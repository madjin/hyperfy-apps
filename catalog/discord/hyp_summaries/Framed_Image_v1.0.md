# Framed_Image_v1.0.hyp

## Metadata
- **Author**: Valiant
- **Channel**: #🎨│showcase
- **Date**: 2025-11-01
- **Size**: 23,222 bytes

## Discord Context
> Framed Image. Using primitives for frame and a bunch of options for jazzing things up. non square images require manual width input.

## Blueprint
- **Name**: Framed Image v1.0
- **Version**: 17
- **Model**: `asset://70f1cabcf315fb6d19769609c0f2e9cc798a45165e19bf0e84c161643faef868.glb`
- **Script**: `asset://ba3bd2599a54ce589ad333249b294e0ac97038d3c72bebd50b7587f8b7091338.js`

## Props
- `width`: int = `0`
- `height`: int = `2`
- `fit`: str = `cover`
- `image`: NoneType = `None`
- `transparent`: bool = `True`
- `lit`: bool = `False`
- `shadows`: bool = `True`
- `placeholder`: image → `asset://daaace2f1b595664c0e6f5a10deb494efc13a850d3cf0804b297a634d2003803.png`
- `frameEnabled`: bool = `True`
- `frameThickness`: float = `0.1`
- `frameDepth`: float = `0.2`
- `frameInset`: int = `0`
- `frameZOffset`: int = `0`
- `frameColor`: str = `#000000`
- `frameCastShadow`: bool = `True`
- `frameReceiveShadow`: bool = `False`
- `frameBackboard`: bool = `True`
- `collider`: bool = `True`
- `colliderDepth`: float = `0.2`
- `frameGlow`: bool = `False`
- `frameGlowIntensity`: float = `40.6`
- `frameGlowColor`: str = `#B91C1C`
- `glowOnly`: bool = `True`
- `backboardColor`: str = `#000000`
- `backboardGlow`: bool = `True`
- `colliderMode`: str = `both`
- `panelThin`: bool = `False`
- `disco`: bool = `False`
- `discoSpeed`: float = `0.2`
- `discoTarget`: str = `frame`

