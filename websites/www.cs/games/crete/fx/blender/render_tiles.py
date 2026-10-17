"""The Island of Crete: render every board sprite with Blender.

Builds each terrain, object and figure of the puzzle as a small painted scene in
code (no outside assets), renders it through one fixed camera and light rig, and
tiles the frames into one PNG atlas, `tiles.png`, with `tiles.json` naming where
each sprite sits. The game (src/puzzle/tiles.ts lists the names) reads both.

Regenerate (from this folder; Blender 4.2 or newer, tested on 5.2):

    /Applications/Blender.app/Contents/MacOS/Blender -b -P render_tiles.py -- --out ../sprites

Install Blender with `brew install --cask blender`. The 16 px check and the
quantize pass use the system `python3` with Pillow (`pip3 install pillow`).

Options (after the `--`):

    --out DIR         Where tiles.png and tiles.json go. Default ../sprites next
                      to this script. preview-16.png and board-preview.png are
                      written beside this script, not into DIR.
    --only A,B        Render just these sprites into <out>/_only/ as one PNG strip
                      each, for a quick look. The atlas is left alone.
    --engine NAME     eevee (default; falls back to cycles if EEVEE cannot start
                      headless) or cycles.
    --samples N       Render samples per frame. Default 32.
    --supersample N   Render at N times the frame size and average down, for clean
                      edges at tiny sizes. Default 3.
    --seed N          Seed for every random scatter. Same seed, same atlas. Default 7.
    --blend-dir DIR   Where each scene is saved as <sprite>.blend before it is
                      rendered (the Blender source of every sprite, committed
                      through Git LFS). Default: next to this script.
    --no-blend        Do not save the .blend files.
    --no-quantize     Skip the 256-colour palette pass.
    --no-check        Skip the 16 px check and the preview.
    --keep-frames     Leave the per-frame PNGs in <out>/_frames for inspection.

The atlas. Every frame is CELL px wide and CELL + RISE px tall. The bottom CELL px
are the board cell; the top RISE px are what stands above it (a wall's top, a
figure's head), drawn over the cell above. A sprite's frames run left to right
from (x, y) in tiles.json; each sprite has its own row, in SPRITES order.

The camera. One orthographic camera tilted TILT degrees down from the horizontal
serves every sprite. Scenes are modelled in "screen units" (a cell is 1 x 1 on the
floor, an object 0.375 tall stands 24 px high); a root empty stretches the scene
so the tilted camera draws a floor cell as a square and a vertical edge at full
length. Terrain is opaque in the cell; objects and figures stand on a transparent
film. All textures are procedural, laid out in the sprite's own coordinates.

The light. A warm sun from the upper left and a cool fill from the lower right
light every sprite the same way, so tiles join; figures add a rim light from
behind, and figures and objects get a dark outline (an inverted hull) that keeps
them readable at 16 px.

The 16 px check. After the atlas is written, every object and figure's first frame
is shrunk to 16 px wide and must cover 12-85% of its frame and differ in mean
luminance from the floor by at least 0.18; the script lists each failure and exits
non-zero. It also writes preview-16.png (every sprite at 16, 24 and 48 px) and
board-preview.png beside this script.
"""
import json
import math
import os
import random
import subprocess
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Euler, Matrix, Vector


CELL, RISE = 64, 24
TILT = 35                     # degrees the camera looks down from the horizontal
COLS = 8                      # frames in the longest loop
Y0 = -0.12                    # where figures stand (floor y; the cell centre is 0)
WALL_H = RISE / CELL          # a wall's height in screen units: its top fills the rise band


# ---------------------------------------------------------------- arguments
def parse_args():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    here = os.path.dirname(os.path.abspath(__file__))
    a = {'out': os.path.join(here, '..', 'sprites'), 'only': None, 'engine': 'eevee', 'samples': 32,
         'supersample': 3, 'seed': 7, 'quantize': True, 'keep': False, 'blend': True, 'blend_dir': here,
         'check': True}
    i = 0
    while i < len(argv):
        k = argv[i]
        if k == '--out': a['out'] = argv[i + 1]; i += 2
        elif k == '--only': a['only'] = argv[i + 1].split(','); i += 2
        elif k == '--engine': a['engine'] = argv[i + 1]; i += 2
        elif k == '--samples': a['samples'] = int(argv[i + 1]); i += 2
        elif k == '--supersample': a['supersample'] = int(argv[i + 1]); i += 2
        elif k == '--seed': a['seed'] = int(argv[i + 1]); i += 2
        elif k == '--blend-dir': a['blend_dir'] = argv[i + 1]; i += 2
        elif k == '--no-blend': a['blend'] = False; i += 1
        elif k == '--no-quantize': a['quantize'] = False; i += 1
        elif k == '--no-check': a['check'] = False; i += 1
        elif k == '--keep-frames': a['keep'] = True; i += 1
        else: raise SystemExit('render_tiles.py: unknown option ' + k)
    a['out'] = os.path.abspath(a['out'])
    return a


ARGS = {}
ROOT = None           # the empty every scene object hangs from


# ------------------------------------------------------------------- colour
def lin(c):
    """'#rrggbb' (sRGB) or a linear tuple -> linear RGB tuple."""
    if isinstance(c, str):
        h = c.lstrip('#')
        v = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
        return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in v)
    return tuple(c[:3])


def shade(c, k):
    """A colour scaled in linear light."""
    return tuple(min(1.0, x * k) for x in lin(c))


# ------------------------------------------------------------ material kit
class MB:
    """A material under construction: small helpers over the node tree. Every
    helper returns an output socket (or the material, for pbr)."""

    def __init__(self, name):
        self.mat = bpy.data.materials.new(name)
        self.mat.use_nodes = True
        self.nt = self.mat.node_tree
        for n in list(self.nt.nodes):
            self.nt.nodes.remove(n)
        self.out = self.nt.nodes.new('ShaderNodeOutputMaterial')
        self._p = None

    def set(self, sock, v):
        if isinstance(v, bpy.types.NodeSocket):
            self.nt.links.new(v, sock)
            return
        if isinstance(v, str):
            v = lin(v)
        try:
            n = len(sock.default_value)
        except TypeError:
            sock.default_value = v
            return
        v = list(v) + [1.0] * (n - len(v))
        sock.default_value = v[:n]

    def n(self, kind, props=None, inp=None):
        nd = self.nt.nodes.new(kind)
        for k, v in (props or {}).items():
            setattr(nd, k, v)
        for k, v in (inp or {}).items():
            self.set(nd.inputs[k], v)
        return nd

    def coord(self):
        if self._p is None:
            self._p = self.n('ShaderNodeTexCoord').outputs['Object']
        return self._p

    def sep(self, vec=None):
        return self.n('ShaderNodeSeparateXYZ', inp={'Vector': vec or self.coord()})

    def comb(self, x, y, z=0.0):
        return self.n('ShaderNodeCombineXYZ', inp={'X': x, 'Y': y, 'Z': z}).outputs[0]

    def math(self, op, a, b=None, clamp=False):
        nd = self.n('ShaderNodeMath', {'operation': op, 'use_clamp': clamp})
        self.set(nd.inputs[0], a)
        if b is not None:
            self.set(nd.inputs[1], b)
        return nd.outputs[0]

    def vmath(self, op, a, b=None):
        nd = self.n('ShaderNodeVectorMath', {'operation': op})
        self.set(nd.inputs[0], a)
        if b is not None:
            self.set(nd.inputs[1], b)
        return nd.outputs['Value'] if op in ('DOT_PRODUCT', 'LENGTH', 'DISTANCE') else nd.outputs['Vector']

    def ramp(self, fac, stops, interp='LINEAR'):
        nd = self.n('ShaderNodeValToRGB')
        cr = nd.color_ramp
        cr.interpolation = interp
        el = cr.elements
        el[0].position = stops[0][0]
        el[1].position = stops[-1][0]
        for pos, _ in stops[1:-1]:
            el.new(pos)
        for e, (pos, col) in zip(el, stops):
            e.color = (*lin(col), 1.0)
        self.set(nd.inputs['Fac'], fac)
        return nd.outputs['Color']

    def mix(self, a, b, fac=1.0, blend='MIX'):
        nd = self.n('ShaderNodeMix', {'data_type': 'RGBA', 'blend_type': blend})
        self.set(nd.inputs[0], fac)
        self.set(nd.inputs[6], a)
        self.set(nd.inputs[7], b)
        return nd.outputs[2]

    def noise(self, scale, detail=5.0, rough=0.5, vec=None, w=None):
        nd = self.n('ShaderNodeTexNoise', {'noise_dimensions': '4D' if w is not None else '3D'},
                    {'Scale': scale, 'Detail': detail, 'Roughness': rough, 'Vector': vec or self.coord()})
        if w is not None:
            self.set(nd.inputs['W'], w)
        return nd.outputs['Fac']

    def voronoi(self, scale, feature='F1', vec=None, rand=1.0, out='Distance'):
        nd = self.n('ShaderNodeTexVoronoi', {'feature': feature},
                    {'Scale': scale, 'Randomness': rand, 'Vector': vec or self.coord()})
        return nd.outputs[out]

    def bump(self, height, strength=0.5, dist=0.05):
        return self.n('ShaderNodeBump', inp={'Height': height, 'Strength': strength, 'Distance': dist}).outputs['Normal']

    def groove(self, color, depth=0.5, lo=0.485, hi=0.499):
        """Darken a thin line where two cells meet, so a grid of tiles reads."""
        s = self.sep()
        e = self.math('MAXIMUM', self.math('ABSOLUTE', s.outputs['X']), self.math('ABSOLUTE', s.outputs['Y']))
        g = self.ramp(e, [(lo, '#ffffff'), (hi, shade('#ffffff', depth))])
        return self.mix(color, g, 1.0, 'MULTIPLY')

    def pbr(self, base, rough=0.5, metal=0.0, normal=None, emit=None, estr=0.0, spec=0.5, coat=0.0):
        b = self.n('ShaderNodeBsdfPrincipled', inp={'Base Color': base, 'Roughness': rough, 'Metallic': metal})
        for k in ('Specular IOR Level', 'Specular'):
            if k in b.inputs:
                b.inputs[k].default_value = spec
                break
        if coat and 'Coat Weight' in b.inputs:
            b.inputs['Coat Weight'].default_value = coat
        if normal is not None:
            self.set(b.inputs['Normal'], normal)
        if emit is not None:
            self.set(b.inputs['Emission Color'], emit)
            b.inputs['Emission Strength'].default_value = estr
        self.nt.links.new(b.outputs['BSDF'], self.out.inputs['Surface'])
        return self.mat

    def emission(self, color, strength=1.0):
        e = self.n('ShaderNodeEmission', inp={'Color': color, 'Strength': strength})
        self.nt.links.new(e.outputs['Emission'], self.out.inputs['Surface'])
        return self.mat

    def value(self, name, v=0.0):
        nd = self.n('ShaderNodeValue')
        nd.name = nd.label = name
        nd.outputs[0].default_value = v
        return nd


