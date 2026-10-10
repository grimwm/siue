"""Operation Tankity: render the animated effect sprite sheets with Blender.

Builds six sheets procedurally (no .blend files, no external assets), renders
every frame with a transparent background, tiles the frames into one PNG sprite
sheet per effect, and writes sprites.json describing the sheets. The game's
engine (fx.js) reads them; effects.json picks a sheet per emitter.

Regenerate (from this folder; Blender 4.2 or newer, tested on 5.2):

    /Applications/Blender.app/Contents/MacOS/Blender -b -P render_fx.py -- --out ../sprites

Install Blender with `brew install --cask blender`. Rendering all five sheets
takes about ten seconds on an Apple-silicon laptop.

Options (after the `--`):

    --out DIR         Where sheets and sprites.json go. Default ../sprites next
                      to this script.
    --only A,B        Render just these sheets: fireball, smoke, shock, energy,
                      mushroom, moon. Default: all. sprites.json keeps the entries of
                      sheets that were not re-rendered.
    --engine NAME     eevee (default; falls back to cycles if EEVEE cannot start
                      headless) or cycles.
    --samples N       Render samples per frame (EEVEE TAA / Cycles). Default 24.
    --supersample N   Render at N times the frame size and average down, for
                      clean edges at tiny sizes. Default 2.
    --seed N          Seed for every random scatter (embers, spikes, puffs).
                      Same seed, same sheets. Default 7.
    --blend-dir DIR   Where each scene is saved as <name>.blend before it is
                      rendered (the Blender source of every sheet, committed
                      through Git LFS). Default: next to this script.
    --no-blend        Do not save the .blend files.
    --no-quantize     Skip the 256-colour palette pass. By default, if Python's
                      Pillow is importable (system python3, not Blender's) the
                      sheets are palette-quantized with alpha kept, which cuts
                      them to a fraction of their size.
    --keep-frames     Leave the per-frame PNGs in <out>/_frames for inspection.

Sheet layout (all recorded in sprites.json): frames are square, `frame` px on a
side, row-major from the top-left, `cols` per row, `frames` in all; `fps` is the
rate the animation was designed for (an emitter may override it). Colour
conventions: `fireball` and `mushroom` are natural colour (fire and smoke);
`smoke`, `shock`, `energy` are neutral white and grey so an emitter's `tint`
(multiply) colours them. The mushroom stands on the bottom edge of its frame. `moon` is seven phases of
a procedural moon (maria and craters, lit by one sun lamp swung round it, a
touch of earthshine on the dark side); the game picks one per match.

Per-effect parameters live in the SHEETS table below: `frame` (px), `frames`,
`cols`, `fps`, and the builder function that animates it. Builders take
(frames, rng); their private constants (radii, drift, colours) are named at the
top of each function.
"""
import json
import math
import os
import random
import subprocess
import sys

import bpy
import numpy as np
from mathutils import Vector


# ---------------------------------------------------------------- arguments
def parse_args():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    here = os.path.dirname(os.path.abspath(__file__))
    a = {'out': os.path.join(here, '..', 'sprites'), 'only': None, 'engine': 'eevee', 'samples': 24,
         'supersample': 2, 'seed': 7, 'quantize': True, 'keep': False, 'blend': True, 'blend_dir': here}
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
        elif k == '--keep-frames': a['keep'] = True; i += 1
        else: raise SystemExit('render_fx.py: unknown option ' + k)
    a['out'] = os.path.abspath(a['out'])
    return a


# ------------------------------------------------------------------ helpers
def ease_out(t): return 1 - (1 - t) ** 3
def ease_in(t): return t * t
def smooth(a, b, t): return 0.0 if t <= a else 1.0 if t >= b else (lambda u: u * u * (3 - 2 * u))((t - a) / (b - a))


