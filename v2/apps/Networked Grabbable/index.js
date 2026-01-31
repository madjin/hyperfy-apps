export default function main(world, app, fetch, props, setTimeout) {
if (world.isClient) {
  console.log("state", app.state)
  let holder = undefined
  if (holder === undefined && app.state.owner !== undefined) {
    holder = world.getPlayer(app.state.owner)
  }
  const { id: localId } = world.getPlayer()
  const controls = app.control()
  const action = app.create('action', {
    label: 'Pick Up',
    distance: 3,
    onTrigger: ({ playerId }) => {
      action.active = false;
      app.send('taken', playerId)
      holder = world.getPlayer(playerId)
    }
  });
  if (holder !== undefined) action.active = false

  app.on('taken', (playerId) => {
    holder = world.getPlayer(playerId)
    action.active = false
  })

  app.on('dropped', () => {
    holder = undefined
    action.active = true
  })

  controls.keyX.onRelease = () => {
    if (holder === undefined) return
    if (holder.id !== localId) return

    app.send('dropped')

    holder = undefined
  }

  app.add(action)

  app.on('lateUpdate', () => {
    if (holder === undefined) return

    const matrix = holder.getBoneTransform('rightIndexProximal')
    if (matrix) {
      app.position.setFromMatrixPosition(matrix)
      app.quaternion.setFromRotationMatrix(matrix)
    }
  })
}

if (world.isServer) {
  const state = app.state
  app.on('taken', (playerId) => {
    state.owner = playerId
    app.send('taken', playerId)
  })
  app.on('dropped', () => {
    state.owner = undefined
    app.send('dropped')
  })
}
}