## Assets
- `[model]` 70f1cabcf315fb6d19769609c0f2e9cc798a45165e19bf0e84c161643faef868.glb (2,620 bytes)
- `[script]` ba3bd2599a54ce589ad333249b294e0ac97038d3c72bebd50b7587f8b7091338.js (13,806 bytes)
- `[texture]` daaace2f1b595664c0e6f5a10deb494efc13a850d3cf0804b297a634d2003803.png (2,498 bytes)
- `[image]` daaace2f1b595664c0e6f5a10deb494efc13a850d3cf0804b297a634d2003803.png (2,498 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.get()`, `app.on()`, `app.remove()`, `app.send()`
**Events Listened**: `rebuildFrame`, `update`
**Nodes Created**: `collider`, `image`, `prim`, `rigidbody`

## Keywords (for Discord search)
above, aspect, auto, avoid, back, backBoard, backboard, backboardColor, backboardGlow, backboardSection, baseY, behind, bigStep, black, both, bottom, bottomBar, build, button, castShadow

## Script Source
```javascript
// Image + Primitive Frame
// + Frame/Backboard glow
// + Collider modes: Off, Panel only, Frame only, Both
// + Z-fighting fix: backboard slightly behind image; image transparency obeys toggle
// + Collider depth: frame colliders use frameDepth; panel collider can optionally be thin (0.02m)
// + Auto vertical offset = rim thickness (t) when frame is enabled (keeps bottom bar above ground)

app.configure([
  { key: 'placeholder', type: 'file', kind: 'image', label: 'Placeholder', hidden: true },
  { key: 'image', type: 'file', kind: 'image', label: 'Image', hint: 'The image to display.' },

  { key: 'surface', type: 'section', label: 'Surface' },
  { key: 'width', type: 'number', label: 'Width', dp: 1, step: 0.1, bigStep: 1, initial: 0,
    hint: '0 = auto from height & aspect' },
  { key: 'height', type: 'number', label: 'Height', dp: 1, step: 0.1, bigStep: 1, initial: 1,
    hint: '0 = auto from width & aspect' },
  { key: 'fit', type: 'switch', label: 'Fit',
    options: [
      { label: 'Stretch', value: 'none' },
      { label: 'Cover',  value: 'cover' },
      { label: 'Contain',value: 'contain' },
    ],
    initial: 'none' },
  { key: 'transparent', type: 'toggle', label: 'Transparent' },
  { key: 'lit', type: 'toggle', label: 'Lit' },
  { key: 'shadows', type: 'toggle', label: 'Shadows' },

  { key: 'frame', type: 'section', label: 'Frame' },
  { key: 'frameEnabled', type: 'toggle', label: 'Enable Frame', initial: true },
  { key: 'frameThickness', type: 'number', label: 'Rim Thickness (m)', dp: 3, step: 0.005, bigStep: 0.05, initial: 0.1 },
  { key: 'frameDepth', type: 'number', label: 'Depth (m)', dp: 3, step: 0.005, bigStep: 0.05, initial: 0.2 },
  { key: 'frameZOffset', type: 'number', label: 'Z Offset (m)', dp: 3, step: 0.005, bigStep: 0.05, initial: 0.02 },
  { key: 'frameColor', type: 'color', label: 'Frame Color', initial: '#000000' },
  { key: 'frameCastShadow', type: 'toggle', label: 'Frame Casts Shadow', initial: true },
  { key: 'frameReceiveShadow', type: 'toggle', label: 'Frame Receives Shadow', initial: true },

  // Frame glow
  { key: 'frameGlow', type: 'toggle', label: 'Frame Glow (Emissive)', initial: false },
  { key: 'frameGlowIntensity', type: 'range', label: 'Glow Intensity', min: 0, max: 50, step: 0.1, initial: 1.5 },
  { key: 'frameGlowColor', type: 'color', label: 'Glow Color', initial: '#B91C1C' },

  // Backboard
  { key: 'backboardSection', type: 'section', label: 'Backboard' },
  { key: 'frameBackboard', type: 'toggle', label: 'Add Backboard', initial: false },
  { key: 'backboardColor', type: 'color', label: 'Backboard Color', initial: '#000000' },
  { key: 'backboardGlow', type: 'toggle', label: 'Backboard Affected by Glow', initial: false },

  // Collider
  { key: 'colliderSection', type: 'section', label: 'Collider' },
  {
    key: 'colliderMode',
    type: 'switch',
    label: 'Collider Mode',
    options: [
      { label: 'Off', value: 'off' },
      { label: 'Panel only', value: 'panel' },
      { label: 'Frame only', value: 'frame' },
      { label: 'Both', value: 'both' },
    ],
    initial: 'both',
  },
  { key: 'panelThin', type: 'toggle', label: 'Use Thin Panel Collider', initial: false },

  // Disco Mode
  { key: 'discoSection', type: 'section', label: 'Disco Mode' },
  { key: 'disco', type: 'toggle', label: 'Enable Disco (Emissive only)', initial: false },
  { key: 'discoSpeed', type: 'range', label: 'Speed (cycles/sec)', min: 0, max: 2, step: 0.05, initial: 0.25 },
  {
    key: 'discoTarget',
    type: 'switch',
    label: 'Target',
    options: [
      { label: 'Frame', value: 'frame' },
      { label: 'Backboard', value: 'back' },
      { label: 'Both', value: 'both' },
    ],
    initial: 'frame',
  },

  { key: 'rebuild', type: 'button', label: 'Rebuild', onClick: () => app.send('rebuildFrame') },
])

app.keepActive = true

// ── Image
const src = props.image?.url || props.placeholder?.url
const widthProp  = props.width === 0 ? null : props.width
const heightProp = props.height === 0 ? null : props.height

const oldSurface = app.get('Surface')
app.remove(oldSurface)

const image = app.create('image')
image.pivot = 'bottom-center'
image.src = src
image.width = widthProp
image.height = heightProp
image.fit = props.fit
image.color = props.transparent ? 'transparent' : 'black'
image.transparent = !!props.transparent // only transparent if requested
image.doubleside = true
image.lit = props.lit
image.castShadow = props.shadows
image.receiveShadow = props.shadows
app.add(image)

// ── Frame props
const frameEnabled = !!props.frameEnabled
const t = Math.max(0, props.frameThickness ?? 0.1) // bar thickness (Y for horizontals)
const d = Math.max(0, props.frameDepth ?? 0.2)     // bar depth (Z) — used for visuals and colliders (rim)
const zOff = props.frameZOffset ?? 0.02
const frameColor = props.frameColor || '#000000'
const fCast = props.frameCastShadow ?? true
const fRecv = props.frameReceiveShadow ?? true

// ── Glow
const frameGlow = !!props.frameGlow
const frameGlowIntensity = Math.max(0, Math.min(50, props.frameGlowIntensity ?? 1.5))
const frameGlowColor = props.frameGlowColor || frameColor

// ── Backboard props
const wantBack = !!props.frameBackboard
const backboardColor = props.backboardColor || '#000000'
const backboardGlow = !!props.backboardGlow

// ── Collider props & nodes
const colliderMode = props.colliderMode || 'both'
const useThinPanel = !!props.panelThin
const PANEL_THIN_Z = 0.02

let rb = null
let colPanel = null, colBottom = null, colTop = null, colLeft = null, colRight = null

function clearColliderNode(n){ if (n){ app.remove(n); return null } return null }

function ensureRigidBody(on){
  if (!on){
    colPanel = clearColliderNode(colPanel)
    colBottom = clearColliderNode(colBottom)
    colTop = clearColliderNode(colTop)
    colLeft = clearColliderNode(colLeft)
    colRight = clearColliderNode(colRight)
    rb = clearColliderNode(rb)
    return
  }
  if (!rb){
    rb = app.create('rigidbody')
    rb.type = 'static'
    app.add(rb)
  }
}

function ensurePanelCollider(){
  if (!colPanel){ colPanel = app.create('collider'); colPanel.type = 'box'; rb.add(colPanel) }
}
function ensureFrameColliders(){
  if (!colBottom){ colBottom = app.create('collider'); colBottom.type = 'box'; rb.add(colBottom) }
  if (!colTop){ colTop = app.create('collider'); colTop.type = 'box'; rb.add(colTop) }
  if (!colLeft){ colLeft = app.create('collider'); colLeft.type = 'box'; rb.add(colLeft) }
  if (!colRight){ colRight = app.create('collider'); colRight.type = 'box'; rb.add(colRight) }
}
function removePanelCollider(){ colPanel = clearColliderNode(colPanel) }
function removeFrameColliders(){
  colBottom = clearColliderNode(colBottom)
  colTop = clearColliderNode(colTop)
  colLeft = clearColliderNode(colLeft)
  colRight = clearColliderNode(colRight)
}

// ── Frame prims
function makeBox() {
  const n = app.create('prim', {
    type: 'box',
    scale: [1,1,1],
    position: [0,0,0],
    color: frameColor,
    castShadow: fCast,
    receiveShadow: fRecv,
    doubleside: false,
    metalness: 0,
    roughness: 1,
  })
  app.add(n)
  return n
}
let topBar = null, bottomBar = null, leftBar = null, rightBar = null, backBoard = null
function ensureBars() {
  if (!topBar)    topBar    = makeBox()
  if (!bottomBar) bottomBar = makeBox()
  if (!leftBar)   leftBar   = makeBox()
  if (!rightBar)  rightBar  = makeBox()
  if (wantBack) {
    if (!backBoard) backBoard = makeBox()
  } else if (backBoard) {
    app.remove(backBoard); backBoard = null
  }
}

// ── Style helpers
function styleBar(n){
  n.color = frameColor
  n.castShadow = fCast
  n.receiveShadow = fRecv
  if (frameGlow) {
    n.emissive = frameGlowColor
    n.emissiveIntensity = frameGlowIntensity
  } else {
    n.emissive = null
    n.emissiveIntensity = 0
  }
  n.visible = true
}
function styleBackboard(n){
  n.color = backboardColor
  n.castShadow = fCast
  n.receiveShadow = fRecv
  if (backboardGlow) {
    n.emissive = backboardColor
    n.emis

// ... truncated ...
```

---
*Extracted from Framed_Image_v1.0.hyp. Attachment ID: 1434190156939923516*