def paint(name, color, rough=0.55, metal=0.0, var=0.18, bump=0.12, scale=9.0, c2=None, spec=0.5, coat=0.0):
    """A painted surface: a colour that drifts with noise, and a fine bump."""
    m = MB(name)
    nz = m.noise(scale, 4, 0.55)
    col = m.ramp(nz, [(0.35, color), (0.65, c2 or shade(color, 1.0 - var))])
    return m.pbr(col, rough, metal, m.bump(nz, bump, 0.02), spec=spec, coat=coat)


def bronze(name='bronze', tone='#a76a30'):
    return paint(name, tone, rough=0.4, metal=0.35, var=0.4, bump=0.2, scale=14, spec=0.6)


def gold(name='gold'):
    return paint(name, '#f0b52c', rough=0.32, metal=0.4, var=0.3, bump=0.1, scale=14, spec=0.7)


def enamel(name, color):
    return paint(name, color, rough=0.2, metal=0.0, var=0.12, bump=0.05, scale=20, coat=0.6)


def limestone(name, a='#e0d3b2', b='#c4b490', scale=5.0, bump=0.4, rough=0.85, grid=True, cracks=True):
    """Warm off-white limestone: noise-driven colour, pitting, hairline cracks, a bump,
    and (for floor) a thin groove at the cell edge."""
    m = MB(name)
    nz = m.noise(scale, 8, 0.62)
    big = m.noise(1.4, 3, 0.5)
    col = m.ramp(nz, [(0.3, a), (0.7, b)])
    col = m.mix(col, m.ramp(big, [(0.3, '#ffffff'), (0.7, '#d9d2c2')]), 1.0, 'MULTIPLY')
    pits = m.ramp(m.voronoi(scale * 3.5), [(0.0, '#a69a82'), (0.16, '#ffffff')])
    col = m.mix(col, pits, 0.8, 'MULTIPLY')
    h = m.math('ADD', m.math('MULTIPLY', nz, 0.7), 0.0)
    if cracks:
        edge = m.voronoi(2.2, 'DISTANCE_TO_EDGE', rand=1.0)
        line = m.ramp(edge, [(0.0, '#a89b80'), (0.02, '#ffffff')])
        col = m.mix(col, line, 0.8, 'MULTIPLY')
        h = m.math('ADD', h, m.math('MULTIPLY', m.ramp(edge, [(0.0, '#000000'), (0.04, '#ffffff')]), 0.0))
    if grid:
        col = m.groove(col)
    return m.pbr(col, rough, 0.0, m.bump(h, bump, 0.03), spec=0.3)


# ------------------------------------------------------------------ geometry
def make(name, bm, mats, parent=None, smooth=None, bevel=0.0, outline=False):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    o.parent = parent or ROOT
    for m in mats:
        me.materials.append(m)
    if smooth is not None:
        for p in me.polygons:
            p.use_smooth = smooth
    if bevel:
        b = o.modifiers.new('bevel', 'BEVEL')
        b.width = bevel
        b.segments = 2
        b.limit_method = 'ANGLE'
    if outline:
        add_outline(o)
    return o


OUTLINE = {'on': False, 'width': 0.012, 'mat': None}


def add_outline(o, width=None):
    """An inverted hull: a shell pushed out along the normals, drawn black from
    the inside only, so a dark line follows the silhouette."""
    if OUTLINE['mat'] is None:
        m = MB('outline')
        m.emission('#120a06', 1.0)
        m.mat.use_backface_culling = True
        m.mat.use_backface_culling_shadow = True        # the hull casts no shadow on what it outlines
        OUTLINE['mat'] = m.mat
    me = o.data
    me.materials.append(OUTLINE['mat'])
    s = o.modifiers.new('hull', 'SOLIDIFY')
    s.thickness = width or OUTLINE['width']
    s.offset = 1.0
    s.use_flip_normals = True
    s.use_rim = False
    s.material_offset = len(me.materials)


def box(x0, x1, y0, y1, z0, z1, top, side=None, bevel=0.0, outline=None, parent=None):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = ((x1 if v.co.x > 0 else x0), (y1 if v.co.y > 0 else y0), (z1 if v.co.z > 0 else z0))
    bm.normal_update()
    for f in bm.faces:
        f.material_index = 0 if (f.normal.z > 0.5 or side is None) else 1
    mats = [top] + ([side] if side is not None else [])
    return make('box', bm, mats, parent, False, bevel, OUTLINE['on'] if outline is None else outline)


def cyl(c, r0, r1=None, length=0.1, axis='Z', mat=None, seg=24, rot=(0, 0, 0), outline=None, parent=None, bevel=0.0):
    """A cylinder or cone centred on c, along `axis`; r0 at the low end, r1 at the high."""
    r1 = r0 if r1 is None else r1
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r0, radius2=r1, depth=length)
    bm.normal_update()
    for f in bm.faces:
        f.smooth = abs(f.normal.z) < 0.9
    ax = {'Z': lambda p: p, 'Y': lambda p: Vector((p.x, p.z, -p.y)), 'X': lambda p: Vector((p.z, p.y, -p.x))}[axis]
    rm = Euler(rot).to_matrix()
    for v in bm.verts:
        v.co = rm @ ax(v.co) + Vector(c)
    bm.normal_update()
    o = make('cyl', bm, [mat], parent, None, bevel, OUTLINE['on'] if outline is None else outline)
    return o


def ball(c, r, mat, scale=(1, 1, 1), seg=20, rings=14, outline=None, parent=None, rot=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1.0)
    rm = Euler(rot).to_matrix()
    for v in bm.verts:
        v.co = rm @ Vector((v.co.x * r * scale[0], v.co.y * r * scale[1], v.co.z * r * scale[2])) + Vector(c)
    return make('ball', bm, [mat], parent, True, 0.0, OUTLINE['on'] if outline is None else outline)


def prism(pts, thick, mat, plane='XZ', at=0.0, bevel=0.008, outline=None, parent=None, mats=None):
    """A flat shape of 2D points extruded `thick`. plane XZ: stands facing the camera,
    centred on y = at. plane XY: lies on the floor from z = at upward."""
    bm = bmesh.new()
    if plane == 'XZ':
        vs = [bm.verts.new((px, 0.0, pz)) for px, pz in pts]
        d = (0.0, thick, 0.0)
        off = (0.0, at - thick / 2, 0.0)
    else:
        vs = [bm.verts.new((px, py, 0.0)) for px, py in pts]
        d = (0.0, 0.0, thick)
        off = (0.0, 0.0, at)
    f = bm.faces.new(vs)
    ret = bmesh.ops.extrude_face_region(bm, geom=[f])
    bmesh.ops.translate(bm, verts=[e for e in ret['geom'] if isinstance(e, bmesh.types.BMVert)], vec=d)
    bmesh.ops.translate(bm, verts=bm.verts[:], vec=off)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return make('prism', bm, mats or [mat], parent, False, bevel, OUTLINE['on'] if outline is None else outline)


def torus(c, major, minor, mat, rot=(0, 0, 0), outline=None, parent=None):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=32, minor_segments=12,
                                     location=c, rotation=rot)
    o = bpy.context.active_object
    o.parent = parent or ROOT
    o.data.materials.append(mat)
    for p in o.data.polygons:
        p.use_smooth = True
    if OUTLINE['on'] if outline is None else outline:
        add_outline(o)
    return o


def empty(loc=(0, 0, 0), parent=None):
    e = bpy.data.objects.new('E', None)
    bpy.context.scene.collection.objects.link(e)
    e.parent = parent or ROOT
    e.location = loc
    return e


def child_of(o, parent):
    """Hang o under a moving empty so it keeps its place at rest."""
    o.parent = parent
    o.matrix_parent_inverse = parent.matrix_basis.inverted()


def mirror_pts(pts):
    return [(-x, z) for x, z in pts]


# --------------------------------------------------------------------- scene
def sun(travel, energy, color, angle=4.0):
    ld = bpy.data.lights.new('sun', 'SUN')
    ld.energy = energy
    ld.color = lin(color)
    ld.angle = math.radians(angle)
    o = bpy.data.objects.new('sun', ld)
    o.rotation_euler = Vector(travel).normalized().to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.collection.objects.link(o)
    return o


def new_scene(frames, figure=False, outline=False):
    """Empty scene with the shared camera and light rig. Returns the scene."""
    global ROOT
    bpy.ops.wm.read_factory_settings(use_empty=True)
    OUTLINE['mat'] = None
    OUTLINE['on'] = outline
    ss = ARGS['supersample']
    sc = bpy.context.scene
    sc.frame_start, sc.frame_end = 0, max(frames - 1, 0)
    sc.render.resolution_x = CELL * ss
    sc.render.resolution_y = (CELL + RISE) * ss
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = True
    sc.render.filter_size = 1.0
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.image_settings.color_depth = '8'
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'
    sc.world = bpy.data.worlds.new('W')
    sc.world.color = (0.20, 0.22, 0.27)            # the cool ambient
    engines = ['BLENDER_EEVEE', 'BLENDER_EEVEE_NEXT', 'CYCLES'] if ARGS['engine'] == 'eevee' else ['CYCLES']
    for name in engines:
        try:
            sc.render.engine = name
            break
        except TypeError:
            continue
    if sc.render.engine == 'CYCLES':
        sc.cycles.samples = ARGS['samples']
        sc.cycles.use_denoising = False
        sc.cycles.device = 'CPU'
    else:
        try:
            sc.eevee.taa_render_samples = ARGS['samples']
        except AttributeError:
            pass
    el = math.radians(TILT)
    cam = bpy.data.objects.new('Cam', bpy.data.cameras.new('Cam'))
    cam.data.type = 'ORTHO'
    cam.data.sensor_fit = 'HORIZONTAL'
    cam.data.ortho_scale = 1.0                      # the frame is one cell wide
    cam.data.shift_y = (CELL + RISE) / CELL / 2 - 0.5   # the cell's centre sits 0.5 up the frame
    cam.data.clip_start, cam.data.clip_end = 0.1, 60
    a = math.pi / 2 - el
    cam.rotation_euler = (a, 0, 0)
    cam.location = (0, -10 * math.sin(a), 10 * math.cos(a))
    sc.collection.objects.link(cam)
    sc.camera = cam
    # screen units -> world: the floor is foreshortened by sin(el), verticals by cos(el)
    ROOT = bpy.data.objects.new('Root', None)
    ROOT.scale = (1.0, 1.0 / math.sin(el), 1.0 / math.cos(el))
    sc.collection.objects.link(ROOT)
    sun((0.55, 0.3, -0.78), 4.4, '#fff0d2')        # warm key, upper left
    sun((-0.5, 0.7, -0.45), 1.7, '#9fb8ff', 12)     # cool fill, lower right
    if figure:
        sun((-0.25, -0.75, -0.4), 3.4, '#cfe4ff', 6)    # rim from behind, above, right
    return sc


