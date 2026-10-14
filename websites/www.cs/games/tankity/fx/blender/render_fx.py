"""Operation Tankity: render the animated effect sprite sheets with Blender.

Builds every sheet procedurally (no external assets), renders every frame
with a transparent background, tiles the frames into one PNG sprite sheet per
effect (or, for an atlas, one row per clip in a shared PNG), and writes
sprites.json describing the sheets. The game's
engine (src/fx/engine.ts) reads them; the effects in game.yaml pick a sheet per emitter.

Regenerate (from this folder; Blender 4.2 or newer, tested on 5.2):

    /Applications/Blender.app/Contents/MacOS/Blender -b -P render_fx.py -- --out ../sprites

Install Blender with `brew install --cask blender`. The EEVEE sheets take
seconds; the Cycles ones (real volumes: blast, plume, dirt, flakburst, nuke)
take a few minutes in all on an Apple-silicon laptop, the nuke most of it.

Options (after the `--`):

    --out DIR         Where sheets and sprites.json go. Default ../sprites next
                      to this script.
    --only A,B        Render just these sheets (names from SHEETS and ATLASES
                      below: fireball, smoke, shock, energy, moon,
                      blast, plume, dirt, debris, scorch, flakburst, electric,
                      nuke, flare, muzzle, shells, shells_blast, parachute). Default: all. sprites.json
                      keeps the entries of sheets that were not re-rendered.
    --engine NAME     eevee (default; falls back to cycles if EEVEE cannot start
                      headless) or cycles.
    --samples N       Render samples per frame (EEVEE TAA / Cycles). Default 24.
    --supersample N   Render at N times the frame size and average down, for
                      clean edges at tiny sizes. Default 2.
    --seed N          Seed for every random scatter (embers, spikes, puffs).
                      Same seed, same sheets. Default 7.
    --blend-dir DIR   Where each scene is saved as <name>.blend before it is
                      rendered (the Blender source of every sheet, committed
                      through Git LFS; an atlas's clips go to <atlas>/<clip>.blend).
                      Default: next to this script.
    --no-blend        Do not save the .blend files.
    --no-quantize     Skip the 256-colour palette pass. By default, if Python's
                      Pillow is importable (system python3, not Blender's) the
                      sheets are palette-quantized with alpha kept, which cuts
                      them to a fraction of their size.
    --keep-frames     Leave the per-frame PNGs in <out>/_frames for inspection.
    --pick 0,8,16     A quick look while tuning: render only these frames (the
                      others repeat the last one rendered). Never for the
                      committed sheets.

Sheet layout (all recorded in sprites.json): frames are square, `frame` px on a
side, row-major from the top-left, `cols` per row, `frames` in all; `fps` is the
rate the animation was designed for (an emitter may override it). Colour
conventions: `fireball` is natural colour (fire);
`smoke`, `shock`, `energy` are neutral white and grey so an emitter's `tint`
(multiply) colours them. `moon` is seven phases of
a procedural moon (maria and craters, lit by one sun lamp swung round it, a
touch of earthshine on the dark side); the game picks one per match.
`parachute` is a striped canopy on its lines, lit by a sun lamp: the first 6
frames bloom it open from a furled streamer, the other 10 are one loop of it
swaying from where its lines meet, which sits at the middle of the frame's
bottom edge (the game hangs that point on top of the falling unit).

Per-effect parameters live in the SHEETS table below: `frame` (px), `frames`,
`cols`, `fps`, and the builder function that animates it. ATLASES holds the
shells in flight: `shells.png` has one row per shell (p_shell, p_buck, ...),
each its own entry in sprites.json with `first`, its first frame in the file.
More colour conventions: `blast`, `dirt`, `scorch`, `flakburst`, `nuke`,
`muzzle` and the shells are natural colour; `plume`, `debris`, `electric`
and `flare` are neutral, for a tint. `dirt` and `nuke` stand on the bottom
edge of the frame; `muzzle` points right from the frame's centre. Builders take
(frames, rng); their private constants (radii, drift, colours) are named at the
top of each function.
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
from mathutils import Vector


# ---------------------------------------------------------------- arguments
def parse_args():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    here = os.path.dirname(os.path.abspath(__file__))
    a = {'out': os.path.join(here, '..', 'sprites'), 'only': None, 'engine': 'eevee', 'samples': 24,
         'supersample': 2, 'seed': 7, 'quantize': True, 'keep': False, 'blend': True, 'blend_dir': here, 'pick': None}
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
        elif k == '--pick': a['pick'] = [int(v) for v in argv[i + 1].split(',')]; i += 2
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


def build_parachute(frames, rng):
    """A parachute: a dome of alternating white and orange gores, lines from
    its rim to a knot at the bottom-middle of the frame. OPEN frames bloom it
    from a furled streamer; the rest are one sway loop, pivoting on the knot."""
    OPEN = 6                                     # opening frames; the rest loop
    KNOT_Z = -1.92                               # frame bottom is -2 (ortho_scale 4)
    RIM_Z = 0.55                                 # canopy rim height above the frame centre
    R = 1.45                                     # open canopy radius
    DOME = 0.85                                  # open canopy height above its rim
    GORES = 12
    SWAY = math.radians(8)                       # sway amplitude
    WHITE, ORANGE, CORD = (0.93, 0.91, 0.86), (1.0, 0.42, 0.12), (0.78, 0.76, 0.7)

    def lit(name, color, glow):
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        b = m.node_tree.nodes.get('Principled BSDF')
        b.inputs['Base Color'].default_value = (*color, 1)
        b.inputs['Roughness'].default_value = 0.85
        for k in ('Emission Color', 'Emission'):
            if k in b.inputs:
                b.inputs[k].default_value = (*color, 1)
                break
        if 'Emission Strength' in b.inputs:
            b.inputs['Emission Strength'].default_value = glow   # the night battlefield is dark: a little self-light
        return m

    pivot = bpy.data.objects.new('Knot', None)
    link(pivot)
    pivot.location = (0, 0, KNOT_Z)
    # The dome: the top half of a UV sphere, each gore (a column of faces) one colour.
    bpy.ops.mesh.primitive_uv_sphere_add(segments=GORES * 2, ring_count=12, radius=1.0)
    dome = bpy.context.active_object
    bm = bmesh.new()
    bm.from_mesh(dome.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -1e-4], context='VERTS')
    bm.to_mesh(dome.data)
    bm.free()
    bpy.ops.object.shade_smooth()
    dome.data.materials.append(lit('gore-white', WHITE, 0.35))
    dome.data.materials.append(lit('gore-orange', ORANGE, 0.35))
    for poly in dome.data.polygons:
        a = math.atan2(poly.center.y, poly.center.x) % math.tau
        poly.material_index = int(a / (math.tau / GORES)) % 2
    dome.parent = pivot
    cord = lit('cord', CORD, 0.6)
    lines = []
    for k in range(8):
        bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.018, depth=1.0)
        o = bpy.context.active_object
        o.data.materials.append(cord)
        o.parent = pivot
        lines.append((o, k / 8 * math.tau + math.tau / 16))
    sun = bpy.data.objects.new('Sun', bpy.data.lights.new('Sun', 'SUN'))
    sun.data.energy = 3.5
    sun.rotation_euler = (math.radians(35), math.radians(-30), 0)   # from above, in front, a little left
    link(sun)
    bpy.context.scene.world.color = (0.08, 0.08, 0.1)
    rim_local = RIM_Z - KNOT_Z                    # rim height above the knot
    for f in range(frames):
        if f < OPEN:
            t = ease_out((f + 1) / OPEN)
            rw = R * (0.12 + 0.88 * t)            # furled: narrow and tall
            dh = DOME * (2.2 - 1.2 * t)
            ang = 0.0
        else:
            u = (f - OPEN) / (frames - OPEN)
            ang = SWAY * math.sin(u * math.tau)
            breathe = 1 + 0.03 * math.sin(u * math.tau * 2)
            rw, dh = R * breathe, DOME / breathe
        dome.scale = (rw, rw * 0.5, dh)
        dome.location = (0, 0, rim_local)
        dome.keyframe_insert('scale', frame=f)
        dome.keyframe_insert('location', frame=f)
        pivot.rotation_euler = (0, ang, 0)
        pivot.keyframe_insert('rotation_euler', frame=f)
        for o, a in lines:
            top = Vector((math.cos(a) * rw, math.sin(a) * rw * 0.5, rim_local))
            o.location = top * 0.5
            o.rotation_euler = top.normalized().to_track_quat('Z', 'Y').to_euler()
            o.scale = (1, 1, top.length)
            o.keyframe_insert('location', frame=f)
            o.keyframe_insert('rotation_euler', frame=f)
            o.keyframe_insert('scale', frame=f)
# --------------------------------------------- volumetric and lit builders
# The sheets below are rendered with Cycles: real volumes (lit, self-shadowing
# smoke with fire glowing inside it) and lit meshes (the shells in flight).
ARGS = {}                                        # the parsed options, for builders that pick their own engine
FIRE = [(0.0, (0.0, 0.0, 0.0)), (0.2, (0.35, 0.03, 0.0)), (0.45, (1.0, 0.22, 0.01)), (0.75, (1.0, 0.42, 0.05)), (1.0, (1.0, 0.62, 0.18))]


def use_cycles(samples=None, bounces=2):
    """Switch the current scene to Cycles on the CPU (volumes need it). Cycles
    sheets render at their own size (no supersampling; more samples instead),
    or volumes would take minutes a frame."""
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    k = ARGS.get('supersample', 2)
    sc.render.resolution_x //= k
    sc.render.resolution_y //= k
    ARGS['_ss'] = 1
    sc.cycles.samples = samples or max(64, ARGS.get('samples', 24) * 3)
    sc.cycles.use_denoising = False
    sc.cycles.max_bounces = bounces
    sc.cycles.volume_bounces = 1
    sc.cycles.transparent_max_bounces = 16
    sc.cycles.volume_step_rate = 1.0
    sc.cycles.seed = ARGS.get('seed', 7)
    return sc


def add_sun(energy=3.2, elev=50, side=0.8, ambient=(0.035, 0.035, 0.04)):
    """One sun from the upper left (`side` > 0) and a little in front, and a
    dim grey world so shadowed smoke is not black."""
    sun = bpy.data.objects.new('Sun', bpy.data.lights.new('Sun', 'SUN'))
    sun.data.energy = energy
    sun.data.angle = math.radians(8)
    e = math.radians(elev)
    # the direction the light travels: rightward, away from the camera (+Y), down
    travel = Vector((math.cos(e) * side, math.cos(e) * 0.5, -math.sin(e))).normalized()
    sun.rotation_euler = travel.to_track_quat('-Z', 'Y').to_euler()
    link(sun)
    bpy.context.scene.world.color = ambient
    return sun


def lobe(kind='sphere'):
    """An empty that shapes a volume: its local unit sphere (or, for 'torus',
    a ring of radius 1 and tube radius 0.5 round its Z axis) is where the
    smoke is. Move and scale it to animate the puff."""
    e = bpy.data.objects.new('lobe', None)
    e['kind'] = kind
    link(e)
    return e


def vol_material(name, lobes, noise_obj, albedo=(0.5, 0.5, 0.5), fire=FIRE, emit=9.0, edge=0.22, warp=0.4, scale=3.2, aniso=0.3, density=22.0):
    """One volume shaped by `lobes` (empties, see lobe()): the union of their
    shapes, the edge broken into billows by warped 4D noise that is laid out
    in `noise_obj`'s space (so the billows grow as it grows). Keyframable
    Value nodes:
      heat   0 cold smoke .. 1+ a white-hot interior (emission through `fire`)
      cool   how deep below the surface the glow starts (0 .. 0.5): as it
             rises the fire sinks into the smoke and the rim goes dark
      dens   overall density multiplier (thins the puff as it dies)
      evo    the noise's fourth coordinate (the billows boil as it moves)
      rough  how far the noise eats into the shapes (0 smooth, 1 ragged)
    Put it on vol_domain(), one cube round the whole frame: a single volume
    renders many times faster than overlapping ones."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    N, L = nt.nodes.new, nt.links.new

    def val(n, v):
        x = N('ShaderNodeValue'); x.name = n; x.label = n
        x.outputs[0].default_value = v
        return x

    def math_node(op, a=None, b=None, clamp=False):
        m = N('ShaderNodeMath'); m.operation = op; m.use_clamp = clamp
        for i, v in enumerate((a, b)):
            if v is None:
                continue
            if isinstance(v, (int, float)):
                m.inputs[i].default_value = v
            else:
                L(v, m.inputs[i])
        return m

    def vec(op, a, b=None, scale_by=None):
        m = N('ShaderNodeVectorMath'); m.operation = op
        L(a, m.inputs[0])
        if b is not None:
            if isinstance(b, tuple):
                m.inputs[1].default_value = b
            else:
                L(b, m.inputs[1])
        if scale_by is not None:
            m.inputs['Scale'].default_value = scale_by
        return m

    heat, dens, evo, rough = val('heat', 0.0), val('dens', 1.0), val('evo', 0.0), val('rough', 0.5)
    cool = val('cool', 0.0)
    ntc = N('ShaderNodeTexCoord'); ntc.object = noise_obj
    pn = ntc.outputs['Object']
    n1 = N('ShaderNodeTexNoise'); n1.noise_dimensions = '4D'
    n1.inputs['Scale'].default_value = 1.3; n1.inputs['Detail'].default_value = 2.0
    L(pn, n1.inputs['Vector']); L(evo.outputs[0], n1.inputs['W'])
    wv = vec('SCALE', vec('SUBTRACT', n1.outputs['Color'], (0.5, 0.5, 0.5)).outputs['Vector'], scale_by=warp).outputs['Vector']
    n2 = N('ShaderNodeTexNoise'); n2.noise_dimensions = '4D'
    n2.inputs['Scale'].default_value = scale; n2.inputs['Detail'].default_value = 4.0
    n2.inputs['Roughness'].default_value = 0.62
    L(vec('ADD', pn, wv).outputs['Vector'], n2.inputs['Vector']); L(evo.outputs[0], n2.inputs['W'])
    shape = None
    for e in lobes:
        tc = N('ShaderNodeTexCoord'); tc.object = e
        p = vec('ADD', tc.outputs['Object'], wv).outputs['Vector']
        if e.get('kind') == 'torus':
            sep = N('ShaderNodeSeparateXYZ'); L(p, sep.inputs[0])
            rad = math_node('SQRT', math_node('ADD', math_node('MULTIPLY', sep.outputs['X'], sep.outputs['X']).outputs[0],
                                              math_node('MULTIPLY', sep.outputs['Y'], sep.outputs['Y']).outputs[0]).outputs[0])
            q = math_node('SUBTRACT', rad.outputs[0], 1.0)
            dd = math_node('SQRT', math_node('ADD', math_node('MULTIPLY', q.outputs[0], q.outputs[0]).outputs[0],
                                             math_node('MULTIPLY', sep.outputs['Z'], sep.outputs['Z']).outputs[0]).outputs[0])
            f = math_node('MULTIPLY_ADD', dd.outputs[0], -1.6)
            f.inputs[2].default_value = 0.8
        else:
            ln = vec('LENGTH', p)
            f = math_node('SUBTRACT', 0.8, ln.outputs['Value'])
        shape = f if shape is None else math_node('MAXIMUM', shape.outputs[0], f.outputs[0])
    # field: 0.8 deep inside, 0 on the (noisy) surface, negative outside
    b = math_node('SUBTRACT', n2.outputs['Fac'], 0.5)
    c = math_node('MULTIPLY', b.outputs[0], rough.outputs[0])
    field = math_node('MULTIPLY_ADD', c.outputs[0], 2.0)
    L(shape.outputs[0], field.inputs[2])
    sm = N('ShaderNodeMapRange'); sm.interpolation_type = 'SMOOTHSTEP'
    sm.inputs['From Min'].default_value = 0.0; sm.inputs['From Max'].default_value = edge
    L(field.outputs[0], sm.inputs['Value'])
    d = math_node('MULTIPLY', sm.outputs['Result'], dens.outputs[0])
    d2 = math_node('MULTIPLY', d.outputs[0], density)
    pv = N('ShaderNodeVolumePrincipled')
    L(d2.outputs[0], pv.inputs['Density'])
    pv.inputs['Color'].default_value = (*albedo, 1.0)
    pv.inputs['Anisotropy'].default_value = aniso
    # heat: glows only deeper than `cool` below the surface, in patches
    lo = math_node('ADD', cool.outputs[0], 0.0)
    hi = math_node('ADD', cool.outputs[0], 0.25)
    core = N('ShaderNodeMapRange')
    L(lo.outputs[0], core.inputs['From Min']); L(hi.outputs[0], core.inputs['From Max'])
    L(field.outputs[0], core.inputs['Value'])
    patch = N('ShaderNodeMapRange')
    patch.inputs['From Min'].default_value = 0.3; patch.inputs['From Max'].default_value = 0.62
    patch.inputs['To Min'].default_value = 0.35
    L(n2.outputs['Fac'], patch.inputs['Value'])
    hp = math_node('MULTIPLY', core.outputs['Result'], patch.outputs['Result'])
    hm = math_node('MULTIPLY', hp.outputs[0], heat.outputs[0], clamp=True)
    cr = N('ShaderNodeValToRGB')
    L(hm.outputs[0], cr.inputs['Fac'])
    el = cr.color_ramp.elements
    for i, (pos, col) in enumerate(fire):
        e = el[i] if i < len(el) else el.new(pos)
        e.position = pos
        e.color = (*col, 1.0)
    L(cr.outputs['Color'], pv.inputs['Emission Color'])
    pv.inputs['Emission Strength'].default_value = emit
    out = N('ShaderNodeOutputMaterial')
    L(pv.outputs['Volume'], out.inputs['Volume'])
    return mat


