# rom2.hyp

## Metadata
- **Author**: general hyper
- **Channel**: #💻│developers
- **Date**: 2025-03-28
- **Size**: 34,556 bytes

## Discord Context
> <@161613961605677058>

## Blueprint
- **Name**: rom2
- **Version**: 264
- **Model**: `asset://9eefb29492dbcf914486487ead46db237a06ff10b645bd0d46b2fff8e8b0d289.glb`
- **Script**: `asset://c2ca976e8ffbc0a5bb23b2f891074aa792378361b2db3c302579b47398098e6c.js`

## Props
- `rName`: str = `rom2`
- `color`: str = `0`

## Assets
- `[model]` 9eefb29492dbcf914486487ead46db237a06ff10b645bd0d46b2fff8e8b0d289.glb (31,856 bytes)
- `[script]` c2ca976e8ffbc0a5bb23b2f891074aa792378361b2db3c302579b47398098e6c.js (1,957 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.get()`
**Nodes Created**: `ui`, `uitext`

## Keywords (for Discord search)
backgroundColor, below, cases, center, color, configure, create, dropdown, execute, ffffff, fontFamily, fontSize, green, handle, hyper, indigo, initial, label, material, mesh

## Script Source
```javascript
// =================================================================
// Place your rom scrip below:
// =================================================================



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
// UI
// =================================================================
const ui = app.create('ui')
ui.rotation.y = 180 * DEG2RAD
ui.position.z = -0.12
ui.position.y = -0.46
ui.width = 20
const romName = app.create('uitext')
romName.fontSize = 4
romName.textAlign = 'center'
romName.color = '#000000'
romName.value = props.rName
romName.backgroundColor = '#ffffff'
romName.fontFamily = 'Arial Black'
const mesh = app.get('hyper-rom-orange_mesh')
const mat = mesh.material
// handle y color cases
if (props.color == 0.1777){
  // indigo
  mat.textureY = 0.0684
} else if (props.color == 0.0957){
  // red
  mat.textureY = -0.0645
} else if (props.color == 0.2633){
  // green
  mat.textureY = -0.1772
} else {
  mat.textureY = 0
}
mat.textureX  = props.color
// execute
ui.add(romName)
app.add(ui)

```

---
*Extracted from rom2.hyp. Attachment ID: 1355042999339454464*