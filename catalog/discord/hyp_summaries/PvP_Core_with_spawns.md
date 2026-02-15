# PvP_Core_with_spawns.hyp

## Metadata
- **Author**: Saori
- **Channel**: #🎨│showcase
- **Date**: 2025-03-28
- **Size**: 90,224 bytes

## Blueprint
- **Name**: PvP Core (with spawns)
- **Version**: 28
- **Model**: `asset://2ed7215390bcb7c2d254ea3bb55e9f95838576f771f65b0a62e6c47a838e83b3.glb`
- **Script**: `asset://35d27a2c013e77fda2745061681901f0da637364ac0ac3695a35459b00e79d38.js`

## Props
- `death`: emote → `asset://87bd1f15d84ce5c0e6a95a9415bcc100e7aedab572ae51698a71d2d284a7226b.glb`
- `spawn`: int = `1`
- `spawns`: int = `3`

## Assets
- `[model]` 2ed7215390bcb7c2d254ea3bb55e9f95838576f771f65b0a62e6c47a838e83b3.glb (2,056 bytes)
- `[script]` 35d27a2c013e77fda2745061681901f0da637364ac0ac3695a35459b00e79d38.js (2,733 bytes)
- `[emote]` 87bd1f15d84ce5c0e6a95a9415bcc100e7aedab572ae51698a71d2d284a7226b.glb (84,416 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.create()`, `app.emit()`, `app.off()`, `app.on()`, `app.send()`
**World Methods**: `world.add()`, `world.getPlayer()`, `world.getPlayers()`, `world.on()`, `world.remove()`
**Events Listened**: `health`, `hyperfy:dmg`, `update`
**Nodes Created**: `ui`, `uitext`

## Keywords (for Discord search)
alignItems, amount, applyEffect, billboard, center, color, configure, console, copy, create, crit, d82424, data, death, deathEmote, delta, distance, distanceTo, duration, elapsed

## Script Source
```javascript
app.configure([
  {
    key: 'death',
    type: 'file',
    kind: 'emote',
    label: 'Death'
  },
  {
    key: 'spawns',
    type: 'number',
    initial: 1,
    min: 1,
    step: 1,
    label: 'spawns'
  }
])

const v1 = new Vector3()

let deathEmote = null
if (props.death?.url) {
  deathEmote = props.death.url + '?l=0' // loop=false
}

// =============
// DEATH WATCHER
// =============
if (world.isServer) {
  world.on('health', ({ playerId, health }) => {
    if (health === 0) {
      const spawn = Math.floor(Math.random() * props.spawns) + 1;
      console.log('spawning at', spawn)
      const player = world.getPlayer(playerId)
      player.applyEffect({
        emote: deathEmote,
        duration: 5,
        freeze: true,
        onEnd: () => {
          app.emit(`spawn:${spawn}`, playerId)
          player.heal()
        }
      })
    }
  })
}

// ==============
// HEAL OVER TIME
// ==============
if (world.isServer) {
  const HOT_INTERVAL = 2
  const HOT_AMOUNT = 10
  let elapsed = 0
  app.on('update', (delta) => {
    elapsed += delta
    if (elapsed < HOT_INTERVAL) return
    elapsed = 0
    const players = world.getPlayers()
    for (const player of players) {
      if (player.health < 100) {
        player.heal(HOT_AMOUNT)
      }
    }
  })
  world.on('hyperfy:dmg', (data) => {
    app.send('hyperfy:dmg', data)
  })
}

// ==============
// DAMAGE NUMBERS
// ==============
if (world.isClient) {
  const DMG_VISIBLE_DISTANCE = 20
  const localPlayer = world.getPlayer()
  app.on('hyperfy:dmg', ({ playerId, amount, crit }) => {
    showDamage(playerId, amount, crit)
  })
  function showDamage(playerId, amount, crit) {
    const player = world.getPlayer(playerId)
    if (!player) return
    const distance = localPlayer.position.distanceTo(player.position)
    if (distance > DMG_VISIBLE_DISTANCE) return
    const ui = app.create('ui', {
      width: crit ? 30 : 15,
      height: crit ? 30 : 15,
      billboard: 'full',
      alignItems: 'center',
      justifyContent: 'center'
    })
    const text = app.create('uitext', {
      value: amount,
      fontWeight: 800,
      fontSize: crit ? 16 : 8,
      color: crit ? '#d82424' : 'white'
    })
    ui.add(text)
    world.add(ui)
    ui.position.copy(player.position)
    ui.position.y += (player.height || 1.7) + 0.3
    const x = num(-0.5, 0.5, 1)
    const z = num(-0.5, 0.5, 1)
    const dir = new Vector3(x, 1, z)
    const time = 1
    const speed = 0.3
    let elapsed = 0
    function update(delta) {
      v1.copy(dir).multiplyScalar(speed * delta)
      ui.position.add(v1)
      elapsed += delta
      if (elapsed > time) {
        world.remove(ui)
        app.off('update', update)
      }
    }
    app.on('update', update)
  }
}
```

---
*Extracted from PvP_Core_with_spawns.hyp. Attachment ID: 1355236590091243800*