def vol_domain(mat, half=(2.0, 1.2, 2.0), center=(0, 0, 0)):
    """The one cube the volume lives in (covers the frame by default)."""
    bpy.ops.mesh.primitive_cube_add(size=2.0, location=center)
    o = bpy.context.active_object
    o.scale = half
    o.data.materials.append(mat)
    return o


def keys(o, f):
    o.keyframe_insert('location', frame=f)
    o.keyframe_insert('scale', frame=f)
    o.keyframe_insert('rotation_euler', frame=f)


def build_blast(frames, rng):
    """A rolling fireball that cools into dark smoke: a white-yellow flash,
    orange billows bursting out of it, the fire sinking into the smoke as it
    cools, then grey-brown smoke that climbs and thins. A real volume lit by
    the sun, so the smoke shades itself."""
    use_cycles()
    add_sun(energy=4.0)
    lobes = []
    for i in range(9):
        if i == 0:
            off, s0 = Vector((0, 0, 0)), 1.0
        else:
            a = (i / 8) * math.tau + rng.uniform(-0.3, 0.3)
            off = Vector((math.cos(a), rng.uniform(-0.3, 0.3), math.sin(a) * 0.8 + 0.15)) * rng.uniform(0.62, 0.8)
            s0 = rng.uniform(0.62, 0.78)
        lobes.append((lobe(), off, s0))
    mat = vol_material('blast', [e for e, _, _ in lobes], lobes[0][0], albedo=(0.3, 0.27, 0.24), emit=2.6)
    vol_domain(mat)
    for f in range(frames):
        t = f / (frames - 1)
        g = ease_out(min(1.0, t * 2.2))
        for o, off, s0 in lobes:
            s = s0 * (0.18 + 0.82 * g) * (1 + 0.12 * t)
            o.scale = (s, s, s)
            o.location = off * (0.2 + 0.85 * g) + Vector((0, 0, 0.35 * t * t))
            keys(o, f)
        mat_key(mat, 'heat', f, 2.6 * (1 - smooth(0.1, 0.85, t)))
        mat_key(mat, 'cool', f, -0.12 + 0.42 * smooth(0.1, 0.7, t))
        mat_key(mat, 'dens', f, (0.35 + 0.65 * smooth(0.05, 0.4, t)) * (1.0 - 0.75 * smooth(0.6, 1.0, t)))
        mat_key(mat, 'evo', f, t * 1.2)
        mat_key(mat, 'rough', f, 0.35 + 0.4 * t)


