# Prism.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-03-30
- **Size**: 9,827,244 bytes

## Discord Context
> Just gonna leave these here for reference.
This is the Prism system.
Instead of item based action bars like the Elemental system, this one is class based characters that have an avatar, skills, energy, etc.
It's also PvPvE and there's work to do to make PvP a toggleable thing, eg for dueling.
Backpack will also be added, but those items will be more representational than the Elemental ones.

## Blueprint
- **Name**: Prism
- **Version**: 59
- **Model**: `asset://fda1d122bbbca0a9659448cc8b9aae01409df1173a2af6a7e776c937e5cac3d7.glb`
- **Script**: `asset://47303b5069fe5449b47c299078c38f19fd1ceb4ebf8e5fa69d3fb5c2b1419dfe.js`

## Props
- `avatar`: avatar → `asset://268b12ee20dda8564f18e929924f60c164270e122884466908b1ce44d61d92e8.vrm`
- `weapon`: model → `asset://4e41ee66fee24259ba05c372d7be408ca36da3004d2b21d01e21c70c7270f384.glb`
- `attack1`: emote → `asset://460b1d41e99c3ff70d4e01c36d77ac925c2577584658e94566c579e88a670757.glb`
- `attack2`: emote → `asset://a7b857124edf757f54efe9a6f3694e4d342d89823f0027bc7ad14bd72c38e630.glb`
- `attackEmote1`: emote → `asset://460b1d41e99c3ff70d4e01c36d77ac925c2577584658e94566c579e88a670757.glb`
- `attackEmote2`: emote → `asset://a7b857124edf757f54efe9a6f3694e4d342d89823f0027bc7ad14bd72c38e630.glb`
- `attackSound`: audio → `asset://3c04ffb1db694a8195bb92cc1926291e7479e4250d2028fbfa708a6e9dc85748.mp3`
- `chargeEmote`: emote → `asset://390877595102398e89c1ff6034323b949c0b4f8611afb8ed584aa49b575a5c76.glb`
- `chargeIcon`: texture → `asset://d3fb30b5d5b46867f99e4bda7535e6a22fa591854526b0631b1f7e31ed0021a6.png`
- `chargeCost`: int = `30`
- `specialEmote`: emote → `asset://93c66c42e8ac517e179ef72fb48538a21023c10895b35b53f3048dad76927a88.glb`
- `specialIcon`: texture → `asset://f327b3daf2fba37624faeb90d6c3f88b6e09ffe19245f40cc86b362cdea172fd.png`
- `specialCost`: int = `50`
- `attackIcon`: texture → `asset://4acd01d8bfc9542c24a6daa9180ff1accff487c40987b1524c08e4ab41bc339a.png`
- `attackCost`: int = `1`
- `enabled`: bool = `True`
- `deathDuration`: int = `5`
- `healInterval`: int = `2`
- `healAmount`: int = `10`
- `deathEmote`: emote → `asset://87bd1f15d84ce5c0e6a95a9415bcc100e7aedab572ae51698a71d2d284a7226b.glb`

