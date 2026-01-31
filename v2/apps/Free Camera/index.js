export default function main(world, app, fetch, props, setTimeout) {
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
  outerPlus.onPointerDown = () => { set(bigStep); return true }
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

function createCameraPanel() {
  cameraPanel = app.create('ui', {
    width: 460,
    height: 120,
    backgroundColor: 'rgba(40,42,54,0.95)',
    borderRadius: 16,
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    res: 2,
    space: 'screen',
    position: [0.8, 0.62, 1],
    offset: [0, 0, 0],
    pivot: 'center',
    pointerEvents: true,
    interactive: true,
    active: true
  })

  // Header row with title and close button
  const header = app.create('uiview', {
    width: 420,
    height: 48,
    backgroundColor: 'rgba(68, 71, 90, 0.5)',
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: [0, 10, 0, 20],
    marginBottom: 14
  })
  // Title that shows toggle key
  const titleText = app.create('uitext', {
    value: '',
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold'
  })
  header.add(titleText)

  // Cube visibility toggle button (eye / eye-slash)
  const cubeBtn = app.create('uiview', {
    width: 28,
    height: 28,
    backgroundColor: 'rgba(85, 170, 255, 0.25)',
    borderRadius: 10,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  })
  const cubeBtnText = app.create('uitext', { value: '', color: '#ffffff', fontSize: 16 })
  cubeBtn.add(cubeBtnText)

  const OPEN_ICON = '👁'
  const CLOSED_ICON = '👁'
  const VISIBLE_BG = 'rgba(85, 170, 255, 0.25)'
  const HIDDEN_BG = 'rgba(68, 71, 90, 0.5)'

  function updateCubeBtn() {
    if (cubeVisible) {
      cubeBtnText.value = OPEN_ICON
      cubeBtnText.color = '#ffffff'
      cubeBtn.backgroundColor = VISIBLE_BG
    } else {
      cubeBtnText.value = CLOSED_ICON
      cubeBtnText.color = '#aaaaaa'
      cubeBtn.backgroundColor = HIDDEN_BG
    }
  }

  cubeBtn.onPointerDown = () => {
    if (!cubeNode) cubeNode = app.get('Cube')
    if (!cubeNode) return true
    cubeVisible = !cubeVisible
    cubeNode.active = cubeVisible
    updateCubeBtn()
    return true
  }
  updateCubeBtn()

  const closeBtn = app.create('uiview', {
    width: 28,
    height: 28,
    backgroundColor: 'rgba(255, 85, 85, 0.25)',
    borderRadius: 10,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  })
  closeBtn.add(app.create('uitext', { value: '×', color: '#ffffff', fontSize: 14 }))
  closeBtn.onPointerDown = () => { toggleCameraPanel(true); return true }

  // Right-hand control container (eye + close)
  const rightControls = app.create('uiview', {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    width: 60
  })
  rightControls.add(cubeBtn)
  rightControls.add(closeBtn)
  header.add(rightControls)

  cameraPanel.add(header)

  const listContainer = app.create('uiview', {
    width: 420,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: [8,0,0,0]
  })
  cameraPanel.add(listContainer)

  // Freecam group (hardcoded)
  const freeGroup = app.create('uiview', {
    width: 420,
    height: 280,
    backgroundColor: 'rgba(68,71,90,0.28)',
    borderRadius: 12,
    padding: [12, 20, 12, 20],
    marginBottom: 18,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8
  })
  listContainer.add(freeGroup)
  const freeHeaderContainer = app.create('uiview', {
    width: 420,
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: 8,
  })
  const freeHeader = app.create('uitext', { value: '', color: '#ffffff', fontSize: 16, fontWeight: 'bold', padding: [0, 0, 10, 0] })
  freeHeaderContainer.add(freeHeader)
  freeGroup.add(freeHeaderContainer)
  freeGroup.add(createStepperControl('Movement Speed', () => freecamSpeed, v => { freecamSpeed = Math.max(0, Math.min(1, v)) }, 0, 1, 0.01, 0.1))
  freeGroup.add(createStepperControl('Movement Lerp', () => CONFIG.FREECAM_MOVE_LERP, v => { CONFIG.FREECAM_MOVE_LERP = v }, RANGES.FREECAM_MOVE_LERP.min, RANGES.FREECAM_MOVE_LERP.max, 0.01, 0.1))
  freeGroup.add(createStepperControl('Look Speed', () => CONFIG.FREECAM_LOOK_SPEED, v => { CONFIG.FREECAM_LOOK_SPEED = Math.max(0, Math.min(1, v)) }, 0, 1, 0.01, 0.1))
  freeGroup.add(createStepperControl('Look Lerp', () => CONFIG.FREECAM_LOOK_LERP, v => { CONFIG.FREECAM_LOOK_LERP = v }, RANGES.FREECAM_LOOK_LERP.min, RANGES.FREECAM_LOOK_LERP.max, 0.01, 0.1))

  // Orbit group (hardcoded)
  const orbitGroup = app.create('uiview', {
    width: 420,
    height: 480,
    backgroundColor: 'rgba(68,71,90,0.18)',
    borderRadius: 12,
    padding: [12, 20, 12, 20],
    marginBottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8
  })
  listContainer.add(orbitGroup)
  const orbitHeaderContainer = app.create('uiview', {
    width: 420,
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: 8,
  })
  const orbitHeader = app.create('uitext', { value: '', color: '#ffffff', fontSize: 16, fontWeight: 'bold', padding: [0, 0, 10, 0] })
  orbitHeaderContainer.add(orbitHeader)
  orbitGroup.add(orbitHeaderContainer)
  orbitGroup.add(createStepperControl('Radius', () => CONFIG.ORBIT_RADIUS, v => { CONFIG.ORBIT_RADIUS = v }, RANGES.ORBIT_RADIUS.min, RANGES.ORBIT_RADIUS.max, 0.1, 1))
  orbitGroup.add(createStepperControl('Height', () => CONFIG.ORBIT_HEIGHT, v => { CONFIG.ORBIT_HEIGHT = v }, RANGES.ORBIT_HEIGHT.min, RANGES.ORBIT_HEIGHT.max, 0.1, 1))
  orbitGroup.add(createStepperControl('Movement Speed', () => CONFIG.ORBIT_MOVE_SPEED, v => { CONFIG.ORBIT_MOVE_SPEED = Math.max(0, Math.min(1, v)) }, 0, 1, 0.01, 0.1))
  orbitGroup.add(createStepperControl('Movement Lerp', () => CONFIG.ORBIT_MOVE_LERP, v => { CONFIG.ORBIT_MOVE_LERP = v }, RANGES.ORBIT_MOVE_LERP.min, RANGES.ORBIT_MOVE_LERP.max, 0.01, 0.1))
  orbitGroup.add(createStepperControl('Look Speed', () => CONFIG.ORBIT_LOOK_SPEED, v => { CONFIG.ORBIT_LOOK_SPEED = Math.max(0, Math.min(1, v)) }, 0, 1, 0.01, 0.1))
  orbitGroup.add(createStepperControl('Look Lerp', () => CONFIG.ORBIT_LOOK_LERP, v => { CONFIG.ORBIT_LOOK_LERP = v }, RANGES.ORBIT_LOOK_LERP.min, RANGES.ORBIT_LOOK_LERP.max, 0.01, 0.1))

  world.add(cameraPanel)
  // Hardcode panel height to fit all content, with null check
  if (cameraPanel) cameraPanel.height = 880

  // Update labels based on current key bindings
  function updateHeaderLabels() {
    titleText.value = `FREE CAMERA [${getKeyChar('keyUIPanel', 'U')}]`
    freeHeader.value = `FREECAM [${getKeyChar('keyFreecam', 'C')}]`
    orbitHeader.value = `ORBIT [${getKeyChar('keyOrbit', 'O')}]`
  }

  // Initial update
  updateHeaderLabels()
  // Refresh each frame so UI reflects changed props
  app.on('update', updateHeaderLabels)
}

function toggleCameraPanel(forceClose = false) {
  cameraPanelVisible = forceClose ? false : !cameraPanelVisible
  if (!cameraPanel) createCameraPanel()
  cameraPanel.active = cameraPanelVisible
}

// Helper – generic vector extraction from various sources
function getVectorValues(v) {
  if (!v) return null
  if (typeof v.x === 'number') return { x: v.x, y: v.y, z: v.z }
  if (typeof v._x === 'number') return { x: v._x, y: v._y, z: v._z }
  if (v.position) return getVectorValues(v.position)
  if (Array.isArray(v) && v.length >= 3) return { x: v[0], y: v[1], z: v[2] }
  if (v.getWorldPosition) {
    const p = new Vector3(); v.getWorldPosition(p);
    return getVectorValues(p)
  }
  return null
}

// === Helper functions for normalized config values ===

// Map a 0-1 scalar to a range [min, max]
function speedScalar(value, min, max) {
  return min + (max - min) * Math.max(0, Math.min(1, value))
}

function lookAtTarget(targetPos, factor = 1.0) {
  if (!control || !control.camera) return
  const t = getVectorValues(targetPos)
  if (!t) return
  const camPos = control.camera.position
  const dir = new Vector3(t.x - camPos.x, t.y - camPos.y, t.z - camPos.z)
  const len = dir.length()
  if (len < 0.001) return
  dir.divideScalar(len)
  if (factor >= 1) {
    control.camera.quaternion.setFromRotationMatrix(new Matrix4().lookAt(new Vector3(0,0,0), dir, new Vector3(0,1,0)))
  } else {
    const targetQuat = new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(new Vector3(0,0,0), dir, new Vector3(0,1,0)))
    control.camera.quaternion.slerp(targetQuat, Math.min(0.2, Math.max(0.001, factor)))
  }
}