def build_plume(frames, rng):
    """Lingering smoke: a cluster of lit billows that swells, climbs and thins.
    Neutral grey so an emitter's tint colours it."""
    use_cycles()
    add_sun(ambient=(0.06, 0.06, 0.06))
    lobes = []
    for i in range(7):
        a = rng.uniform(0, math.tau)
        off = Vector((math.cos(a) * rng.uniform(0.15, 0.55), rng.uniform(-0.2, 0.2), rng.uniform(-0.45, 0.35)))
        lobes.append((lobe(), off * 1.3, rng.uniform(0.62, 0.82)))
    mat = vol_material('plume', [e for e, _, _ in lobes], lobes[0][0], albedo=(0.75, 0.75, 0.75), emit=0.0, density=14.0)
    vol_domain(mat)
    for f in range(frames):
        t = f / (frames - 1)
        g = ease_out(t)
        for o, off, s0 in lobes:
            s = s0 * (0.5 + 0.75 * g)
            o.scale = (s, s, s)
            o.location = off * (0.8 + 0.6 * g) + Vector((0, 0, 0.7 * t - 0.3))
            keys(o, f)
        mat_key(mat, 'heat', f, 0.0)
        mat_key(mat, 'dens', f, smooth(0.0, 0.15, t) * (1 - 0.85 * smooth(0.35, 1.0, t)))
        mat_key(mat, 'evo', f, t * 0.9)
        mat_key(mat, 'rough', f, 0.5 + 0.4 * t)


def clod(rng, r, mat):
    """A lumpy, flat-shaded chunk of dirt or rock."""
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=r)
    o = bpy.context.active_object
    for v in o.data.vertices:
        v.co *= rng.uniform(0.65, 1.25)
    o.data.materials.append(mat)
    return o


def build_dirt(frames, rng):
    """Ground thrown up by a blast, standing on the bottom edge of the frame:
    a fan of lit clods flung up and falling back, and a brown dust cloud
    rolling out along the ground behind them."""
    GROUND = -1.95
    use_cycles()
    add_sun(energy=4.0, ambient=(0.07, 0.06, 0.05))
    soil = [pbr('soil%d' % i, c, 0.0, 0.9) for i, c in enumerate(((0.32, 0.2, 0.1), (0.2, 0.12, 0.06), (0.42, 0.3, 0.17)))]
    clods = []
    for i in range(46):
        o = clod(rng, rng.uniform(0.06, 0.17), rng.choice(soil))
        ang = math.radians(rng.uniform(60, 120))
        sp = rng.uniform(3.0, 6.6)
        spin = Vector((rng.uniform(-9, 9), rng.uniform(-9, 9), rng.uniform(-9, 9)))
        clods.append((o, math.cos(ang) * sp * 0.75, math.sin(ang) * sp, rng.uniform(-0.25, 0.25), spin))
    lobes = []
    for i in range(6):
        side = (i - 2.5) / 2.5
        lobes.append((lobe(), side, rng.uniform(0.5, 0.7)))
    column = [lobe() for _ in range(4)]
    mat = vol_material('dust', [e for e, _, _ in lobes] + column, lobes[2][0], albedo=(0.55, 0.4, 0.26), emit=0.0, density=10.0)
    vol_domain(mat)
    G = 9.0
    for f in range(frames):
        t = f / (frames - 1)
        tt = t * 1.25                                  # seconds of flight in the clip
        for o, vx, vz, x0, spin in clods:
            z = GROUND + 0.1 + vz * tt - 0.5 * G * tt * tt
            o.location = (x0 + vx * tt, 0, max(GROUND - 0.3, z))
            o.rotation_euler = spin * tt
            o.keyframe_insert('location', frame=f)
            o.keyframe_insert('rotation_euler', frame=f)
        g = ease_out(t)
        for o, side, s0 in lobes:
            s = s0 * (0.3 + 0.9 * g)
            o.scale = (s * 1.1, s, s * 0.8)
            o.location = (side * (0.3 + 1.1 * g), 0, GROUND + s * 0.5 + 0.25 * g)
            keys(o, f)
        for i, o in enumerate(column):
            h = (0.35 + 0.5 * i) * ease_out(min(1.0, t * 1.8))
            w = (0.48 - 0.07 * i) * (0.5 + 0.8 * g)
            o.location = (0, 0, GROUND + 0.3 + h)
            o.scale = (w, w, w * 1.3)
            keys(o, f)
        mat_key(mat, 'heat', f, 0.0)
        mat_key(mat, 'dens', f, smooth(0.0, 0.1, t) * (1 - 0.8 * smooth(0.4, 1.0, t)))
        mat_key(mat, 'evo', f, t)
        mat_key(mat, 'rough', f, 0.55)


def build_debris(frames, rng):
    """One rock chunk tumbling a full turn. Warm grey: tint it brown for dirt,
    blue-grey for metal. Play it from a random frame so a handful of them
    all look different."""
    shell_rig(rim=(0.9, 0.9, 1.0))
    b = spinner(frames, 1.0, axis=0)
    b2 = bpy.data.objects.new('tumble', None)
    link(b2)
    b.parent = b2
    for f in range(frames):
        b2.rotation_euler = (0, f / frames * math.tau, 0)
        b2.keyframe_insert('rotation_euler', frame=f)
    look_flat(b2)
    o = clod(rng, 1.25, pbr('rock', (0.6, 0.56, 0.5), 0.0, 0.85))
    o.parent = b


