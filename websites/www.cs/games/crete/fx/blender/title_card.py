"""The Island of Crete: the title card's picture, rendered with Blender.

The Labyrinth's entrance at night: a wall of cyclopean ashlar, red Minoan columns
with black capitals, horns of consecration on the lintel, a gold labrys over the
door, two bronze braziers, and a stair going down inside, lit from below by the
fire of the depths, where the Minotaur stands as a silhouette. Light shafts rise
out of the door through a thin haze. The upper third of the frame stays dark for
the card's title. Everything is built in code from primitives and procedural
materials (no outside assets); the render is crisp: no paint or blur pass, only
the view transform's tone map and a light grade.

Regenerate (from websites/www.cs/games/crete; Blender 4.2 or newer, tested on 5.2, and
ImageMagick 7 for the WebP encode):

    tools/render-title.sh

which writes fx/title/title-wide.webp and fx/title/title-tall.webp and saves the scene as
fx/blender/title.blend (Git LFS). It runs, for each framing,

    blender -b -P fx/blender/title_card.py -- --frame wide|tall --out OUT.png

Options (after the `--`):

    --frame wide|tall|near  wide: 16:9 landscape (desktop); tall: 9:16 portrait (phones);
                       near: a close look down the stair, for checking its detail (not shipped).
    --out PATH         The PNG to write.
    --scale F          Resolution scale (1 = 1920x1080 or 1080x1920). Default 1.
    --samples N        EEVEE samples. Default 96.
    --blend PATH       Also save the scene as this .blend (both framings share one scene;
                       the tall camera is `cam-tall`).
    --seed N           Seed for every random choice. Default 5.
"""
import math
import random
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []


def opt(name, default):
    return argv[argv.index(name) + 1] if name in argv else default


FRAME = opt('--frame', 'wide')
OUT = opt('--out', '/tmp/title.png')
SCALE = float(opt('--scale', '1'))
SAMPLES = int(opt('--samples', '96'))
BLEND = opt('--blend', '')
RND = random.Random(int(opt('--seed', '5')))


# ------------------------------------------------------------------ colour
def lin(c):
    h = c.lstrip('#')
    v = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in v)


# --------------------------------------------------------------- materials
class MB:
    """A small node-tree builder for one material."""

    def __init__(self, name):
        self.mat = bpy.data.materials.new(name)
        self.mat.use_nodes = True
        self.nt = self.mat.node_tree
        for n in list(self.nt.nodes):
            self.nt.nodes.remove(n)
        self.out = self.nt.nodes.new('ShaderNodeOutputMaterial')

    def set(self, sock, v):
        if isinstance(v, bpy.types.NodeSocket):
            self.nt.links.new(v, sock)
        elif isinstance(v, str):
            sock.default_value = (*lin(v), 1.0)
        elif isinstance(v, (tuple, list)):
            n = len(sock.default_value)
            sock.default_value = (list(v) + [1.0] * n)[:n]
        else:
            sock.default_value = v

    def n(self, kind, props=None, inp=None):
        nd = self.nt.nodes.new(kind)
        for k, v in (props or {}).items():
            setattr(nd, k, v)
        for k, v in (inp or {}).items():
            self.set(nd.inputs[k], v)
        return nd

    def obj_co(self):
        return self.n('ShaderNodeTexCoord').outputs['Object']

    def pos(self):
        return self.n('ShaderNodeNewGeometry').outputs['Position']

    def rand(self):
        """A random number per object, so each block of stone has its own tint."""
        return self.n('ShaderNodeObjectInfo').outputs['Random']

    def noise(self, scale, detail=6, rough=0.55, vec=None):
        return self.n('ShaderNodeTexNoise', inp={'Scale': scale, 'Detail': detail, 'Roughness': rough,
                                                 'Vector': vec if vec is not None else self.pos()}).outputs['Fac']

    def vor(self, scale, feature='F1', out='Distance', vec=None, rand=1.0):
        return self.n('ShaderNodeTexVoronoi', {'feature': feature},
                      {'Scale': scale, 'Randomness': rand, 'Vector': vec if vec is not None else self.pos()}).outputs[out]

    def ramp(self, fac, stops):
        nd = self.n('ShaderNodeValToRGB')
        el = nd.color_ramp.elements
        el[0].position, el[1].position = stops[0][0], stops[-1][0]
        for p, _ in stops[1:-1]:
            el.new(p)
        for e, (p, c) in zip(el, stops):
            e.color = (*lin(c), 1.0)
        self.set(nd.inputs['Fac'], fac)
        return nd.outputs['Color']

    def mix(self, a, b, fac=1.0, blend='MIX'):
        nd = self.n('ShaderNodeMix', {'data_type': 'RGBA', 'blend_type': blend})
        self.set(nd.inputs[0], fac)
        self.set(nd.inputs[6], a)
        self.set(nd.inputs[7], b)
        return nd.outputs[2]

    def math(self, op, a, b=0.0):
        nd = self.n('ShaderNodeMath', {'operation': op})
        self.set(nd.inputs[0], a)
        self.set(nd.inputs[1], b)
        return nd.outputs[0]

    def bump(self, h, s=0.5, d=0.05):
        return self.n('ShaderNodeBump', inp={'Height': h, 'Strength': s, 'Distance': d}).outputs['Normal']

    def pbr(self, base, rough=0.7, metal=0.0, normal=None, emit=None, estr=0.0, spec=0.4):
        b = self.n('ShaderNodeBsdfPrincipled', inp={'Base Color': base, 'Roughness': rough, 'Metallic': metal})
        b.inputs['Specular IOR Level'].default_value = spec
        if normal is not None:
            self.set(b.inputs['Normal'], normal)
        if emit is not None:
            self.set(b.inputs['Emission Color'], emit)
            b.inputs['Emission Strength'].default_value = estr
        self.nt.links.new(b.outputs['BSDF'], self.out.inputs['Surface'])
        return self.mat

    def emission(self, c, s):
        e = self.n('ShaderNodeEmission', inp={'Color': c, 'Strength': s})
        self.nt.links.new(e.outputs[0], self.out.inputs['Surface'])
        return self.mat