// Freecam helpers
function captureFreecamControls() {
  control.keyW.capture = true; control.keyA.capture = true; control.keyS.capture = true; control.keyD.capture = true;
  control.shiftLeft.capture = true; control.space.capture = true; if (control.ctrlLeft) control.ctrlLeft.capture = true;
  control.mouseRight.capture = true; control.pointer.capture = true;
}
function releaseFreecamControls() {
  control.keyW.capture = false; control.keyA.capture = false; control.keyS.capture = false; control.keyD.capture = false;
  control.shiftLeft.capture = false; control.space.capture = false; if (control.ctrlLeft) control.ctrlLeft.capture = false;
  control.mouseRight.capture = false; control.pointer.capture = false;
}

function captureOrbitControls() {
  control.keyW.capture = true; control.keyA.capture = true; control.keyS.capture = true; control.keyD.capture = true;
  control.shiftLeft.capture = true; control.space.capture = true; if (control.ctrlLeft) control.ctrlLeft.capture = true;
}
function releaseOrbitControls() {
  control.keyW.capture = false; control.keyA.capture = false; control.keyS.capture = false; control.keyD.capture = false;
  control.shiftLeft.capture = false; control.space.capture = false; if (control.ctrlLeft) control.ctrlLeft.capture = false;
}

function enterFreecam() {
  if (!control || !control.camera) return
  currentState = STATES.FREECAM
  control.camera.write = true
  captureFreecamControls()
}
function leaveFreecam() {
  if (!control) return
  releaseFreecamControls()
  if (control.pointer.locked) control.pointer.unlock()
  currentState = STATES.DEFAULT
  control.camera.write = false
}

