# dash.hyp

## Metadata
- **Author**: peezy
- **Channel**: #🧊│3d-design
- **Date**: 2025-04-02
- **Size**: 115,158 bytes

## Blueprint
- **Name**: dash
- **Version**: 15
- **Model**: `asset://9eefb29492dbcf914486487ead46db237a06ff10b645bd0d46b2fff8e8b0d289.glb`
- **Script**: `asset://19bf8746ecc19b9f32b31283fe36308f0cc080b249ee59318e55fe3bfb5940ae.js`

## Props
- `rName`: str = `dash`
- `color`: str = `0.0957`
- `chargeEmote`: emote → `asset://390877595102398e89c1ff6034323b949c0b4f8611afb8ed584aa49b575a5c76.glb`

## Assets
- `[model]` 9eefb29492dbcf914486487ead46db237a06ff10b645bd0d46b2fff8e8b0d289.glb (31,856 bytes)
- `[script]` 19bf8746ecc19b9f32b31283fe36308f0cc080b249ee59318e55fe3bfb5940ae.js (3,144 bytes)
- `[emote]` 390877595102398e89c1ff6034323b949c0b4f8611afb8ed584aa49b575a5c76.glb (79,176 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.control()`, `app.create()`, `app.get()`, `app.on()`
**World Methods**: `world.getPlayer()`
**Events Listened**: `update`
**Nodes Created**: `ui`, `uitext`

## Keywords (for Discord search)
applyEffect, applyQuaternion, backgroundColor, below, camera, canDash, cases, center, charge, chargeEmote, color, configure, control, copy, create, delta, dropdown, duration, emote, execute

## Script Source
```javascript
// =================================================================
// Place your rom scrip below:
// =================================================================



// =================================================================
// Config
// =================================================================
app.configure([
  {
    key: 'rName',
    type: 'text',
    label: 'Rom Name',
  },
  {
    key: 'color',
    type: 'dropdown',
    label: 'Color',
    options: [
      {
        label: 'Red',
        value: '0.0957',
      },
      {
        label: 'Orange',
        value: '0',
      },
      {
        label: 'Yellow',
        value: '0.4824',
      },
      {
        label: 'Green',
        value: '0.2633',
      },
      {
        label: 'Blue',
        value: '0.389',
      },
      {
        label: 'Indigo',
        value: '0.1777',
      },
      {
        label: 'Violet',
        value: '0.5098',
      },
    ],
    initial: '0',
  },
  {
    key: 'chargeEmote',
    type: 'file',
    kind: 'emote',
    label: 'Charge Emote',
  },
]);

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

const chargeEmote = props.chargeEmote?.url + '?l=0'

const v1 = new Vector3()
const q1 = new Quaternion()
const e1 = new Euler(0, 0, 0, 'YXZ')


if (world.isClient) {
  const player = world.getPlayer()
  let control = app.control()
  let canDash = true;

  function getDirection(vec3) {
    e1.setFromQuaternion(control.camera.quaternion)
    e1.x = 0
    e1.z = 0
    q1.setFromEuler(e1)
    const dir = vec3.copy(FORWARD).applyQuaternion(q1)
    return dir
  }

  function charge() {
    if (player.hasEffect()) return
    if (!canDash) return
    canDash = false

    const dir = getDirection(v1)
    const force = dir.multiplyScalar(30)
    player.push(force)
    player.applyEffect({
      emote: chargeEmote,
      turn: true,
      duration: 0.4,
      onEnd: () => {
        canDash = true
      }
    })
  }

  app.on('update', delta => {
    if (control.keyF.pressed) {
      charge()
    }
  })
}


// =================================================================
// UI
// =================================================================
const ui = app.create('ui')
ui.rotation.y = 180 * DEG2RAD
ui.position.z = -0.12
ui.position.y = -0.46
ui.width = 20
const romName = app.create('uitext')
romName.fontSize = 4
romName.textAlign = 'center'
romName.color = '#000000'
romName.value = props.rName
romName.backgroundColor = '#ffffff'
romName.fontFamily = 'Arial Black'
const mesh = app.get('hyper-rom-orange_mesh')
const mat = mesh.material
// handle y color cases
if (props.color == 0.1777) {
  // indigo
  mat.textureY = 0.0684
} else if (props.color == 0.0957) {
  // red
  mat.textureY = -0.0645
} else if (props.color == 0.2633) {
  // green
  mat.textureY = -0.1772
} else {
  mat.textureY = 0
}
mat.textureX = props.color
// execute
ui.add(romName)
app.add(ui)

```

---
*Extracted from dash.hyp. Attachment ID: 1356968685037682848*