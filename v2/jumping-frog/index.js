export default function main(world, app, fetch, props, setTimeout) {
app.remove(app.get('Block'))
/**
 * changelog:
 * - create: make a weird jumping frog
 */

const frog = app.create('group')

// Structure: frog -> hop -> squash -> parts
const hop = app.create('group')
frog.add(hop)

const squash = app.create('group')
hop.add(squash)

// Colors
const green = '#2aff5e'
const darkGreen = '#1aba44'
const belly = '#d6ffcf'
const eyeWhite = '#ffffff'
const pupilBlack = '#222222'
const tongueRed = '#ff4a4a'
const spot = '#1e8f4a'

// Dimensions
const bodyR = 0.16
const headR = 0.11
const bodyY = 0.19
const headY = bodyY + bodyR * 0.9 + headR * 0.35

// Body
const body = app.create('prim', {
  type: 'sphere',
  size: [bodyR],
  color: green,
})
body.position.set(0, bodyY, 0)
squash.add(body)

// Belly patch
const bellyPatch = app.create('prim', {
  type: 'sphere',
  size: [bodyR * 0.82],
  color: belly,
  opacity: 0.95,
})
bellyPatch.position.set(0, bodyY - bodyR * 0.15, bodyR * 0.35)
squash.add(bellyPatch)

// Head
const head = app.create('prim', {
  type: 'sphere',
  size: [headR],
  color: green,
})
head.position.set(0, headY, bodyR * 0.18)
squash.add(head)

// Eyes
function makeEye(x) {
  const eye = app.create('group')
  const bulb = app.create('prim', {
    type: 'sphere',
    size: [headR * 0.28],
    color: eyeWhite,
    emissive: eyeWhite,
    emissiveIntensity: 1.8,
  })
  const pupil = app.create('prim', {
    type: 'sphere',
    size: [headR * 0.12],
    color: pupilBlack,
    emissive: pupilBlack,
    emissiveIntensity: 0.3,
  })
  bulb.position.set(0, 0, 0)
  pupil.position.set(0, 0, headR * 0.21)
  eye.add(bulb)
  eye.add(pupil)
  eye.position.set(x, headR * 0.55, headR * 0.15)
  return eye
}
const eyeL = makeEye(-headR * 0.48)
const eyeR = makeEye(headR * 0.48)
head.add(eyeL)
head.add(eyeR)

// Tongue (weird bit)
const tongueLenMax = 0.28
const tongue = app.create('prim', {
  type: 'box',
  size: [0.04, 0.02, tongueLenMax],
  color: tongueRed,
  emissive: tongueRed,
  emissiveIntensity: 2.2,
})
// Start retracted
tongue.scale.set(1, 1, 0.001)
tongue.position.set(0, -headR * 0.2, headR * 0.35)
head.add(tongue)

// Spots on back (subtle weirdness)
function makeSpot(x, y, z, r, c) {
  const s = app.create('prim', {
    type: 'sphere',
    size: [r],
    color: c,
    opacity: 0.9,
  })
  s.position.set(x, y, z)
  return s
}
squash.add(makeSpot(-0.07, bodyY + bodyR * 0.25, -0.02, bodyR * 0.18, darkGreen))
squash.add(makeSpot(0.06, bodyY + bodyR * 0.05, -0.05, bodyR * 0.14, darkGreen))
squash.add(makeSpot(0.02, bodyY + bodyR * 0.32, 0.02, bodyR * 0.12, spot))
squash.add(makeSpot(-0.01, bodyY - bodyR * 0.05, -0.08, bodyR * 0.1, spot))

// Legs (hind)
function makeHindLeg(side) {
  const sgn = side // -1 for left, +1 for right
  const thighLen = 0.14
  const shinLen = 0.15
  const footW = 0.12
  const footH = 0.02
  const footD = 0.06

  const leg = app.create('group')
  leg.position.set(sgn * 0.12, 0, 0.06) // foot contact point at ground

  // Thigh pivot at foot
  const thighPivot = app.create('group')
  thighPivot.position.set(0, 0, 0)
  leg.add(thighPivot)

  const thigh = app.create('prim', {
    type: 'cylinder',
    size: [0.035, 0.05, thighLen],
    color: green,
  })
  thigh.position.set(0, thighLen * 0.5, 0)
  thighPivot.add(thigh)

  // Shin pivot at knee (end of thigh)
  const shinPivot = app.create('group')
  shinPivot.position.set(0, thighLen, 0)
  thighPivot.add(shinPivot)

  const shin = app.create('prim', {
    type: 'cylinder',
    size: [0.03, 0.035, shinLen],
    color: green,
  })
  shin.position.set(0, shinLen * 0.5, 0)
  shinPivot.add(shin)

  // Foot at end of shin
  const footPivot = app.create('group')
  footPivot.position.set(0, shinLen, 0)
  shinPivot.add(footPivot)

  const foot = app.create('prim', {
    type: 'box',
    size: [footW, footH, footD],
    color: darkGreen,
  })
  foot.position.set(0, footH * 0.5, footD * 0.25)
  footPivot.add(foot)

  return { leg, thighPivot, shinPivot, footPivot }
}

const leftLeg = makeHindLeg(-1)
const rightLeg = makeHindLeg(1)
squash.add(leftLeg.leg)
squash.add(rightLeg.leg)

// Slight forward lean for character
squash.rotation.x = -6 * DEG2RAD

// Add to world
app.add(frog)

// Animation
const rng = prng(1337)
let phase = rng(0, 1, 3)
const hopSpeed = rng(0.7, 1.05, 3) // cycles per second
const hopHeight = rng(0.18, 0.26, 3) // meters

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x))
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