def reset_scene(frames, args, frame_px):
    """Empty scene, orthographic camera on the XZ plane, transparent film."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.frame_start, sc.frame_end = 0, frames - 1
    sc.render.resolution_x = sc.render.resolution_y = frame_px * args['supersample']
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.image_settings.color_depth = '8'
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'
    sc.world = bpy.data.worlds.new('W')
    sc.world.color = (0, 0, 0)
    engines = ['BLENDER_EEVEE', 'BLENDER_EEVEE_NEXT', 'CYCLES'] if args['engine'] == 'eevee' else ['CYCLES']
    for name in engines:
        try:
            sc.render.engine = name
            break
        except TypeError:
            continue
    if sc.render.engine == 'CYCLES':
        sc.cycles.samples = args['samples']
        sc.cycles.use_denoising = False
        sc.cycles.device = 'CPU'
    else:
        try:
            sc.eevee.taa_render_samples = args['samples']
        except AttributeError:
            pass
    cam = bpy.data.objects.new('Cam', bpy.data.cameras.new('Cam'))
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = 4.0
    cam.data.clip_start, cam.data.clip_end = 0.1, 40
    cam.location = (0, -10, 0)
    cam.rotation_euler = (math.radians(90), 0, 0)
    sc.collection.objects.link(cam)
    sc.camera = cam
    return sc, cam


def link(obj):
    bpy.context.scene.collection.objects.link(obj)
    return obj


def sphere(loc=(0, 0, 0), r=1.0, sub=3, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub, radius=r, location=loc)
    o = bpy.context.active_object
    o.scale = scale
    bpy.ops.object.shade_smooth()
    return o


def key(obj, path, frame, value=None):
    if value is not None:
        setattr(obj, path, value)
    obj.keyframe_insert(data_path=path, frame=frame)


def ramp_material(name, stops, strength=2.0, alpha_power=0.8, noise=0.0, noise_scale=3.0):
    """Emission-only material. Colour comes from a ramp over how directly the
    surface faces the camera (a cheap stand-in for lighting); `heat` shifts the
    ramp (0 hot, 1 cooled), `alpha` is the overall opacity. Both are keyframed
    through the returned value nodes. `noise` breaks the alpha up (0 = solid)."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    try:
        mat.surface_render_method = 'BLENDED'
    except (AttributeError, TypeError):
        mat.blend_method = 'BLEND'
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    N = nt.nodes.new
    out = N('ShaderNodeOutputMaterial')
    mix = N('ShaderNodeMixShader')
    clear = N('ShaderNodeBsdfTransparent')
    emit = N('ShaderNodeEmission')
    lw = N('ShaderNodeLayerWeight')
    lw.inputs['Blend'].default_value = 0.5
    heat = N('ShaderNodeValue'); heat.name = 'heat'; heat.label = 'heat'
    alpha = N('ShaderNodeValue'); alpha.name = 'alpha'; alpha.label = 'alpha'
    alpha.outputs[0].default_value = 1.0
    # Layer Weight's Facing is 0 looking straight at the surface and 1 at the
    # silhouette, so `centre` (1 - Facing) is 1 mid-disc and 0 at the rim. The
    # ramp reads centre lowered by heat.
    inv = N('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 1.0
    nt.links.new(lw.outputs['Facing'], inv.inputs[1])
    shifted = N('ShaderNodeMath'); shifted.operation = 'SUBTRACT'; shifted.use_clamp = True
    nt.links.new(inv.outputs[0], shifted.inputs[0])
    nt.links.new(heat.outputs[0], shifted.inputs[1])
    cr = N('ShaderNodeValToRGB')
    nt.links.new(shifted.outputs[0], cr.inputs['Fac'])
    el = cr.color_ramp.elements
    while len(el) > 2:
        el.remove(el[len(el) - 1])
    for i, (pos, col) in enumerate(stops):
        e = el[i] if i < len(el) else el.new(pos)
        e.position = pos
        e.color = (*col, 1.0)
    nt.links.new(cr.outputs['Color'], emit.inputs['Color'])
    emit.inputs['Strength'].default_value = strength
    # opacity: soft toward the silhouette, broken up by noise, scaled by alpha
    edge = N('ShaderNodeMath'); edge.operation = 'POWER'; edge.inputs[1].default_value = alpha_power
    nt.links.new(inv.outputs[0], edge.inputs[0])
    soft = N('ShaderNodeMath'); soft.operation = 'MULTIPLY'
    nt.links.new(edge.outputs[0], soft.inputs[0])
    nt.links.new(alpha.outputs[0], soft.inputs[1])
    fac = soft
    if noise > 0:
        tc = N('ShaderNodeTexCoord')
        nz = N('ShaderNodeTexNoise'); nz.noise_dimensions = '3D'
        nz.inputs['Scale'].default_value = noise_scale
        nz.inputs['Detail'].default_value = 3.0
        nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
        # lift the noise so it eats edges but never the whole puff
        lift = N('ShaderNodeMapRange')
        lift.inputs['From Min'].default_value = 0.25
        lift.inputs['From Max'].default_value = 0.75
        lift.inputs['To Min'].default_value = 1.0 - noise
        lift.inputs['To Max'].default_value = 1.0
        lift.clamp = True
        nt.links.new(nz.outputs['Fac'], lift.inputs['Value'])
        brk = N('ShaderNodeMath'); brk.operation = 'MULTIPLY'
        nt.links.new(soft.outputs[0], brk.inputs[0])
        nt.links.new(lift.outputs['Result'], brk.inputs[1])
        fac = brk
    clamp = N('ShaderNodeMath'); clamp.operation = 'MULTIPLY'; clamp.inputs[1].default_value = 1.0; clamp.use_clamp = True
    nt.links.new(fac.outputs[0], clamp.inputs[0])
    nt.links.new(clamp.outputs[0], mix.inputs['Fac'])
    nt.links.new(clear.outputs[0], mix.inputs[1])
    nt.links.new(emit.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs['Surface'])
    return mat


def flat_material(name, color, strength=3.0):
    """Solid emissive colour with a keyframable opacity."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    try:
        mat.surface_render_method = 'BLENDED'
    except (AttributeError, TypeError):
        mat.blend_method = 'BLEND'
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    mix = nt.nodes.new('ShaderNodeMixShader')
    clear = nt.nodes.new('ShaderNodeBsdfTransparent')
    emit = nt.nodes.new('ShaderNodeEmission')
    alpha = nt.nodes.new('ShaderNodeValue'); alpha.name = 'alpha'
    alpha.outputs[0].default_value = 1.0
    emit.inputs['Color'].default_value = (*color, 1.0)
    emit.inputs['Strength'].default_value = strength
    nt.links.new(alpha.outputs[0], mix.inputs['Fac'])
    nt.links.new(clear.outputs[0], mix.inputs[1])
    nt.links.new(emit.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs['Surface'])
    return mat


def mat_key(mat, node, frame, value):
    """Keyframe a Value node's output (heat / alpha) on a material."""
    sock = mat.node_tree.nodes[node].outputs[0]
    sock.default_value = value
    sock.keyframe_insert('default_value', frame=frame)


def cloud_displace(obj, strength, size, empty=None):
    tex = bpy.data.textures.new('clouds', 'CLOUDS')
    tex.noise_scale = size
    tex.noise_depth = 2
    mod = obj.modifiers.new('d', 'DISPLACE')
    mod.texture = tex
    mod.strength = strength
    mod.mid_level = 0.5
    if empty is not None:
        mod.texture_coords = 'OBJECT'
        mod.texture_coords_object = empty
    return mod


def moving_empty(rng, frames, drift=1.2):
    """An empty the displace texture follows, so the noise boils frame to frame."""
    e = bpy.data.objects.new('E', None)
    link(e)
    a = Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-1, 1)))
    for f in range(frames):
        e.location = a * (f / max(1, frames - 1)) * drift
        e.keyframe_insert('location', frame=f)
    return e


