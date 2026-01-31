export default function main(world, app, fetch, props, setTimeout) {
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

}
