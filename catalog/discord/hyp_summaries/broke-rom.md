# broke-rom.hyp

## Metadata
- **Author**: general hyper
- **Channel**: #💻│developers
- **Date**: 2025-03-28
- **Size**: 34,599 bytes

## Blueprint
- **Name**: broke-rom
- **Version**: 15
- **Model**: `asset://9eefb29492dbcf914486487ead46db237a06ff10b645bd0d46b2fff8e8b0d289.glb`
- **Script**: `asset://1c85562a840599ed78bf40689a070cf6e18c019024ee1a76c5aa1166c5e151a2.js`

## Props
- `rName`: str = `broke`
- `color`: str = `0.2633`

## Assets
- `[model]` 9eefb29492dbcf914486487ead46db237a06ff10b645bd0d46b2fff8e8b0d289.glb (31,856 bytes)
- `[script]` 1c85562a840599ed78bf40689a070cf6e18c019024ee1a76c5aa1166c5e151a2.js (1,990 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.get()`

## Keywords (for Discord search)
after, begin, being, cases, color, configure, console, dropdown, green, handle, hyper, indigo, initial, label, linked, matLinked, matUnlinked, material, mesh, move

## Script Source
```javascript
// =================================================================
// Config
// =================================================================
app.configure([
  {
    key: 'rName',
    type: 'text',
    label: 'Rom Name',
  },
  {
    key:'color',
    type: 'dropdown',
    label: 'Color',
    options: [
        {
            label: 'Red',
            value: '0.0957',
        },
        {
            label: 'Orange',
            value: '0',
        },
                {
            label: 'Yellow',
            value: '0.4824',
        },
                {
            label: 'Green',
            value: '0.2633',
        },
                {
            label: 'Blue',
            value: '0.389',
        },
                {
            label: 'Indigo',
            value: '0.1777',
        },
        {
            label: 'Violet',
            value: '0.5098',
        },
    ],
    initial: '0',
  }
]);
// =================================================================
// Material Linking Bug
// =================================================================

console.log("-----begin-new-run----")

// get mesh to move uv's on
const mesh = app.get('hyper-rom-orange_mesh')
console.log('root mesh: ', mesh)

// unlink the mesh
mesh.linked = false

// get mesh after being unlinked
const unlinkedMesh = app.get ('hyper-rom-orange_mesh')
console.log ('unlinked mesh: ', unlinkedMesh)

// get material when linked and unlink
const matLinked = mesh.material
const matUnlinked = unlinkedMesh.material
console.log('mat linked', matLinked)
console.log('mat unlinked', matUnlinked)

// unlink material on linked
matLinked.linked = false
matUnlinked.linked  = false

console.log(matLinked)

// handle y color cases
if (props.color == 0.1777){
  // indigo
  mesh.textureY = 0.0684
} else if (props.color == 0.0957){
  // red
  mesh.textureY = -0.0645
} else if (props.color == 0.2633){
  // green
  mesh.textureY = -0.1772
} else {
  mat.textureY = 0
}
mesh.textureX  = props.color

```

---
*Extracted from broke-rom.hyp. Attachment ID: 1355215077946560562*