def look_flat(obj):
    """Linear interpolation for the object's animation, so scripted ease curves rule."""
    ad = obj.animation_data
    if ad and ad.action:
        try:
            for fc in ad.action.fcurves:
                for kp in fc.keyframe_points:
                    kp.interpolation = 'LINEAR'
        except AttributeError:
            pass  # layered actions (4.4+) interpolate by the keys we set


# ------------------------------------------------------------------ builders
def build_fireball(frames, rng):
    """A boiling orange fireball: three displaced shells (hot core, body, rim),
    a flash on the first frames, and a spray of embers."""
    R_MAX = 1.35            # biggest shell radius
    BURN_COLOURS = [(0.0, (0.1, 0.008, 0.0)), (0.4, (0.85, 0.09, 0.006)), (0.75, (1.0, 0.36, 0.03)), (1.0, (1.0, 0.8, 0.3))]
    layers = []
    for i, (scale, strength, noise) in enumerate([(1.0, 0.8, 0.6), (0.72, 0.6, 0.45), (0.45, 0.35, 0.2)]):
        o = sphere(r=1.0, sub=4)
        emp = moving_empty(rng, frames, 1.0 + i * 0.4)
        cloud_displace(o, strength, 0.9 - i * 0.2, emp)
        m = ramp_material('fire%d' % i, BURN_COLOURS, strength=1.8 + i * 0.6, alpha_power=0.5 + i * 0.15, noise=noise, noise_scale=2.2 + i)
        o.data.materials.append(m)
        layers.append((o, m, scale))
    flash = sphere(r=1.0, sub=3)
    fm = ramp_material('flash', [(0.0, (1.0, 0.7, 0.3)), (1.0, (1.0, 0.95, 0.8))], strength=4.0, alpha_power=1.8)
    flash.data.materials.append(fm)
    embers = []
    for i in range(14):
        a = rng.uniform(0, math.tau)
        sp = rng.uniform(0.9, 2.0)
        e = sphere(r=0.05 + rng.uniform(0, 0.05), sub=1)
        em = flat_material('ember%d' % i, (1.0, 0.6 + rng.uniform(0, 0.3), 0.15), 4.0)
        e.data.materials.append(em)
        embers.append((e, em, a, sp))
    for f in range(frames):
        t = f / (frames - 1)
        grow = ease_out(min(1.0, t * 1.5))
        for o, m, sc in layers:
            r = (0.12 + R_MAX * sc * grow) * (1 + 0.05 * math.sin(t * 9))
            o.scale = (r, r, r * 0.95)
            o.location = (0, 0, 0.12 * t)
            o.keyframe_insert('scale', frame=f)
            o.keyframe_insert('location', frame=f)
            mat_key(m, 'heat', f, 0.55 * ease_in(t))
            mat_key(m, 'alpha', f, 1.0 - smooth(0.45, 1.0, t))
        fr = 0.3 + 1.0 * smooth(0, 0.3, t)
        flash.scale = (fr, fr, fr)
        flash.keyframe_insert('scale', frame=f)
        mat_key(fm, 'heat', f, 0.0)
        mat_key(fm, 'alpha', f, 1.0 - smooth(0.0, 0.3, t))
        for e, em, a, sp in embers:
            d = sp * ease_out(t)
            e.location = (math.cos(a) * d, 0, math.sin(a) * d - 0.5 * t * t)
            e.keyframe_insert('location', frame=f)
            mat_key(em, 'alpha', f, 1.0 - smooth(0.5, 1.0, t))