_MC = {}


def cached(fn):
    def wrap(*a, **k):
        key = (fn.__name__,) + a + tuple(sorted(k.items()))
        if key not in _MC:
            _MC[key] = fn(*a, **k)
        return _MC[key]
    return wrap


@cached
def solid(name, a, b=None, rough=0.75, metal=0.0, scale=8.0, bump=0.25, grime=0.3, spec=0.35):
    """A colour drifting between a and b with grime in a large noise."""
    m = MB(name)
    co = m.obj_co()
    nz = m.noise(scale, vec=co)
    col = m.ramp(nz, [(0.3, a), (0.7, b or a)])
    g = m.noise(1.6, 3, 0.5, co)
    col = m.mix(col, m.ramp(g, [(0.4, '#ffffff'), (0.75, '#6a5a48')]), grime, 'MULTIPLY')
    return m.pbr(col, rough, metal, m.bump(nz, bump, 0.02), spec=spec)


@cached
def ashlar(a='#8a8178', b='#6a625a'):
    """Dressed limestone: each block its own tint, pitted face, chipped and darker at its
    edges (the bevel's normals turn away, so the edge wear reads from the light)."""
    m = MB('ashlar')
    p = m.pos()
    r = m.rand()
    tint = m.ramp(r, [(0.0, a), (1.0, b)])
    nz = m.noise(3.0, 8, 0.62, p)
    col = m.mix(tint, m.ramp(nz, [(0.25, '#8f877c'), (0.75, '#ffffff')]), 1.0, 'MULTIPLY')
    pits = m.vor(18.0, 'F1', 'Distance', p)
    col = m.mix(col, m.ramp(pits, [(0.0, '#5a5048'), (0.12, '#ffffff')]), 0.6, 'MULTIPLY')
    stain = m.noise(0.7, 3, 0.5, p)
    col = m.mix(col, m.ramp(stain, [(0.45, '#ffffff'), (0.8, '#584a3c')]), 0.7, 'MULTIPLY')
    h = m.math('ADD', m.math('MULTIPLY', nz, 0.6), m.math('MULTIPLY', pits, 0.5))
    return m.pbr(col, 0.88, 0.0, m.bump(h, 0.8, 0.08), spec=0.22)


@cached
def paving():
    """Irregular flagstones of the forecourt: voronoi cells with dark joints."""
    m = MB('paving')
    p = m.pos()
    pm = m.n('ShaderNodeMapping', inp={'Vector': p, 'Scale': (1.0, 1.25, 1.0)}).outputs[0]
    edge = m.vor(1.7, 'DISTANCE_TO_EDGE', 'Distance', pm)
    cell = m.vor(1.7, 'F1', 'Color', pm)
    tint = m.ramp(m.n('ShaderNodeSeparateColor', inp={'Color': cell}).outputs[0],
                  [(0.0, '#6e655a'), (1.0, '#8c8274')])
    nz = m.noise(5.0, 8, 0.6, p)
    col = m.mix(tint, m.ramp(nz, [(0.3, '#8a8276'), (0.7, '#ffffff')]), 1.0, 'MULTIPLY')
    col = m.mix(col, m.ramp(edge, [(0.0, '#221d18'), (0.018, '#4a423a'), (0.04, '#ffffff')]), 1.0, 'MULTIPLY')
    h = m.math('ADD', m.ramp(edge, [(0.0, '#000000'), (0.08, '#ffffff')]).node.outputs[0], m.math('MULTIPLY', nz, 0.25))
    return m.pbr(col, 0.85, 0.0, m.bump(h, 0.55, 0.05), spec=0.28)


