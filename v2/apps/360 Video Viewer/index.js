export default function main(world, app, fetch, props, setTimeout) {
app.configure([
  {
    key: 'video',
    type: 'file',
    kind: 'video',
    label: 'Video',
  }
])

const src = props.video?.url

if (world.isClient) {
  const mesh = app.get('Sphere')
  const video = app.create('video', {
    src,
    linked: true,
    loop: true,
    aspect: 2 / 1, // 360 videos are generally 2:1
    geometry: mesh.geometry,
    cover: true,
  })
  // position at same place as mesh
  // slightly smaller so its "inside"
  video.position.copy(mesh.position)
  video.quaternion.copy(mesh.quaternion)
  video.scale.copy(mesh.scale).multiplyScalar(0.99)
  
  // disable original mesh
  // mesh.active = false

  // play!
  app.add(video)  
  video.play()
}
}
