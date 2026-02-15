# NPC_Prisoner.hyp

## Metadata
- **Author**: b34k3r
- **Channel**: #💻│developers
- **Date**: 2025-10-12
- **Size**: 4,851,152 bytes

## Discord Context
> I think these are <@688215116457443346>'s

## Blueprint
- **Name**: NPC_Prisoner
- **Version**: 13
- **Model**: `asset://936171d901e0fe0543353e320ea89a40fef117fe535c0b81d93b90ef3e995fe8.vrm`
- **Script**: `asset://1ba69c1b18c43fee30bce596e3e6c3fee90783e1d0b8291b17f9ea5a0ce0f013.js`

## Props
- `emote`: emote → `asset://43aa6ecfccf3a111926b31a1865bc5875d22c9c54c7d3ad501aeb829082e7a08.glb`
- `avatar`: avatar → `asset://268b12ee20dda8564f18e929924f60c164270e122884466908b1ce44d61d92e8.vrm`
- `walk`: emote → `asset://fb2ffd4513c0ef0fd3018b0454004908e4f6ca913309c0e76bc7f118fd217c83.glb`
- `idle`: emote → `asset://f6feee9b30142d02d2bc543d5ddca2db475a06798cd86cf86d9d167e049518b4.glb`
- `talk`: emote → `asset://07b3242f54f8d99b830605de5dfa0d7a1e8ba34ab3949c0cb2a9cf9f6a8ca4a3.glb`

## Assets
- `[avatar]` 936171d901e0fe0543353e320ea89a40fef117fe535c0b81d93b90ef3e995fe8.vrm (1,656,952 bytes)
- `[script]` 1ba69c1b18c43fee30bce596e3e6c3fee90783e1d0b8291b17f9ea5a0ce0f013.js (3,857 bytes)
- `[emote]` 43aa6ecfccf3a111926b31a1865bc5875d22c9c54c7d3ad501aeb829082e7a08.glb (58,476 bytes)
- `[avatar]` 268b12ee20dda8564f18e929924f60c164270e122884466908b1ce44d61d92e8.vrm (2,324,724 bytes)
- `[emote]` fb2ffd4513c0ef0fd3018b0454004908e4f6ca913309c0e76bc7f118fd217c83.glb (123,908 bytes)
- `[emote]` f6feee9b30142d02d2bc543d5ddca2db475a06798cd86cf86d9d167e049518b4.glb (511,580 bytes)
- `[emote]` 07b3242f54f8d99b830605de5dfa0d7a1e8ba34ab3949c0cb2a9cf9f6a8ca4a3.glb (169,528 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.create()`, `app.get()`, `app.on()`
**World Methods**: `world.add()`
**Events Listened**: `fixedUpdate`, `update`
**Nodes Created**: `controller`

## Keywords (for Discord search)
alpha, angles, animation, apply, avatar, based, chance, change, configure, controller, copy, create, ctrl, defined, delta, direction, directionAngles, directionIndex, drift, driftAmount

## Script Source
```javascript
app.configure([
  {
    key: 'walk',
    type: 'file',
    kind: 'emote',
    label: 'Walk',
  },
  {
    key: 'idle',
    type: 'file',
    kind: 'emote',
    label: 'Idle',
  },
  {
    key: 'talk',
    type: 'file',
    kind: 'emote',
    label: 'Talk',
  }
])

const v1 = new Vector3()
const q1 = new Quaternion()
const FORWARD = new Vector3(0, 0, -1)

// Create the controller
const ctrl = app.create('controller', {
  position: app.position.toArray(),
  radius: 0.3,
  height: 1,
})
world.add(ctrl)

// Set up the avatar
const src = props.avatar?.url
const avatar = app.get('avatar')
avatar.position.set(0, 0, 0)
avatar.quaternion.set(0, 0, 0, 1)
ctrl.add(avatar)
avatar.emote = props.walk?.url // Start with walking

// Movement variables
const dir = new Vector3(0.7, 0, 1).normalize()
const move = new Vector3()
const gravity = 8
const speed = 1.7

// Direction change variables
let frameCounter = 0
let nextDirectionChange = 180 // Starting interval (~3 seconds at 60 FPS)
const minTurnInterval = 120 // ~2 seconds
const maxTurnInterval = 300 // ~5 seconds
let directionIndex = 0
const directionAngles = [0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4, Math.PI, 5 * Math.PI / 4, 3 * Math.PI / 2, 7 * Math.PI / 4]

// State variables
let state = 'walking' // 'walking', 'idle', or 'talking'
let stateCounter = 0
const idleDuration = 450 // ~1 second
const talkDuration = 300 // ~2 seconds

// Pseudo-random sequence for variation
let seed = 12345
function pseudoRandom() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff
  return (seed / 0x7fffffff) // Normalize to 0-1
}

// Function to set direction based on pre-defined angles
function updateDirection() {
  const theta = directionAngles[directionIndex]
  dir.set(Math.cos(theta), 0, Math.sin(theta)).normalize()
  directionIndex = (directionIndex + 1) % directionAngles.length
  nextDirectionChange = minTurnInterval + Math.floor(pseudoRandom() * (maxTurnInterval - minTurnInterval))
}

// Function to add slight drift to direction
function driftDirection(delta) {
  const driftAmount = 0.1 * delta
  const driftAngle = pseudoRandom() * driftAmount - (driftAmount / 2)
  const newX = dir.x * Math.cos(driftAngle) - dir.z * Math.sin(driftAngle)
  const newZ = dir.x * Math.sin(driftAngle) + dir.z * Math.cos(driftAngle)
  dir.set(newX, 0, newZ).normalize()
}

// Function to update NPC state and animation
function updateState() {
  if (state === 'walking') {
    if (frameCounter >= nextDirectionChange) {
      updateDirection()
      frameCounter = 0
      const rand = pseudoRandom()
      if (rand < 0.3) { // 30% chance to pause
        state = 'idle'
        stateCounter = 0
        avatar.emote = props.idle?.url
      } else if (rand < 0.4) { // 10% chance to talk (30% to 40%)
        state = 'talking'
        stateCounter = 0
        avatar.emote = props.talk?.url
      }
    }
  } else if (state === 'idle' && stateCounter >= idleDuration) {
    state = 'walking'
    stateCounter = 0
    avatar.emote = props.walk?.url
  } else if (state === 'talking' && stateCounter >= talkDuration) {
    state = 'walking'
    stateCounter = 0
    avatar.emote = props.walk?.url
  }
}

app.on('fixedUpdate', delta => {
  frameCounter++
  stateCounter++

  if (state === 'walking') {
    // Subtle direction drift
    driftDirection(delta)

    // Check for state change (includes direction update)
    updateState()

    // Calculate and apply movement
    move.copy(dir)
    move.y -= gravity
    move.multiplyScalar(speed * delta)
    ctrl.move(move)
  } else {
    // Idle or talking: only apply gravity
    move.set(0, -gravity, 0).multiplyScalar(delta)
    ctrl.move(move)
    updateState()
  }
})

app.on('update', delta => {
  const alpha = 1 - Math.pow(0.00000001, delta)
  q1.setFromUnitVectors(FORWARD, dir)
  avatar.quaternion.slerp(q1, alpha) // Smoothly rotate to face direction
})
```

---
*Extracted from NPC_Prisoner.hyp. Attachment ID: 1426847074359447674*