## Assets
- `[model]` fda1d122bbbca0a9659448cc8b9aae01409df1173a2af6a7e776c937e5cac3d7.glb (64,400 bytes)
- `[script]` 47303b5069fe5449b47c299078c38f19fd1ceb4ebf8e5fa69d3fb5c2b1419dfe.js (6,665 bytes)
- `[avatar]` 268b12ee20dda8564f18e929924f60c164270e122884466908b1ce44d61d92e8.vrm (2,324,724 bytes)
- `[model]` 4e41ee66fee24259ba05c372d7be408ca36da3004d2b21d01e21c70c7270f384.glb (57,256 bytes)
- `[emote]` 460b1d41e99c3ff70d4e01c36d77ac925c2577584658e94566c579e88a670757.glb (73,884 bytes)
- `[emote]` a7b857124edf757f54efe9a6f3694e4d342d89823f0027bc7ad14bd72c38e630.glb (73,368 bytes)
- `[emote]` 460b1d41e99c3ff70d4e01c36d77ac925c2577584658e94566c579e88a670757.glb (73,884 bytes)
- `[emote]` a7b857124edf757f54efe9a6f3694e4d342d89823f0027bc7ad14bd72c38e630.glb (73,368 bytes)
- `[audio]` 3c04ffb1db694a8195bb92cc1926291e7479e4250d2028fbfa708a6e9dc85748.mp3 (49,087 bytes)
- `[emote]` 390877595102398e89c1ff6034323b949c0b4f8611afb8ed584aa49b575a5c76.glb (79,176 bytes)
- `[texture]` d3fb30b5d5b46867f99e4bda7535e6a22fa591854526b0631b1f7e31ed0021a6.png (2,658,191 bytes)
- `[emote]` 93c66c42e8ac517e179ef72fb48538a21023c10895b35b53f3048dad76927a88.glb (77,916 bytes)
- `[texture]` f327b3daf2fba37624faeb90d6c3f88b6e09ffe19245f40cc86b362cdea172fd.png (1,835,526 bytes)
- `[texture]` 4acd01d8bfc9542c24a6daa9180ff1accff487c40987b1524c08e4ab41bc339a.png (2,290,883 bytes)
- `[emote]` 87bd1f15d84ce5c0e6a95a9415bcc100e7aedab572ae51698a71d2d284a7226b.glb (84,416 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.emit()`, `app.off()`, `app.on()`, `app.send()`
**World Methods**: `world.add()`, `world.get()`, `world.getPlayer()`, `world.getPlayers()`, `world.on()`, `world.remove()`, `world.set()`
**Events Listened**: `add`, `clear`, `log`, `prism:dead_request`, `prism:mob_damaged`, `prism:player_hit`, `show_at_player`, `show_at_position`, `update`
**Events Emitted**: `prism:player_died`, `prism:player_respawned`
**Nodes Created**: `ui`, `uitext`

## Keywords (for Discord search)
above, addDefaultLocation, adding, alignItems, amount, applyEffect, applyQuaternion, apps, args, billboard, button, center, clear, clearing, client, clone, color, configure, console, copy

## Script Source
```javascript
app.configure([
  {
    key: 'enabled',
    type: 'toggle',
    label: 'Enabled',
    initial: true,
  },
  {
    key: 'deathEmote',
    type: 'file',
    kind: 'emote',
    label: 'Death Emote',
  },
  {
    key: 'deathDuration',
    type: 'number',
    label: 'Death Duration',
    initial: 5,
  },
  {
    key: 'healInterval',
    type: 'number',
    label: 'Heal Interval',
    initial: 2,
  },
  {
    key: 'healAmount',
    type: 'number',
    label: 'Heal Amount',
    initial: 10,
  },
  {
    key: 'add',
    type: 'button',
    label: 'Add Location',
    onClick: () => app.send('add'),
  },
  {
    key: 'clear',
    type: 'button',
    label: 'Clear Locations',
    onClick: () => app.send('clear'),
  },
])

const LOCATIONS_KEY = 'prism:respawn_locations'

const v1 = new Vector3()
const v2 = new Vector3()
const q1 = new Quaternion()
const q2 = new Quaternion()

const enabled = props.enabled
const deathEmote = props.deathEmote ? props.deathEmote.url + '?l=0' : null
const deathDuration = props.deathDuration
const healInterval = props.healInterval
const healAmount = props.healAmount

if (!enabled) return

/**
 * Server Logic
 */

if (world.isServer) {
  const dead = new Set() 
  let locations = world.get(LOCATIONS_KEY) || []
  if (!locations.length) addDefaultLocation()
  function addDefaultLocation() {
    // 1m in front of box
    const origin = app.position.clone()
    const dir = new Vector3(0, 0, 1).applyQuaternion(app.quaternion)
    const projected = dir.clone().multiplyScalar(1)
    const position = origin.clone().add(projected)
    locations.push({
      position: position.toArray(),
      quaternion: [0, 0, 0, 1],
      isDefault: true,
    })
  }
  function removeDefaultLocation() {
    locations = locations.filter(loc => !loc.isDefault)
  }
  function saveLocations() {
    world.set(LOCATIONS_KEY, locations)
  }
  function getLocation() {
    const location = locations[num(0, locations.length - 1)]
    return {
      position: v1.fromArray(location.position),
      quaternion: q1.fromArray(location.quaternion),
    }
  }
  // listen for apps dealing damage to players
  // for players we handle the emote, death and respawn here
  world.on('prism:player_hit', ([playerId, amount, crit]) => {
    const player = world.getPlayer(playerId)
    if (!player) return
    if (!player.health) return
    if (player.health < amount) amount = player.health
    player.damage(amount)
    app.send('show_at_player', [playerId, amount, crit])
    if (!player.health) {
      const key = `player:${playerId}`
      dead.add(key)
      app.emit('prism:player_died', playerId)
      player.applyEffect({
        emote: deathEmote,
        duration: deathDuration,
        freeze: true,
        onEnd: () => {
          const location = getLocation()
          player.teleport(location.position, location.quaternion)
          player.heal()
          dead.delete(key)
          app.emit('prism:player_respawned', playerId)
        },
      })
    }
  })
  // listen for mobs that want to display damage
  // for mobs they handle their own emote, death and respawn
  world.on('prism:mob_damaged', ([position, amount, crit]) => {
    app.send('show_at_position', [position, amount, crit])
  })
  // heal players over time
  let elapsed = 0
  app.on('update', delta => {
    elapsed += delta
    if (elapsed < healInterval) return
    elapsed = 0
    const players = world.getPlayers()
    for (const player of players) {
      if (player.health > 0 && player.health < 100) {
        player.heal(healAmount)
      }
    }
  })
  // listen for dead queries
  world.on('prism:dead_request', ([type, id, responseId]) => {
    const key = `${type}:${id}`
    const isDead = dead.has(key) || false
    app.emit(`prism:dead_response:${responseId}`, isDead)
  })
  // listen for client adding a respawn location
  app.on('add', (_, playerId) => {
    const player = world.getPlayer(playerId)
    if (!player) return
    if (!player.isAdmin) return
    const location = {
      position: player.position.toArray(),
      quaternion: player.quaternion.toArray()
    }
    locations.push(location)
    removeDefaultLocation()
    saveLocations()
  })
  // listen for client clearing respawn locations
  app.on('clear', (_, playerId) => {
    const player = world.getPlayer(playerId)
    if (!player) return
    if (!player.isAdmin) return
    locations.length = 0
    addDefaultLocation()
    world.set(LOCATIONS_KEY, null)
  })
}

/**
 * Client Logic
 */

if (world.isClient) {
  const localPlayerId = world.getPlayer().id
  // listen to players taking damage and display numbers above their head
  app.on('show_at_player', ([playerId, amount, crit]) => {
    if (playerId === localPlayerId) return
    const player = world.getPlayer(playerId)
    const position = v1.copy(player.position)
    position.y += (player.height || 1.7) + 0.3
    show(position, amount, crit)
  })
  app.on('show_at_position', ([position, amount, crit]) => {
    position = v1.fromArray(position)
    show(position, amount, crit)
  })
  function show(position, amount, crit) {
    const $ui = app.create('ui', {
      width: crit ? 30 : 15,
      height: crit ? 30 : 15,
      billboard: 'full',
      alignItems: 'center',
      justifyContent: 'center',
    })
    const $text = app.create('uitext', {
      value: amount,
      fontWeight: 800,
      fontSize: crit ? 16 : 8,
      color: crit ? '#d82424' : 'white',
    })
    $ui.add($text)
    world.add($ui)
    $ui.position.copy(position)
    const x = num(-0.5, 0.5, 1)
    const z = num(-0.5, 0.5, 1)
    const dir = new Vector3(x, 1, z)
    const time = 1
    const speed = 0.3
    let elapsed = 0
    function update(delta) {
      v1.copy(dir).multiplyScalar(speed * delta)
      $ui.position.add(v1)
      elapsed += delta
      if (elapsed > time) {
        world.remove($ui)
        app.off('update', update)
      }
    }
    app.on('update', update)
  }
}

// =======================================
// Box & Label
const LABEL = 'Prism'
const $ui = app.create('ui', {
  height: 50,
  alignItems: 'center',
  justifyContent: 'center',
})
$ui.position.y = 1.3
const $text = app.create('uitext', {
  value: LABEL || 'No Label',
  textAlign: 'center',
  color: 'white'
})
$ui.add($text)
app.add($ui)
// =======================================
// Logger
const LOG_LABEL = 'dmg'
const LOG_ENABLED = false
function log(...args) {
  if (!LOG_ENABLED) return
  if (world.isServer) {
    app.send('log', args)
  } else {
    console.log(`[${LOG_LABEL}]`, ...args)
  }
}
if (world.isClient) {
  app.on('log', args => {
    console.log(`$[${LOG_LABEL}]`, ...args)
  })
}
// =======================================
```

---
*Extracted from Prism.hyp. Attachment ID: 1355903732411269261*