@cached
def fresco_red():
    m = MB('minoanred')
    co = m.obj_co()
    nz = m.noise(4.0, 6, 0.55, co)
    col = m.ramp(nz, [(0.3, '#9a2e1c'), (0.7, '#6e1c12')])
    flake = m.vor(12.0, 'F1', 'Distance', co)
    col = m.mix(col, m.ramp(flake, [(0.0, '#c8b8a0'), (0.05, '#ffffff')]), 0.35, 'MULTIPLY')
    return m.pbr(col, 0.72, 0.0, m.bump(nz, 0.35, 0.02), spec=0.3)


@cached
def glow(name, c, s):
    return MB(name).emission(c, s)


# ---------------------------------------------------------------- geometry
def link(o):
    bpy.context.scene.collection.objects.link(o)
    return o


def obj(name, bm, mats, smooth=False, bevel=0.0, seg=2):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = link(bpy.data.objects.new(name, me))
    for m in mats:
        me.materials.append(m)
    for pl in me.polygons:
        pl.use_smooth = smooth
    if bevel:
        b = o.modifiers.new('b', 'BEVEL')
        b.width, b.segments, b.limit_method = bevel, seg, 'ANGLE'
    return o


def box(c, s, mat, bevel=0.0, rot=(0, 0, 0), seg=2):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * s[0], v.co.y * s[1], v.co.z * s[2]))
    o = obj('box', bm, [mat], bevel=bevel, seg=seg)
    o.location, o.rotation_euler = c, rot
    return o


def cyl(c, r0, r1, h, mat, seg=24, rot=(0, 0, 0), smooth=True):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r0, radius2=r1, depth=h)
    o = obj('cyl', bm, [mat], smooth)
    o.location, o.rotation_euler = c, rot
    return o


def ball(c, r, mat, sc=(1, 1, 1), rot=(0, 0, 0), sub=3):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=r)
    o = obj('ball', bm, [mat], True)
    o.location, o.scale, o.rotation_euler = c, sc, rot
    return o


def torus(c, R, r, mat, rot=(0, 0, 0)):
    cu = bpy.data.curves.new('tor', 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth, cu.bevel_resolution = r, 3
    sp = cu.splines.new('POLY')
    pts = [(R * math.cos(t * math.tau / 32), R * math.sin(t * math.tau / 32), 0) for t in range(32)]
    sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts):
        p.co = (*q, 1)
    sp.use_cyclic_u = True
    o = link(bpy.data.objects.new('torus', cu))
    cu.materials.append(mat)
    o.location, o.rotation_euler = c, rot
    return o


def prism(profile, depth, mat, c, rot=(0, 0, 0), bevel=0.0, smooth=False):
    """A flat outline in XZ (list of (x, z)) extruded `depth` along Y and centred on it."""
    bm = bmesh.new()
    vs = [bm.verts.new((x, -depth / 2, z)) for x, z in profile]
    f = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [e for e in ext['geom'] if isinstance(e, bmesh.types.BMVert)]:
        v.co.y += depth
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = obj('prism', bm, [mat], smooth=smooth, bevel=bevel)
    o.location, o.rotation_euler = c, rot
    return o


def parent(objs, root):
    for o in objs:
        o.parent = root
    return root


def empty(c=(0, 0, 0), rz=0.0):
    e = link(bpy.data.objects.new('e', None))
    e.location, e.rotation_euler = c, (0, 0, rz)
    return e


def point(c, energy, color, radius=0.1, name='lamp'):
    lg = bpy.data.lights.new(name, 'POINT')
    lg.energy, lg.color, lg.shadow_soft_size = energy, lin(color), radius
    lo = link(bpy.data.objects.new(name, lg))
    lo.location = c
    return lo


def spot(c, aim, energy, color, angle_deg, radius=0.2, blend=0.4, name='spot'):
    lg = bpy.data.lights.new(name, 'SPOT')
    lg.energy, lg.color, lg.shadow_soft_size = energy, lin(color), radius
    lg.spot_size, lg.spot_blend = math.radians(angle_deg), blend
    lo = link(bpy.data.objects.new(name, lg))
    lo.location = c
    d = (Vector(aim) - Vector(c)).normalized()
    lo.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    return lo


@cached
def fire_mat(name, strength):
    """Fire from the base up: near white-gold at the root, orange, then deep red and thinning to
    nothing at the tip."""
    m = MB(name)
    z = m.n('ShaderNodeSeparateXYZ', inp={'Vector': m.n('ShaderNodeTexCoord').outputs['Generated']}).outputs['Z']
    col = m.ramp(z, [(0.0, '#fff0b0'), (0.3, '#ffb030'), (0.65, '#ff5a0a'), (1.0, '#b01404')])
    em = m.n('ShaderNodeEmission', inp={'Color': col, 'Strength': m.math('MULTIPLY', m.math('SUBTRACT', 1.25, z), strength)})
    tr = m.n('ShaderNodeBsdfTransparent')
    mx = m.n('ShaderNodeMixShader')
    m.set(mx.inputs[0], m.math('POWER', z, 2.5))
    m.nt.links.new(em.outputs[0], mx.inputs[1])
    m.nt.links.new(tr.outputs[0], mx.inputs[2])
    m.nt.links.new(mx.outputs[0], m.out.inputs['Surface'])
    try:
        m.mat.surface_render_method = 'BLENDED'
    except AttributeError:
        pass
    return m.mat


