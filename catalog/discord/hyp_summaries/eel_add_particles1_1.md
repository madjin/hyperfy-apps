# eel_add_particles1_1.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-04-17
- **Size**: 553,405 bytes

## Blueprint
- **Name**: eel_add_particles1
- **Version**: 3
- **Model**: `asset://61f91128c02f2adb4f4384accba19b2a4b0be80580e0bf8becb28dd01c05c056.glb`
- **Script**: `asset://689197d812d9522bae998c7dcc55c0f0d631c2194a9951183440c8bba6bd0b88.js`

## Assets
- `[model]` 61f91128c02f2adb4f4384accba19b2a4b0be80580e0bf8becb28dd01c05c056.glb (551,928 bytes)
- `[script]` 689197d812d9522bae998c7dcc55c0f0d631c2194a9951183440c8bba6bd0b88.js (805 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.create()`, `app.get()`, `app.on()`
**World Methods**: `world.add()`
**Events Listened**: `update`
**Nodes Created**: `particles`

## Keywords (for Discord search)
additive, alphaOverLife, blending, bone, configure, create, delta, direction, dust, emissive, file, flow, getBoneTransform, glow, image, kind, label, matrix, name, particle

## Script Source
```javascript
const rig = app.get('rig')

rig.position.y = 2

// Configure particle image upload
app.configure([
  {
    key: 'particleImage',
    type: 'file',
    kind: 'texture',
    label: 'Particle Texture'
  }
])

rig.play({ name: 'flow' })

// Create glow-dust particles
const particles = app.create('particles', {
  shape: ['point'],
  direction: 0.2,
  speed: '0.1~0.3',
  size: '0.03',
  rate: 200,
  blending: 'additive',
  emissive: '1',
  alphaOverLife: '0,0|0.1,1|0.9,1|1,0',
  space: 'world',
  image: props.particleImage?.url
})
world.add(particles)

function update(delta) {
    // Get the bone transform
    const matrix = rig.getBoneTransform('Bone008')
    if (matrix) {
      particles.position.setFromMatrixPosition(matrix)
    }
}

app.on('update', update) 
```

---
*Extracted from eel_add_particles1_1.hyp. Attachment ID: 1362432359336644728*