function enterOrbit(targetPos) {
  if (!control || !control.camera) return

  // If a target offset is provided, apply it
  if (targetPos) {
    orbitPos.x = targetPos.x; orbitPos.y = targetPos.y; orbitPos.z = targetPos.z
  }

  currentState = STATES.ORBIT
  control.camera.write = true
  captureOrbitControls()
  orbitAngle = 0
}
function leaveOrbit() {
  if (!control) return
  releaseOrbitControls()
  currentState = STATES.DEFAULT
  control.camera.write = false
}

// =========================
// Initialization once player exists
// =========================
function initCamera() {
  control = app.control()
  if (!control) return

  // Function to map a single character to control key handle
  function resolveKey(char, fallbackChar) {
    const letter = (char || fallbackChar || '').trim().toUpperCase()
    const k = control['key' + letter]
    return k || control['key' + fallbackChar]
  }

  function refreshKeyBindings() {
    // release previous captures
    ;[keyFreecamCtrl, keyOrbitCtrl, keyUIPanelCtrl, keyFreeCamMoveSpeedUpCtrl, keyFreeCamMoveSpeedDownCtrl].forEach(k => { if (k) k.capture = false })

    keyFreecamCtrl = resolveKey(app.props?.keyFreecam, 'C')
    keyOrbitCtrl   = resolveKey(app.props?.keyOrbit, 'O')
    keyUIPanelCtrl = resolveKey(app.props?.keyUIPanel, 'U')
    keyFreeCamMoveSpeedUpCtrl = control.bracketRight
    keyFreeCamMoveSpeedDownCtrl = control.bracketLeft

    ;[keyFreecamCtrl, keyOrbitCtrl, keyUIPanelCtrl, keyFreeCamMoveSpeedUpCtrl, keyFreeCamMoveSpeedDownCtrl].forEach(k => { if (k) k.capture = true })
  }

  // Initial binding
  refreshKeyBindings()
  // Store on control for access in update loop
  control._refreshKeyBindings = refreshKeyBindings

  // Obtain reference to the cube model (if any) and keep it hidden initially
  cubeNode = app.get('Block')
  if (cubeNode) {
    cubeVisible = true
    cubeNode.active = true
  }

  cameraPosition.copy(control.camera.position)

  // Pointer lock request on RMB when in freecam
  if (!control.pointer._freecamPointerDownAdded) {
    control.pointer.onPointerDown = (e) => {
      if (currentState === STATES.FREECAM && e.button === 2) control.pointer.lock()
    }
    control.pointer._freecamPointerDownAdded = true
  }
}

