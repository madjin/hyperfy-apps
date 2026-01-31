export default function main(world, app, fetch, props, setTimeout) {
app.configure([
  {
    key: 'avatar',
    type: 'file',
    kind: 'avatar',
    label: 'Avatar',
  },
  {
    key: 'attackIcon',
    type: 'file',
    kind: 'texture',
    label: 'Attack Icon',
  },
  {
    key: 'attackEnergy',
    type: 'number',
    label: 'Attack Energy',
  },
  {
    key: 'attackDamage',
    type: 'text',
    label: 'Attack Damage',
  },
  {
    key: 'attackEmote1',
    type: 'file',
    kind: 'emote',
    label: 'Attack Emote 1',
  },
  {
    key: 'attackEmote2',
    type: 'file',
    kind: 'emote',
    label: 'Attack Emote 2',
  },
  {
    key: 'attackSound',
    type: 'file',
    kind: 'audio',
    label: 'Attack Sound',
  },
  {
    key: 'chargeIcon',
    type: 'file',
    kind: 'texture',
    label: 'Charge Icon',
  },
  {
    key: 'chargeEmote',
    type: 'file',
    kind: 'emote',
    label: 'Charge Emote',
  },
  {
    key: 'chargeSound',
    type: 'file',
    kind: 'audio',
    label: 'Charge Sound',
  },
  {
    key: 'chargeEnergy',
    type: 'number',
    label: 'Charge Energy',
  },
  {
    key: 'specialIcon',
    type: 'file',
    kind: 'texture',
    label: 'Special Icon',
  },
  {
    key: 'specialEmote',
    type: 'file',
    kind: 'emote',
    label: 'Special Emote',
  },
  {
    key: 'specialSound',
    type: 'file',
    kind: 'audio',
    label: 'Special Sound',
  },
  {
    key: 'specialEnergy',
    type: 'number',
    label: 'Special Energy',
  },
  {
    key: 'specialDamage',
    type: 'text',
    label: 'Special Damage',
  },

])

const CLASS_NAME = 'Vanguard'
const DEBUG_PLAYER = null // 'NXaaL9PrK5'
const DEBUG_HITS = false
const FORWARD = new Vector3(0, 0, -1)

const ENERGY_RATE = 1
const ENERGY_RATE_AMOUNT = 10
const ENERGY_MAX = 100 

const ATTACK_RADIUS = 1
const ATTACK_DISTANCE = 1

const SPECIAL_RADIUS = 2.5

const attackIcon = props.attackIcon?.url
const attackEnergy = props.attackEnergy
const [
  attackDamageMin, 
  attackDamageMax, 
  attackCritChance, 
  attackCritMultiplier
] = parseDamageProp(props.attackDamage)
const attacks = []
if (props.attackEmote1) attacks.push(props.attackEmote1.url)
if (props.attackEmote2) attacks.push(props.attackEmote2.url)
const getAttack = () => {
  const i = num(0, attacks.length - 1)
  return attacks[i]
}

const chargeEmote = props.chargeEmote?.url + '?l=0'
const chargeIcon = props.chargeIcon?.url
const chargeEnergy = props.chargeEnergy
const chargeSound = props.chargeSound?.url

const specialEmote = props.specialEmote?.url + '?l=0&s=2'
const specialIcon = props.specialIcon?.url
const specialEnergy = props.specialEnergy
const specialSound = props.specialSound?.url
const [
  specialDamageMin, 
  specialDamageMax, 
  specialCritChance, 
  specialCritMultiplier
] = parseDamageProp(props.specialDamage)

const v1 = new Vector3()
const v2 = new Vector3()
const v3 = new Vector3()
const q1 = new Quaternion()
const q2 = new Quaternion()
const q3 = new Quaternion()
const e1 = new Euler(0, 0, 0, 'YXZ')
const e2 = new Euler(0, 0, 0, 'YXZ')
const e3 = new Euler(0, 0, 0, 'YXZ')

const playerLayerMask = world.createLayerMask('player')

const _sword = app.get('Sword')
app.remove(_sword)

const hitSphere = app.get('Sphere')

const box = app.get('Box')
box.onPointerEnter = () => box.scale.setScalar(1.05)
box.onPointerLeave = () => box.scale.setScalar(1)
box.onPointerDown = () => app.send('equip')

const _attackSound = app.create('audio', {
  src: props.attackSound?.url,
  group: 'sfx',
  volume: 0.5,
})

const _specialSound = app.create('audio', {
  src: props.specialSound?.url,
  group: 'sfx',
  volume: 0.5,
})

const _chargeSound = app.create('audio', {
  src: props.chargeSound?.url,
  group: 'sfx',
  volume: 0.5,
})

function createActor({ playerId, energy }, hook) {
  const player = world.getPlayer(playerId)
  // client
  let weapon 
  let sword
  let attackSound
  let specialSound
  let chargeSound
  let control
  let ui 
  // server
  let lastEnergy = 0
  return {
    get energy() {
      return energy
    },
    client: {
      init() {
        weapon = app.create('group')
        sword = _sword.clone(true)
        sword.position.set(0.1, -0.01, 0)
        sword.rotation.set(-80 * DEG2RAD, 0 * DEG2RAD, 0 * DEG2RAD)
        weapon.add(sword)
        attackSound = _attackSound.clone()
        weapon.add(attackSound)
        specialSound = _specialSound.clone()
        weapon.add(specialSound)
        chargeSound = _chargeSound.clone()
        weapon.add(chargeSound)
        world.add(weapon)
        if (player.local) {
          control = app.control()
          ui = createUI()
        }
      },
      update(delta) {
        const matrix = player.getBoneTransform('rightHand')
        if (matrix) {
          weapon.position.setFromMatrixPosition(matrix)
          weapon.quaternion.setFromRotationMatrix(matrix)
        }
        if (player.local) {
          // health bar
          ui.health = player.health
          ui.energy = energy
          // disabled btns
          ui.setBtnDisabled(0, energy < attackEnergy)
          ui.setBtnDisabled(1, energy < specialEnergy)
          ui.setBtnDisabled(2, energy < chargeEnergy)
          // actions
          if (control.pointer.locked) {
            // attack
            if (control.mouseLeft.pressed) {
              this.attack()
            }
            if (control.mouseLeft.released) {
              ui.setBtnActive(0, false)
            }
            // special
            if (control.mouseRight.pressed) {
              this.special()
            }
            if (control.mouseRight.released) {
              ui.setBtnActive(1, false)
            }
            // charge
            if (control.keyF.pressed) {
              this.charge()
            }
            if (control.keyF.released) {
              ui.setBtnActive(2, false)
            }
          }
        }
      },
      attack() {
        if (player.hasEffect()) return
        energy -= attackEnergy
        ui.setBtnActive(0, true)
        player.applyEffect({
          snare: 0.9,
          duration: 0.4,
          emote: getAttack(),
          turn: true
        })
        const dir = this.getDirection(v1)
        const projection = v2.copy(dir).multiplyScalar(ATTACK_DISTANCE)
        const pos = v3.copy(player.position).add(projection)
        pos.y += 1
        if (DEBUG_HITS) {
          world.add(hitSphere)
          hitSphere.position.copy(pos)
          hitSphere.scale.setScalar(ATTACK_RADIUS)
          hitSphere.active = true
        }
        hook.server('attack', pos.toArray())
      },
      special() {
        if (player.hasEffect()) return
        if (energy < specialEnergy) return
        energy -= specialEnergy
        ui.setBtnActive(1, true)
        player.applyEffect({
          snare: 0.8,
          emote: specialEmote,
          turn: true,
          duration: 0.6,
        })
        const pos = player.position.clone()
        pos.y += 1
        if (DEBUG_HITS) {
          world.add(hitSphere)
          hitSphere.position.copy(pos)
          hitSphere.scale.setScalar(SPECIAL_RADIUS)
          hitSphere.active = true
        }
        hook.server('special', pos.toArray())
      },
      charge() {
        if (player.hasEffect()) return
        if (energy < chargeEnergy) return
        energy -= chargeEnergy
        ui.setBtnActive(2, true)
        const dir = this.getDirection(v1)
        const force = dir.multiplyScalar(30)
        player.push(force)
        player.applyEffect({
          emote: chargeEmote,
          turn: true,
          duration: 0.4,
        })
        // app.send('charge')
        hook.server('charge')
      },
      addEnergy(amount) {
        energy = Math.min(energy + amount, ENERGY_MAX)
      },
      playAttackSound() {
        attackSound.play(true)
      },
      playSpecialSound() {
        specialSound.play(true)
      },
      playChargeSound() {
        chargeSound.play(true)
      },
      getDirection(vec3) {
        e1.setFromQuaternion(control.camera.quaternion)
        e1.x = 0
        e1.z = 0
        q1.setFromEuler(e1)
        const dir = vec3.copy(FORWARD).applyQuaternion(q1)
        return dir
      },
      destroy() {
        control?.release()
        ui?.destroy()
        world.remove(weapon)
      }
    },
    server: {
      init() {
        player.setSessionAvatar(props.avatar?.url)
      },
      update(delta) {
        lastEnergy += delta
        if (lastEnergy >= ENERGY_RATE) {
          lastEnergy = 0
          if (energy < ENERGY_MAX) {
            energy = Math.min(energy + ENERGY_RATE_AMOUNT, ENERGY_MAX)
            hook.client('addEnergy', ENERGY_RATE_AMOUNT)
          }
        }
      },
      attack(pos) {
        hook.broadcast('playAttackSound')
        if (energy < attackEnergy) return console.warn('player attacked without energy')
        energy -= attackEnergy
        const origin = v1.fromArray(pos)
        const hits = world.overlapSphere(ATTACK_RADIUS, origin/*, playerLayerMask*/)
        for (const hit of hits) {
          let type
          let id
          if (hit.playerId && hit.playerId !== player.id) {
            type = 'player'
            id = hit.playerId
          } else if (hit.tag?.startsWith('mob:')) {
            type = 'mob'
            id = hit.tag.split(':')[1]
          }
          if (type) {
            let amount = num(attackDamageMin, attackDamageMax)
            const crit = num(0, 1, 1) < attackCritChance / 100
            if (crit) amount *= attackCritMultiplier
            hook.damage(type, id, amount, crit)
          }
        }
      },
      special(pos) {
        hook.broadcast('playSpecialSound')
        if (energy < specialEnergy) return console.warn('player speciald without energy')
        energy -= specialEnergy
        const origin = v1.fromArray(pos)
        const hits = world.overlapSphere(SPECIAL_RADIUS, origin/*, playerLayerMask*/)
        for (const hit of hits) {
          let type
          let id
          if (hit.playerId && hit.playerId !== player.id) {
            type = 'player'
            id = hit.playerId
          } else if (hit.tag?.startsWith('mob:')) {
            type = 'mob'
            id = hit.tag.split(':')[1]
          }
          if (type) {
            let amount = num(specialDamageMin, specialDamageMax)
            const crit = num(0, 1, 1) < specialCritChance / 100
            if (crit) amount *= specialCritMultiplier
            hook.damage(type, id, amount, crit)
          }
        }
      },
      charge() {
        hook.broadcast('playChargeSound')
        if (energy < chargeEnergy) return console.warn('player charged without energy')
        energy -= chargeEnergy
      },
      destroy() {
        // ...
      }
    }
  }
}

if (world.isServer) {
  const state = app.state
  const actors = new Map() // playerId -> Actor
  state.actors = new Map() // playerId -> Info { playerId, energy }
  state.ready = true
  function addActor(playerId) {
    if (actors.has(playerId)) return
    app.emit('equipping', [playerId, CLASS_NAME])
    const info = { playerId, energy: ENERGY_MAX }
    state.actors.set(playerId, info)
    const actor = createActor(info, {
      client(fn, data) {
        app.sendTo(playerId, 'call', [fn, data])
      },
      broadcast(fn, data) {
        app.send('broadcast', [playerId, fn, data])
      },
      damage(type, id, amount, crit) {
        if (type === 'player') {
          app.emit('prism:player_hit', [id, amount, crit])
        }
        if (type === 'mob') {
          app.emit(`prism:mob_hit:${id}`, [playerId, amount, crit])
        }
      }
    })
    actors.set(playerId, actor)
    actor.server.init()
    app.send('addActor', info)
  }
  function removeActor(playerId) {
    const actor = actors.get(playerId)
    if (!actor) return
    actor.server.destroy()
    actors.delete(playerId)
    state.actors.delete(playerId)
    app.send('removeActor', playerId)
  }
  if (DEBUG_PLAYER && world.getPlayer(DEBUG_PLAYER)) {
    addActor(DEBUG_PLAYER)
  }
  app.on('update', delta => {
    actors.forEach(actor => {
      actor.server.update(delta)
    })
  })
  world.on('enter', e => {
    if (e.playerId === DEBUG_PLAYER) {
      addActor(e.playerId)
    }
  })
  app.on('call', ([playerId, fn, data], _playerId) => {
    if (playerId !== _playerId) return console.error('vanguard received call from wrong player')
    actors.get(playerId)?.server[fn]?.(data)
  })
  app.on('equip', (_, playerId) => {
    addActor(playerId)
  })
  app.on('charge', (dir, playerId) => {
    const info = state.actors.get(playerId)
    if (!info) return
    const energy = Math.max(info.energy - chargeEnergy, 0)
    info.energy = energy
  })
  world.on('leave', e => {
    removeActor(e.playerId)
  })
  app.send('init', state)
}

if (world.isClient) {
  if (app.state.ready) {
    init(app.state)
  } else {
    app.on('init', init)
  }
  function init(state) {
    const localPlayerId = world.getPlayer().id
    const actors = new Map()
    function addActor(info) {
      const actor = createActor(info, {
        server(fn, data) {
          app.send('call', [info.playerId, fn, data])
        },
      })
      actors.set(info.playerId, actor)
      actor.client.init()
    }
    function removeActor(playerId) {
      const actor = actors.get(playerId)
      actor?.client.destroy()
      actors.delete(playerId)
    }
    state.actors.forEach(info => {
      addActor(info)
    })
    app.on('addActor', info => {
      addActor(info)
    })
    app.on('removeActor', playerId => {
      removeActor(playerId)
    })
    app.on('update', delta => {
      actors.forEach(actor => {
        actor.client.update(delta)
      })
    })
    app.on('call', ([fn, data]) => {
      actors.get(localPlayerId)?.client[fn]?.(data)
    })
    app.on('broadcast', ([playerId, fn, data]) => {
      actors.get(playerId)?.client[fn]?.(data)
    })
    app.on('addEnergy', amount => {
      const actor = actors.get(localPlayerId)
      actor?.client.addEnergy(amount)
    })
  }
}

function createUI() {
  const width = 190
  const $ui = app.create('ui', {
    width,
    height: 107,
    space: 'screen',
    position: [0.5, 1, 0],
    offset: [0, -40, 0],
    pivot: 'bottom-center',
    // backgroundColor: 'red',
  })
  const $health = app.create('uiview',{
    height: 15,
    padding: 2,
    backgroundColor: 'rgba(15, 16, 24, 0.8)',
    flexDirection: 'row',
    alignItems: 'stretch',
  })
  $ui.add($health)
  const $healthBar = app.create('uiview', {
    width: width * 0.8,
    backgroundColor: 'green'
  })
  $health.add($healthBar)
  const $energy = app.create('uiview',{
    margin: [4, 0, 0, 0],
    height: 20,
    padding: 2,
    backgroundColor: 'rgba(15, 16, 24, 0.8)',
    flexDirection: 'row',
    alignItems: 'stretch',
  })
  $ui.add($energy)
  const $energyBar = app.create('uiview', {
    width: width * 0.3,
    backgroundColor: 'orange'
  })
  $energy.add($energyBar)
  const $btns = app.create('uiview', {
    flexDirection: 'row',
    gap: 4,
  })
  $ui.add($btns)
  const btns = []
  function addBtn(icon, label) {
    const $btn = app.create('uiview', {
      margin: [8, 0, 0, 0],
      width: 60,
      height: 60,
      padding: 2,
      backgroundColor: 'rgba(15, 16, 24, 0.8)'
    })
    $btns.add($btn)
    const $icon = app.create('uiimage', {
      flex: 1,
      src: icon,
      objectFit: 'cover',
    })
    $btn.add($icon)
    const $label = app.create('uitext', {
      absolute: true,
      top: 5,
      right: 5,
      textAlign: 'right',
      fontSize: 10,
      fontWeight: 500,
      value: label,
      color: 'rgba(255, 255, 255, 0.7)',
    })
    $btn.add($label)
    const $shade = app.create('uiview', {
      display: 'none',
      absolute: true,
      top: 2,
      left: 2,
      right: 2,
      bottom: 2,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
    })
    $btn.add($shade)
    const $highlight = app.create('uiview', {
      display: 'none',
      absolute: true,
      top: 2,
      left: 2,
      right: 2,
      bottom: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    })
    $btn.add($highlight)
    btns.push({ $btn, $icon, $shade, $highlight })
  }
  addBtn(attackIcon, 'LMB')
  addBtn(specialIcon, 'RMB')
  addBtn(chargeIcon, 'F')
  world.add($ui)
  return {
    set health(value) {
      $healthBar.width = width * (value / 100)
    },
    set energy(value) {
      $energyBar.width = width * (value / ENERGY_MAX)
    },
    setBtnDisabled(idx, isDisabled) {
      btns[idx].$shade.display = isDisabled ? 'flex' : 'none'
    },
    setBtnActive(idx, isActive) {
      btns[idx].$highlight.display = isActive ? 'flex' : 'none'
    },
    destroy() {
      world.remove($ui)
    }
  }
}


// =======================================
// Damage parser (min,max,crit_chance,crit_multiplier)
function parseDamageProp(str) {
  try {
    return str.split(',').map(parseFloat)
  } catch (err) {
    return [0,0,0,0]
  }
}
// =======================================
// Box & Label
const LABEL = CLASS_NAME
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

// =======================================
// Logger
const LOG_LABEL = 'vanguard'
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