def blob(r=0.22, y=0.0, strength=0.4):
    """A soft dark ellipse under an object, standing in for the shadow it casts."""
    m = MB('shadow')
    m.mat.surface_render_method = 'BLENDED'
    d = m.vmath('LENGTH', m.vmath('SUBTRACT', m.coord(), (0, y, 0)))
    f = m.ramp(d, [(0.0, '#ffffff'), (r, '#000000')])
    clear = m.n('ShaderNodeBsdfTransparent')
    em = m.n('ShaderNodeEmission', inp={'Color': '#000000', 'Strength': 1.0})
    mx = m.n('ShaderNodeMixShader')
    fac = m.math('MULTIPLY', m.n('ShaderNodeSeparateColor', inp={'Color': f}).outputs[0], strength)
    m.nt.links.new(fac, mx.inputs[0])
    m.nt.links.new(clear.outputs[0], mx.inputs[1])
    m.nt.links.new(em.outputs[0], mx.inputs[2])
    m.nt.links.new(mx.outputs[0], m.out.inputs['Surface'])
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=r * 1.2)
    for v in bm.verts:
        v.co.z = 0.004
        v.co.y += y
    return make('shadow', bm, [m.mat], None, False, 0.0, False)


def key_val(sock, f, v):
    sock.default_value = v
    sock.keyframe_insert('default_value', frame=f)


def key_obj(o, f, **kw):
    for path, v in kw.items():
        setattr(o, path, v)
        o.keyframe_insert(path, frame=f)


# --------------------------------------------------------------- terrain bits
def floor_mat():
    """Calm, light flagstone: slabs a quarter of a cell across, hairline joints, a
    fine speckle and a gentle bump, so a field of floor stays quiet."""
    m = MB('floor')
    p = m.coord()
    s = m.sep()
    uv = m.comb(s.outputs['X'], s.outputs['Y'])
    br = m.n('ShaderNodeTexBrick', {'offset': 0.5, 'squash': 1.0},
             {'Color1': '#efe6cc', 'Color2': '#e6dcc0', 'Mortar': '#c9bd9f', 'Scale': 1.0, 'Mortar Size': 0.012,
              'Mortar Smooth': 0.3, 'Brick Width': 0.25, 'Row Height': 0.25, 'Vector': uv})
    nz = m.noise(30, 4, 0.5)
    col = m.mix(br.outputs['Color'], m.ramp(nz, [(0.35, '#ffffff'), (0.7, '#ece4d0')]), 1.0, 'MULTIPLY')
    col = m.groove(col, 0.85)
    m.pbr(col, 0.9, 0.0, m.bump(m.math('SUBTRACT', 1.0, br.outputs['Fac']), 0.3, 0.02), spec=0.2)
    return m.mat


def slab(mat, side=None, z0=-0.3, z1=0.0, bevel=0.0):
    """A floor slab whose top edge meets the frame's cell exactly; it overruns the
    other three sides, which the frame crops."""
    return box(-0.62, 0.62, -0.62, 0.5, z0, z1, mat, side or mat, bevel, outline=False)


def holed_floor(half, base, depth=0.4):
    """The floor with a square hole of half-width `half` in the middle of the cell."""
    box(-0.62, 0.62, -0.62, -half, -depth, 0.0, base, base, 0.004, outline=False)
    box(-0.62, 0.62, half, 0.5, -depth, 0.0, base, base, 0.004, outline=False)
    box(-0.62, -half, -half, half, -depth, 0.0, base, base, 0.004, outline=False)
    box(half, 0.62, -half, half, -depth, 0.0, base, base, 0.004, outline=False)


def build_floor(f):
    slab(floor_mat())


def build_dirt(f):
    m = MB('dirt')
    nz = m.noise(9, 7, 0.65)
    col = m.ramp(nz, [(0.3, '#8a6743'), (0.55, '#6c4d30'), (0.75, '#4e3822')])
    peb = m.voronoi(11)
    col = m.mix(col, m.ramp(peb, [(0.0, '#a08a6c'), (0.12, '#ffffff')]), 0.7, 'MULTIPLY')
    col = m.groove(col)
    m.pbr(col, 0.95, 0.0, m.bump(m.math('ADD', nz, m.math('MULTIPLY', peb, 0.8)), 0.9, 0.04), spec=0.1)
    slab(m.mat)
    rng = random.Random(ARGS['seed'])
    stone = paint('pebble', '#8d7a62', rough=0.9)
    for _ in range(9):
        x, y = rng.uniform(-0.42, 0.42), rng.uniform(-0.42, 0.42)
        ball((x, y, 0.0), rng.uniform(0.025, 0.05), stone, (1, 1, 0.5), 8, 6, outline=False)


def build_wall(f):
    """A raised block of dark, cool, coarsely dressed stone: big courses on top, a
    shaded front that fills the rise band, darkest at the foot."""
    def courses(name, c1, c2, mortar, plane, width, height, shade_foot=None):
        m = MB(name)
        s = m.sep()
        p = m.comb(s.outputs['X'], s.outputs['Y' if plane == 'XY' else 'Z'])
        br = m.n('ShaderNodeTexBrick', {'offset': 0.5, 'squash': 1.0},
                 {'Color1': c1, 'Color2': c2, 'Mortar': mortar, 'Scale': 1.0, 'Mortar Size': 0.03,
                  'Mortar Smooth': 0.15, 'Brick Width': width, 'Row Height': height, 'Vector': p})
        nz = m.noise(12, 6, 0.6)
        col = m.mix(br.outputs['Color'], m.ramp(nz, [(0.3, '#ffffff'), (0.7, '#b5bac4')]), 1.0, 'MULTIPLY')
        if shade_foot:
            col = m.mix(col, m.ramp(s.outputs['Z'], [(0.0, shade_foot), (WALL_H, '#ffffff')]), 1.0, 'MULTIPLY')
        m.pbr(col, 0.9, 0.0, m.bump(m.math('SUBTRACT', 1.0, br.outputs['Fac']), 1.0, 0.04), spec=0.2)
        return m.mat
    top = courses('wall-top', '#7d8696', '#6c7586', '#3c424e', 'XY', 0.5, 0.33)
    front = courses('wall-front', '#555c6a', '#4a5160', '#262a33', 'XZ', 0.34, 0.125, '#6a6e78')
    box(-0.5, 0.5, -0.5, 0.5, -0.3, WALL_H, top, front, 0.012, outline=False)


def lowered_grate(mat_bar, z):
    for i in range(5):
        x = -0.36 + i * 0.18
        box(x - 0.045, x + 0.045, -0.4, 0.4, z - 0.04, z, mat_bar, mat_bar, 0.006, outline=False)


def build_toggle(f, closed):
    pit = paint('pit', '#2a2118', rough=1.0)
    bar = bronze('grate')
    if not closed:
        holed_floor(0.43, floor_mat(), 0.2)
        box(-0.43, 0.43, -0.43, 0.43, -0.12, -0.04, pit, pit, 0.0, outline=False)
        for i in range(5):
            x = -0.34 + i * 0.17
            box(x - 0.05, x + 0.05, -0.41, 0.41, -0.04, 0.0, bar, bar, 0.008, outline=False)
        box(-0.45, 0.45, -0.45, -0.38, -0.04, 0.0, bar, bar, 0.008, outline=False)
        box(-0.45, 0.45, 0.38, 0.45, -0.04, 0.0, bar, bar, 0.008, outline=False)
    else:
        slab(floor_mat())
        box(-0.43, 0.43, -0.43, 0.43, -0.12, 0.002, pit, pit, 0.0, outline=False)
        h = 0.3
        for i in range(5):
            x = -0.34 + i * 0.17
            box(x - 0.055, x + 0.055, -0.42, 0.42, 0.0, h, bar, bar, 0.01, outline=False)
        for yy in (-0.45, 0.45):
            box(-0.47, 0.47, yy - 0.04, yy + 0.04, 0.0, h, bar, bar, 0.01, outline=False)
        for xx in (-0.45, 0.45):
            box(xx - 0.04, xx + 0.04, -0.45, 0.45, 0.0, h + 0.03, bar, bar, 0.01, outline=False)


def build_door(f, color):
    slab(floor_mat())
    bz = bronze('door-bronze')
    en = enamel('door-' + color, DOOR_COLORS[color])
    h = 0.34
    box(-0.48, 0.48, -0.48, 0.48, 0.0, h, bz, bz, 0.018, outline=False)
    box(-0.49, 0.49, -0.13, 0.13, h - 0.004, h + 0.012, en, en, 0.006, outline=False)         # band across the top
    box(-0.485, 0.485, -0.495, -0.47, 0.04, 0.26, en, en, 0.006, outline=False)               # band on the front
    cyl((0, 0, h + 0.012), 0.1, length=0.016, mat=en, outline=False)
    cyl((0, -0.482, 0.15), 0.045, length=0.02, axis='Y', mat=paint('keyhole', '#1a1008', 1.0), outline=False)