def build_smoke(frames, rng):
    """A dark puff that swells, drifts up and thins out. Neutral grey."""
    PUFFS = 8                                   # overlapping blobs
    GREYS = [(0.0, (0.02, 0.02, 0.02)), (0.5, (0.1, 0.1, 0.1)), (1.0, (0.4, 0.4, 0.4))]
    blobs = []
    for i in range(PUFFS):
        o = sphere(r=1.0, sub=3)
        emp = moving_empty(rng, frames, 0.6)
        cloud_displace(o, 0.35, 0.7, emp)
        m = ramp_material('smoke%d' % i, GREYS, strength=1.0, alpha_power=0.55, noise=0.5, noise_scale=2.5)
        o.data.materials.append(m)
        blobs.append((o, m, Vector((rng.uniform(-0.55, 0.55), 0, rng.uniform(-0.45, 0.45))), rng.uniform(0.55, 0.85)))
    for f in range(frames):
        t = f / (frames - 1)
        for o, m, off, r0 in blobs:
            r = r0 * (0.45 + 0.75 * ease_out(t))
            o.scale = (r, r, r)
            o.location = (off.x * (0.6 + t), 0, off.z * (0.6 + t) + 0.5 * t)
            o.keyframe_insert('scale', frame=f)
            o.keyframe_insert('location', frame=f)
            mat_key(m, 'heat', f, 0.0)
            mat_key(m, 'alpha', f, 0.85 * smooth(0, 0.12, t) * (1 - smooth(0.4, 1.0, t)))


