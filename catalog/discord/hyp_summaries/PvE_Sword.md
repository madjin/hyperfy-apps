# PvE_Sword.hyp

## Metadata
- **Author**: peezy
- **Channel**: #💻│developers
- **Date**: 2025-03-25
- **Size**: 270,775 bytes

## Blueprint
- **Name**: PvE Sword
- **Version**: 3
- **Model**: `asset://a0af4178b1bd37e755dd99b5137c5ccfb3c6a203d3ed71d3e775eb97a3b6e2d5.glb`
- **Script**: `asset://790b5b9820eea8f432502f30017d3321669f7b431245aab1ac1ac4b168d93e8b.js`

## Props
- `attack`: emote → `asset://9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb`
- `attack1`: emote → `asset://460b1d41e99c3ff70d4e01c36d77ac925c2577584658e94566c579e88a670757.glb`
- `attack2`: emote → `asset://a7b857124edf757f54efe9a6f3694e4d342d89823f0027bc7ad14bd72c38e630.glb`
- `debug`: bool = `True`

## Assets
- `[model]` a0af4178b1bd37e755dd99b5137c5ccfb3c6a203d3ed71d3e775eb97a3b6e2d5.glb (54,948 bytes)
- `[script]` 790b5b9820eea8f432502f30017d3321669f7b431245aab1ac1ac4b168d93e8b.js (6,101 bytes)
- `[emote]` 9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb (60,912 bytes)
- `[emote]` 460b1d41e99c3ff70d4e01c36d77ac925c2577584658e94566c579e88a670757.glb (73,884 bytes)
- `[emote]` a7b857124edf757f54efe9a6f3694e4d342d89823f0027bc7ad14bd72c38e630.glb (73,368 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.control()`, `app.create()`, `app.get()`, `app.on()`, `app.send()`
**World Methods**: `world.add()`, `world.createLayerMask()`, `world.emit()`, `world.getPlayer()`, `world.on()`, `world.overlapSphere()`, `world.remove()`
**Events Listened**: `addHolder`, `attack`, `dmg`, `drop`, `lateUpdate`, `leave`, `removeHolder`, `state`, `take`
**Events Emitted**: `hyperfy:dmg`
**Nodes Created**: `action`

## Keywords (for Discord search)
action, active, addHolder, amount, applyEffect, applyQuaternion, arr1, attack, attack1, attack2, attacks, camera, clone, configure, console, control, copy, create, createLayerMask, crit

## Script Source
```javascript
app.configure([
  {
    key: 'attack1',
    type: 'file',
    kind: 'emote',
    label: 'Attack 1'
  },
  {
    key: 'attack2',
    type: 'file',
    kind: 'emote',
    label: 'Attack 2'
  },
  {
    key: 'debug',
    label: 'Debug',
    type: 'switch',
    options: [
      { label: 'No', value: false },
      { label: 'Yes', value: true },
    ],
    initial: false
  },
])

const forward = new Vector3(0, 0, -1)
const v1 = new Vector3()
const v2 = new Vector3()
const q1 = new Quaternion()
const q2 = new Quaternion()
const e1 = new Euler(0, 0, 0, 'YXZ')
const e2 = new Euler(0, 0, 0, 'YXZ')
const arr1 = []

const MIN_DMG = 20
const MAX_DMG = 30
const CRIT_CHANCE = 0.3
const CRIT_MULTIPLIER = 2
const HIT_RADIUS = 0.5
const HIT_DISTANCE = 1

const initialSword = app.get('Sword')
initialSword.type = 'kinematic'
const initialCollider = app.get('Sword_Collider')
initialCollider.trigger = true
// initialSword.onTriggerEnter = e => {
//   // console.log('HIT', e.playerId)
// }
initialCollider.layer = 'tool'


const sphere = app.get('Sphere')
sphere.parent.remove(sphere)
sphere.scale.setScalar(HIT_RADIUS)

const src = initialSword.clone(true)

const debug = props.debug

if (world.isServer) {
  const overlapLayerMask = world.createLayerMask('environment')
  const holders = new Map()
  const state = app.state
  state.holders = new Set()
  state.ready = true
  app.send('state', state)
  app.on('take', playerId => {
    if (state.holders.has(playerId)) return
    const player = world.getPlayer(playerId)
    if (!player) return
    state.holders.add(playerId)
    app.send('addHolder', playerId)
    const sword = src.clone(true)
    world.add(sword)
    holders.set(playerId, { player, sword })
  })
  app.on('attack', data => {
    const { playerId, pos } = data
    const origin = v1.fromArray(pos)
    const radius = HIT_RADIUS
    const hits = world.overlapSphere(radius, origin, overlapLayerMask)
    for (const hit of hits) {
      if (hit.playerId && hit.playerId !== playerId) {
        const player = world.getPlayer(hit.playerId)
        if (!player) continue
        if (!player.health) continue
        let amount = num(MIN_DMG, MAX_DMG)
        let crit = false
        if (player.health > amount) {
          crit = num(0, 1, 1) < CRIT_CHANCE
          if (crit) amount *= CRIT_MULTIPLIER
        }
        if (amount > player.health) amount = player.health
        player.damage(amount)
        app.send('dmg', { playerId: hit.playerId, amount, crit })
      }
    }
  })
  app.on('drop', playerId => {
    if (!state.holders.has(playerId)) return
    state.holders.delete(playerId)
    app.send('removeHolder', playerId)
    const holder = holders.get(playerId)
    world.remove(holder.sword)
    holders.delete(playerId)
  })
  app.on('lateUpdate', () => {
    holders.forEach(holder => {
      const matrix = holder.player.getBoneTransform('rightArm')
      if (matrix) {
        holder.sword.position.setFromMatrixPosition(matrix)
        holder.sword.quaternion.setFromRotationMatrix(matrix)
      }
    })
  })
  world.on('leave', e => {
    if (!state.holders.has(e.playerId)) return
    state.holders.delete(e.playerId)
    const holder = holders.get(e.playerId)
    world.remove(holder.sword)
    holders.delete(e.playerId)
    app.send('removeHolder', e.playerId)
  })
}

if (world.isClient) {
  const attacks = []
  if (props.attack1) attacks.push(props.attack1.url)
  if (props.attack2) attacks.push(props.attack2.url)
  const getAttack = () => {
    const i = num(0, attacks.length-1)
    return attacks[i]
  }
  const localPlayer = world.getPlayer()
  const action = app.create('action', {
    label: 'Take',
    onTrigger: e => {
      action.active = false
      app.send('take', localPlayer.id)
    }
  })
  initialSword.add(action)
  let state = app.state
  if (state.ready) {
    init(state)
  } else {
    app.on('state', init)
  }
  function init(_state) {
    state = _state
    const holders = new Map()
    let control
    for (const playerId of state.holders) {
      const player = world.getPlayer(playerId)
      const sword = src.clone(true)
      world.add(sword)
      holders.set(playerId, { player, sword })
    }
    app.on('addHolder', playerId => {
      state.holders.add(playerId)
      const player = world.getPlayer(playerId)
      const sword = src.clone(true)
      world.add(sword)
      holders.set(playerId, { player, sword })
      if (playerId === localPlayer.id) {
        control?.release()
        control = app.control()
      }
    })
    app.on('removeHolder', playerId => {
      state.holders.delete(playerId)
      const holder = holders.get(playerId)
      world.remove(holder.sword)
      holders.delete(playerId)
      if (playerId === localPlayer.id) {
        control?.release()
        control = null
        action.active = true
      }
    })
    app.on('lateUpdate', () => {
      holders.forEach(holder => {
        const matrix = holder.player.getBoneTransform('rightIndexProximal')
        if (matrix) {
          holder.sword.position.setFromMatrixPosition(matrix)
          holder.sword.quaternion.setFromRotationMatrix(matrix)
        }
      })
      if (control?.keyQ.pressed) {
        app.send('drop', localPlayer.id)
      }
      if (control?.mouseLeft.pressed && control?.pointer.locked && !localPlayer.hasEffect()) {
        localPlayer.applyEffect({
          snare: 0.9,
          duration: 0.4,
          emote: getAttack(),
          turn: true
        })
        e1.setFromQuaternion(control.camera.quaternion)
        e1.x = 0
        e1.z = 0
        q1.setFromEuler(e1)
        const projection = v1.copy(forward).applyQuaternion(q1)
        projection.multiplyScalar(HIT_DISTANCE)
        const pos = v2.copy(localPlayer.position).add(projection)
        pos.y += 1
        pos.toArray(arr1)


        if (debug) {
          sphere.position.copy(pos)
          world.add(sphere)
        }        

        app.send('attack', {
          playerId: localPlayer.id,
          pos: arr1
        })
      }
    })
    app.on('dmg', data => {
      world.emit('hyperfy:dmg', data)
    })
  }
}
```

---
*Extracted from PvE_Sword.hyp. Attachment ID: 1354082560329650176*