def flame(c, s=1.0):
    """Tongues of fire: orange outer cones round yellow cores, each leaning its own way."""
    core, outer = fire_mat('flamecore', 3.0), fire_mat('flameouter', 1.6)
    objs = []
    for k in range(7):
        a = k * 2.4
        rr = 0.0 if k == 0 else 0.05 + 0.03 * (k % 3)
        h = 1.0 if k == 0 else RND.uniform(0.45, 0.8)
        lean = (RND.uniform(-0.25, 0.25), RND.uniform(-0.25, 0.25), 0)
        x, y = c[0] + math.cos(a) * rr * s, c[1] + math.sin(a) * rr * s
        objs.append(cyl((x, y, c[2] + 0.15 * s * h), 0.075 * s * (1.1 - 0.3 * (k > 0)), 0.0, 0.34 * s * h, outer, 14, rot=lean))
        if k < 4:
            objs.append(cyl((x, y, c[2] + 0.09 * s * h), 0.04 * s, 0.0, 0.18 * s * h, core, 12, rot=lean))
    return objs


# ---------------------------------------------------------------- figures
def build_minotaur(x, y, z, face, k):
    """The beast as in the game's spike: hulking, horned, a labrys upright in his right hand."""
    hide = solid('hide', '#4a2a18', '#2c180c', rough=0.9, scale=24, bump=0.7)
    hide2 = solid('hide2', '#2a160a', '#1a0d06', rough=0.9, scale=24, bump=0.6)
    horn = solid('horn', '#ece0c0', '#b0a080', rough=0.45, scale=10, grime=0.2)
    loin = solid('loin', '#5a1a14', '#3a0e0a', rough=0.85)
    bronze = solid('mbronze', '#8a5a24', '#4a2e10', rough=0.4, metal=0.35, scale=14)
    steel = solid('axe', '#a8a49a', '#6a665e', rough=0.3, metal=0.35, scale=14)
    eye = glow('meye', '#ff5a10', 30.0)
    root = empty((x, y, z), face)
    P = []
    for sx in (-1, 1):
        P.append(cyl((sx * 0.12, 0, 0.14), 0.085, 0.07, 0.28, hide2))
        P.append(box((sx * 0.12, -0.02, 0.03), (0.13, 0.15, 0.06), glow('hoof', '#0a0605', 1), 0.02))
    P.append(cyl((0, 0, 0.33), 0.24, 0.18, 0.16, loin))
    P.append(cyl((0, 0, 0.4), 0.215, 0.215, 0.05, bronze))
    P.append(ball((0, 0.02, 0.56), 0.3, hide, (1.0, 0.72, 0.85)))
    P.append(ball((0, 0.05, 0.68), 0.26, hide, (1.15, 0.7, 0.55)))
    for sx in (-1, 1):
        P.append(ball((sx * 0.32, 0.03, 0.7), 0.12, hide))
        P.append(cyl((sx * 0.37, 0.0, 0.52), 0.085, 0.1, 0.3, hide, rot=(0, -sx * 0.18, 0)))
        P.append(ball((sx * 0.4, -0.02, 0.36), 0.09, hide2))
        P.append(cyl((sx * 0.37, 0.0, 0.62), 0.11, 0.11, 0.04, bronze, rot=(0, -sx * 0.18, 0)))
    hz = 0.86
    P.append(ball((0, -0.06, hz), 0.13, hide, (1.0, 1.05, 0.95)))
    P.append(ball((0, -0.17, hz - 0.05), 0.085, hide2, (1.0, 1.0, 0.8)))
    for sx in (-1, 1):
        P.append(ball((sx * 0.065, -0.155, hz + 0.03), 0.022, eye))
        P.append(ball((sx * 0.14, -0.04, hz + 0.02), 0.055, hide2, (1.5, 0.5, 0.6)))
        pt = Vector((sx * 0.1, -0.06, hz + 0.07))
        for ang, ln, r0, r1 in ((80, 0.12, 0.05, 0.04), (40, 0.13, 0.04, 0.028), (-10, 0.12, 0.028, 0.008)):
            a = math.radians(ang) * sx
            d = Vector((math.sin(a), 0.0, math.cos(a)))
            P.append(cyl(pt + d * ln / 2, r0, r1, ln, horn, 10, rot=(0, a, 0)))
            pt = pt + d * ln
    P.append(cyl((0.42, -0.05, 0.6), 0.022, 0.022, 0.95, solid('haft', '#4a2c14', '#2a180a'), 8))
    for sx in (-1, 1):
        prof = [(0, -0.05), (sx * 0.2, -0.14), (sx * 0.24, 0.0), (sx * 0.2, 0.14), (0, 0.05)]
        if sx < 0:
            prof.reverse()
        P.append(prism(prof, 0.025, steel, (0.42, -0.05, 0.98)))
    parent(P, root)
    root.scale = (k, k, k)
    return root