def build_scorch(frames, rng):
    """A burn mark: a ragged black-brown char whose embers glow and die out."""
    sc = bpy.context.scene
    sc.world.color = (0.2, 0.2, 0.2)
    bpy.ops.mesh.primitive_plane_add(size=4.0, rotation=(math.radians(90), 0, 0))
    o = bpy.context.active_object
    mat = bpy.data.materials.new('char')
    mat.use_nodes = True
    try:
        mat.surface_render_method = 'BLENDED'
    except (AttributeError, TypeError):
        mat.blend_method = 'BLEND'
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    N, L = nt.nodes.new, nt.links.new
    tc = N('ShaderNodeTexCoord')
    ln = N('ShaderNodeVectorMath'); ln.operation = 'LENGTH'; L(tc.outputs['Object'], ln.inputs[0])
    nz = N('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1.6; nz.inputs['Detail'].default_value = 6
    L(tc.outputs['Object'], nz.inputs['Vector'])
    rr = N('ShaderNodeMath'); rr.operation = 'MULTIPLY_ADD'; L(nz.outputs['Fac'], rr.inputs[0]); rr.inputs[1].default_value = -1.1
    L(ln.outputs['Value'], rr.inputs[2])
    mask = N('ShaderNodeMapRange'); mask.interpolation_type = 'SMOOTHSTEP'
    mask.inputs['From Min'].default_value = 1.05; mask.inputs['From Max'].default_value = 0.45
    L(rr.outputs[0], mask.inputs['Value'])
    tone = N('ShaderNodeValToRGB')
    tone.color_ramp.elements[0].color = (0.01, 0.008, 0.006, 1); tone.color_ramp.elements[0].position = 0.3
    tone.color_ramp.elements[1].color = (0.12, 0.07, 0.035, 1); tone.color_ramp.elements[1].position = 0.75
    L(nz.outputs['Fac'], tone.inputs['Fac'])
    vor = N('ShaderNodeTexVoronoi'); vor.inputs['Scale'].default_value = 7.0
    L(tc.outputs['Object'], vor.inputs['Vector'])
    spot = N('ShaderNodeMapRange'); spot.inputs['From Min'].default_value = 0.16; spot.inputs['From Max'].default_value = 0.05
    L(vor.outputs['Distance'], spot.inputs['Value'])
    ember = N('ShaderNodeValue'); ember.name = 'ember'
    em = N('ShaderNodeMath'); em.operation = 'MULTIPLY'; L(spot.outputs['Result'], em.inputs[0]); L(ember.outputs[0], em.inputs[1])
    emc = N('ShaderNodeEmission'); emc.inputs['Color'].default_value = (1.0, 0.35, 0.05, 1)
    L(em.outputs[0], emc.inputs['Strength'])
    dif = N('ShaderNodeEmission'); L(tone.outputs['Color'], dif.inputs['Color']); dif.inputs['Strength'].default_value = 1.0
    add = N('ShaderNodeAddShader'); L(dif.outputs[0], add.inputs[0]); L(emc.outputs[0], add.inputs[1])
    alpha = N('ShaderNodeMath'); alpha.operation = 'MULTIPLY'; L(mask.outputs['Result'], alpha.inputs[0]); alpha.inputs[1].default_value = 0.92
    mix = N('ShaderNodeMixShader'); clear = N('ShaderNodeBsdfTransparent')
    L(alpha.outputs[0], mix.inputs['Fac']); L(clear.outputs[0], mix.inputs[1]); L(add.outputs[0], mix.inputs[2])
    out = N('ShaderNodeOutputMaterial'); L(mix.outputs[0], out.inputs['Surface'])
    o.data.materials.append(mat)
    for f in range(frames):
        t = f / (frames - 1)
        mat_key(mat, 'ember', f, 9.0 * (1 - smooth(0.0, 0.85, t)))


def build_flakburst(frames, rng):
    """An airburst: a hard orange flash torn open into a ragged, sooty black
    puff that hangs in the air."""
    use_cycles()
    add_sun(energy=3.5)
    lobes = [(lobe(), Vector((0, 0, 0)), 0.75)]
    for i in range(7):
        a = rng.uniform(0, math.tau)
        lobes.append((lobe(), Vector((math.cos(a), rng.uniform(-0.3, 0.3), math.sin(a))) * rng.uniform(0.5, 0.75), rng.uniform(0.4, 0.55)))
    mat = vol_material('flak', [e for e, _, _ in lobes], lobes[0][0], albedo=(0.07, 0.065, 0.06), emit=3.0, warp=0.55, scale=4.0)
    vol_domain(mat)
    for f in range(frames):
        t = f / (frames - 1)
        g = ease_out(min(1.0, t * 3.0))
        for o, off, s0 in lobes:
            s = s0 * (0.25 + 0.85 * g) * (1 + 0.25 * t)
            o.scale = (s, s, s)
            o.location = off * (0.3 + 0.8 * g) + Vector((0, 0, -0.15 * t))
            keys(o, f)
        mat_key(mat, 'heat', f, 3.0 * (1 - smooth(0.0, 0.35, t)))
        mat_key(mat, 'cool', f, -0.15 + 0.5 * smooth(0.0, 0.3, t))
        mat_key(mat, 'dens', f, 1.0 - 0.6 * smooth(0.5, 1.0, t))
        mat_key(mat, 'evo', f, t * 0.8)
        mat_key(mat, 'rough', f, 0.6 + 0.3 * t)


def build_electric(frames, rng):
    """A ball of lightning: forked bolts lashing out from a hot core, new ones
    every frame (the game adds the soft glow). Neutral white so a tint colours it."""
    core = sphere(r=1.0, sub=3)
    cm = ramp_material('ecore', [(0.0, (0.5, 0.5, 0.55)), (1.0, (1.0, 1.0, 1.0))], strength=2.2, alpha_power=1.2)
    core.data.materials.append(cm)
    arc = flat_material('earc', (1.0, 1.0, 1.0), 1.6)
    per = []
    for f in range(frames):
        t = f / (frames - 1)
        reach = 0.6 + 1.25 * ease_out(min(1.0, t * 2.0))
        n = 7 if t < 0.6 else 4
        objs = []
        for k in range(n):
            a = rng.uniform(0, math.tau)
            L_ = reach * rng.uniform(0.55, 1.0)
            ex, ez = math.cos(a) * L_, math.sin(a) * L_
            pts = jagged(rng, 0, 0, ex, ez, 7, 0.14)
            objs.append(bolt_curve(pts, arc, 0.035 * (1 - 0.5 * t)))
            mx, mz = pts[3]
            b2 = a + rng.choice((-1, 1)) * rng.uniform(0.4, 0.9)
            objs.append(bolt_curve(jagged(rng, mx, mz, mx + math.cos(b2) * L_ * 0.45, mz + math.sin(b2) * L_ * 0.45, 4, 0.12), arc, 0.022))
        per.append(objs)
    flicker(per, frames)
    for f in range(frames):
        t = f / (frames - 1)
        r = 0.42 * (1 - 0.6 * t)
        core.scale = (r, r, r)
        core.keyframe_insert('scale', frame=f)
        mat_key(cm, 'heat', f, 0.0)
        mat_key(cm, 'alpha', f, 1.0 - smooth(0.6, 1.0, t))


def build_nuke(frames, rng):
    """The nuclear sequence, standing on the bottom edge of its frame: a
    white-hot dome on the ground lifts into a rising fireball, draws a stem of
    dust up under it and rolls into a mushroom cap (a torus with a crown),
    while the base surge rings out along the ground; the fire sinks into
    brown-grey smoke as it climbs."""
    GROUND = -2.0
    use_cycles()
    add_sun(energy=4.0, ambient=(0.06, 0.05, 0.05))
    cap_t, crown = lobe('torus'), lobe()
    stem = [lobe() for _ in range(6)]
    base = [lobe() for _ in range(7)]
    allk = [crown, cap_t] + stem + base
    mat = vol_material('nuke', allk, crown, albedo=(0.36, 0.29, 0.23), emit=3.0, density=18.0, scale=3.6)
    vol_domain(mat)
    for f in range(frames):
        t = f / (frames - 1)
        rise = ease_out(min(1.0, t * 1.35))
        cz = GROUND + 0.4 + 2.3 * rise                       # cap centre height
        cr = 0.35 + 0.65 * ease_out(min(1.0, t * 1.6))       # cap radius
        roll = smooth(0.08, 0.5, t)                          # the fireball flattens into a rolling ring
        crown.location = (0, 0, cz + 0.1 * cr)
        crown.scale = (cr * (0.9 + 0.15 * roll), cr * 0.9, cr * (0.95 - 0.3 * roll))
        cap_t.location = (0, 0, cz - 0.08 * cr)
        k = 0.3 + 0.75 * roll
        cap_t.scale = (cr * k, cr * k, cr * (0.5 + 0.4 * roll))
        cap_t.rotation_euler = (0, 0, t * 0.6)
        for i, o in enumerate(stem):
            u = (i + 0.5) / len(stem)
            grow = smooth(0.03 + 0.03 * i, 0.3 + 0.05 * i, t)
            w = (0.26 + 0.14 * (1 - u)) * (0.15 + 0.85 * grow) * (1 + 0.2 * t)
            top = cz - 0.3 * cr
            o.location = (0, 0, GROUND + 0.1 + (top - GROUND - 0.1) * u)
            o.scale = (w, w, max(w, (top - GROUND) / len(stem) * 0.95 * grow))
        for i, o in enumerate(base):
            side = (i - 3) / 3.0
            spread = ease_out(smooth(0.03, 1.0, t))
            o.location = (side * (0.2 + 1.4 * spread), 0, GROUND + 0.16 + 0.08 * spread)
            s = (0.32 + 0.22 * spread) * (1.0 if i == 3 else 0.9)
            o.scale = (s * 1.25, s, s * (0.8 - 0.3 * spread))
        for o in allk:
            keys(o, f)
        mat_key(mat, 'heat', f, 3.0 * (1 - smooth(0.05, 0.75, t)) + 0.4 * (1 - smooth(0.6, 1.0, t)))
        mat_key(mat, 'cool', f, -0.15 + 0.4 * smooth(0.05, 0.65, t))
        mat_key(mat, 'dens', f, (0.45 + 0.55 * smooth(0.0, 0.25, t)) * (1 - 0.55 * smooth(0.7, 1.0, t)))
        mat_key(mat, 'evo', f, t * 1.5)
        mat_key(mat, 'rough', f, 0.4 + 0.35 * t)


def build_flare(frames, rng):
    """A hot flash for energy hits: a long horizontal streak, a shorter
    vertical one, a small diagonal star and a soft core, snapping out and
    fading. Neutral white so a tint colours it."""
    parts_ = []
    for name, sc_, alpha_p in (('streak', (1.95, 0.05, 0.05), 1.0), ('vert', (0.05, 0.05, 0.9), 1.0),
                               ('d1', (0.55, 0.035, 0.035), 1.0), ('d2', (0.55, 0.035, 0.035), 1.0), ('core', (0.45, 0.45, 0.45), 0.9),
                               ('halo', (1.0, 1.0, 1.0), 2.2)):
        o = sphere(r=1.0, sub=3)
        m = ramp_material('fl_' + name, [(0.0, (0.55, 0.55, 0.6)), (1.0, (1.0, 1.0, 1.0))], strength=2.0 if name != 'halo' else 0.9, alpha_power=alpha_p)
        o.data.materials.append(m)
        if name == 'd1':
            o.rotation_euler = (0, math.radians(45), 0)
        if name == 'd2':
            o.rotation_euler = (0, math.radians(-45), 0)
        parts_.append((o, m, Vector(sc_), name))
    for f in range(frames):
        t = f / (frames - 1)
        g = ease_out(min(1.0, t * 3.5))
        for o, m, sc_, name in parts_:
            k = (0.3 + 0.7 * g) if name != 'streak' else (0.2 + 0.8 * g) * (1 + 0.15 * t)
            thin = 1 - 0.6 * t
            if name in ('core', 'halo'):
                o.scale = sc_ * k * (1 - 0.5 * t if name == 'core' else 1)
            else:
                o.scale = (sc_.x * k, sc_.y * thin, sc_.z * k if name == 'vert' else sc_.z * thin)
            o.keyframe_insert('scale', frame=f)
            mat_key(m, 'heat', f, 0.0)
            mat_key(m, 'alpha', f, (0.6 if name == 'halo' else 1.0) * (1 - smooth(0.35, 1.0, t)))


def build_muzzle(frames, rng):
    """A muzzle blast pointing right from the middle of the frame: a white-hot
    core, a ragged orange tongue of flame and two side jets, gone in a blink."""
    FL = [(0.0, (0.55, 0.12, 0.0)), (0.5, (1.0, 0.45, 0.05)), (1.0, (1.0, 0.92, 0.65))]
    blobs = []
    for name, loc, sc_, st in (('tongue', (0.95, 0, 0), (0.85, 0.3, 0.3), 1.5), ('tip', (1.55, 0, 0), (0.4, 0.2, 0.2), 1.3),
                               ('up', (0.4, 0, 0.5), (0.45, 0.15, 0.15), 1.4), ('down', (0.4, 0, -0.5), (0.45, 0.15, 0.15), 1.4),
                               ('core', (0.2, 0, 0), (0.38, 0.34, 0.34), 2.4)):
        o = sphere(r=1.0, sub=4)
        cloud_displace(o, 0.25 if name != 'core' else 0.05, 0.5, moving_empty(rng, frames, 1.5))
        m = ramp_material('mz_' + name, FL, strength=st, alpha_power=0.8, noise=0.35 if name != 'core' else 0.0, noise_scale=3.0)
        o.data.materials.append(m)
        # the side jets lean forward, out of the muzzle brake
        if name == 'up':
            o.rotation_euler = (0, math.radians(55), 0)
        if name == 'down':
            o.rotation_euler = (0, math.radians(-55), 0)
        blobs.append((o, m, Vector(loc), Vector(sc_)))
    for f in range(frames):
        t = f / (frames - 1)
        g = ease_out(min(1.0, t * 3.0))
        for o, m, loc, sc_ in blobs:
            o.scale = sc_ * (0.35 + 0.75 * g)
            o.location = loc * (0.45 + 0.6 * g)
            o.keyframe_insert('scale', frame=f)
            o.keyframe_insert('location', frame=f)
            mat_key(m, 'heat', f, 0.6 * smooth(0.1, 1.0, t))
            mat_key(m, 'alpha', f, 1.0 - smooth(0.3, 1.0, t))


# ------------------------------------------------------- shells in flight
# Each is modelled nose to the right (+X) and turned about its long axis
# over the frames; the game turns the sprite to the shell's heading.
def pbr(name, color, metal=0.0, rough=0.5, emit=None, strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    b = mat.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*color, 1.0)
    b.inputs['Metallic'].default_value = metal
    b.inputs['Roughness'].default_value = rough
    if emit is not None:
        b.inputs['Emission Color'].default_value = (*emit, 1.0)
        b.inputs['Emission Strength'].default_value = strength
    return mat


def shell_rig(rim=(0.55, 0.65, 1.0)):
    """Key sun from the upper left, a cool rim from behind, a dim world."""
    sc = bpy.context.scene
    sc.world.color = (0.09, 0.09, 0.11)
    key_ = bpy.data.objects.new('Key', bpy.data.lights.new('Key', 'SUN'))
    key_.data.energy = 4.5
    key_.rotation_euler = Vector((0.55, 0.6, -0.6)).normalized().to_track_quat('-Z', 'Y').to_euler()
    link(key_)
    back = bpy.data.objects.new('Rim', bpy.data.lights.new('Rim', 'SUN'))
    back.data.energy = 2.5
    back.data.color = rim
    back.rotation_euler = Vector((-0.3, -0.8, 0.45)).normalized().to_track_quat('-Z', 'Y').to_euler()
    link(back)


def part(obj, mat, parent, smooth_=True):
    obj.data.materials.append(mat)
    if smooth_:
        bpy.ops.object.shade_smooth()
    obj.parent = parent
    return obj


def cyl_x(r, x0, x1, mat, parent, verts=32, r1=None):
    """A cylinder (or, with r1, a cone frustum) along X from x0 to x1."""
    if r1 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=x1 - x0, location=((x0 + x1) / 2, 0, 0), rotation=(0, math.pi / 2, 0))
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r1, depth=x1 - x0, location=((x0 + x1) / 2, 0, 0), rotation=(0, math.pi / 2, 0))
    return part(bpy.context.active_object, mat, parent)