def build_shock(frames, rng):
    """An expanding ring of compressed air: a bright thin ring and a softer
    wide one behind it. Neutral white."""
    R0, R1 = 0.15, 1.75                          # ring radius at start and end
    rings = []
    for minor, strength, delay in [(0.05, 3.0, 0.0), (0.16, 1.2, 0.05)]:
        bpy.ops.mesh.primitive_torus_add(major_radius=1.0, minor_radius=minor, major_segments=64, minor_segments=12)
        o = bpy.context.active_object
        o.rotation_euler = (math.radians(90), 0, 0)
        bpy.ops.object.shade_smooth()
        m = ramp_material('shock', [(0.0, (0.5, 0.5, 0.55)), (1.0, (1.0, 1.0, 1.0))], strength=strength, alpha_power=0.5, noise=0.45, noise_scale=3.5)
        o.data.materials.append(m)
        rings.append((o, m, delay, minor))
    for f in range(frames):
        t = f / (frames - 1)
        for o, m, delay, minor in rings:
            tt = max(0.0, t - delay) / (1 - delay)
            r = R0 + (R1 - R0) * ease_out(tt)
            w = 1 - 0.55 * tt
            o.scale = (r, r * 0.0 + r, w)
            o.keyframe_insert('scale', frame=f)
            mat_key(m, 'heat', f, 0.0)
            mat_key(m, 'alpha', f, smooth(0, 0.06, t) * (1 - smooth(0.35, 1.0, t)))


def build_energy(frames, rng):
    """A plasma burst: white-hot core, expanding ring, radial spikes and sparks.
    Neutral white so tints read cleanly."""
    SPIKES, SPARKS = 12, 16
    core = sphere(r=1.0, sub=3)
    cm = ramp_material('core', [(0.0, (0.75, 0.75, 0.8)), (1.0, (1.0, 1.0, 1.0))], strength=4.5, alpha_power=1.1)
    core.data.materials.append(cm)
    halo = sphere(r=1.0, sub=3)
    hm = ramp_material('halo', [(0.0, (0.2, 0.2, 0.25)), (1.0, (0.85, 0.85, 0.9))], strength=1.6, alpha_power=1.4)
    halo.data.materials.append(hm)
    bpy.ops.mesh.primitive_torus_add(major_radius=1.0, minor_radius=0.045, major_segments=64, minor_segments=10)
    ring = bpy.context.active_object
    ring.rotation_euler = (math.radians(90), 0, 0)
    rm = flat_material('ring', (1.0, 1.0, 1.0), 3.5)
    ring.data.materials.append(rm)
    spikes = []
    sm = flat_material('spike', (1.0, 1.0, 1.0), 4.0)
    for i in range(SPIKES):
        a = i / SPIKES * math.tau + rng.uniform(-0.12, 0.12)
        L = rng.uniform(0.9, 1.7) * (1.0 if i % 2 == 0 else 0.62)
        bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.07, radius2=0.0, depth=1.0)
        o = bpy.context.active_object
        o.data.materials.append(sm)
        o.rotation_euler = (0, math.pi / 2 - a, 0)   # cone axis (Z) swung into the XZ plane
        o.rotation_mode = 'XYZ'
        spikes.append((o, a, L))
    sparks = []
    pm = flat_material('spark', (1.0, 1.0, 1.0), 4.0)
    for i in range(SPARKS):
        a = rng.uniform(0, math.tau)
        sp = rng.uniform(0.7, 1.85)
        o = sphere(r=0.04 + rng.uniform(0, 0.035), sub=1)
        o.data.materials.append(pm)
        sparks.append((o, a, sp))
    for f in range(frames):
        t = f / (frames - 1)
        r = 0.55 * (1 - ease_in(smooth(0.0, 0.7, t))) + 0.04
        core.scale = (r, r, r)
        core.keyframe_insert('scale', frame=f)
        hr = 0.5 + 0.9 * ease_out(t)
        halo.scale = (hr, hr, hr)
        halo.keyframe_insert('scale', frame=f)
        mat_key(hm, 'heat', f, 0.0)
        mat_key(hm, 'alpha', f, 0.5 * (1 - smooth(0.0, 0.7, t)))
        # materials with a single alpha node are shared, so key them once per frame
        mat_key(cm, 'alpha', f, 1.0 - smooth(0.5, 0.95, t))
        rr = 0.25 + 1.4 * ease_out(t)
        ring.scale = (rr, rr, 1 - 0.5 * t)
        ring.keyframe_insert('scale', frame=f)
        mat_key(rm, 'alpha', f, 1 - smooth(0.3, 1.0, t))
        mat_key(sm, 'alpha', f, 1 - smooth(0.35, 0.9, t))
        mat_key(pm, 'alpha', f, 1 - smooth(0.5, 1.0, t))
        for o, a, L in spikes:
            g = ease_out(smooth(0.0, 0.5, t)) * (1 - 0.35 * smooth(0.5, 1.0, t))
            length = L * g + 0.01
            o.scale = (1 - 0.5 * t, 1 - 0.5 * t, length)
            # the cone's origin is its middle: slide it so the base stays at the core
            o.location = (math.cos(a) * length / 2, 0, math.sin(a) * length / 2)
            o.keyframe_insert('scale', frame=f)
            o.keyframe_insert('location', frame=f)
        for o, a, sp in sparks:
            d = sp * ease_out(t)
            o.location = (math.cos(a) * d, 0, math.sin(a) * d)
            o.keyframe_insert('location', frame=f)