# ------------------------------------------------------------------- scene
DOOR_W = 2.4          # the door's clear width
DOOR_H = 3.3          # threshold to lintel
WALL_T = 1.4          # the facade's thickness (the door's reveal)
STEP_D, STEP_H = 0.95, 0.3
STEPS = 13


def ashlar_wall(x0, x1, z0, z1, y, rows, mat, depth=0.9, skip=None):
    """Courses of big dressed blocks between x0..x1 and z0..z1 with their faces at y,
    each course its own height, the joints staggered, each block a little proud or sunk."""
    zs = [z0]
    for i in range(rows):
        zs.append(z0 + (z1 - z0) * (i + 1) / rows + (RND.uniform(-0.08, 0.08) if i < rows - 1 else 0))
    for r in range(rows):
        za, zb = zs[r], zs[r + 1]
        x = x0 - RND.uniform(0.0, 0.7)
        while x < x1:
            w = RND.uniform(0.9, 1.7)
            xa, xb = max(x, x0), min(x + w, x1)
            if xb - xa > 0.15 and not (skip and skip(xa, xb, za, zb)):
                proud = RND.uniform(-0.05, 0.07)
                box(((xa + xb) / 2, y + depth / 2 - proud, (za + zb) / 2),
                    (xb - xa - 0.035, depth, zb - za - 0.035), mat, bevel=0.045, seg=3)
            x += w


def build_facade():
    st = ashlar()
    big = ashlar('#7e766c', '#5e5750')
    half = DOOR_W / 2
    # the facade left and right of the door, then above the lintel
    ashlar_wall(-15.0, -half - 0.02, 0.0, DOOR_H + 0.05, 0.0, 4, big, depth=WALL_T)
    ashlar_wall(half + 0.02, 15.0, 0.0, DOOR_H + 0.05, 0.0, 4, big, depth=WALL_T)
    ashlar_wall(-15.0, -2.82, DOOR_H + 0.05, DOOR_H + 0.55, 0.0, 1, big, depth=WALL_T)
    ashlar_wall(2.82, 15.0, DOOR_H + 0.05, DOOR_H + 0.55, 0.0, 1, big, depth=WALL_T)
    ashlar_wall(-15.0, 15.0, DOOR_H + 0.55, DOOR_H + 1.75, 0.0, 2, st, depth=WALL_T)
    # a plinth course along the foot of the wall
    box((-5.2 - half / 2, -0.12, 0.12), (8.2, 0.3, 0.24), big, bevel=0.03)
    box((5.2 + half / 2, -0.12, 0.12), (8.2, 0.3, 0.24), big, bevel=0.03)
    # the reveal: the door's jambs, lined with big upright slabs
    for sx in (-1, 1):
        for i, (za, zb) in enumerate(((0.0, 1.5), (1.5, DOOR_H))):
            box((sx * (half + 0.12), WALL_T / 2, (za + zb) / 2), (0.24, WALL_T - 0.04, zb - za - 0.04), st, bevel=0.04)
    # the lintel: one great block, a painted band of red with a black rule and white discs (rosettes)
    box((0, 0.55, DOOR_H + 0.27), (DOOR_W + 3.2, WALL_T + 0.3, 0.5), st, bevel=0.05, seg=3)
    red, black = fresco_red(), solid('minoanblack', '#16110e', '#0c0907', rough=0.55)
    white = solid('limewhite', '#d8cfbc', '#b8ae98', rough=0.8, scale=12)
    box((0, -0.11, DOOR_H + 0.3), (DOOR_W + 3.2, 0.02, 0.24), red)
    box((0, -0.115, DOOR_H + 0.43), (DOOR_W + 3.2, 0.02, 0.035), black)
    box((0, -0.115, DOOR_H + 0.17), (DOOR_W + 3.2, 0.02, 0.035), black)
    for i in range(-6, 7):
        cyl((i * 0.44, -0.125, DOOR_H + 0.3), 0.07, 0.07, 0.02, white, 16, rot=(math.pi / 2, 0, 0))
        cyl((i * 0.44, -0.135, DOOR_H + 0.3), 0.03, 0.03, 0.02, red, 12, rot=(math.pi / 2, 0, 0))
    # the cornice above the upper courses
    box((0, 0.5, DOOR_H + 1.85), (30.4, WALL_T + 0.4, 0.22), st, bevel=0.04)


def build_columns():
    """Minoan columns before the facade: red shafts wider at the top, black cushion
    capitals and square abaci, on stone bases."""
    red, black = fresco_red(), solid('minoanblack', '#16110e', '#0c0907', rough=0.55)
    base = ashlar('#8c8478', '#7a7268')
    gold = solid('capband', '#b08a3a', '#7a5e22', rough=0.4, metal=0.4)
    for sx in (-1, 1):
        cx, cy = sx * (DOOR_W / 2 + 0.75), -0.55
        cyl((cx, cy, 0.08), 0.46, 0.46, 0.16, base, 32)
        cyl((cx, cy, 0.2), 0.4, 0.4, 0.08, base, 32)
        cyl((cx, cy, 0.24 + 1.48), 0.25, 0.33, 2.96, red, 32)
        cyl((cx, cy, 3.25), 0.35, 0.35, 0.07, gold, 32)
        # the cushion: a squat torus-like bulge
        ball((cx, cy, 3.4), 0.5, black, (1.0, 1.0, 0.36), sub=4)
        box((cx, cy, 3.55), (1.05, 1.05, 0.2), black, bevel=0.03)