def nose_x(r, x0, length, mat, parent):
    """An ogive nose: the front half of a stretched sphere starting at x0."""
    o = sphere(loc=(x0, 0, 0), r=1.0, sub=4, scale=(length, r, r))
    return part(o, mat, parent)


def fins(x0, x1, span, mat, parent, n=4, thick=0.05, root=0.0, phase=45):
    """n flat fins round the tail, from x0 to x1, standing `span` out from radius `root`."""
    out = []
    for i in range(n):
        a = math.radians(phase + i * 360 / n)
        bpy.ops.mesh.primitive_cube_add(size=1.0)
        o = bpy.context.active_object
        o.scale = (x1 - x0, thick, span)
        o.location = ((x0 + x1) / 2, -math.sin(a) * (root + span / 2), math.cos(a) * (root + span / 2))
        o.rotation_euler = (a, 0, 0)
        out.append(part(o, mat, parent, smooth_=False))
    return out


def spinner(frames, turns=0.5, axis=0):
    """The empty every part hangs from; turns `turns` times about X over the clip."""
    e = bpy.data.objects.new('body', None)
    link(e)
    for f in range(frames):
        r = [0.0, 0.0, 0.0]
        r[axis] = f / frames * math.tau * turns
        e.rotation_euler = r
        e.keyframe_insert('rotation_euler', frame=f)
    look_flat(e)
    return e


