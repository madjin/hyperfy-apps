# spawn.hyp

## Metadata
- **Author**: Saori
- **Channel**: #🎨│showcase
- **Date**: 2025-03-28
- **Size**: 4,361 bytes

## Blueprint
- **Name**: spawn
- **Version**: 0
- **Model**: `asset://0bafb08027f376408fa291714feeebccc753602fcd2e5bcee4296c01b8448fee.glb`
- **Script**: `asset://802e255484efa63f29a9bca120040d5321819c504ef262e4eb6849cf2b3cde30.js`

## Props
- `id`: int = `1`

## Assets
- `[model]` 0bafb08027f376408fa291714feeebccc753602fcd2e5bcee4296c01b8448fee.glb (3,340 bytes)
- `[script]` 802e255484efa63f29a9bca120040d5321819c504ef262e4eb6849cf2b3cde30.js (359 bytes)

## Script Analysis
**App Methods**: `app.configure()`
**World Methods**: `world.getPlayer()`, `world.on()`

## Keywords (for Discord search)
configure, console, getPlayer, initial, isServer, label, number, player, playerId, position, propConfig, props, spawn, step, teleport, type, world

## Script Source
```javascript
const propConfig = [{
  key: 'id',
  type: 'number',
  label: 'Spawn ID',
  min: 1,
  step: 1,
  initial: 1
}]

app.configure(propConfig);

console.log('id', props.id)

if (world.isServer) {
  world.on(`spawn:${props.id}`, (playerId) => {
    console.log('spawn', props.id)
    const player = world.getPlayer(playerId)
    player.teleport(app.position)
  })
}
```

---
*Extracted from spawn.hyp. Attachment ID: 1355236589298647160*