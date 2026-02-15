export default function main(world, app, fetch, props, setTimeout) {
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
}
