export default function main(world, app, fetch, props, setTimeout) {
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
}
