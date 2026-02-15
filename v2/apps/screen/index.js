export default function main(world, app, fetch, props, setTimeout) {
app.configure([
  {
    key: 'restricted',
    type: 'toggle',
    label: 'Permission',
    trueLabel: 'Admin',
    falseLabel: 'Everyone',
    initial: false,
  }
])

const screenId = app.instanceId
const restricted = props.restricted

if (world.isClient) {
  const display = app.get('Display')
  const button = app.get('Button')
  const screen = app.get('Screen')
  const video = app.create('video', {
    screenId: app.instanceId,
    linked: true,
    aspect: 16 / 9, // geometry is 16:9
    geometry: screen.geometry,
    fit: 'contain',
    color: 'black',
  })
  // move video to same place as screen
  video.position.copy(screen.position)
  video.quaternion.copy(screen.quaternion)
  video.scale.copy(screen.scale)
  screen.parent.remove(screen)
  app.add(video)

  const player = world.getPlayer()
  const canUse = restricted ? player.admin : true
  if (canUse) {
    const action = app.create('action', {
      label: 'Share Screen',
      distance: 5,
      position: [0, 1, 0],
      onTrigger: () => player.screenshare(screenId),
    })
    app.add(action)
  }
}
}