// Initialise immediately (no player dependency)
initCamera()

// =========================
// Main update loop
// =========================
app.on('update', (delta) => {
  if (!control || !control.camera) return

  // Refresh key bindings in case props changed
  if (control._refreshKeyBindings) control._refreshKeyBindings()

  // Toggle requests using dynamic keys
  if (keyFreecamCtrl?.pressed) {
    if (currentState === STATES.FREECAM) leaveFreecam(); else enterFreecam()
  }
  if (keyOrbitCtrl?.pressed) {
    if (currentState === STATES.ORBIT) leaveOrbit(); else enterOrbit()
  }
  if (keyUIPanelCtrl?.pressed && !uiKeyPrevPressed) {
    toggleCameraPanel()
  }
  uiKeyPrevPressed = keyUIPanelCtrl?.pressed

  // Handle freecam speed adjustment keys
  if (keyFreeCamMoveSpeedUpCtrl?.pressed && !speedUpKeyPrevPressed) {
    freecamSpeed = Math.max(0, Math.min(1, freecamSpeed + 0.1))
  }
  speedUpKeyPrevPressed = keyFreeCamMoveSpeedUpCtrl?.pressed

  if (keyFreeCamMoveSpeedDownCtrl?.pressed && !speedDownKeyPrevPressed) {
    freecamSpeed = Math.max(0, Math.min(1, freecamSpeed - 0.1))
  }
  speedDownKeyPrevPressed = keyFreeCamMoveSpeedDownCtrl?.pressed

  // Run state updates
  switch (currentState) {
    case STATES.FREECAM:
      updateFreecam(delta)
      break
    case STATES.ORBIT:
      updateOrbit(delta)
      break
    default:
      // default state handled by game
      break
  }
})

