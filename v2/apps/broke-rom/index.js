export default function main(world, app, fetch, props, setTimeout) {
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

}