def decal(x, ang, w, h, mat, parent, r):
    """A small painted mark on a body of radius r at angle `ang` round X (so spin shows)."""
    bpy.ops.mesh.primitive_cube_add(size=1.0)
    o = bpy.context.active_object
    a = math.radians(ang)
    o.scale = (w, 0.02, h)
    o.location = (x, -math.cos(a) * r, math.sin(a) * r)
    o.rotation_euler = (-a + 0, 0, 0)
    o.rotation_euler = (a, 0, 0)
    return part(o, mat, parent, smooth_=False)


def build_p_shell(frames, rng):
    """The plain shell: olive steel, a brass fuze, a copper driving band."""
    shell_rig()
    b = spinner(frames, 0.5)
    olive, brass, copper, ink = pbr('olive', (0.26, 0.3, 0.16), 0.25, 0.5), pbr('brass', (0.85, 0.62, 0.25), 1.0, 0.3), pbr('copper', (0.75, 0.38, 0.2), 1.0, 0.35), pbr('ink', (0.9, 0.85, 0.3), 0.0, 0.6)
    cyl_x(0.42, -1.45, 0.35, olive, b)
    nose_x(0.42, 0.35, 0.95, olive, b)
    nose_x(0.17, 1.05, 0.32, brass, b)
    cyl_x(0.445, -1.2, -0.95, copper, b)
    cyl_x(0.38, -1.55, -1.45, copper, b)
    decal(-0.3, 0, 0.5, 0.1, ink, b, 0.425)


def build_p_buck(frames, rng):
    """A lead pellet, dented, tumbling."""
    shell_rig()
    b = spinner(frames, 1.0, axis=1)
    lead = pbr('lead', (0.42, 0.42, 0.46), 0.7, 0.38)
    o = sphere(r=0.9, sub=3)
    cloud_displace(o, 0.12, 0.45)
    part(o, lead, b)


def build_p_mortar(frames, rng):
    """A mortar bomb: a fat teardrop, a tail boom and four fins."""
    shell_rig()
    b = spinner(frames, 0.25)
    olive, steel, brass, ink = pbr('olive', (0.22, 0.26, 0.14), 0.2, 0.55), pbr('steel', (0.5, 0.5, 0.52), 0.9, 0.35), pbr('brass', (0.85, 0.62, 0.25), 1.0, 0.3), pbr('ink', (0.85, 0.82, 0.75), 0.0, 0.6)
    o = sphere(loc=(0.15, 0, 0), r=1.0, sub=4, scale=(1.05, 0.58, 0.58))
    part(o, olive, b)
    cyl_x(0.2, -1.45, -0.5, steel, b)
    nose_x(0.14, 1.12, 0.28, brass, b)
    fins(-1.5, -1.0, 0.42, steel, b, root=0.12, thick=0.04)
    decal(0.2, 10, 0.3, 0.08, ink, b, 0.58)


def build_p_rail(frames, rng):
    """A rail slug, white-hot: a glowing spindle, a hotter core, a blue sheath."""
    b = spinner(frames, 0.0)
    core = sphere(r=1.0, sub=4, scale=(1.4, 0.2, 0.2))
    cm = ramp_material('slug', [(0.0, (0.2, 0.55, 1.0)), (1.0, (0.9, 0.97, 1.0))], strength=1.6, alpha_power=0.6)
    part(core, cm, b)
    sheath = sphere(r=1.0, sub=4, scale=(1.85, 0.5, 0.5))
    sm = ramp_material('sheath', [(0.0, (0.05, 0.25, 0.9)), (1.0, (0.35, 0.65, 1.0))], strength=1.3, alpha_power=1.6)
    part(sheath, sm, b)
    for f in range(frames):
        k = 1.0 + 0.12 * math.sin(f / frames * math.tau * 2)
        sheath.scale = (1.85 * k, 0.5 * k, 0.5 * k)
        sheath.keyframe_insert('scale', frame=f)
        mat_key(sm, 'heat', f, 0.0)
        mat_key(sm, 'alpha', f, 0.55 + 0.25 * math.sin(f / frames * math.tau * 3))


def build_p_cluster(frames, rng):
    """A cluster canister: banded segments over the bomblets, short fins."""
    shell_rig()
    b = spinner(frames, 0.5)
    hull, band, steel, glow = pbr('hull', (0.3, 0.25, 0.38), 0.4, 0.45), pbr('band', (0.08, 0.07, 0.1), 0.2, 0.6), pbr('steel', (0.5, 0.5, 0.55), 0.9, 0.35), pbr('lamp', (0.9, 0.6, 1.0), 0.0, 0.4, (0.85, 0.5, 1.0), 4.0)
    cyl_x(0.46, -1.3, 0.5, hull, b)
    nose_x(0.46, 0.5, 0.75, hull, b)
    for x in (-0.75, -0.15, 0.4):
        cyl_x(0.475, x - 0.04, x + 0.04, band, b)
    for ang in (0, 120, 240):
        decal(-0.4, ang, 1.6, 0.04, band, b, 0.465)
    fins(-1.45, -1.05, 0.25, steel, b, root=0.3)
    decal(0.05, 30, 0.12, 0.12, glow, b, 0.47)


def build_p_flak(frames, rng):
    """A flak shell: grey steel, a red band, a proximity fuze that blinks."""
    shell_rig()
    b = spinner(frames, 0.5)
    grey, red, brass = pbr('grey', (0.38, 0.39, 0.42), 0.5, 0.4), pbr('red', (0.7, 0.05, 0.06), 0.1, 0.45), pbr('brass', (0.85, 0.62, 0.25), 1.0, 0.3)
    cyl_x(0.4, -1.4, 0.3, grey, b)
    nose_x(0.4, 0.3, 0.85, grey, b)
    cyl_x(0.41, -0.55, -0.25, red, b)
    nose_x(0.15, 0.95, 0.28, brass, b)
    lamp = sphere(loc=(1.22, 0, 0), r=0.11, sub=2)
    lm = pbr('lamp', (1.0, 0.3, 0.2), 0.0, 0.3, (1.0, 0.25, 0.15), 0.0)
    part(lamp, lm, b)
    node = lm.node_tree.nodes['Principled BSDF'].inputs['Emission Strength']
    for f in range(frames):
        node.default_value = 30.0 if f < frames // 2 else 0.5
        node.keyframe_insert('default_value', frame=f)


def build_p_seeker(frames, rng):
    """A guided missile: white body, teal seeker head, fins and canards, and a
    flickering exhaust flame behind."""
    shell_rig()
    b = spinner(frames, 0.25)
    white, teal, steel = pbr('white', (0.82, 0.84, 0.86), 0.1, 0.35), pbr('teal', (0.2, 0.75, 0.65), 0.3, 0.2), pbr('steel', (0.45, 0.46, 0.5), 0.9, 0.35)
    cyl_x(0.27, -1.25, 0.6, white, b)
    nose_x(0.27, 0.6, 0.55, teal, b)
    fins(-1.25, -0.8, 0.3, steel, b, root=0.2)
    fins(0.15, 0.4, 0.14, steel, b, root=0.22)
    cyl_x(0.2, -1.38, -1.25, steel, b, r1=0.27)
    flame = sphere(loc=(-1.75, 0, 0), r=1.0, sub=3, scale=(0.4, 0.17, 0.17))
    fm = ramp_material('flame', [(0.0, (1.0, 0.35, 0.05)), (1.0, (1.0, 0.95, 0.75))], strength=3.5, alpha_power=0.9)
    flame.data.materials.append(fm)
    for f in range(frames):
        k = 0.75 + 0.5 * rng.random()
        flame.scale = (0.42 * k, 0.17 * (0.8 + 0.2 * k), 0.17 * (0.8 + 0.2 * k))
        flame.location = (-1.38 - 0.42 * k, 0, 0)
        flame.keyframe_insert('scale', frame=f)
        flame.keyframe_insert('location', frame=f)
        mat_key(fm, 'heat', f, 0.0)
        mat_key(fm, 'alpha', f, 1.0)


