# Credits

Every sprite in `sprites/tiles.png` is rendered by `blender/render_tiles.py` from
scenes built in code, one `.blend` per sprite beside it (the Blender source,
committed through Git LFS). The limestone, bronze, enamel, water, ice, fire and
hide are procedural Blender materials; the figures, objects and terrain are
modelled from primitive meshes. No external images, textures, models or fonts
are used.

The Modern look's models (floor, walls, terrain, pieces and figures) are built in
code from three.js primitives (`src/modern/scene/`), and its textures are painted
procedurally on canvases from seeded noise. Its floating icons and mini map reuse
the sprite atlas above. No external images, textures, models or fonts are used.

The title card's picture (`title/title-wide.webp`, `title/title-tall.webp`) is rendered by
`blender/title_card.py` from a scene built in code (`blender/title.blend`, Git LFS): primitive
meshes and procedural materials. No external images, textures, models or fonts are used.