def build_mushroom(frames, rng):
    """A nuclear mushroom cloud rising off the ground, standing on the bottom
    edge of the frame: glowing base, boiling stem, rolling cap, ground dust."""
    GROUND = -2.0                                # frame bottom (ortho half-height 2.2 below)
    STEM_H, STEM_R = 2.9, 0.34
    CAP_RX, CAP_RZ = 1.55, 0.85
    HOT = [(0.0, (0.05, 0.03, 0.025)), (0.4, (0.35, 0.1, 0.03)), (0.7, (0.95, 0.4, 0.06)), (1.0, (1.0, 0.8, 0.35))]
    COLD = [(0.0, (0.03, 0.025, 0.022)), (0.5, (0.1, 0.08, 0.07)), (1.0, (0.3, 0.24, 0.2))]

    def part(r, scale, stops, strength, strength_noise, disp, size):
        o = sphere(r=r, sub=4, scale=scale)
        emp = moving_empty(rng, frames, 0.9)
        cloud_displace(o, disp, size, emp)
        m = ramp_material('mush', stops, strength=strength, alpha_power=0.6, noise=strength_noise, noise_scale=2.2)
        o.data.materials.append(m)
        return o, m
    stem, sm_ = part(1.0, (1, 1, 1), HOT, 2.0, 0.35, 0.3, 0.8)
    cap, cm_ = part(1.0, (1, 1, 1), HOT, 2.2, 0.3, 0.35, 0.9)
    skirt, km_ = part(1.0, (1, 1, 1), HOT, 2.0, 0.3, 0.25, 0.8)
    base, bm_ = part(1.0, (1, 1, 1), HOT, 3.0, 0.1, 0.25, 1.0)
    dust, dm_ = part(1.0, (1, 1, 1), COLD, 1.0, 0.45, 0.3, 0.9)
    for f in range(frames):
        t = f / (frames - 1)
        rise = ease_out(t)
        h = STEM_H * rise
        sr = STEM_R * (0.7 + 0.5 * t)
        stem.scale = (sr, sr, max(0.05, h * 0.5))
        stem.location = (0, 0, GROUND + h * 0.5)
        cz = GROUND + h + CAP_RZ * 0.1 * t
        cx, cz_r = CAP_RX * (0.15 + 0.85 * ease_out(min(1, t * 1.25))), CAP_RZ * (0.2 + 0.8 * ease_out(min(1, t * 1.1)))
        cap.scale = (cx, cx * 0.7, cz_r)
        cap.location = (0, 0, cz + cz_r * 0.2)
        skirt.scale = (cx * 0.95, cx * 0.6, cz_r * 0.38)
        skirt.location = (0, 0, cz - cz_r * 0.55)
        bw = 0.55 + 0.7 * ease_out(t)
        base.scale = (bw, bw * 0.7, 0.34 + 0.15 * t)
        base.location = (0, 0, GROUND + 0.28)
        dw = 0.4 + 1.55 * ease_out(t)
        dust.scale = (dw, dw * 0.6, 0.3 + 0.16 * t)
        dust.location = (0, 0, GROUND + 0.18)
        for o in (stem, cap, skirt, base, dust):
            o.keyframe_insert('scale', frame=f)
            o.keyframe_insert('location', frame=f)
        cool = smooth(0.15, 0.85, t)
        mat_key(sm_, 'heat', f, 0.05 + 0.8 * cool)
        mat_key(cm_, 'heat', f, 0.15 + 0.75 * cool)
        mat_key(km_, 'heat', f, 0.25 + 0.7 * cool)
        mat_key(bm_, 'heat', f, 0.0 + 0.7 * cool)
        mat_key(dm_, 'heat', f, 0.0)
        mat_key(sm_, 'alpha', f, smooth(0, 0.05, t) * (1 - smooth(0.82, 1.0, t)))
        mat_key(cm_, 'alpha', f, smooth(0, 0.08, t) * (1 - smooth(0.85, 1.0, t)))
        mat_key(km_, 'alpha', f, smooth(0.05, 0.2, t) * (1 - smooth(0.85, 1.0, t)))
        mat_key(bm_, 'alpha', f, smooth(0, 0.04, t) * (1 - smooth(0.4, 0.8, t)))
        mat_key(dm_, 'alpha', f, 0.8 * smooth(0, 0.1, t) * (1 - smooth(0.6, 1.0, t)))