DOOR_COLORS = {'red': '#d11f16', 'blue': '#1f55e0', 'yellow': '#f2c40c', 'green': '#1d9a2c'}


def build_gate(f, closed):
    """Closed: bronze bars from floor to lintel over a dark opening. Open: the bars
    are lifted into the lintel, leaving short teeth and the floor showing through."""
    slab(floor_mat())
    bz = bronze('gate-bronze', '#b97b3a')
    dark = paint('gate-dark', '#17110a', rough=1.0)
    lintel = 0.5
    if closed:
        box(-0.45, 0.45, 0.06, 0.12, 0.0, lintel, dark, dark, 0.0, outline=False)
        for i in range(6):
            x = -0.375 + i * 0.15
            cyl((x, 0, lintel / 2), 0.04, length=lintel, mat=bz, seg=10, outline=False)
        cyl((0, 0, 0.14), 0.025, length=1.0, axis='X', mat=bz, seg=8, outline=False)
        for x in (-0.48, 0.48):
            box(x - 0.05, x + 0.05, -0.08, 0.1, 0.0, lintel + 0.03, bz, bz, 0.01, outline=False)
    else:
        for x in (-0.48, 0.48):
            box(x - 0.035, x + 0.035, -0.06, 0.06, 0.0, lintel + 0.03, bz, bz, 0.01, outline=False)
    box(-0.5, 0.5, -0.07, 0.07, lintel - 0.02, lintel + 0.06, bz, bz, 0.01, outline=False)
    if not closed:
        for i in range(6):
            x = -0.375 + i * 0.15
            cyl((x, 0, lintel - 0.07), 0.03, 0.012, 0.1, mat=bz, seg=8, outline=False)


def ring(h_out, h_in, z_top, top, side, depth=0.5):
    """A square ring of floor between half-widths h_in and h_out, top at z_top."""
    for (x0, x1, y0, y1) in ((-h_out, h_out, -h_out, -h_in), (-h_out, h_out, h_in, h_out),
                             (-h_out, -h_in, -h_in, h_in), (h_in, h_out, -h_in, h_in)):
        box(x0, x1, y0, y1, -depth, z_top, top, side, 0.0, outline=False)


def build_exit(f):
    """A stair going down into light: nested square steps falling away, each darker
    than the one above, round a bright doorway at the bottom."""
    P = 0.36                                                        # the top step's outer half width
    holed_floor(P, floor_mat())
    light = MB('exit-light')
    light.emission('#fff6cc', 2.2)
    tops = ['#4a3d2a', '#5c4a30', '#b8803a', '#ffd070']
    sides = ['#2a2218', '#33291b', '#8a5c24', '#e0a040']
    hs = [P, P - 0.07, P - 0.14, P - 0.2]
    ring(P + 0.035, P, 0.012, paint('exit-lip', '#2a2218', rough=0.9), paint('exit-lip2', '#2a2218', rough=0.9))
    for i in range(4):
        h_in = hs[i + 1] if i < 3 else 0.12
        m = MB('step%d' % i)
        m.pbr(tops[i], 0.9, 0.0, emit=tops[i] if i > 1 else None, estr=0.6 + 0.5 * i)
        ms = MB('riser%d' % i)
        ms.pbr(sides[i], 0.9, 0.0, emit=sides[i] if i > 1 else None, estr=0.6 + 0.5 * i)
        ring(hs[i], h_in, -0.07 - i * 0.08, m.mat, ms.mat)
    box(-0.12, 0.12, -0.12, 0.12, -0.5, -0.36, light.mat, light.mat, 0.0, outline=False)


def build_safe(f):
    m = limestone('safe-floor', '#eadfc2', '#d5c8a4')
    slab(m)
    leaf = paint('laurel', '#5d7a3c', rough=0.7, var=0.3)
    dk = paint('laurel-dk', '#3f5a28', rough=0.7)
    n = 20
    for i in range(n):
        a = i / n * math.tau
        r = 0.37
        for k, (rr, mat) in enumerate(((r, leaf), (r - 0.0, dk))):
            if k:
                continue
            ball((math.cos(a) * rr, math.sin(a) * rr, 0.004), 0.07, mat, (0.42, 1.0, 0.18), 10, 6, outline=False,
                 rot=(0, 0, a + 0.5))
    torus((0, 0, 0.0), 0.36, 0.012, dk, outline=False)
    ball((0, 0, 0.0), 0.12, paint('safe-dot', '#c8a24a', rough=0.5, metal=0.6), (1, 1, 0.15), 14, 8, outline=False)


def build_button(f):
    slab(floor_mat())
    bz = bronze('button')
    ring = paint('button-ring', '#2a2118', rough=1.0)
    cyl((0, 0, 0.0), 0.33, length=0.02, mat=ring, outline=False)
    cyl((0, 0, 0.03), 0.27, 0.25, 0.06, mat=bz, outline=False)
    cyl((0, 0, 0.07), 0.2, 0.18, 0.04, mat=paint('button-top', '#c47a34', rough=0.3, metal=0.8), outline=False)


def build_ice(f):
    m = MB('ice')
    nz = m.noise(7, 5, 0.5)
    base = m.ramp(nz, [(0.3, '#a9d7f2'), (0.7, '#d8f0ff')])
    mp = m.n('ShaderNodeMapping', {'vector_type': 'POINT'},
             {'Rotation': (0, 0, 0.55), 'Scale': (1.0, 11.0, 1.0), 'Vector': m.coord()})
    st = m.noise(5, 3, 0.4, mp.outputs[0])
    streak = m.ramp(st, [(0.55, '#ffffff'), (0.8, '#7fb5dc')])
    col = m.mix(base, streak, 0.7, 'MULTIPLY')
    edge = m.voronoi(2.2, 'DISTANCE_TO_EDGE')
    col = m.mix(col, m.ramp(edge, [(0.0, '#ffffff'), (0.04, '#9cc9e6')]), 0.8, 'MULTIPLY')
    col = m.groove(col, 0.6)
    m.pbr(col, 0.1, 0.0, m.bump(st, 0.25, 0.02), spec=1.0, coat=0.8)
    slab(m.mat)
    # a glint of frost at the cell's edge
    fr = paint('frost', '#eaf6ff', rough=0.5)
    for (x, y, r) in ((-0.38, 0.36, 0.05), (0.4, -0.3, 0.04), (0.36, 0.38, 0.03)):
        ball((x, y, 0.0), r, fr, (1, 1, 0.3), 8, 6, outline=False)


def build_water(f):
    n = ARGS_FRAMES['water']
    m = MB('water')
    ph = m.value('phase')
    ph2 = m.value('phase2')
    mp = m.n('ShaderNodeMapping', {'vector_type': 'POINT'}, {'Rotation': (0, 0, 0.7), 'Vector': m.coord()})
    w1 = m.n('ShaderNodeTexWave', {'wave_type': 'BANDS', 'bands_direction': 'X', 'wave_profile': 'SIN'},
             {'Scale': 2.2, 'Distortion': 1.6, 'Detail': 1.0, 'Detail Scale': 1.5, 'Vector': m.coord()})
    m.set(w1.inputs['Phase Offset'], ph.outputs[0])
    w2 = m.n('ShaderNodeTexWave', {'wave_type': 'BANDS', 'bands_direction': 'X', 'wave_profile': 'SIN'},
             {'Scale': 3.1, 'Distortion': 1.4, 'Detail': 1.0, 'Detail Scale': 1.5, 'Vector': mp.outputs[0]})
    m.set(w2.inputs['Phase Offset'], ph2.outputs[0])
    h = m.math('ADD', m.math('MULTIPLY', w1.outputs[0], 0.55), m.math('MULTIPLY', w2.outputs[0], 0.45))
    col = m.ramp(h, [(0.2, '#0b3a78'), (0.55, '#1b78b8'), (0.85, '#6fcbe6'), (1.0, '#c4f2ff')])
    m.pbr(col, 0.12, 0.0, m.bump(h, 1.2, 0.05), spec=0.9)
    slab(m.mat)
    for fr in range(n):
        key_val(ph.outputs[0], fr, fr / n * math.tau)
        key_val(ph2.outputs[0], fr, -fr / n * math.tau)


