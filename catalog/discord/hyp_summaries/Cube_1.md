# Cube_1.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-03-29
- **Size**: 39,111 bytes

## Blueprint
- **Name**: Cube 1
- **Version**: 12
- **Model**: `asset://d4fb6ad7b4ad5cc6e6379cac25f1d9572d999736ab7a39166dc849b3a15f694f.glb`
- **Script**: `asset://6497809dadc598c62457ae1e69b2451c6fea2cff293f7cabe907e08208be497e.js`

## Props
- `speed`: float = `1.1`

## Assets
- `[model]` d4fb6ad7b4ad5cc6e6379cac25f1d9572d999736ab7a39166dc849b3a15f694f.glb (38,188 bytes)
- `[script]` 6497809dadc598c62457ae1e69b2451c6fea2cff293f7cabe907e08208be497e.js (253 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.get()`, `app.on()`
**Events Listened**: `update`

## Keywords (for Discord search)
configure, delta, label, linked, material, mesh, props, range, speed, step, textureX, type, update

## Script Source
```javascript
app.configure([
  {
    key: 'speed',
    type: 'range',
    label: 'Speed',
    min: 0,
    max: 10,
    step: 0.1,
  }
])

const mesh = app.get('Mesh')
mesh.linked = false

app.on('update', delta => {
  mesh.material.textureX += props.speed * delta
})
```

---
*Extracted from Cube_1.hyp. Attachment ID: 1355371621136990400*