def build_moon(frames, rng):
    """A moon with maria and craters. Frame i is a phase: the sun lamp swings
    round the moon (0 = full, 90 = right-lit quarter, 180 = new), tilted a
    little so terminators are not always upright."""
    PHASES = [0, 55, 100, 140, -140, -100, -55]   # degrees of sun azimuth, one per frame
    TILT = 18                                      # degrees the light is tipped out of the horizontal
    bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=64, radius=1.0)
    moon = bpy.context.active_object
    bpy.ops.object.shade_smooth()
    mat = bpy.data.materials.new('moon')
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    N = nt.nodes.new
    out, bsdf, tc = N('ShaderNodeOutputMaterial'), N('ShaderNodeBsdfPrincipled'), N('ShaderNodeTexCoord')
    maria = N('ShaderNodeTexNoise'); maria.inputs['Scale'].default_value = 1.6; maria.inputs['Detail'].default_value = 6
    nt.links.new(tc.outputs['Object'], maria.inputs['Vector'])
    mramp = N('ShaderNodeValToRGB')
    mramp.color_ramp.elements[0].position = 0.46
    mramp.color_ramp.elements[0].color = (0.16, 0.16, 0.19, 1)
    mramp.color_ramp.elements[1].position = 0.56
    mramp.color_ramp.elements[1].color = (0.62, 0.6, 0.57, 1)
    nt.links.new(maria.outputs['Fac'], mramp.inputs['Fac'])
    heights = []
    for scale, weight in ((5.0, 1.0), (13.0, 0.7), (34.0, 0.45)):
        vor = N('ShaderNodeTexVoronoi')
        vor.inputs['Scale'].default_value = scale
        vor.inputs['Randomness'].default_value = 1.0
        nt.links.new(tc.outputs['Object'], vor.inputs['Vector'])
        rim = N('ShaderNodeMapRange')            # bowl in the middle of a cell, raised rim, flat outside
        rim.inputs['From Min'].default_value = 0.0
        rim.inputs['From Max'].default_value = 0.55
        rim.inputs['To Min'].default_value = -weight
        rim.inputs['To Max'].default_value = 0.0
        rim.clamp = True
        nt.links.new(vor.outputs['Distance'], rim.inputs['Value'])
        heights.append(rim)
    add1 = N('ShaderNodeMath'); add1.operation = 'ADD'
    nt.links.new(heights[0].outputs['Result'], add1.inputs[0]); nt.links.new(heights[1].outputs['Result'], add1.inputs[1])
    add2 = N('ShaderNodeMath'); add2.operation = 'ADD'
    nt.links.new(add1.outputs[0], add2.inputs[0]); nt.links.new(heights[2].outputs['Result'], add2.inputs[1])
    bump = N('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.6; bump.inputs['Distance'].default_value = 0.08
    nt.links.new(add2.outputs[0], bump.inputs['Height'])
    nt.links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    nt.links.new(mramp.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = 1.0
    for k in ('Specular IOR Level', 'Specular'):
        if k in bsdf.inputs:
            bsdf.inputs[k].default_value = 0.0
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    moon.data.materials.append(mat)
    sc = bpy.context.scene
    sc.world.color = (0.012, 0.014, 0.024)          # earthshine on the dark side
    sun = bpy.data.objects.new('Sun', bpy.data.lights.new('Sun', 'SUN'))
    sun.data.energy = 4.5
    link(sun)
    for f, az in enumerate(PHASES):
        a = math.radians(az)
        # light travels from the sun toward the moon: +Y (away from the camera) is a full moon
        d = Vector((-math.sin(a), math.cos(a), math.sin(math.radians(TILT)) * 0.4)).normalized()
        sun.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        sun.keyframe_insert('rotation_euler', frame=f)


# name -> (builder, frame px, frames, columns, fps)
SHEETS = {
    'fireball': (build_fireball, 96, 24, 6, 30),
    'smoke': (build_smoke, 64, 16, 4, 14),
    'shock': (build_shock, 96, 12, 4, 24),
    'energy': (build_energy, 96, 16, 4, 30),
    'mushroom': (build_mushroom, 128, 24, 6, 14),
    'moon': (build_moon, 192, 7, 4, 0),
}


# -------------------------------------------------------------- compositing
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
    out = np.concatenate([rgb, (wsum / (k * k))[..., None]], axis=-1)
    return out


def write_sheet(frames_px, frame, cols, path):
    n = len(frames_px)
    rows = (n + cols - 1) // cols
    sheet = np.zeros((rows * frame, cols * frame, 4), dtype=np.float32)   # bottom-up rows
    for i, fr in enumerate(frames_px):
        r, c = divmod(i, cols)
        y0 = (rows - 1 - r) * frame
        sheet[y0:y0 + frame, c * frame:(c + 1) * frame] = fr
    img = bpy.data.images.new('sheet', cols * frame, rows * frame, alpha=True)
    img.alpha_mode = 'CHANNEL_PACKED'
    img.colorspace_settings.name = 'Non-Color'
    img.pixels.foreach_set(sheet.reshape(-1))
    img.filepath_raw = path
    img.file_format = 'PNG'
    img.save()
    bpy.data.images.remove(img)
    return rows


def quantize(path):
    """Palette-quantize with alpha, using the system python3's Pillow if present."""
    code = ("import sys\nfrom PIL import Image\nim = Image.open(sys.argv[1]).convert('RGBA')\n"
            "im.quantize(256, method=Image.Quantize.FASTOCTREE).save(sys.argv[1], optimize=True)\n")
    for py in ('/usr/bin/python3', '/opt/homebrew/bin/python3', 'python3'):
        try:
            r = subprocess.run([py, '-I', '-c', code, path], capture_output=True, timeout=120)
        except (OSError, subprocess.TimeoutExpired):
            continue
        if r.returncode == 0:
            return True
    return False


def main():
    args = parse_args()
    os.makedirs(args['out'], exist_ok=True)
    index_path = os.path.join(args['out'], 'sprites.json')
    index = {}
    if os.path.exists(index_path):
        with open(index_path) as fh:
            index = json.load(fh)
    index['_note'] = ('Sprite sheets rendered by fx/blender/render_fx.py. frame = square px; frames fill rows '
                      'left to right from the top-left, cols per row; fps = designed playback rate.')
    names = args['only'] or list(SHEETS)
    for name in names:
        build, frame_px, nframes, cols, fps = SHEETS[name]
        rng = random.Random(args['seed'])
        sc, _ = reset_scene(nframes, args, frame_px)
        build(nframes, rng)
        if args['blend']:
            bpy.context.preferences.filepaths.save_version = 0   # no .blend1 backups
            bpy.ops.wm.save_as_mainfile(filepath=os.path.join(os.path.abspath(args['blend_dir']), name + '.blend'), compress=True)
        tmp = os.path.join(args['out'], '_frames', name)
        paths = render_frames(sc, nframes, tmp)
        k = args['supersample']
        frames_px = [downsample(read_png(p), k) for p in paths]
        out_png = os.path.join(args['out'], name + '.png')
        rows = write_sheet(frames_px, frame_px, cols, out_png)
        q = quantize(out_png) if args['quantize'] else False
        index[name] = {'file': name + '.png', 'frame': frame_px, 'cols': cols, 'rows': rows, 'frames': nframes, 'fps': fps}
        print('SHEET %s: %d frames of %dpx, %d bytes%s, engine %s' % (
            name, nframes, frame_px, os.path.getsize(out_png), ' (quantized)' if q else '', sc.render.engine))
    with open(index_path, 'w') as fh:
        json.dump(index, fh, indent=2)
        fh.write('\n')
    if not args['keep']:
        import shutil
        shutil.rmtree(os.path.join(args['out'], '_frames'), ignore_errors=True)


main()
