# Networked_Grabbable.hyp

## Metadata
- **Author**: Saori
- **Channel**: #🎨│showcase
- **Date**: 2025-03-12
- **Size**: 923,928 bytes

## Blueprint
- **Name**: Networked Grabbable
- **Version**: 106
- **Model**: `asset://3563bcd41b6e15bfcb2ee46ffa5b0fa281587beb116e5ea32e876c80bfdaec36.glb`
- **Script**: `asset://83b3cf22f34ebc5c24238ee5ce2693ae8596f33375dae19d5161f89b2fe4aa44.js`

## Props
- `walkAim`: emote → `asset://809db322bcf5ccb00933db8e3e54a5bcb5537f9c12fa94cf3d3e6085eb733b66.glb`

## Assets
- `[model]` 3563bcd41b6e15bfcb2ee46ffa5b0fa281587beb116e5ea32e876c80bfdaec36.glb (731,944 bytes)
- `[script]` 83b3cf22f34ebc5c24238ee5ce2693ae8596f33375dae19d5161f89b2fe4aa44.js (1,482 bytes)
- `[texture]` e8d7222b9ba922872c317fd2c9a2693f4ab4b986f8c5eae39c19925c230ee797.png (115,029 bytes)
- `[emote]` 809db322bcf5ccb00933db8e3e54a5bcb5537f9c12fa94cf3d3e6085eb733b66.glb (74,236 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.control()`, `app.create()`, `app.on()`, `app.send()`
**World Methods**: `world.getPlayer()`
**Events Listened**: `dropped`, `lateUpdate`, `taken`
**Nodes Created**: `action`

## Keywords (for Discord search)
action, active, console, control, controls, create, distance, dropped, getBoneTransform, getPlayer, holder, isClient, isServer, keyX, label, lateUpdate, localId, matrix, onRelease, onTrigger

## Script Source
```javascript
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
```

---
*Extracted from Networked_Grabbable.hyp. Attachment ID: 1349221803062464532*