def tongue(h, r, mat, seg=12, rings=9):
    """A flame tongue: a round base tapering to a point at height h."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1.0)
    for v in bm.verts:
        t = (v.co.z + 1) / 2
        d = math.hypot(v.co.x, v.co.y)
        k = r * ((1 - t) ** 0.8) * (1.0 + 0.5 * math.sin(t * 3.1))
        if d > 1e-6:
            v.co.x, v.co.y = v.co.x / d * k, v.co.y / d * k
        else:
            v.co.x = v.co.y = 0.0
        v.co.z = t * h
    return make('tongue', bm, [mat], None, True, 0.0, False)


def build_fire(f):
    n = ARGS_FRAMES['fire']
    m = MB('char')
    nz = m.noise(10, 6, 0.6)
    ember = m.voronoi(3.5, 'DISTANCE_TO_EDGE')
    col = m.ramp(nz, [(0.3, '#3a2d26'), (0.7, '#241a15')])
    glowc = m.ramp(ember, [(0.0, '#ff7a1a'), (0.06, '#2a1a12')])
    col = m.mix(col, glowc, 1.0, 'MIX')
    col = m.groove(col)
    m.pbr(col, 0.9, 0.0, m.bump(nz, 0.6, 0.03), emit=m.ramp(ember, [(0.0, '#ff6a10'), (0.05, '#000000')]), estr=3.0)
    slab(m.mat)
    rng = random.Random(ARGS['seed'])
    fm = MB('flame')
    z = fm.sep()
    fac = fm.math('DIVIDE', z.outputs['Z'], 0.55, True)
    lw = fm.n('ShaderNodeLayerWeight', inp={'Blend': 0.5}).outputs['Facing']
    c = fm.ramp(fac, [(0.0, '#d8300a'), (0.35, '#ff7a10'), (0.7, '#ffc830'), (1.0, '#fff4a0')])
    c = fm.mix(c, shade('#ffffff', 0.75), fm.math('SUBTRACT', 1.0, lw, True), 'MULTIPLY')
    fm.emission(c, 2.0)
    core = MB('flame-core')
    zc = core.sep()
    cf = core.math('DIVIDE', zc.outputs['Z'], 0.5, True)
    core.emission(core.ramp(cf, [(0.0, '#ffb020'), (0.5, '#ffe060'), (1.0, '#ffffe0')]), 2.4)
    tongues = []
    for i in range(9):
        a = i / 9 * math.tau + rng.uniform(-0.3, 0.3)
        rr = 0.0 if i == 0 else rng.uniform(0.12, 0.3)
        hgt = 0.62 if i == 0 else rng.uniform(0.32, 0.5)
        o = tongue(hgt, 0.13 if i == 0 else rng.uniform(0.08, 0.12), fm.mat)
        o.location = (math.cos(a) * rr, math.sin(a) * rr * 0.9, -0.02)
        inner = tongue(hgt * 0.72, 0.07 if i == 0 else 0.05, core.mat)
        inner.location = o.location
        tongues.append((o, inner, rng.uniform(0, math.tau), rng.choice((1, 2)), rng.uniform(0.04, 0.1)))
    for fr in range(n):
        t = fr / n
        for o, inner, ph, k, amp in tongues:
            s = 1.0 + 0.16 * math.sin(math.tau * (t * k) + ph)
            sw = amp * math.sin(math.tau * t + ph)
            for ob in (o, inner):
                key_obj(ob, fr, scale=(1.0 + 0.05 * math.sin(math.tau * t * 2 + ph), 1.0, s),
                        rotation_euler=(sw, amp * math.sin(math.tau * t + ph * 1.7), 0.0))


def force_mat(direction, name):
    """A bronze plate with a row of chevrons engraved in it, pointing the way the
    plate carries you. The chevrons scroll one plate length (two chevron spacings)
    over the loop: the 'phase' value runs 0..2 and the pattern repeats every 1."""
    dx, dy = {'up': (0, 1), 'down': (0, -1), 'left': (-1, 0), 'right': (1, 0)}[direction]
    m = MB(name)
    ph = m.value('phase')
    p = m.coord()
    u = m.vmath('DOT_PRODUCT', p, (dx, dy, 0))
    v = m.vmath('DOT_PRODUCT', p, (-dy, dx, 0))
    P = 0.5                                             # chevron spacing in cell units
    s = m.math('ADD', m.math('DIVIDE', u, P), m.math('MULTIPLY', m.math('ABSOLUTE', v), 1.5))
    s = m.math('SUBTRACT', s, ph.outputs[0])
    fr = m.math('FRACT', s)
    arrow = m.ramp(fr, [(0.0, '#ffffff'), (0.30, '#ffffff'), (0.36, '#000000')])
    sx = m.sep()
    edge = m.math('MAXIMUM', m.math('ABSOLUTE', sx.outputs['X']), m.math('ABSOLUTE', sx.outputs['Y']))
    inside = m.ramp(edge, [(0.40, '#ffffff'), (0.43, '#000000')])
    chev = m.mix('#000000', arrow, 1.0, 'MIX')
    chev = m.mix(chev, inside, 1.0, 'MULTIPLY')
    nz = m.noise(16, 4, 0.5)
    plate = m.ramp(nz, [(0.35, '#7d4a1f'), (0.65, '#5f3716')])
    gold_c = m.ramp(nz, [(0.35, '#f0b840'), (0.65, '#d89a2a')])
    rim = m.ramp(edge, [(0.455, '#ffffff'), (0.47, '#4a2c10')])
    col = m.mix(plate, gold_c, chev, 'MIX')
    col = m.mix(col, rim, 1.0, 'MULTIPLY')
    m.pbr(col, 0.35, 0.65, m.bump(chev, 0.8, 0.02), spec=0.6)
    return m, ph


def build_force(f, direction):
    n = ARGS_FRAMES['force-' + direction]
    m, ph = force_mat(direction, 'force-' + direction)
    box(-0.62, 0.62, -0.62, 0.5, -0.3, 0.05, m.mat, m.mat, 0.0, outline=False)
    for fr in range(n):
        key_val(ph.outputs[0], fr, 2.0 * fr / n)


# --------------------------------------------------------------------- objects
def build_relic(f):
    g = gold('labrys')
    dk = paint('labrys-shaft', '#6b3f18', rough=0.5, metal=0.4)
    blade = [(0.03, 0.50), (0.10, 0.57), (0.20, 0.66), (0.31, 0.75), (0.285, 0.62), (0.27, 0.5), (0.285, 0.38), (0.31, 0.25),
             (0.20, 0.34), (0.10, 0.43), (0.03, 0.48)]
    prism(blade, 0.05, g, at=0.0)
    prism(mirror_pts(blade), 0.05, g, at=0.0)
    cyl((0, 0, 0.36), 0.032, length=0.72, mat=dk, seg=10)
    ball((0, 0, 0.0), 0.045, g, (1, 1, 1))
    ball((0, 0, 0.73), 0.04, g)
    cyl((0, 0, 0.5), 0.05, length=0.05, mat=g)
    ruby = enamel('relic-gem', '#c4162a')
    ball((0.0, -0.03, 0.46), 0.025, ruby)
    blob(0.3, 0.0, 0.4)


def build_key(f, color):
    bz = bronze('key-bronze', '#9c6128')
    en = enamel('key-' + color, DOOR_COLORS[color])
    rt = empty((0, 0, 0))
    rt.rotation_euler = (0, 0, math.radians(35))
    c = (-0.2, 0, 0.0)
    torus((c[0], 0, 0.045), 0.15, 0.045, bz, parent=rt)
    cyl((c[0], 0, 0.04), 0.135, length=0.05, mat=en, parent=rt)
    box(-0.07, 0.34, -0.035, 0.035, 0.01, 0.085, bz, bz, 0.012, parent=rt)
    for x, w in ((0.21, 0.05), (0.29, 0.05)):
        box(x, x + w, -0.13, 0.0, 0.01, 0.085, bz, bz, 0.01, parent=rt)
    box(0.0, 0.05, -0.06, 0.06, 0.01, 0.1, bz, bz, 0.01, parent=rt)
    blob(0.32, 0.0, 0.3)


def build_flippers(f):
    blue = paint('flipper', '#14b3b0', rough=0.45, var=0.25, spec=0.6)
    dk = paint('flipper-dk', '#0f7f86', rough=0.5)
    for k, y in enumerate((-0.16, 0.2)):
        rt = empty((0, y, 0))
        rt.rotation_euler = (0, 0, math.radians(-12 if k else 12))
        pocket = [(-0.32, -0.07), (-0.22, -0.12), (-0.08, -0.11), (0.0, -0.06), (0.0, 0.06), (-0.08, 0.11), (-0.22, 0.12), (-0.32, 0.07)]
        blade = [(-0.02, -0.08), (0.18, -0.2), (0.34, -0.22), (0.36, 0.0), (0.34, 0.22), (0.18, 0.2), (-0.02, 0.08)]
        prism(blade, 0.03, blue, 'XY', 0.0, parent=rt)
        prism(pocket, 0.085, dk, 'XY', 0.0, parent=rt)
        for dy in (-0.1, 0.0, 0.1):
            box(0.02, 0.32, dy - 0.012, dy + 0.012, 0.03, 0.04, dk, dk, 0.0, parent=rt, outline=False)
    blob(0.4, 0.0, 0.3)


BOOT = [(-0.2, 0.0), (0.24, 0.0), (0.27, 0.07), (0.22, 0.14), (0.07, 0.18), (0.03, 0.34), (0.02, 0.5), (-0.17, 0.5),
        (-0.19, 0.34), (-0.21, 0.18)]


def build_boots(f, kind):
    """One boot in profile: fire boots are red with a flame, skates are white with a
    steel blade, suction boots are green with a big cup under the sole."""
    spec = {
        'fire-boots': ('#d8381a', '#2a1812'),
        'skates': ('#b4c8da', '#2a2a30'),
        'suction': ('#2f8f58', '#2a1812'),
    }[kind]
    body = paint('boot-' + kind, spec[0], rough=0.5, var=0.25, spec=0.5, coat=0.3)
    sole = paint('boot-sole', spec[1], rough=0.7)
    rt = empty((0, 0, 0.0))
    rt.rotation_euler = (0, 0, math.radians(-8))
    up = 0.0
    if kind == 'skates':
        up = 0.08
    if kind == 'suction':
        up = 0.1
    pts = [(x, z + up) for x, z in BOOT]
    prism(pts, 0.2, body, at=0.0, parent=rt)
    prism([(-0.21, up - 0.02), (0.28, up - 0.02), (0.28, up + 0.03), (-0.21, up + 0.03)], 0.21, sole, at=0.0, parent=rt)
    cuff = paint('boot-cuff', {'fire-boots': '#ffb02a', 'skates': '#f2e4c4', 'suction': '#e0a828'}[kind], rough=0.7)
    prism([(-0.185, 0.5 + up - 0.06), (0.025, 0.5 + up - 0.06), (0.025, 0.5 + up + 0.02), (-0.185, 0.5 + up + 0.02)], 0.23, cuff, at=0.0, parent=rt)
    if kind == 'fire-boots':
        fl = enamel('boot-flame', '#ffd23a')
        prism([(-0.14, 0.12), (-0.08, 0.3), (-0.12, 0.28), (-0.1, 0.42), (-0.02, 0.26), (-0.05, 0.27), (0.0, 0.1)], 0.215, fl, at=0.0, parent=rt)
    if kind == 'skates':
        st = paint('blade', '#c9d6de', rough=0.2, metal=0.9)
        prism([(-0.26, 0.02), (0.34, 0.02), (0.36, 0.06), (0.28, 0.08), (-0.22, 0.08), (-0.27, 0.04)], 0.035, st, at=0.0, parent=rt)
        for x in (-0.12, 0.2):
            box(x - 0.015, x + 0.015, -0.015, 0.015, 0.06, up - 0.02, st, st, 0.0, parent=rt)
        ice = enamel('skate-lace', '#3a88d8')
        for z in (0.38, 0.28, 0.2):
            box(-0.05, 0.0, -0.11, 0.11, z + up, z + up + 0.025, ice, ice, 0.0, parent=rt)
    if kind == 'suction':
        cupm = paint('cup', '#d9a53c', rough=0.3, metal=0.7)
        cup2 = paint('cup-in', '#6b3a18', rough=0.8)
        cyl((0.0, 0, 0.04), 0.2, 0.12, 0.09, 'Y', cupm, parent=rt, rot=(0, 0, 0))
        cyl((0.0, -0.045, 0.04), 0.1, length=0.02, axis='Y', mat=cup2, parent=rt)
    blob(0.32, 0.0, 0.35)


def build_mirror(f):
    br = bronze('mirror-bronze', '#c27a34')
    pol = paint('mirror-glass', '#f0d9a8', rough=0.12, metal=1.0, var=0.2, spec=1.0)
    gl = MB('mirror-face')
    gl.pbr('#2c4a3a', 0.35, 0.3)
    rt = empty((0, 0.0, 0.0))
    rt.rotation_euler = (math.radians(-12), 0, 0)
    cy = 0.42
    cyl((0, 0.0, cy), 0.3, length=0.05, axis='Y', mat=br, parent=rt, seg=32)
    cyl((0, -0.03, cy), 0.245, length=0.03, axis='Y', mat=pol, parent=rt, seg=32)
    torus((0, -0.03, cy), 0.26, 0.022, gold('mirror-rim'), rot=(math.pi / 2, 0, 0), parent=rt)
    # the gorgon face
    skin = paint('gorgon', '#3f6b48', rough=0.5, var=0.3)
    ball((0, -0.06, cy - 0.01), 0.12, skin, (1, 0.35, 1), parent=rt)
    eye = enamel('gorgon-eye', '#ffe55a')
    for sx in (-1, 1):
        ball((sx * 0.05, -0.085, cy + 0.03), 0.028, eye, (1, 0.5, 1), parent=rt)
        ball((sx * 0.05, -0.1, cy + 0.03), 0.012, paint('pupil', '#101010'), (1, 0.5, 1), parent=rt, outline=False)
    box(-0.05, 0.05, -0.1, -0.075, cy - 0.07, cy - 0.04, paint('gorgon-mouth', '#1a1a1a'), None, 0.0, parent=rt, outline=False)
    hair = paint('snake', '#2f9a4a', rough=0.4, var=0.3)
    for i in range(9):
        a = math.radians(-20 + i * 25)
        ball((math.cos(a + 0.0) * 0.15 * (1 if i < 5 else 1), -0.06, cy + 0.05 + math.sin(a) * 0.14), 0.028, hair, parent=rt)
    cyl((0, 0.0, cy - 0.4), 0.04, length=0.18, axis='Z', mat=br, parent=rt, seg=12)
    ball((0, 0, 0.02), 0.05, br)
    blob(0.3, 0.0, 0.4)


def build_cake(f):
    cake = paint('cake', '#cf8f3a', rough=0.7, var=0.35, bump=0.4, scale=18)
    honey = paint('honey', '#f0a818', rough=0.1, var=0.1, bump=0.0, spec=1.0, coat=1.0)
    plate = bronze('cake-plate')
    cyl((0, 0, 0.012), 0.34, 0.33, 0.024, mat=plate, seg=32)
    cyl((0, 0, 0.12), 0.25, 0.23, 0.2, mat=cake, seg=32)
    cyl((0, 0, 0.225), 0.255, 0.23, 0.03, mat=honey, seg=32)
    nut = paint('almond', '#e8cf9a', rough=0.6)
    for i in range(8):
        a = i / 8 * math.tau
        ball((math.cos(a) * 0.17, math.sin(a) * 0.17 - 0.0, 0.25), 0.04, nut, (1, 0.7, 0.5), rot=(0, 0, a))
    ball((0.0, 0.0, 0.25), 0.06, honey, (1, 1, 0.5))
    for a in (0.5, 2.2, 4.0):
        ball((math.cos(a) * 0.22, math.sin(a) * 0.22, 0.17), 0.04, honey, (0.8, 0.8, 1.6))
    blob(0.34, 0.0, 0.35)


def cow_parts(rt, hide, spot, nose, wood, horn):
    box(-0.2, 0.2, -0.09, 0.09, 0.14, 0.31, hide, hide, 0.03, parent=rt)
    box(0.17, 0.32, -0.065, 0.065, 0.2, 0.34, hide, hide, 0.025, parent=rt)
    box(0.3, 0.37, -0.05, 0.05, 0.2, 0.28, nose, nose, 0.018, parent=rt)
    for sy in (-1, 1):
        cyl((0.22, sy * 0.075, 0.37), 0.015, 0.0, 0.07, mat=horn, parent=rt, seg=8, rot=(sy * 0.4, 0, 0))
        ball((0.2, sy * 0.075, 0.33), 0.03, hide, (0.7, 0.4, 1.0), parent=rt)
    box(-0.26, 0.26, -0.11, 0.11, 0.075, 0.115, wood, wood, 0.01, parent=rt)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cyl((sx * 0.15, sy * 0.125, 0.065), 0.065, length=0.03, axis='Y', mat=spot, parent=rt, seg=14)
            cyl((sx * 0.15, sy * 0.14, 0.065), 0.025, length=0.02, axis='Y', mat=nose, parent=rt, seg=8)
    cyl((-0.2, 0, 0.27), 0.012, length=0.16, mat=spot, parent=rt, seg=6, rot=(0, 0.5, 0))


def build_cow(f, standing=False):
    m = MB('cow-hide')
    nz = m.noise(7, 2, 0.5)
    spots = m.ramp(nz, [(0.48, '#f4ead4'), (0.52, '#4a2a16')], 'CONSTANT')
    m.pbr(spots, 0.6, 0.0, m.bump(nz, 0.2, 0.02), spec=0.4)
    spot = paint('wheel', '#5a3416', rough=0.7)
    nose = paint('cow-nose', '#e8a2a0', rough=0.5)
    wood = paint('cow-wood', '#b87a3c', rough=0.7, var=0.35)
    horn = paint('cow-horn', '#f4ead4', rough=0.5)
    rt = empty((0, Y0 if standing else 0.0, 0.0))
    s = 1.55 if standing else 1.3
    rt.scale = (s, s, s)
    rt.rotation_euler = (0, 0, math.radians(-38))
    cow_parts(rt, m.mat, spot, nose, wood, horn)
    blob(0.38 * s, Y0 if standing else 0.0, 0.35)


# ---------------------------------------------------------------------- story
def build_page(f):
    pap = paint('papyrus', '#c9a05a', rough=0.8, var=0.3, bump=0.4, scale=24)
    ink = paint('papyrus-ink', '#4a2e18', rough=0.8)
    rod = paint('rod', '#6a3d1c', rough=0.6)
    red = enamel('page-ribbon', '#c4161c')
    rt = empty((0, 0, 0))
    rt.rotation_euler = (0, 0, math.radians(18))
    cyl((0, 0, 0.1), 0.12, length=0.62, axis='X', mat=pap, parent=rt, seg=24)
    for sx in (-1, 1):
        cyl((sx * 0.335, 0, 0.1), 0.135, 0.07, 0.05, axis='X', mat=rod, parent=rt, seg=16, rot=(0, 0, 0))
        cyl((sx * 0.31, 0, 0.1), 0.05, length=0.04, axis='X', mat=pap, parent=rt, seg=12)
    cyl((0.0, 0, 0.1), 0.14, length=0.07, axis='X', mat=red, parent=rt, seg=24)
    box(-0.2, -0.08, -0.12, 0.01, 0.0, 0.05, pap, pap, 0.01, parent=rt)       # the loose curl
    for i in range(4):
        box(0.1, 0.27, -0.118 - 0.0, -0.112, 0.04 + i * 0.045, 0.058 + i * 0.045, ink, ink, 0.0, parent=rt, outline=False)
    blob(0.38, 0.0, 0.35)


def build_block(f):
    st = limestone('block', '#a39a88', '#8a826f', 6.0, 0.6, grid=False)
    side = limestone('block-side', '#7e7665', '#6a6354', 6.0, 0.6, grid=False)
    box(-0.44, 0.44, -0.44, 0.34, 0.0, 0.34, st, side, 0.035, outline=True)
    ins = limestone('block-inset', '#8f8774', '#7a7260', 9.0, 0.5, grid=False)
    box(-0.32, 0.32, -0.32, 0.22, 0.33, 0.352, ins, ins, 0.01, outline=False)


# --------------------------------------------------------------------- figures
def build_theseus(f):
    skin = paint('skin', '#cf8d5f', rough=0.6, var=0.15)
    hair = paint('hair', '#3a2010', rough=0.7)
    tunic = paint('tunic', '#1b6f7a', rough=0.7, var=0.25, bump=0.3)
    cloak = paint('cloak', '#c4211a', rough=0.65, var=0.35, bump=0.3)
    leather = paint('belt', '#4a2a12', rough=0.6)
    thread = paint('thread', '#c4161c', rough=0.9, bump=0.5, scale=40)
    wood = paint('spool', '#b87a3c', rough=0.6)
    y = Y0
    cl = [(-0.15, 0.56), (0.15, 0.56), (0.30, 0.16), (0.14, 0.08), (0.0, 0.14), (-0.14, 0.08), (-0.30, 0.16)]
    prism(cl, 0.035, cloak, at=y + 0.13)
    for sx in (-1, 1):
        cyl((sx * 0.075, y, 0.12), 0.05, 0.044, 0.25, mat=skin, seg=12)
        box(sx * 0.075 - 0.06, sx * 0.075 + 0.06, y - 0.12, y + 0.06, 0.0, 0.05, leather, leather, 0.015)
    cyl((0, y, 0.4), 0.19, 0.125, 0.3, mat=tunic, seg=24)
    cyl((0, y, 0.36), 0.165, length=0.045, mat=leather, seg=24)
    ball((0, y, 0.55), 0.14, tunic, (1.0, 0.8, 0.5))
    for sx in (-1, 1):
        cyl((sx * 0.185, y, 0.42), 0.04, 0.035, 0.24, mat=skin, seg=10, rot=(0, -sx * 0.3, 0))
        ball((sx * 0.215, y, 0.3), 0.045, skin)
        ball((sx * 0.155, y, 0.545), 0.06, tunic)
    # the thread spool in the right hand
    sp = (0.24, y - 0.05, 0.3)
    cyl(sp, 0.065, length=0.1, axis='Y', mat=thread, seg=16)
    for dy in (-0.055, 0.055):
        cyl((sp[0], sp[1] + dy, sp[2]), 0.085, length=0.02, axis='Y', mat=wood, seg=16)
    # head
    ball((0, y, 0.66), 0.11, skin)
    ball((0, y + 0.04, 0.705), 0.108, hair, (1.0, 0.92, 0.72))
    for sx in (-1, 1):
        ball((sx * 0.04, y - 0.1, 0.665), 0.016, paint('eye', '#201008'), outline=False)
    cyl((0, y - 0.012, 0.745), 0.015, length=0.04, mat=gold('clasp'), seg=8, outline=False)
    ball((0, y - 0.07, 0.535), 0.03, gold('clasp'), outline=False)
    blob(0.26, y, 0.4)
    k = 1.22                                    # taller, near the Minotaur's height: the head uses the rise band
    ROOT.scale = tuple(v * k for v in ROOT.scale)
    ROOT.location = (0, (1 - k) * ROOT.scale[1] / k * y, 0)


def build_minotaur(f, stone=False):
    n = ARGS_FRAMES['minotaur']
    if stone:
        hide = limestone('stone-hide', '#9a9488', '#78726a', 7.0, 0.7, grid=False)
        hide2 = limestone('stone-hide2', '#8a8478', '#6a655d', 7.0, 0.7, grid=False)
        horn = limestone('stone-horn', '#b4aea0', '#938d80', 7.0, 0.5, grid=False)
        snout = hide2
        cloth = hide2
        eye = hide2
        ring = hide2
    else:
        hide = paint('hide', '#5a2e16', rough=0.85, var=0.4, bump=0.7, scale=30)
        hide2 = paint('hide-dk', '#33190c', rough=0.85, var=0.3, bump=0.5, scale=30)
        horn = paint('horn', '#f0e4c0', rough=0.45, var=0.25)
        snout = paint('snout', '#8a5a40', rough=0.7, var=0.3)
        cloth = paint('loin', '#8c1818', rough=0.8, var=0.3)
        eye = MB('minotaur-eye')
        eye.emission('#ff5a1a', 2.0)
        eye = eye.mat
        ring = gold('nose-ring')
    y = Y0
    hoof = paint('hoof', '#150d08', rough=0.5)
    for sx in (-1, 1):
        cyl((sx * 0.1, y, 0.11), 0.075, 0.062, 0.23, mat=hide2)
        box(sx * 0.1 - 0.065, sx * 0.1 + 0.065, y - 0.1, y + 0.06, 0.0, 0.05, hoof if not stone else hide2, hoof if not stone else hide2, 0.015)
    cyl((0, y, 0.3), 0.21, 0.15, 0.16, mat=cloth)
    up = empty((0, y, 0.3))
    parts = []
    parts.append(ball((0, y, 0.5), 0.27, hide, (1.0, 0.68, 0.9)))
    parts.append(ball((0, y - 0.02, 0.55), 0.22, hide2, (1.05, 0.6, 0.85)))
    parts.append(ball((0, y, 0.67), 0.14, hide, (1.0, 0.9, 0.7)))
    for sx in (-1, 1):
        parts.append(ball((sx * 0.27, y, 0.66), 0.1, hide))
        parts.append(cyl((sx * 0.31, y, 0.5), 0.075, 0.09, 0.26, mat=hide, rot=(0, -sx * 0.25, 0)))
        parts.append(ball((sx * 0.335, y, 0.37), 0.085, hide2))
    # the bull's head, facing the viewer
    hz = 0.76
    parts.append(ball((0, y - 0.01, hz), 0.115, hide, (1.0, 0.95, 1.0)))
    parts.append(ball((0, y - 0.09, hz - 0.035), 0.075, snout, (1.0, 0.85, 0.75)))
    for sx in (-1, 1):
        parts.append(ball((sx * 0.028, y - 0.15, hz - 0.035), 0.014, hoof if not stone else hide2, outline=False))
        parts.append(ball((sx * 0.062, y - 0.08, hz + 0.045), 0.02, eye, outline=False))
        parts.append(ball((sx * 0.12, y + 0.0, hz + 0.01), 0.05, hide2, (1.4, 0.4, 0.7), rot=(0, sx * 0.3, 0)))
        # a horn: three tapering segments sweeping out and up
        p = Vector((sx * 0.1, y - 0.01, hz + 0.05))
        segs = ((78, 0.09, 0.05, 0.04), (35, 0.1, 0.04, 0.03), (-12, 0.09, 0.03, 0.012))
        for ang, ln, r0, r1 in segs:
            a = math.radians(ang) * sx
            d = Vector((math.sin(a), 0.0, math.cos(a)))
            c = p + d * ln / 2
            parts.append(cyl(c, r0, r1, ln, mat=horn, seg=10, rot=(0, a, 0)))
            p = p + d * ln
    parts.append(torus((0, y - 0.15, hz - 0.075), 0.032, 0.008, ring, rot=(math.pi / 2, 0, 0)))
    for o in parts:
        child_of(o, up)
    for fr in range(n):
        t = fr / n
        b = math.sin(math.tau * t)
        key_obj(up, fr, scale=(1.0 + 0.012 * b, 1.0, 1.0 + 0.045 * b), location=(0, y, 0.3 + 0.012 * b))
    blob(0.3, y, 0.45)


def build_minotaur_stone(f):
    build_minotaur(f, stone=True)


# -------------------------------------------------------------------- sprites
# name, builder, frames, fps, kind, outline. Rows of the atlas follow this order
# (the order tiles.ts lists them: terrain, then objects, then figures).
SPRITES = [
    ('floor', build_floor, 1, 0, 'terrain'),
    ('wall', build_wall, 1, 0, 'terrain'),
    ('exit', build_exit, 1, 0, 'terrain'),
    ('gate-closed', lambda f: build_gate(f, True), 1, 0, 'terrain'),
    ('gate-open', lambda f: build_gate(f, False), 1, 0, 'terrain'),
    ('water', build_water, 8, 8, 'terrain'),
    ('fire', build_fire, 8, 10, 'terrain'),
    ('ice', build_ice, 1, 0, 'terrain'),
    ('force-up', lambda f: build_force(f, 'up'), 8, 8, 'terrain'),
    ('force-down', lambda f: build_force(f, 'down'), 8, 8, 'terrain'),
    ('force-left', lambda f: build_force(f, 'left'), 8, 8, 'terrain'),
    ('force-right', lambda f: build_force(f, 'right'), 8, 8, 'terrain'),
    ('dirt', build_dirt, 1, 0, 'terrain'),
    ('safe', build_safe, 1, 0, 'terrain'),
    ('button', build_button, 1, 0, 'terrain'),
    ('toggle-open', lambda f: build_toggle(f, False), 1, 0, 'terrain'),
    ('toggle-closed', lambda f: build_toggle(f, True), 1, 0, 'terrain'),
    ('door-red', lambda f: build_door(f, 'red'), 1, 0, 'terrain'),
    ('door-blue', lambda f: build_door(f, 'blue'), 1, 0, 'terrain'),
    ('door-yellow', lambda f: build_door(f, 'yellow'), 1, 0, 'terrain'),
    ('door-green', lambda f: build_door(f, 'green'), 1, 0, 'terrain'),
    ('relic', build_relic, 1, 0, 'object'),
    ('key-red', lambda f: build_key(f, 'red'), 1, 0, 'object'),
    ('key-blue', lambda f: build_key(f, 'blue'), 1, 0, 'object'),
    ('key-yellow', lambda f: build_key(f, 'yellow'), 1, 0, 'object'),
    ('key-green', lambda f: build_key(f, 'green'), 1, 0, 'object'),
    ('flippers', build_flippers, 1, 0, 'object'),
    ('fire-boots', lambda f: build_boots(f, 'fire-boots'), 1, 0, 'object'),
    ('skates', lambda f: build_boots(f, 'skates'), 1, 0, 'object'),
    ('suction', lambda f: build_boots(f, 'suction'), 1, 0, 'object'),
    ('mirror', build_mirror, 1, 0, 'object'),
    ('cake', build_cake, 1, 0, 'object'),
    ('cow', build_cow, 1, 0, 'object'),
    ('page', build_page, 1, 0, 'object'),
    ('block', build_block, 1, 0, 'object'),
    ('theseus', build_theseus, 1, 0, 'figure'),
    ('minotaur', build_minotaur, 8, 6, 'figure'),
    ('minotaur-stone', build_minotaur_stone, 1, 0, 'figure'),
    ('cow-standing', lambda f: build_cow(f, True), 1, 0, 'figure'),
]
ARGS_FRAMES = {name: frames for name, _, frames, _, _ in SPRITES}


# ---------------------------------------------------------------- compositing
def render_frames(sc, frames, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    paths = []
    for f in range(frames):
        sc.frame_set(f)
        p = os.path.join(out_dir, 'f%03d.png' % f)
        sc.render.filepath = p
        bpy.ops.render.render(write_still=True)
        paths.append(p)
    return paths


def read_png(path):
    img = bpy.data.images.load(path)
    img.alpha_mode = 'CHANNEL_PACKED'              # raw values, no (un)premultiplying
    img.colorspace_settings.name = 'Non-Color'
    w, h = img.size
    a = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(a)
    bpy.data.images.remove(img)
    return a.reshape(h, w, 4)


def downsample(a, k):
    """Box-average k x k blocks, weighting colour by alpha so edges stay clean."""
    if k == 1:
        return a
    h, w, _ = a.shape
    a = a.reshape(h // k, k, w // k, k, 4)
    al = a[..., 3]
    wsum = al.sum(axis=(1, 3))
    rgb = (a[..., :3] * al[..., None]).sum(axis=(1, 3)) / np.maximum(wsum, 1e-6)[..., None]
    return np.concatenate([rgb, (wsum / (k * k))[..., None]], axis=-1)


def write_png(arr, path):
    """arr: rows top-down, float RGBA 0..1."""
    h, w, _ = arr.shape
    img = bpy.data.images.new('sheet', w, h, alpha=True)
    img.alpha_mode = 'CHANNEL_PACKED'
    img.colorspace_settings.name = 'Non-Color'
    img.pixels.foreach_set(np.ascontiguousarray(arr[::-1]).reshape(-1))
    img.filepath_raw = path
    img.file_format = 'PNG'
    img.save()
    bpy.data.images.remove(img)


def render_sprite(name, build, frames, kind, blend_path):
    """Build one sprite's scene, save its .blend, render its frames; returns them
    as float RGBA arrays CELL wide and CELL + RISE tall, rows top-down."""
    ARGS_FRAMES[name] = frames
    sc = new_scene(frames, figure=(kind == 'figure'), outline=(kind != 'terrain'))
    build(frames)
    if ARGS['blend']:
        bpy.context.preferences.filepaths.save_version = 0
        os.makedirs(os.path.dirname(blend_path), exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=blend_path, compress=True)
    tmp = os.path.join(ARGS['out'], '_frames', name)
    paths = render_frames(sc, frames, tmp)
    k = ARGS['supersample']
    out = []
    for p in paths:
        a = read_png(p)[::-1]                       # Blender stores rows bottom-up
        out.append(downsample(np.ascontiguousarray(a), k))
    return out


def quantize(path):
    code = ("import sys\nfrom PIL import Image\nim = Image.open(sys.argv[1]).convert('RGBA')\n"
            "im.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(sys.argv[1], optimize=True)\n")
    r = run_python(code, [path])
    return r is not None and r.returncode == 0


def run_python(code, argv):
    for py in ('/usr/bin/python3', '/opt/homebrew/bin/python3', 'python3'):
        try:
            r = subprocess.run([py, '-I', '-c', code, *argv], capture_output=True, text=True, timeout=300)
        except (OSError, subprocess.TimeoutExpired):
            continue
        if r.returncode in (0, 1) and 'No module named' not in r.stderr:
            return r
    return None


# The 16 px check and the preview, run by the system python3 (Blender's has no Pillow).
CHECK_PY = r'''
import json, sys
from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageStat

png, meta, preview = sys.argv[1:4]
atlas = json.load(open(meta))
cell, rise = atlas['cell'], atlas['rise']
sheet = Image.open(png).convert('RGBA')
KINDS = json.loads(sys.argv[4])

def frame(name, i=0):
    s = atlas['sprites'][name]
    return sheet.crop((s['x'] + i * cell, s['y'], s['x'] + (i + 1) * cell, s['y'] + cell + rise))

def shrink(im, w):
    """Lanczos with premultiplied alpha, so edges do not pick up the transparent colour."""
    h = round(im.height * w / im.width)
    a = im.getchannel('A')
    rgb = Image.merge('RGB', [ImageChops.multiply(c, a) for c in im.split()[:3]])
    return rgb.resize((w, h), Image.LANCZOS), a.resize((w, h), Image.LANCZOS)

def lum(rgb_pm):
    return ImageStat.Stat(rgb_pm.convert('L')).sum[0]

def mean_lum(im, w=16):
    rgb, a = shrink(im, w)
    cov = ImageStat.Stat(a).sum[0]
    return (lum(rgb) / cov if cov else 0.0), cov / (255.0 * a.width * a.height)

floor_lum, _ = mean_lum(frame('floor'))
failures = []
wall_lum, _ = mean_lum(frame('wall'))
print('floor %.2f  wall %.2f  gap %.2f' % (floor_lum, wall_lum, floor_lum - wall_lum))
if floor_lum - wall_lum < 0.25:
    failures.append('wall: luminance %.2f vs floor %.2f (gap %.2f, need 0.25)' % (wall_lum, floor_lum, floor_lum - wall_lum))
rows = []
for name, kind in KINDS.items():
    if kind == 'terrain':
        continue
    l, cov = mean_lum(frame(name))
    d = abs(l - floor_lum)
    ok = 0.12 <= cov <= 0.85 and d >= 0.18
    rows.append((name, cov, l, d, ok))
    if not ok:
        failures.append('%s: coverage %.0f%%, luminance %.2f vs floor %.2f (diff %.2f)' % (name, cov * 100, l, floor_lum, d))
for name, cov, l, d, ok in rows:
    print('%-16s coverage %3.0f%%  luminance %.2f  diff %.2f  %s' % (name, cov * 100, l, d, 'ok' if ok else 'FAIL'))

# preview: every sprite at 16, 24 and 48 px on floor, labelled
try:
    font = ImageFont.load_default(size=10)
except TypeError:
    font = ImageFont.load_default()
sizes = (16, 24, 48)
names = list(atlas['sprites'])
pad = 6
cw = sum(sizes) + pad * 4
ch = round((cell + rise) * 48 / cell) + 18
cols = 6
nrows = (len(names) + cols - 1) // cols
img = Image.new('RGB', (cols * cw, nrows * ch), (60, 56, 52))
d = ImageDraw.Draw(img)
fl = frame('floor')
floor_bg = Image.new('RGBA', (cell, cell + rise))
floor_cell = fl.crop((0, rise, cell, cell + rise))
floor_bg.paste(floor_cell, (0, 0))
floor_bg.paste(floor_cell, (0, rise))
for i, name in enumerate(names):
    gx, gy = (i % cols) * cw, (i // cols) * ch
    d.text((gx + pad, gy + 3), name, fill=(240, 236, 228), font=font)
    x = gx + pad
    sp = frame(name)
    for w in sizes:
        h = round((cell + rise) * w / cell)
        rgb, a = shrink(sp, w)
        under = floor_bg.resize((w, h), Image.LANCZOS).convert('RGB')
        inv = a.point(lambda v: 255 - v)
        small = ImageChops.add(rgb, Image.merge('RGB', [ImageChops.multiply(c, inv) for c in under.split()]))
        img.paste(small, (x, gy + 16))
        x += w + pad
img.save(preview)

# a mock board with the real draw order: rows top to bottom, each sprite's rise over the row above
BOARD = [
    '#########',
    '#.S..#.E#',
    '#.##.#.|#',
    '#...~~.R#',
    '#.#.##=.#',
    '#r.F.>.y#',
    '#########',
]
LEGEND = {'.': 'floor', '#': 'wall', 'S': 'safe', 'E': 'exit', '|': 'gate-closed', '~': 'water', 'R': 'door-red',
          '=': 'ice', 'F': 'fire', '>': 'force-right'}
ITEMS = {'r': 'key-red', 'y': 'key-yellow'}
FIGS = [(1, 1, 'theseus'), (5, 3, 'minotaur'), (3, 5, 'cow-standing')]

def board(w):
    h = round((cell + rise) * w / cell)
    r = round(rise * w / cell)
    img = Image.new('RGBA', (len(BOARD[0]) * w, len(BOARD) * w + r), (30, 28, 26, 255))
    def put(name, row, col):
        sp = frame(name).resize((w, h), Image.LANCZOS)
        img.alpha_composite(sp, (col * w, row * w + r - (h - w)))
    for row, line in enumerate(BOARD):
        for col, ch in enumerate(line):
            if ch in ITEMS:
                put('floor', row, col)
            else:
                put(LEGEND[ch], row, col)
        for col, ch in enumerate(line):
            if ch in ITEMS:
                put(ITEMS[ch], row, col)
    for row, col, name in FIGS:
        put(name, row, col)
    return img

b16, b24 = board(16), board(24)
canvas = Image.new('RGBA', (b16.width + b24.width + 12, b24.height), (60, 56, 52, 255))
canvas.alpha_composite(b16, (0, 0))
canvas.alpha_composite(b24, (b16.width + 12, 0))
canvas.convert('RGB').save(preview.replace('preview-16', 'board-preview'))
for f in failures:
    print('FAIL ' + f)
sys.exit(1 if failures else 0)
'''


def check(out_dir, args):
    kinds = {name: kind for name, _, _, _, kind in SPRITES}
    r = run_python(CHECK_PY, [os.path.join(out_dir, 'tiles.png'), os.path.join(out_dir, 'tiles.json'),
                              os.path.join(os.path.dirname(os.path.abspath(__file__)), 'preview-16.png'), json.dumps(kinds)])
    if r is None:
        print('WARNING: Pillow is not importable by python3; the 16 px check was skipped (pip3 install pillow)')
        return True
    sys.stdout.write(r.stdout)
    sys.stderr.write(r.stderr)
    return r.returncode == 0


# ----------------------------------------------------------------------- main
def main():
    args = parse_args()
    ARGS.update(args)
    out = args['out']
    os.makedirs(out, exist_ok=True)
    blend_dir = os.path.abspath(args['blend_dir'])
    names = [s[0] for s in SPRITES]
    if len(set(names)) != len(names):
        raise SystemExit('render_tiles.py: duplicate sprite names')
    chosen = [s for s in SPRITES if args['only'] is None or s[0] in args['only']]
    if args['only'] is not None:
        missing = set(args['only']) - set(names)
        if missing:
            raise SystemExit('render_tiles.py: unknown sprite ' + ', '.join(sorted(missing)))
    rows = {}
    for name, build, frames, fps, kind in chosen:
        rows[name] = render_sprite(name, build, frames, kind, os.path.join(blend_dir, name + '.blend'))
        print('SPRITE %s: %d frame(s), engine %s' % (name, frames, bpy.context.scene.render.engine), flush=True)
    if args['only'] is not None:
        d = os.path.join(out, '_only')
        os.makedirs(d, exist_ok=True)
        for name, fr in rows.items():
            write_png(np.concatenate(fr, axis=1), os.path.join(d, name + '.png'))
        return
    h = CELL + RISE
    sheet = np.zeros((len(SPRITES) * h, COLS * CELL, 4), dtype=np.float32)
    sprites = {}
    for i, (name, _, frames, fps, _) in enumerate(SPRITES):
        for k, fr in enumerate(rows[name]):
            sheet[i * h:(i + 1) * h, k * CELL:(k + 1) * CELL] = fr
        sprites[name] = {'x': 0, 'y': i * h, 'frames': frames, 'fps': fps}
    assert list(sprites) == names, 'tiles.json must name exactly the sprites in SPRITES, in order'
    png = os.path.join(out, 'tiles.png')
    write_png(sheet, png)
    with open(os.path.join(out, 'tiles.json'), 'w') as fh:
        json.dump({'cell': CELL, 'rise': RISE, 'sprites': sprites}, fh, indent=2)
        fh.write('\n')
    q = quantize(png) if args['quantize'] else False
    print('ATLAS tiles.png: %d sprites, %d bytes%s' % (len(SPRITES), os.path.getsize(png), ' (quantized)' if q else ''))
    if not args['keep']:
        import shutil
        shutil.rmtree(os.path.join(out, '_frames'), ignore_errors=True)
    if args['check'] and not check(out, args):
        sys.exit(1)


main()