def build_horns():
    """Horns of consecration along the lintel: a block base with two horns rising in a U."""
    st = solid('hornstone', '#b8a68a', '#8e7e66', rough=0.75, scale=6, bump=0.3)
    z = DOOR_H + 1.96
    for x0, k in ((0.0, 1.25), (-3.6, 0.85), (3.6, 0.85)):
        outer = [(-0.62, 0.0), (0.62, 0.0), (0.62, 0.2), (0.5, 0.75), (0.42, 0.95), (0.3, 0.92), (0.33, 0.6),
                 (0.24, 0.36), (0.0, 0.3), (-0.24, 0.36), (-0.33, 0.6), (-0.3, 0.92), (-0.42, 0.95), (-0.5, 0.75),
                 (-0.62, 0.2)]
        prism([(x * k, zz * k) for x, zz in outer], 0.45 * k, st, (x0, 0.45, z), bevel=0.03)


def build_labrys():
    """A gold double axe hung on the facade over the lintel."""
    gold = solid('tgold', '#d8a840', '#8a6418', rough=0.3, metal=0.75, scale=14)
    y, z = -0.12, DOOR_H + 1.12
    cyl((0, y, z), 0.04, 0.04, 1.0, gold, 12)
    cyl((0, y, z + 0.5), 0.07, 0.07, 0.05, gold, 12)
    for sx in (-1, 1):
        prof = [(0.03 * sx, -0.08), (0.36 * sx, -0.3), (0.46 * sx, -0.16), (0.42 * sx, 0.0), (0.46 * sx, 0.16),
                (0.36 * sx, 0.3), (0.03 * sx, 0.08)]
        if sx < 0:
            prof.reverse()
        prism(prof, 0.05, gold, (0, y, z + 0.12), bevel=0.01)
    # a faint warm light so the gold catches the braziers
    point((0, -1.2, z + 0.4), 8, '#ffb070', 0.3)


def build_stair():
    """The stair down: deep treads with worn noses, side walls of ashlar stepping down
    with them, a sloping ceiling of great slabs, and a fire glow from far below."""
    st = ashlar('#7a7268', '#5e5850')
    tread = solid('tread', '#a39888', '#857a6c', rough=0.7, scale=3, bump=0.12, grime=0.35)
    riser = solid('riser', '#1e1915', '#14100d', rough=0.95, scale=6)
    half = DOOR_W / 2
    y0 = WALL_T
    # the threshold slab
    box((0, WALL_T / 2, -0.06), (DOOR_W + 0.2, WALL_T, 0.12), tread, bevel=0.03)
    for i in range(STEPS):
        yc = y0 + (i + 0.5) * STEP_D
        zt = -(i + 1) * STEP_H
        # a tread is two or three slabs side by side, so the steps read as laid stone
        cuts = sorted(RND.uniform(-0.7, 0.7) for _ in range(RND.choice((1, 2))))
        xs = [-half] + cuts + [half]
        # each tread is a slab with a rounded nose overhanging a darker, recessed riser,
        # so every step shows a lit edge over a line of shadow
        for xa, xb in zip(xs, xs[1:]):
            box(((xa + xb) / 2, yc - 0.03, zt - 0.045), (xb - xa - 0.03, STEP_D + 0.06, 0.09), tread, bevel=0.04, seg=3)
        box((0, yc + 0.05, zt - 0.09 - (STEP_H - 0.09) / 2 - 0.4), (DOOR_W, STEP_D, STEP_H - 0.09 + 0.8), riser)
    # side walls: courses of blocks that step down with the stair
    for sx in (-1, 1):
        for i in range(0, STEPS, 2):
            ya = y0 + i * STEP_D
            zb = -(i + 1) * STEP_H - 0.1
            zz = zb
            while zz < DOOR_H + 0.4:
                h = RND.uniform(0.55, 0.8)
                box((sx * (half + 0.45), ya + STEP_D, zz + h / 2), (0.9, 2 * STEP_D - 0.03, h - 0.03), st, bevel=0.035)
                zz += h
    # ceiling slabs, stepping down every few treads
    for i in range(0, STEPS, 3):
        ya = y0 + i * STEP_D
        zc = DOOR_H + 0.15 - i * STEP_H * 0.75
        box((0, ya + 1.5 * STEP_D, zc), (DOOR_W + 1.2, 3 * STEP_D - 0.03, 0.3), st, bevel=0.03)
    # oil lamps in niches down the side walls: they rake the treads so each step shows
    bronze = solid('lampbronze', '#8a5a24', '#4a2e10', rough=0.4, metal=0.5)
    for k, i in enumerate((2, 6, 10)):
        sx = -1 if k % 2 == 0 else 1
        yl = y0 + (i + 0.5) * STEP_D
        zl = -(i + 1) * STEP_H + 0.75
        box((sx * (half + 0.12), yl, zl + 0.2), (0.3, 0.5, 0.6), glow('niche', '#140804', 1.0))
        ball((sx * (half - 0.02), yl, zl), 0.09, bronze, (1.0, 1.6, 0.5))
        flame((sx * (half - 0.02), yl - 0.1, zl + 0.03), 0.6)
        point((sx * (half - 0.25), yl - 0.15, zl + 0.25), 30 + 10 * k, '#ffa050', 0.1, 'niche')
    # the depths: a hot wall where the stair turns, and the fire's light
    bottom_y = y0 + STEPS * STEP_D
    bottom_z = -STEPS * STEP_H
    # the hot wall where the stair turns: embers and cracks glowing through the rock, not a flat light
    dg = MB('depthglow')
    dp = dg.pos()
    heat = dg.math('ADD', dg.noise(1.2, 6, 0.6, dp), dg.math('MULTIPLY', dg.vor(2.0, 'DISTANCE_TO_EDGE', 'Distance', dp), -0.6))
    dg.emission(dg.ramp(heat, [(0.15, '#5a1404'), (0.45, '#d84a12'), (0.7, '#ff9a3a')]), 2.0)
    box((0, bottom_y + 0.6, bottom_z + 2.0), (DOOR_W + 1.0, 0.4, 6.0), dg.mat)
    point((0, bottom_y - 0.8, bottom_z + 0.8), 6000, '#ff5a18', 1.2, 'depths')
    point((0, bottom_y - 1.0, bottom_z + 4.0), 4000, '#ff6a20', 0.5, 'treads')
    # the light shafts: a strong spot from the depths aimed up out of the door, through a haze
    spot((0, bottom_y - 1.2, bottom_z + 0.8), (0, -4.0, 4.5), 60000, '#ff7a2a', 30, 0.5, 0.3, 'shaft')
    # a second beam from high on the stair, under the ceiling, out through the door and over the forecourt
    spot((0, y0 + 11 * STEP_D, 1.0), (0, -7.0, 0.0), 16000, '#ff8a3a', 34, 0.4, 0.15, 'shaft-out')
    return bottom_y, bottom_z