// =========================
// Update – Orbit
// =========================
function updateOrbit(delta) {
  // Treat orbitPos as an OFFSET from the app's world position
  // Compute the base world position of the app and add the configured offset
  const basePos = new Vector3()
  if (typeof app.getWorldPosition === 'function') {
    app.getWorldPosition(basePos)
  } else if (app.position) {
    basePos.copy(app.position)
  }

  const targetPos = new Vector3(basePos.x + orbitPos.x, basePos.y + orbitPos.y, basePos.z + orbitPos.z)

  const angularSpeed = speedScalar(CONFIG.ORBIT_MOVE_SPEED, RANGES.ORBIT_MOVE_SPEED.min, RANGES.ORBIT_MOVE_SPEED.max)
  orbitAngle += angularSpeed * delta

  cameraTarget.x = targetPos.x + Math.sin(orbitAngle) * CONFIG.ORBIT_RADIUS
  cameraTarget.z = targetPos.z + Math.cos(orbitAngle) * CONFIG.ORBIT_RADIUS
  cameraTarget.y = targetPos.y + CONFIG.ORBIT_HEIGHT

  // Smooth movement using configurable lerp
  cameraPosition.lerp(cameraTarget, CONFIG.ORBIT_MOVE_LERP)
  control.camera.position.copy(cameraPosition)

  lookAtTarget(targetPos, CONFIG.ORBIT_LOOK_LERP)
}

// =========================
// Update – Freecam
// =========================
function updateFreecam(delta) {
  // Adjust normalized speed via scroll wheel
  if (control.scrollDelta && typeof control.scrollDelta.value === 'number' && control.scrollDelta.value !== 0) {
    freecamSpeed = Math.max(0, Math.min(1, freecamSpeed + control.scrollDelta.value * 0.002))
  }

  control.pointer.preventDefault = true

  // Convert normalized speed to physical units per-frame
  const physicalSpeed = speedScalar(freecamSpeed, RANGES.FREECAM_MOVE_SPEED.min, RANGES.FREECAM_MOVE_SPEED.max)

  // Movement vector in camera local space
  const move = new Vector3()
  if (control.keyW.down) move.z -= 1
  if (control.keyS.down) move.z += 1
  if (control.keyA.down) move.x -= 1
  if (control.keyD.down) move.x += 1
  if (control.space.down) move.y += 1
  if (control.shiftLeft.down) move.y -= 1
  if (control.ctrlLeft?.down) move.y -= 1

  let desiredVelocity = new Vector3()
  if (move.lengthSq() > 0) {
    move.normalize()
    desiredVelocity.copy(move).multiplyScalar(physicalSpeed * delta * 60)
  }

  freecamVelocity.lerp(desiredVelocity.applyQuaternion(control.camera.quaternion), CONFIG.FREECAM_MOVE_LERP)
  control.camera.position.add(freecamVelocity)

  // Rotation when pointer locked
  if (control.pointer.locked) {
    if (!freecamTargetQuat) freecamTargetQuat = control.camera.quaternion.clone()
    const dx = control.pointer.delta.x
    const dy = control.pointer.delta.y
    const eul = new Euler().setFromQuaternion(freecamTargetQuat, 'YXZ')
    const lookSpeed = speedScalar(CONFIG.FREECAM_LOOK_SPEED, RANGES.FREECAM_LOOK_SPEED.min, RANGES.FREECAM_LOOK_SPEED.max)
    eul.y -= dx * lookSpeed
    eul.x -= dy * lookSpeed
    eul.x = Math.max(-Math.PI/2 + 0.01, Math.min(Math.PI/2 - 0.01, eul.x))
    freecamTargetQuat.setFromEuler(eul, 'YXZ')
    control.pointer.delta.x = 0; control.pointer.delta.y = 0
  } else {
    if (freecamTargetQuat) freecamTargetQuat.copy(control.camera.quaternion)
  }

  if (freecamTargetQuat) control.camera.quaternion.slerp(freecamTargetQuat, CONFIG.FREECAM_LOOK_LERP)
}

// Helper: get current key character from props with fallback
function getKeyChar(propKey, fallback) {
  const ch = (app.props && typeof app.props[propKey] === 'string' && app.props[propKey].trim()) ? app.props[propKey].trim() : fallback
  return ch.toUpperCase()
}

console.log('FreeCam: ready (press C for freecam, O for orbit)')
} 
}
