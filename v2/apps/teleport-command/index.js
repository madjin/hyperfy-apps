export default function main(world, app, fetch, props, setTimeout) {


app.configure([
  {
    key: 'cmd',
    type: 'text',
    label: 'Command',
    hint: `The command that triggers the teleport, without the slash, eg 'home'.`
  },
  {
    key: 'btn',
    type: 'button',
    label: 'Set Destination',
    hint: 'Sets the destination to the same position and direction you are currently standing in.',
    onClick: () => app.send('set')
  },
])

const cmd = props.cmd

if (world.isServer) {
  const key = `destination_${app.instanceId}`
  const state = app.state
  state.dest = world.get(key)
  state.ready = true
  app.on('set', (_, playerId) => {
    const player = world.getPlayer(playerId)
    state.dest = {
      position: player.position.toArray(),
      rotationY: player.rotation.y
    }
    world.set(key, state.dest)
    app.send('dest', state.dest)
  })
  app.send('init', state)
}

if (world.isClient) {
  console.log(app.state)
  if (app.state.ready) {
    init(app.state)
  } else {
    app.on('init', init)
  }
  function init(state) {
    app.on('dest', dest => {
      state.dest = dest
    })
    world.on('command', e => {
      if (e.args[0] !== cmd) return
      if (!state.dest) return
      const player = world.getPlayer()
      const position = new Vector3().fromArray(state.dest.position)
      const rotationY = state.dest.rotationY
      player.teleport(position, rotationY)
    })
  }
}
}