def bolt_curve(pts, mat, width=0.03):
    """A jagged line through pts (x, z), a glowing tube."""
    cu = bpy.data.curves.new('bolt', 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = width
    sp = cu.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for i, (x, z) in enumerate(pts):
        sp.points[i].co = (x, -0.6, z, 1.0)
    o = bpy.data.objects.new('bolt', cu)
    o.data.materials.append(mat)
    link(o)
    return o


def jagged(rng, x0, z0, x1, z1, n=7, amp=0.25):
    pts = []
    for i in range(n + 1):
        t = i / n
        j = 0 if i in (0, n) else rng.uniform(-amp, amp)
        pts.append((x0 + (x1 - x0) * t - (z1 - z0) * j, z0 + (z1 - z0) * t + (x1 - x0) * j))
    return pts


def flicker(objs_by_frame, frames):
    """Show each frame's own objects only on that frame."""
    for f in range(frames):
        for g, objs in enumerate(objs_by_frame):
            for o in objs:
                o.hide_render = g != f
                o.keyframe_insert('hide_render', frame=f)


def build_p_lance(frames, rng):
    """The lance: a spear of yellow plasma wrapped in crawling sparks."""
    b = spinner(frames, 0.0)
    core = sphere(r=1.0, sub=4, scale=(1.75, 0.2, 0.2))
    part(core, ramp_material('spear', [(0.0, (1.0, 0.65, 0.0)), (1.0, (1.0, 0.98, 0.75))], strength=1.7, alpha_power=0.5), b)
    sheath = sphere(r=1.0, sub=4, scale=(1.9, 0.42, 0.42))
    part(sheath, ramp_material('lsheath', [(0.0, (0.7, 0.45, 0.0)), (1.0, (1.0, 0.85, 0.2))], strength=1.2, alpha_power=1.8), b)
    arc = flat_material('arc', (1.0, 0.85, 0.3), 2.0)
    per = []
    for f in range(frames):
        objs = []
        for k in range(3):
            x0 = rng.uniform(-1.7, 0.6)
            objs.append(bolt_curve(jagged(rng, x0, rng.uniform(-0.15, 0.15), x0 + rng.uniform(0.6, 1.1), rng.choice((-1, 1)) * rng.uniform(0.3, 0.55), 5, 0.18), arc, 0.045))
        per.append(objs)
    flicker(per, frames)


def build_p_heavy(frames, rng):
    """The heavy: a fat, blunt gunmetal shell with a wide orange band and rivets."""
    shell_rig()
    b = spinner(frames, 0.5)
    gun, orange, rivet = pbr('gun', (0.16, 0.16, 0.18), 0.8, 0.4), pbr('orange', (0.85, 0.35, 0.08), 0.2, 0.45), pbr('rivet', (0.6, 0.6, 0.6), 1.0, 0.3)
    cyl_x(0.66, -1.35, 0.3, gun, b)
    nose_x(0.66, 0.3, 0.9, gun, b)
    cyl_x(0.675, -0.75, -0.35, orange, b)
    cyl_x(0.62, -1.5, -1.35, gun, b)
    for i in range(6):
        a = math.radians(i * 60 + 15)
        r = sphere(loc=(-0.95, -math.cos(a) * 0.66, math.sin(a) * 0.66), r=0.06, sub=1)
        part(r, rivet, b)


def build_p_needle(frames, rng):
    """The needle: a slim polished flechette with four tail fins."""
    shell_rig()
    b = spinner(frames, 0.25)
    chrome, dark = pbr('chrome', (0.88, 0.9, 0.95), 1.0, 0.15), pbr('dark', (0.2, 0.22, 0.26), 0.8, 0.3)
    cyl_x(0.11, -1.6, 0.9, chrome, b)
    cyl_x(0.11, 0.9, 1.8, chrome, b, r1=0.0)
    fins(-1.65, -1.05, 0.2, dark, b, root=0.08, thick=0.03)


def build_p_emp(frames, rng):
    """The EMP: a teal plasma orb in a cage of two steel rings, arcs crawling over it."""
    shell_rig()
    b = spinner(frames, 0.25)
    orb = sphere(r=0.55, sub=4)
    part(orb, ramp_material('orb', [(0.0, (0.0, 0.45, 0.4)), (1.0, (0.55, 1.0, 0.92))], strength=1.5, alpha_power=0.7), b)
    steel = pbr('steel', (0.4, 0.42, 0.46), 0.9, 0.3)
    for rot in ((0, 0, 0), (0, math.pi / 2, 0)):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.72, minor_radius=0.07, major_segments=48, minor_segments=10, rotation=rot)
        part(bpy.context.active_object, steel, b)
    arc = flat_material('arc', (0.45, 1.0, 0.9), 1.8)
    per = []
    for f in range(frames):
        objs = []
        for k in range(3):
            a0 = rng.uniform(0, math.tau)
            a1 = a0 + rng.uniform(0.9, 1.8)
            r0, r1 = 0.5, rng.uniform(0.95, 1.3)
            objs.append(bolt_curve(jagged(rng, math.cos(a0) * r0, math.sin(a0) * r0, math.cos(a1) * r1, math.sin(a1) * r1, 5, 0.16), arc, 0.045))
        per.append(objs)
    flicker(per, frames)


def build_p_roller(frames, rng):
    """The roller: a heavy tan ball with a dark band and studs. The frames turn
    it one full turn clockwise about the view axis (the game picks the frame
    from the distance rolled), the light stays put."""
    shell_rig()
    b = spinner(frames, 1.0, axis=1)
    tan, dark, stud = pbr('tan', (0.62, 0.48, 0.28), 0.3, 0.5), pbr('band', (0.14, 0.1, 0.06), 0.2, 0.6), pbr('stud', (0.75, 0.72, 0.66), 1.0, 0.3)
    o = sphere(r=1.55, sub=4)
    part(o, tan, b)
    bpy.ops.mesh.primitive_torus_add(major_radius=1.53, minor_radius=0.1, major_segments=64, minor_segments=10, rotation=(0, 0, 0))
    part(bpy.context.active_object, dark, b)
    for a in (40, 160, 280):
        r = math.radians(a)
        s_ = sphere(loc=(math.cos(r) * 1.1, -1.05, math.sin(r) * 1.1), r=0.13, sub=2)
        part(s_, stud, b)


def build_p_nuke(frames, rng):
    """The nuke: a fat bomb, olive with a yellow hazard band and a red nose,
    box fins in a ring at the tail."""
    shell_rig()
    b = spinner(frames, 0.25)
    olive, yellow, red, steel = pbr('olive', (0.22, 0.25, 0.17), 0.3, 0.5), pbr('yellow', (0.95, 0.75, 0.05), 0.1, 0.45), pbr('red', (0.75, 0.06, 0.05), 0.2, 0.4), pbr('steel', (0.42, 0.43, 0.45), 0.9, 0.35)
    o = sphere(loc=(0.05, 0, 0), r=1.0, sub=4, scale=(1.15, 0.66, 0.66))
    part(o, olive, b)
    cyl_x(0.672, -0.35, 0.05, yellow, b)
    nose_x(0.33, 0.95, 0.3, red, b)
    cyl_x(0.5, -1.45, -0.7, olive, b, r1=0.36)
    fins(-1.65, -1.2, 0.45, steel, b, root=0.18, thick=0.05)
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.66, depth=0.42, location=(-1.43, 0, 0), rotation=(0, math.pi / 2, 0))
    ring = bpy.context.active_object
    sol = ring.modifiers.new('s', 'SOLIDIFY')
    sol.thickness = 0.05
    bm_ = ring.data
    # open the ring: drop the two caps so it is a band
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(bm_)
    caps = [f for f in bm.faces if len(f.verts) > 4]
    bmesh.ops.delete(bm, geom=caps, context='FACES_ONLY')
    bm.to_mesh(bm_)
    bm.free()
    part(ring, steel, b)


def build_p_leapfrog(frames, rng):
    """The Leapfrog: a squat frog-green bomb with a brass nose, a pale belly
    band and a coiled spring for a tail (it leaps on from each burst)."""
    shell_rig()
    b = spinner(frames, 0.5)
    green, belly, brass, steel = pbr('green', (0.18, 0.5, 0.12), 0.25, 0.45), pbr('belly', (0.78, 0.86, 0.45), 0.1, 0.5), pbr('brass', (0.85, 0.62, 0.25), 1.0, 0.3), pbr('steel', (0.55, 0.56, 0.6), 0.9, 0.3)
    o = sphere(loc=(0.1, 0, 0), r=1.0, sub=4, scale=(0.95, 0.62, 0.62))
    part(o, green, b)
    cyl_x(0.635, -0.2, 0.1, belly, b)
    nose_x(0.2, 0.95, 0.3, brass, b)
    for i in range(5):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.26, minor_radius=0.05, major_segments=24, minor_segments=8,
                                         location=(-0.85 - i * 0.14, 0, 0), rotation=(0, math.pi / 2, 0))
        part(bpy.context.active_object, steel, b)
    for ang in (60, 300):
        eye = sphere(loc=(0.55, -math.cos(math.radians(ang)) * 0.45, math.sin(math.radians(ang)) * 0.45), r=0.11, sub=2)
        part(eye, pbr('eye', (0.95, 0.85, 0.2), 0.0, 0.3, (0.9, 0.7, 0.1), 1.5), b)


