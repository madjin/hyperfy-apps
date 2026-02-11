# Mob_-_Skelly.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-03-30
- **Size**: 8,718,396 bytes

## Discord Context
> Just gonna leave these here for reference.
This is the Prism system.
Instead of item based action bars like the Elemental system, this one is class based characters that have an avatar, skills, energy, etc.
It's also PvPvE and there's work to do to make PvP a toggleable thing, eg for dueling.
Backpack will also be added, but those items will be more representational than the Elemental ones.

## Blueprint
- **Name**: Mob - Skelly
- **Version**: 534
- **Model**: `asset://5ee65030d904366bdf3b3b269d4e4e989c9cdc5ba5e46a69d6498aa4caa9ec2d.vrm`
- **Script**: `asset://6539dbfcaeac6d7b1139ee986632ff650381d9c2a6b8675d439a68172c80d88e.js`

## Props
- `avatar`: avatar → `asset://5ee65030d904366bdf3b3b269d4e4e989c9cdc5ba5e46a69d6498aa4caa9ec2d.vrm`
- `weapon`: model → `asset://b57eb8a61a9e4314fd80e3b2ffea5157693dd2be6bc6fc7e70c7501e7b166516.glb`
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
- `idleEmote`: emote → `asset://c56b4f79ae304b31ee0f81ebd66b8f5a906ff508d739bf9deeafe7b68484efbe.glb`
- `walkEmote`: emote → `asset://3e5fc4f1109d342f59583561e21f843235801174052ec403fc32e47683941123.glb`
- `attackEmote`: emote → `asset://460b1d41e99c3ff70d4e01c36d77ac925c2577584658e94566c579e88a670757.glb`
- `assets`: model → `asset://722faa592f8674fee087a136b0725d2ff3c1b9a361bdcbcb011f0235e3ee12f2.glb`
- `aggroRadius`: int = `10`
- `aggroDebug`: bool = `False`
- `runEmote`: emote → `asset://3e5fc4f1109d342f59583561e21f843235801174052ec403fc32e47683941123.glb`
- `aggroDistance`: int = `10`
- `fleeDistance`: int = `11`
- `leashDistance`: int = `11`
- `healRate`: int = `1`
- `regenRate`: int = `1`
- `regenAmount`: int = `20`
- `deadEmote`: emote → `asset://87bd1f15d84ce5c0e6a95a9415bcc100e7aedab572ae51698a71d2d284a7226b.glb`
- `attackDmg`: str = `10,15,30,2`
- `attackRate`: int = `1`
- `runSpeed`: int = `6`

