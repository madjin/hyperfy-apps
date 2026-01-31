export default function main(world, app, fetch, props, setTimeout) {
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
}