def build_p_funky(frames, rng):
    """The Funky Bomb: a glossy ball in candy stripes (pink, cyan, yellow,
    lime) with a stubby fuse, tumbling."""
    shell_rig()
    b = spinner(frames, 1.0, axis=1)
    cols = [(0.95, 0.3, 0.6), (0.2, 0.85, 0.95), (0.98, 0.85, 0.15), (0.55, 0.9, 0.25)]
    mats = [pbr('stripe%d' % i, c, 0.1, 0.25) for i, c in enumerate(cols)]
    o = sphere(r=0.9, sub=4)
    part(o, mats[0], b)
    for i, x in enumerate((-0.6, -0.2, 0.2, 0.6)):
        r = math.sqrt(max(0.0, 0.9 * 0.9 - x * x)) + 0.015
        cyl_x(r, x - 0.09, x + 0.09, mats[(i + 1) % 4], b)
    cyl_x(0.12, 0.85, 1.15, pbr('cap', (0.2, 0.2, 0.22), 0.8, 0.4), b)
    spark = sphere(loc=(1.22, 0, 0), r=0.12, sub=2)
    part(spark, pbr('spark', (1.0, 0.85, 0.4), 0.0, 0.3, (1.0, 0.7, 0.2), 6.0), b)


def build_p_deathshead(frames, rng):
    """Death's Head: a long gunmetal MIRV bus with a bone-white skull nose
    (two dark eye sockets), a blood-red band and four fins."""
    shell_rig()
    b = spinner(frames, 0.25)
    gun, bone, red, socket, steel = pbr('gun', (0.14, 0.14, 0.16), 0.8, 0.35), pbr('bone', (0.86, 0.83, 0.74), 0.05, 0.55), pbr('red', (0.6, 0.04, 0.04), 0.2, 0.4), pbr('socket', (0.02, 0.02, 0.02), 0.0, 0.8), pbr('steel', (0.45, 0.46, 0.5), 0.9, 0.3)
    cyl_x(0.5, -1.4, 0.25, gun, b)
    o = sphere(loc=(0.3, 0, 0), r=1.0, sub=4, scale=(0.9, 0.56, 0.56))
    part(o, bone, b)
    cyl_x(0.515, -0.45, -0.2, red, b)
    # the face looks out to the side the camera sees as the bus turns: two
    # sockets along the skull and a row of teeth below them
    for ang in (0, 180):
        a = math.radians(ang)
        for x in (0.45, 0.8):
            surf = 0.56 * math.sqrt(1 - ((x - 0.3) / 0.9) ** 2)   # the skull's radius at x
            eye = sphere(loc=(x, -math.cos(a) * surf, math.sin(a) * surf + 0.08), r=0.15, sub=2)
            part(eye, socket, b)
        for k in range(4):
            decal(0.3 + k * 0.12, ang - 30, 0.06, 0.12, socket, b, 0.55)
    fins(-1.5, -1.0, 0.45, steel, b, root=0.15, thick=0.05)


# atlas name -> (frame px, frames per clip, fps, [(sheet name, builder)]):
# one PNG, one row per clip; each clip is its own sheet in sprites.json.
ATLASES = {
    'shells': (48, 8, 12, [
        ('p_shell', build_p_shell), ('p_buck', build_p_buck), ('p_mortar', build_p_mortar),
        ('p_rail', build_p_rail), ('p_cluster', build_p_cluster), ('p_flak', build_p_flak),
        ('p_seeker', build_p_seeker), ('p_lance', build_p_lance), ('p_heavy', build_p_heavy),
        ('p_needle', build_p_needle), ('p_emp', build_p_emp), ('p_roller', build_p_roller),
        ('p_nuke', build_p_nuke),
    ]),
    # The Blast family's own shells (Baby Nuke and the rollers wear p_nuke and p_roller).
    'shells_blast': (48, 8, 12, [
        ('p_leapfrog', build_p_leapfrog), ('p_funky', build_p_funky), ('p_deathshead', build_p_deathshead),
    ]),
}


# name -> (builder, frame px, frames, columns, fps)
SHEETS = {
    'fireball': (build_fireball, 96, 24, 6, 30),
    'smoke': (build_smoke, 64, 16, 4, 14),
    'shock': (build_shock, 96, 12, 4, 24),
    'energy': (build_energy, 96, 16, 4, 30),
    'moon': (build_moon, 192, 7, 4, 0),
    'blast': (build_blast, 128, 24, 6, 30),
    'plume': (build_plume, 96, 20, 5, 12),
    'dirt': (build_dirt, 96, 20, 5, 24),
    'debris': (build_debris, 32, 16, 8, 20),
    'scorch': (build_scorch, 64, 12, 6, 6),
    'flakburst': (build_flakburst, 96, 20, 5, 24),
    'electric': (build_electric, 96, 16, 4, 24),
    'nuke': (build_nuke, 160, 32, 8, 12),
    'flare': (build_flare, 96, 12, 6, 30),
    'muzzle': (build_muzzle, 64, 8, 8, 30),
    'parachute': (build_parachute, 64, 16, 4, 12),
}


# -------------------------------------------------------------- compositing
def render_frames(sc, frames, out_dir, pick=None):
    os.makedirs(out_dir, exist_ok=True)
    paths = []
    for f in range(frames):
        if pick is not None and f not in pick:
            # a quick look: frames left out repeat the last one rendered
            if paths:
                paths.append(paths[-1])
                continue
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


def render_one(args, name, build, frame_px, nframes, blend_path):
    """Build one scene, save its .blend, render its frames; returns the frames
    (frame_px square, alpha-weighted down from the supersampled render) and
    the engine that drew them."""
    rng = random.Random(args['seed'])
    ARGS.pop('_ss', None)
    sc, _ = reset_scene(nframes, args, frame_px)
    build(nframes, rng)
    if args['blend']:
        bpy.context.preferences.filepaths.save_version = 0   # no .blend1 backups
        os.makedirs(os.path.dirname(blend_path), exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=blend_path, compress=True)
    tmp = os.path.join(args['out'], '_frames', name)
    paths = render_frames(sc, nframes, tmp, args['pick'])
    k = ARGS.get('_ss', args['supersample'])
    return [downsample(read_png(p), k) for p in paths], sc.render.engine


def main():
    args = parse_args()
    ARGS.update(args)
    os.makedirs(args['out'], exist_ok=True)
    index_path = os.path.join(args['out'], 'sprites.json')
    index = {}
    if os.path.exists(index_path):
        with open(index_path) as fh:
            index = json.load(fh)
    index['_note'] = ('Sprite sheets rendered by fx/blender/render_fx.py. frame = square px; frames fill rows '
                      'left to right from the top-left, cols per row; fps = designed playback rate. '
                      'Sheets that share a file (an atlas) start at frame `first` of it.')
    blend_dir = os.path.abspath(args['blend_dir'])
    names = args['only'] or (list(SHEETS) + list(ATLASES))
    for name in names:
        out_png = os.path.join(args['out'], name + '.png')
        if name in ATLASES:
            frame_px, nframes, fps, clips = ATLASES[name]
            frames_px, engine = [], ''
            for clip, build in clips:
                fr, engine = render_one(args, clip, build, frame_px, nframes, os.path.join(blend_dir, name, clip + '.blend'))
                frames_px += fr
            rows = write_sheet(frames_px, frame_px, nframes, out_png)
            for i, (clip, _) in enumerate(clips):
                index[clip] = {'file': name + '.png', 'frame': frame_px, 'cols': nframes, 'rows': rows,
                               'frames': nframes, 'first': i * nframes, 'fps': fps}
            what = '%d clips of %d frames' % (len(clips), nframes)
        else:
            build, frame_px, nframes, cols, fps = SHEETS[name]
            frames_px, engine = render_one(args, name, build, frame_px, nframes, os.path.join(blend_dir, name + '.blend'))
            rows = write_sheet(frames_px, frame_px, cols, out_png)
            index[name] = {'file': name + '.png', 'frame': frame_px, 'cols': cols, 'rows': rows, 'frames': nframes, 'fps': fps}
            what = '%d frames' % nframes
        q = quantize(out_png) if args['quantize'] else False
        print('SHEET %s: %s of %dpx, %d bytes%s, engine %s' % (
            name, what, frame_px, os.path.getsize(out_png), ' (quantized)' if q else '', engine))
    with open(index_path, 'w') as fh:
        json.dump(index, fh, indent=2)
        fh.write('\n')
    if not args['keep']:
        import shutil
        shutil.rmtree(os.path.join(args['out'], '_frames'), ignore_errors=True)


main()