def build_braziers():
    bronze = solid('brz', '#8a5a24', '#4a2e10', rough=0.38, metal=0.6, scale=12)
    dark = solid('brzdark', '#2a1c10', '#1a120a', rough=0.5, metal=0.5)
    coals = MB('coals')
    cv = coals.vor(14.0, 'DISTANCE_TO_EDGE', 'Distance', coals.obj_co())
    coals.emission(coals.ramp(cv, [(0.0, '#ffb040'), (0.06, '#b02a08'), (0.14, '#1a0a04')]), 6.0)
    for sx in (-1, 1):
        bx, by = sx * (DOOR_W / 2 + 2.35), -1.35
        for k in range(3):
            a = k * math.tau / 3 + 0.4
            lx, ly = bx + math.cos(a) * 0.28, by + math.sin(a) * 0.28
            cyl(((lx + bx) / 2, (ly + by) / 2, 0.55), 0.03, 0.03, 1.15, dark, 8,
                rot=(-math.sin(a) * 0.24, math.cos(a) * 0.24, 0))
            ball((lx, ly, 0.04), 0.06, dark)
        cyl((bx, by, 1.08), 0.16, 0.5, 0.36, bronze, 32)
        torus((bx, by, 1.26), 0.5, 0.035, bronze)
        cyl((bx, by, 1.22), 0.46, 0.46, 0.04, coals.mat, 32)
        flame((bx, by, 1.24), 2.1)
        flame((bx + 0.17, by + 0.05, 1.24), 1.35)
        flame((bx - 0.16, by - 0.06, 1.24), 1.5)
        point((bx, by - 0.15, 2.2), 160, '#ff9a50', 0.35, 'brazier')
        point((bx, by, 1.5), 60, '#ff7a30', 0.2, 'coalglow')


def build_ground():
    box((0, -8.0, -0.06), (40, 16, 0.12), paving())
    # two broad steps up to the threshold in front of the door
    st = ashlar('#8a8276', '#6e675e')
    box((0, -0.55, -0.05), (DOOR_W + 2.6, 1.1, 0.1), st, bevel=0.03)
    # a low dark hill line far behind the facade so the sky has a horizon
    box((0, 30, 2.0), (120, 1, 8), solid('hill', '#0c0e14', '#080a10', rough=1.0))