function animate(delta) {
  phase += delta * hopSpeed
  if (phase > 1) phase -= Math.floor(phase)

  // Timeline segments
  // 0.00-0.20: squat
  // 0.20-0.80: jump arc
  // 0.80-1.00: land/squat
  let squatAmt = 0
  let stretchAmt = 0
  let y = 0

  if (phase < 0.2) {
    const t = phase / 0.2
    squatAmt = easeInOutQuad(t) // 0..1
    y = 0
  } else if (phase < 0.8) {
    const t = (phase - 0.2) / 0.6 // 0..1
    // Jump arc: smooth half sine
    y = Math.sin(Math.PI * t) * hopHeight
    // Stretch more at mid-air
    stretchAmt = Math.sin(Math.PI * t) // 0..1
    squatAmt = 0
  } else {
    const t = (phase - 0.8) / 0.2
    squatAmt = 1 - easeInOutQuad(t)
    y = 0
  }

  // Body squash/stretch with rough volume preservation
  const yScale = 1 - 0.28 * squatAmt + 0.18 * stretchAmt
  const xzScale = 1 + 0.16 * squatAmt - 0.1 * stretchAmt
  squash.scale.set(xzScale, yScale, xzScale)

  // Vertical movement
  hop.position.y = y

  // Leg posing
  // Base pose
  let thighX = -0.32
  let shinX = 0.62

  // Add crouch fold and air extension
  const crouch = clamp(squatAmt, 0, 1)
  const extend = clamp(stretchAmt, 0, 1)

  thighX += -0.45 * crouch + 0.25 * extend
  shinX += 0.55 * crouch - 0.45 * extend

  leftLeg.thighPivot.rotation.x = thighX
  rightLeg.thighPivot.rotation.x = thighX
  leftLeg.shinPivot.rotation.x = shinX
  rightLeg.shinPivot.rotation.x = shinX

  // Tiny forward tilt during air
  squash.rotation.x = (-6 + 4 * extend) * DEG2RAD

  // Tongue flick near jump apex
  const tJump = clamp((phase - 0.2) / 0.6, 0, 1) // 0..1 only during air
  const peak = 1 - Math.abs(tJump - 0.5) * 2 // triangle peak at apex
  const tongueFactor = Math.max(0, peak - 0.3) / 0.7 // gate
  const tz = tongueLenMax * tongueFactor
  // Update tongue length and forward position so base stays at mouth
  tongue.scale.z = Math.max(0.001, tongueFactor)
  tongue.position.z = headR * 0.35 + (tongueLenMax * tongueFactor) * 0.5

  // Subtle eye bob
  eyeL.position.y = headR * 0.55 + 0.01 * extend
  eyeR.position.y = headR * 0.55 + 0.01 * extend
}

app.on('animate', animate)
}
