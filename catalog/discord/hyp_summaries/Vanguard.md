# Vanguard.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-03-30
- **Size**: 10,119,730 bytes

## Discord Context
> Just gonna leave these here for reference.
This is the Prism system.
Instead of item based action bars like the Elemental system, this one is class based characters that have an avatar, skills, energy, etc.
It's also PvPvE and there's work to do to make PvP a toggleable thing, eg for dueling.
Backpack will also be added, but those items will be more representational than the Elemental ones.

## Blueprint
- **Name**: Vanguard
- **Version**: 512
- **Model**: `asset://f3eabd259b9c1410f46e1e730ad2210b62ee5acff9813ff38337b343882ec050.glb`
- **Script**: `asset://93a03970fe525d9eea51eeaea0f8593b63ff87d199146501265386c36c1835ed.js`

## Props
- `avatar`: avatar → `asset://268b12ee20dda8564f18e929924f60c164270e122884466908b1ce44d61d92e8.vrm`
- `weapon`: model → `asset://64aa563bdac1799ddf44805cdad9cc20b2eda979154d35135362050107ebc492.glb`
- `attack1`: emote → `asset://460b1d41e99c3ff70d4e01c36d77ac925c2577584658e94566c579e88a670757.glb`
- `attack2`: emote → `asset://a7b857124edf757f54efe9a6f3694e4d342d89823f0027bc7ad14bd72c38e630.glb`
- `attackEmote1`: emote → `asset://460b1d41e99c3ff70d4e01c36d77ac925c2577584658e94566c579e88a670757.glb`
- `attackEmote2`: emote → `asset://a7b857124edf757f54efe9a6f3694e4d342d89823f0027bc7ad14bd72c38e630.glb`
- `attackSound`: audio → `asset://1f6a6e79631c5b2d07796e049b2f5ad8ab2681feeb9499da04f358b9f117b769.mp3`
- `chargeEmote`: emote → `asset://390877595102398e89c1ff6034323b949c0b4f8611afb8ed584aa49b575a5c76.glb`
- `chargeIcon`: texture → `asset://d3fb30b5d5b46867f99e4bda7535e6a22fa591854526b0631b1f7e31ed0021a6.png`
- `chargeCost`: int = `30`
- `specialEmote`: emote → `asset://93c66c42e8ac517e179ef72fb48538a21023c10895b35b53f3048dad76927a88.glb`
- `specialIcon`: texture → `asset://f327b3daf2fba37624faeb90d6c3f88b6e09ffe19245f40cc86b362cdea172fd.png`
- `specialCost`: int = `50`
- `attackIcon`: texture → `asset://4acd01d8bfc9542c24a6daa9180ff1accff487c40987b1524c08e4ab41bc339a.png`
- `attackCost`: int = `1`
- `attackDmg`: str = `10-20`
- `attackDamage`: str = `5,10,30,2`
- `attackCritChance`: int = `30`
- `attackCritMultiplier`: int = `2`
- `attackEnergy`: int = `1`
- `chargeEnergy`: int = `20`
- `specialEnergy`: int = `50`
- `specialDamage`: str = `20,40,30,1.5`
- `specialSound`: audio → `asset://967fd5ca7d34688058f2bc4da2263ffd03f5ba0f397e13b8359f1b21cbb2919a.mp3`
- `chargeSound`: audio → `asset://fba37782dc9d42d2dfe3c1ebe46e4f5d0fb50abf3061f8a3dd58c2aa03925ffa.mp3`

## Assets
- `[model]` f3eabd259b9c1410f46e1e730ad2210b62ee5acff9813ff38337b343882ec050.glb (395,948 bytes)
- `[script]` 93a03970fe525d9eea51eeaea0f8593b63ff87d199146501265386c36c1835ed.js (17,657 bytes)
- `[avatar]` 268b12ee20dda8564f18e929924f60c164270e122884466908b1ce44d61d92e8.vrm (2,324,724 bytes)
- `[model]` 64aa563bdac1799ddf44805cdad9cc20b2eda979154d35135362050107ebc492.glb (117,740 bytes)
- `[emote]` 460b1d41e99c3ff70d4e01c36d77ac925c2577584658e94566c579e88a670757.glb (73,884 bytes)
- `[emote]` a7b857124edf757f54efe9a6f3694e4d342d89823f0027bc7ad14bd72c38e630.glb (73,368 bytes)
- `[emote]` 460b1d41e99c3ff70d4e01c36d77ac925c2577584658e94566c579e88a670757.glb (73,884 bytes)
- `[emote]` a7b857124edf757f54efe9a6f3694e4d342d89823f0027bc7ad14bd72c38e630.glb (73,368 bytes)
- `[audio]` 1f6a6e79631c5b2d07796e049b2f5ad8ab2681feeb9499da04f358b9f117b769.mp3 (5,433 bytes)
- `[emote]` 390877595102398e89c1ff6034323b949c0b4f8611afb8ed584aa49b575a5c76.glb (79,176 bytes)
- `[texture]` d3fb30b5d5b46867f99e4bda7535e6a22fa591854526b0631b1f7e31ed0021a6.png (2,658,191 bytes)
- `[emote]` 93c66c42e8ac517e179ef72fb48538a21023c10895b35b53f3048dad76927a88.glb (77,916 bytes)
- `[texture]` f327b3daf2fba37624faeb90d6c3f88b6e09ffe19245f40cc86b362cdea172fd.png (1,835,526 bytes)
- `[texture]` 4acd01d8bfc9542c24a6daa9180ff1accff487c40987b1524c08e4ab41bc339a.png (2,290,883 bytes)
- `[audio]` 967fd5ca7d34688058f2bc4da2263ffd03f5ba0f397e13b8359f1b21cbb2919a.mp3 (7,105 bytes)
- `[audio]` fba37782dc9d42d2dfe3c1ebe46e4f5d0fb50abf3061f8a3dd58c2aa03925ffa.mp3 (10,031 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.control()`, `app.create()`, `app.emit()`, `app.get()`, `app.on()`, `app.remove()`, `app.send()`, `app.sendTo()`
**World Methods**: `world.add()`, `world.createLayerMask()`, `world.getPlayer()`, `world.on()`, `world.overlapSphere()`, `world.remove()`
**Events Listened**: `addActor`, `addEnergy`, `broadcast`, `call`, `charge`, `enter`, `equip`, `init`, `leave`, `log`, `removeActor`, `update`
**Events Emitted**: `equipping`, `prism:player_hit`
**Nodes Created**: `audio`, `group`, `ui`, `uiimage`, `uitext`, `uiview`

## Keywords (for Discord search)
absolute, actions, active, actor, actors, addActor, addBtn, addEnergy, alignItems, amount, applyEffect, applyQuaternion, args, attack, attackCritChance, attackCritMultiplier, attackDamage, attackDamageMax, attackDamageMin, attackEmote1

## Script Source
```javascript
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
        q1.set

// ... truncated ...
```

---
*Extracted from Vanguard.hyp. Attachment ID: 1355903732742881552*