## Assets
- `[avatar]` 5ee65030d904366bdf3b3b269d4e4e989c9cdc5ba5e46a69d6498aa4caa9ec2d.vrm (384,216 bytes)
- `[script]` 6539dbfcaeac6d7b1139ee986632ff650381d9c2a6b8675d439a68172c80d88e.js (17,947 bytes)
- `[avatar]` 5ee65030d904366bdf3b3b269d4e4e989c9cdc5ba5e46a69d6498aa4caa9ec2d.vrm (384,216 bytes)
- `[model]` b57eb8a61a9e4314fd80e3b2ffea5157693dd2be6bc6fc7e70c7501e7b166516.glb (50,464 bytes)
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
- `[emote]` c56b4f79ae304b31ee0f81ebd66b8f5a906ff508d739bf9deeafe7b68484efbe.glb (88,600 bytes)
- `[emote]` 3e5fc4f1109d342f59583561e21f843235801174052ec403fc32e47683941123.glb (92,192 bytes)
- `[emote]` 460b1d41e99c3ff70d4e01c36d77ac925c2577584658e94566c579e88a670757.glb (73,884 bytes)
- `[model]` 722faa592f8674fee087a136b0725d2ff3c1b9a361bdcbcb011f0235e3ee12f2.glb (74,200 bytes)
- `[emote]` 3e5fc4f1109d342f59583561e21f843235801174052ec403fc32e47683941123.glb (92,192 bytes)
- `[emote]` 87bd1f15d84ce5c0e6a95a9415bcc100e7aedab572ae51698a71d2d284a7226b.glb (84,416 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.create()`, `app.emit()`, `app.get()`, `app.on()`, `app.send()`
**World Methods**: `world.add()`, `world.getPlayer()`, `world.load()`, `world.off()`, `world.on()`, `world.remove()`
**Events Listened**: `delta`, `fixedUpdate`, `init`, `lateUpdate`, `leave`, `log`, `prism:player_died`, `prism:player_respawned`, `update`
**Events Emitted**: `prism:mob_damaged`, `prism:player_hit`
**Nodes Created**: `collider`, `controller`, `group`, `rigidbody`, `ui`, `uitext`, `uiview`

## Keywords (for Discord search)
abstracted, across, active, actualAmount, aggro, aggroDistance, aggroSphere, alignItems, amount, apply, args, arr1, arr2, assets, attack, attackDmg, attackEmote, attackRate, avatar, away

## Script Source
```javascript
app.configure([
  {
    key: 'assets',
    type: 'file',
    kind: 'model',
    label: 'Assets',
  },
  {
    key: 'idleEmote',
    type: 'file',
    kind: 'emote',
    label: 'Idle Emote',
  },
  {
    key: 'runEmote',
    type: 'file',
    kind: 'emote',
    label: 'Run Emote'
  },
  {
    key: 'runSpeed',
    type: 'number',
    label: 'Run Speed',
    initial: 6,
    dp: 1,
  },
  {
    key: 'attackEmote',
    type: 'file',
    kind: 'emote',
    label: 'Attack Emote'
  },
  {
    key: 'attackDmg',
    type: 'text',
    label: 'Attack Dmg',
    initial: '10,20,30,2',
  },
  {
    key: 'attackRate',
    type: 'number',
    label: 'Attack Rate',
    initial: 1.3,
    dp: 1,
  },
  {
    key: 'aggroDistance',
    type: 'number',
    label: 'Aggro Distance',
    initial: 10,
  },
  {
    key: 'leashDistance',
    type: 'number',
    label: 'Leash Distance',
    initial: 11,
  },
  {
    key: 'regenRate',
    type: 'number',
    label: 'Regen Rate',
    initial: 1,
  },
  {
    key: 'regenAmount',
    type: 'number',
    label: 'Regen Amount',
    initial: 1,
  },
  {
    key: 'deadEmote',
    type: 'file',
    kind: 'emote',
    label: 'Dead Emote'
  },
])

const SEND_RATE = 1 / 5
const GRAVITY = -10
const FORWARD = new Vector3(0, 0, -1)
const MAX_HEALTH = 40
const DEATH_TIME = 3
const RESPAWN_TIME = 3
const SPAWN_TIME = 3

const DEBUG_AGGRO = false

const Emotes = {
  IDLE: 0,
  RUN: 1,
  ATTACK: 2,
  DEAD: 3,
}
const emoteUrls = {
  0: props.idleEmote?.url,
  1: props.runEmote?.url + '?s=1',
  2: props.attackEmote?.url,
  3: props.deadEmote?.url + '?l=0'
}

const v1 = new Vector3()
const v2 = new Vector3()
const v3 = new Vector3()
const q1 = new Quaternion()
const q2 = new Quaternion()
const q3 = new Quaternion()

const avatar = app.get('avatar')
avatar.quaternion.copy(app.quaternion)

const mobId = app.instanceId

const getAttackDmg = strToDamageFn(props.attackDmg)

const start = {
  position: app.position.clone(),
  quaternion: app.quaternion.clone()
}

if (world.isServer) {
  init()
  async function init() {
    const state = app.state

    const ctrl = app.create('controller', {
      radius: 0.3,
      height: 1.2,
      tag: `mob:${mobId}`
    })
    ctrl.position.copy(app.position)
    world.add(ctrl)
    ctrl.add(avatar)

    const threat = createThreatTable()

    let visible = true
    let collision = true
    let health = MAX_HEALTH
    let position = ctrl.position
    let quaternion = avatar.quaternion
    let emote = Emotes.IDLE
    
    const aggro = createAggroSphere(ctrl, props.aggroDistance)

    let phase

    function setPhase(fn, ...args) {
      // console.log('setPhase', fn.name)
      phase?.stop?.()
      phase = fn(...args)
    }
    function spawn() {
      visible = true
      collision = true
      ctrl.teleport(start.position)
      avatar.quaternion.copy(start.quaternion)
      health = MAX_HEALTH
      emote = Emotes.IDLE
      threat.reset()
      let time = 0
      return {
        fixedUpdate(delta) {
          if (threat.target) {
            return setPhase(chase)
          }
          time += delta
          if (time > SPAWN_TIME) setPhase(idle)
        }
      }
    }
    function idle() {
      emote = Emotes.IDLE
      aggro.watch(playerId => {
        threat.inc(playerId, 1)
        setPhase(chase)
      })
      let lastRegen = 0
      return {
        fixedUpdate(delta) {
          if (threat.target) {
            return setPhase(chase)
          }
          if (health < MAX_HEALTH) {
            lastRegen += delta
            if (lastRegen > props.regenRate) {
              lastRegen = 0
              health = Math.min(health + props.regenAmount, MAX_HEALTH)
            }
          }
        },
        stop() {
          aggro.unwatch()
        }
      }
    }
    function chase() {
      let playerId = threat.target
      let player = world.getPlayer(playerId)
      emote = Emotes.RUN
      return {
        fixedUpdate(delta) {
          // get and check target
          if (threat.target !== playerId) {
            playerId = threat.target
            if (!playerId) return setPhase(leash)
            player = world.getPlayer(playerId)
          }
          // get flat direction from mob to player (ignore vetical component)
          const dir = v1
          dir.copy(player.position)
          dir.y = ctrl.position.y
          dir.sub(ctrl.position)
          dir.normalize()
          // create a move vector
          const move = v2.copy(dir)
          // apply speed          
          const moveSpeed = props.runSpeed
          move.multiplyScalar(moveSpeed * delta)
          // add gravity
          move.y = GRAVITY * delta
          // move controller
          ctrl.move(move)
          // turn toward player
          q1.setFromUnitVectors(FORWARD, dir)
          avatar.quaternion.copy(q1)
          // close enough to attack?
          const distance = player.position.distanceTo(ctrl.position)
          if (distance < 1.3) setPhase(attack)
          // too far away?
          if (distance > props.leashDistance) setPhase(leash)
        },
        stop() {
          // ...
        }
      }
    }
    function attack() {
      let playerId = threat.target
      let player = world.getPlayer(playerId)
      emote = Emotes.ATTACK
      let lastAttack = props.attackRate
      return {
        fixedUpdate(delta) {
          // get and check target
          if (threat.target !== playerId) {
            playerId = threat.target
            if (!playerId) return setPhase(leash)
            player = world.getPlayer(playerId)
          }
          // attack
          lastAttack += delta
          if (lastAttack > props.attackRate) {
            lastAttack = 0
            const [amount, crit] = getAttackDmg()
            app.emit('prism:player_hit', [playerId, amount, crit])
          }
          // get flat direction from mob to player (ignore vetical component)
          const dir = v1
          dir.copy(player.position)
          dir.y = ctrl.position.y
          dir.sub(ctrl.position)
          dir.normalize()
          // turn toward player
          q1.setFromUnitVectors(FORWARD, dir)
          avatar.quaternion.copy(q1)
          // far enough away to chase?
          const distance = player.position.distanceTo(ctrl.position)
          if (distance > 2.5) setPhase(chase)
        },
        stop() {
          // ...
        }
      }
    }
    function leash() {
      threat.reset()
      emote = Emotes.RUN
      return {
        fixedUpdate(delta) {
          // get flat direction from mob to start (ignore vetical component)
          const dir = v1
          dir.copy(start.position)
          dir.y = ctrl.position.y
          dir.sub(ctrl.position)
          dir.normalize()
          // create a move vector
          const move = v2.copy(dir)
          // apply speed          
          const moveSpeed = 6
          move.multiplyScalar(moveSpeed * delta)
          // add gravity
          move.y = GRAVITY * delta
          // move controller
          ctrl.move(move)
          // turn toward start
          q1.setFromUnitVectors(FORWARD, dir)
          avatar.quaternion.copy(q1)
          // close enough to attack?
          const distance = start.position.distanceTo(ctrl.position)
          if (distance < 0.3) setPhase(idle)
        },
        stop() {
          // ...
        }
      }
    }
    function dead() {
      emote = Emotes.DEAD
      collision = false
      let time = 0
      return {
        fixedUpdate(delta) {
          time += delta
          if (time > DEATH_TIME) setPhase(despawn)
        },
        stop() {
          // ...
        }
      }
    }
    function despawn() {
      visible = false
      let time = 0
      return {
        fixedUpdate(delta) {
          time += delta
          if (time > RESPAWN_TIME) setPhase(spawn)
        },
        stop() {
          // ...
        }
      }
    }
    let lastSend = 0
    world.on('leave', e => {
      threat.clear(e.playerId)
    })


// ... truncated ...
```

---
*Extracted from Mob_-_Skelly.hyp. Attachment ID: 1355903732046368829*