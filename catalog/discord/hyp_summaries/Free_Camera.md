# Free_Camera.hyp

## Metadata
- **Author**: vox
- **Channel**: #⚡│general
- **Date**: 2025-09-09
- **Size**: 33,461 bytes

## Blueprint
- **Name**: Free Camera
- **Version**: 3
- **Model**: `asset://97fc7289a38b5b49357e6fbd74e7e77fc78493dbb1c0dbc850cb8e9db9fd2530.glb`
- **Script**: `asset://45dccbca40661d564e8d7ec37f593a54e48258cae7f90cdc5137a694867fdb41.js`

## Props
- `collision`: bool = `True`
- `keyUIPanel`: str = `j`
- `keyFreecam`: str = `k`
- `keyOrbit`: str = `l`
- `keyFreeCamMoveSpeedUp`: str = `[`
- `keyFreeCamMoveSpeedDown`: str = `]`

## Assets
- `[model]` 97fc7289a38b5b49357e6fbd74e7e77fc78493dbb1c0dbc850cb8e9db9fd2530.glb (3,380 bytes)
- `[script]` 45dccbca40661d564e8d7ec37f593a54e48258cae7f90cdc5137a694867fdb41.js (26,207 bytes)
- `[texture]` 39ad1b405cbf41a90825dadf0b554f3c3baba634636bb94a1057dd8ec0784c86.png (2,777 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.control()`, `app.create()`, `app.get()`, `app.getWorldPosition()`, `app.on()`
**World Methods**: `world.add()`
**Events Listened**: `update`
**Nodes Created**: `ui`, `uitext`, `uiview`

## Keywords (for Discord search)
aaaaaa, access, active, adjustment, alignItems, alignment, angularSpeed, apply, applyQuaternion, around, backgroundColor, base, basePos, based, between, bigStep, binding, bindings, bold, borderRadius

## Script Source
```javascript
// FreeCam.js - Self-contained camera script with Freecam and Orbit modes
// ---------------------------------------------------------------
// Controls (client-side only):
//   C  – Toggle Freecam on/off
//   O  – Toggle Orbit camera around the local player on/off
//   U  – Toggle camera configuration panel
// ---------------------------------------------------------------
// Config parameters are defined inside this script. Adjust as needed.

// Expose hotkeys so builders can change them in the inspector
app.configure([
  { key: 'keyUIPanel', type: 'text', label: 'UI Panel Toggle Key', default: 'U' },
  { key: 'keyFreecam', type: 'text', label: 'Freecam Toggle Key', default: 'C' },
  { key: 'keyOrbit',   type: 'text', label: 'Orbit Toggle Key',   default: 'O' },
])

if (world.isClient) {
// =========================
// Configuration
// =========================
const CONFIG = {
  // Orbit parameters
  ORBIT_RADIUS: 5,
  ORBIT_HEIGHT: 2,
  ORBIT_MOVE_SPEED: 0.3,
  ORBIT_MOVE_LERP: 0.2,
  ORBIT_LOOK_SPEED: 0.9,
  ORBIT_LOOK_LERP: 0.2,
  ORBIT_TARGET_MOVE_SPEED: 1.0,

  // Freecam parameters (normalized speed 0-1)
  FREECAM_MOVE_SPEED: 0.3,
  FREECAM_MOVE_LERP: 0.05,
  FREECAM_LOOK_SPEED: 0.5,
  FREECAM_LOOK_LERP: 0.05,
}

// Physical ranges used for mappings
const RANGES = {
  FREECAM_MOVE_SPEED: { min: 0.05, max: 1.0 },
  ORBIT_MOVE_SPEED: { min: 0.01, max: 4 },
  ORBIT_RADIUS: { min: 0.1, max: 9999 },
  ORBIT_HEIGHT: { min: -999, max: 999 },
  FREECAM_LOOK_SPEED: { min: 0.0005, max: 0.005 },
  ORBIT_LOOK_SPEED: { min: 0, max: 1 },
  FREECAM_MOVE_LERP: { min: 0.01, max: 0.25 },
  FREECAM_LOOK_LERP: { min: 0.01, max: 0.25 },
  ORBIT_MOVE_LERP: { min: 0.01, max: 0.25 },
  ORBIT_LOOK_LERP: { min: 0.01, max: 0.25 }
}

app.keepActive = true

// =========================
// State
// =========================
const STATES = { DEFAULT: 'default', FREECAM: 'freecam', ORBIT: 'orbit' }
let currentState = STATES.DEFAULT
let control = null
// Orbit will focus on this world position provided via props
let orbitTarget = null

// Orbit state vars
let orbitAngle = 0
let cameraPosition = new Vector3()
let cameraTarget = new Vector3()

// Orbit target position editable via UI
const orbitPos = { x: 0, y: 0, z: 0 }

// Freecam state vars
let freecamSpeed = CONFIG.FREECAM_MOVE_SPEED
let freecamVelocity = new Vector3()
let freecamTargetQuat = null

// UI State for live config editing
let cameraPanel = null
let cameraPanelVisible = false

// Dynamic key binding handles
let keyFreecamCtrl = null
let keyOrbitCtrl = null
let keyUIPanelCtrl = null
let keyFreeCamMoveSpeedUpCtrl = null
let keyFreeCamMoveSpeedDownCtrl = null
let uiKeyPrevPressed = false
let speedUpKeyPrevPressed = false
let speedDownKeyPrevPressed = false

// Add cube visibility state
let cubeNode = null
let cubeVisible = true

function createNumberControl(labelText, configKey, step = 0.05) {
  const row = app.create('uiview', {
    width: 320,
    height: 44,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(68, 71, 90, 0.2)',
    borderRadius: 6,
    padding: [0, 0, 0, 10],
    marginTop: 0
  })

  const label = app.create('uitext', {
    value: labelText,
    color: '#f8f8f2',
    fontSize: 15,
    width: 120,
    textAlign: 'left',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  })
  row.add(label)

  // Button group for perfect alignment
  const buttonGroup = app.create('uiview', {
    width: 210,
    height: 32,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0
  })
  // -- button
  const outerMinus = app.create('uiview', {
    width: 28, height: 32, backgroundColor: 'rgba(60,60,80,0.8)', borderRadius: 6, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: 2
  })
  outerMinus.add(app.create('uitext', { value: '--', color: '#ffffff', fontSize: 13 }))
  outerMinus.onPointerDown = () => { set(-step); return true }
  buttonGroup.add(outerMinus)
  // - button
  const minus = app.create('uiview', {
    width: 28, height: 32, backgroundColor: 'rgba(60,60,80,0.8)', borderRadius: 6, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: 2
  })
  minus.add(app.create('uitext', { value: '-', color: '#ffffff', fontSize: 15 }))
  minus.onPointerDown = () => { set(-step); return true }
  buttonGroup.add(minus)
  // value
  const valueText = app.create('uitext', { value: getValue().toFixed(3), color: '#50fa7b', fontSize: 15, fontFamily: 'monospace', textAlign: 'center', width: 70 })
  buttonGroup.add(valueText)
  // + button
  const plus = app.create('uiview', {
    width: 28, height: 32, backgroundColor: 'rgba(60,60,80,0.8)', borderRadius: 6, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: 2
  })
  plus.add(app.create('uitext', { value: '+', color: '#ffffff', fontSize: 15 }))
  plus.onPointerDown = () => { set(step); return true }
  buttonGroup.add(plus)
  // ++ button
  const outerPlus = app.create('uiview', {
    width: 28, height: 32, backgroundColor: 'rgba(60,60,80,0.8)', borderRadius: 6, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: 2
  })
  outerPlus.add(app.create('uitext', { value: '++', color: '#ffffff', fontSize: 13 }))
  outerPlus.onPointerDown = () => { set(step); return true }
  buttonGroup.add(outerPlus)
  row.add(buttonGroup)

  function set(delta) {
    let v = getValue() + delta
    v = Math.max(min, Math.min(max, v))
    setValue(v)
    valueText.value = v.toFixed(3)
  }
  app.on('update', () => { valueText.value = getValue().toFixed(3) })
  return row
}

function createStepperControl(labelText, getValue, setValue, min, max, step, bigStep) {
  const row = app.create('uiview', {
    width: 380,
    height: 44,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(68, 71, 90, 0.2)',
    borderRadius: 6,
    padding: [0, 0, 0, 0],
    marginTop: 0,
    gap: 0
  })
  const labelContainer = app.create('uiview', {
    width: 180,
    height: 32,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflow: 'hidden',
    padding: [0, 0, 0, 6]
  })
  const label = app.create('uitext', {
    value: labelText,
    color: '#f8f8f2',
    fontSize: 16,
    width: 140,
    textAlign: 'left',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  })
  labelContainer.add(label)
  row.add(labelContainer)
  // Button group for perfect alignment
  const buttonGroup = app.create('uiview', {
    width: 180,
    height: 32,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0
  })
  // -- button
  const outerMinus = app.create('uiview', {
    width: 28, height: 32, backgroundColor: 'rgba(60,60,80,0.8)', borderRadius: 6, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: 2
  })
  outerMinus.add(app.create('uitext', { value: '--', color: '#ffffff', fontSize: 13 }))
  outerMinus.onPointerDown = () => { set(-bigStep); return true }
  buttonGroup.add(outerMinus)
  // - button
  const minus = app.create('uiview', {
    width: 28, height: 32, backgroundColor: 'rgba(60,60,80,0.8)', borderRadius: 6, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: 2
  })
  minus.add(app.create('uitext', { value: '-', color: '#ffffff', fontSize: 15 }))
  minus.onPointerDown = () => { set(-step); return true }
  buttonGroup.add(minus)
  // value
  const valueText = app.create('uitext', { value: getValue().toFixed(3), color: '#50fa7b', fontSize: 15, fontFamily: 'monospace', textAlign: 'center', width: 70 })
  buttonGroup.add(valueText)
  // + button
  const plus = app.create('uiview', {
    width: 28, height:

// ... truncated ...
```

---
*Extracted from Free_Camera.hyp. Attachment ID: 1415049093872619600*