def build_world(sc):
    w = bpy.data.worlds.new('night')
    sc.world = w
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes['Background']
    bg.inputs['Color'].default_value = (*lin('#0a0d16'), 1)
    bg.inputs['Strength'].default_value = 0.35
    # the haze lives in a box round the door and forecourt, not the whole world, so the sky stays black
    haze = MB('haze')
    vol = haze.n('ShaderNodeVolumePrincipled', inp={'Density': 0.05, 'Color': '#c8b8a8', 'Anisotropy': 0.35})
    dn = haze.noise(0.6, 3, 0.5)
    haze.set(vol.inputs['Density'], haze.math('MULTIPLY', haze.math('ADD', dn, 0.2), 0.03))
    haze.nt.links.new(vol.outputs[0], haze.out.inputs['Volume'])
    hz = box((0, 2.0, 0.6), (14, 22, 9.0), haze.mat)
    hz.visible_shadow = False
    # denser air in the doorway's mouth, where the beam from below shows as shafts
    mouth = MB('mouth')
    mv = mouth.n('ShaderNodeVolumePrincipled', inp={'Color': '#d8c0a8', 'Anisotropy': 0.5})
    mouth.set(mv.inputs['Density'], mouth.math('MULTIPLY', mouth.math('ADD', mouth.noise(1.4, 4, 0.55), 0.1), 0.12))
    mouth.nt.links.new(mv.outputs[0], mouth.out.inputs['Volume'])
    mo_box = box((0, -1.6, 1.8), (3.6, 4.4, 3.6), mouth.mat)
    mo_box.visible_shadow = False
    # moonlight, cool and low, grazing the facade from the upper left
    ld = bpy.data.lights.new('moon', 'SUN')
    ld.energy, ld.color, ld.angle = 0.35, lin('#8ea0d0'), math.radians(2)
    mo = link(bpy.data.objects.new('moon', ld))
    mo.rotation_euler = (math.radians(62), math.radians(-34), math.radians(-24))
    # stars: tiny emitters on a far dome
    star = glow('star', '#dfe6ff', 6.0)
    r = random.Random(11)
    for _ in range(140):
        az = r.uniform(-1.2, 1.2)
        el = r.uniform(0.18, 0.75)
        d = 80
        ball((math.sin(az) * d * math.cos(el), math.cos(az) * d * math.cos(el), math.sin(el) * d), r.uniform(0.04, 0.09), star, sub=1)


def setup(sc, w, h):
    sc.render.engine = 'BLENDER_EEVEE' if 'BLENDER_EEVEE' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE_NEXT'
    ee = sc.eevee
    ee.taa_render_samples = SAMPLES
    for k, v in (('use_shadows', True), ('use_raytracing', True), ('volumetric_tile_size', '4'),
                 ('volumetric_samples', 96), ('volumetric_end', 60.0), ('use_volumetric_shadows', True),
                 ('volumetric_shadow_samples', 32), ('volumetric_ray_depth', 16)):
        try:
            setattr(ee, k, v)
        except (AttributeError, TypeError):
            pass
    try:
        ee.shadow_pool_size = '1024'
    except (AttributeError, TypeError):
        pass
    sc.render.resolution_x, sc.render.resolution_y = w, h
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = False
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_depth = '8'
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Medium High Contrast'
    sc.view_settings.exposure = 0.0


def camera(name, loc, aim, lens, shift_y=0.0):
    cam = link(bpy.data.objects.new(name, bpy.data.cameras.new(name)))
    cam.data.lens = lens
    cam.data.shift_y = shift_y
    cam.data.clip_end = 300
    cam.location = loc
    d = (Vector(aim) - Vector(loc)).normalized()
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    return cam


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    build_world(sc)
    build_ground()
    build_facade()
    build_columns()
    build_horns()
    build_labrys()
    by, bz = build_stair()
    build_braziers()
    # the beast, eight steps down, facing up the stair at whoever stands in the door
    i = 7
    build_minotaur(0.15, WALL_T + (i + 0.5) * STEP_D, -(i + 1) * STEP_H, math.pi, 1.95)
    point((0.0, WALL_T + (i + 3) * STEP_D, -(i + 1) * STEP_H + 1.2), 900, '#ff5a1a', 0.6, 'rim')

    wide = camera('cam-wide', (0.7, -11.5, 5.6), (0.0, 2.0, 1.9), 27, 0.075)
    tall = camera('cam-tall', (0.4, -11.0, 4.8), (0.0, 2.0, 1.9), 22, 0.16)
    near = camera('cam-near', (0.4, -4.0, 3.6), (0.0, 5.0, -1.0), 30)
    cams = {'wide': (wide, 1920, 1080), 'tall': (tall, 1080, 1920), 'near': (near, 1280, 720)}
    cam, w, h = cams[FRAME]
    sc.camera = cam
    setup(sc, round(w * SCALE), round(h * SCALE))
    if BLEND:
        bpy.context.preferences.filepaths.save_version = 0   # no title.blend1 beside it
        bpy.ops.wm.save_as_mainfile(filepath=BLEND, compress=True)
    sc.render.filepath = OUT
    bpy.ops.render.render(write_still=True)
    print('RENDERED', OUT)


main()
