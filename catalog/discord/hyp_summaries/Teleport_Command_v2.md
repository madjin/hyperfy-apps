# Teleport_Command_v2.hyp

## Metadata
- **Author**: ash
- **Channel**: #🎨│showcase
- **Date**: 2025-06-08
- **Size**: 178,940 bytes

## Discord Context
> Fixed the storage mechanic here

## Blueprint
- **Name**: Teleport Command
- **Version**: 5
- **Model**: `asset://97fc7289a38b5b49357e6fbd74e7e77fc78493dbb1c0dbc850cb8e9db9fd2530.glb`
- **Script**: `asset://e78f34a2ca35a2753b902d7820af57efc655b183f9c09d3c2e4e789deefdce94.js`

## Props
- `collision`: bool = `True`
- `emote`: emote → `asset://9b55dac6a82f41cb61631b3e8c84607dcf0ff9a48d38639bc9c8715fdb15ea55.glb`
- `cmd`: str = `home`

## Assets
- `[model]` 97fc7289a38b5b49357e6fbd74e7e77fc78493dbb1c0dbc850cb8e9db9fd2530.glb (3,380 bytes)
- `[script]` e78f34a2ca35a2753b902d7820af57efc655b183f9c09d3c2e4e789deefdce94.js (1,349 bytes)
- `[texture]` 39ad1b405cbf41a90825dadf0b554f3c3baba634636bb94a1057dd8ec0784c86.png (2,777 bytes)
- `[emote]` 9b55dac6a82f41cb61631b3e8c84607dcf0ff9a48d38639bc9c8715fdb15ea55.glb (170,188 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.on()`, `app.send()`
**World Methods**: `world.get()`, `world.getPlayer()`, `world.on()`, `world.set()`
**Events Listened**: `command`, `dest`, `init`, `set`

## Keywords (for Discord search)
args, button, command, configure, console, currently, dest, destination, direction, fromArray, getPlayer, hint, home, init, instanceId, isClient, isServer, label, onClick, player

## Script Source
```javascript


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
```

---
*Extracted from Teleport_Command_v2.hyp. Attachment ID: 1381127682380791808*