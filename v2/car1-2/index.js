export default function main(world, app, fetch, props, setTimeout) {


const body = app.get('Body')
const cMass = app.get('CenterOfMass')
const collider = app.get('Collider')
const springFL = app.get('SpringFL')
const springFR = app.get('SpringFR')
const springBR = app.get('SpringBR')
const springBL = app.get('SpringBL')
const tireFL = app.get('TireFL')
const tireFR = app.get('TireFR')
const tireBR = app.get('TireBR')
const tireBL = app.get('TireBL')
const springs = [springFL, springFR, springBR, springBL]
const springRestLengths = [
  springFL.position.y - tireFL.position.y,
  springFR.position.y - tireFR.position.y,
  springBR.position.y - tireBR.position.y,
  springBL.position.y - tireBL.position.y,
]
const tires = [tireFL, tireFR, tireBR, tireBL]
const tireRadii = [tireFL.position.y, tireFR.position.y, tireBR.position.y, tireBL.position.y]
const turns = [true, true, false, false]
const powered = [true, true, false, false]
const lefts = [true, false, false, true]
const hubs = []
for (let i = 0; i < 4; i++) {
  const hub = app.create('group')
  const tire = tires[i]
  hub.position.copy(tire.position)
  hub.add(tire)
  tire.position.set(0,0,0)
  body.add(hub)
  hubs.push(hub)
}

body.setCenterOfMass(cMass.position)
body.linearDamping = 0.3 // todo: drag prop
body.angularDamping = 3 // todo: angular drag prop

world.attach(body)

const UP = new Vector3(0, 1, 0)
const DOWN = new Vector3(0, -1, 0)
const FORWARD = new Vector3(0, 0, -1)
const LEFT = new Vector3(-1, 0, 0)
const RIGHT = new Vector3(1, 0, 0)

const _v1 = new Vector3()
const _v2 = new Vector3()
const _v3 = new Vector3()
const _v4 = new Vector3()
const _v5 = new Vector3()
const _v6 = new Vector3()
const _q1 = new Quaternion()
const _q2 = new Quaternion()
const _q3 = new Quaternion()
const _q4 = new Quaternion()
const _q5 = new Quaternion()
const _q6 = new Quaternion()
const _m1 = new Matrix4()
const _m2 = new Matrix4()

// Steering
const steerMaxAngle = 35
const steerMinAngle = -35
const steerSpeed = 100
let steerAngle = 0

const velocity = new Vector3()
const up = new Vector3()
const down = new Vector3()
const forward = new Vector3()
const left = new Vector3()
const right = new Vector3()

const control = app.control()

const anchor = app.create('anchor')
anchor.position.y = 2
body.add(anchor)

const accelAmount = 20
const decelAmount = 20

const springStrength = 20
const springDamper = 10

world.getPlayer().applyEffect({ anchor })

app.on('fixedUpdate', delta => {
  // read simulation
  body.getLinearVelocity(velocity)
  up.copy(UP).applyQuaternion(body.quaternion)
  down.copy(DOWN).applyQuaternion(body.quaternion)
  forward.copy(FORWARD).applyQuaternion(body.quaternion)
  left.copy(LEFT).applyQuaternion(body.quaternion)
  right.copy(RIGHT).applyQuaternion(body.quaternion)
  const magnitude = velocity.length()
  const speed = _v1.copy(forward).dot(velocity)
  const kmph = speed * 3.6 // m/s -> km/h
  const isMovingForward = velocity.dot(forward) > 0

  // acceleration/deceleration
  let accel = 0
  if (control.keyW.down) accel = accelAmount
  else if (control.keyS.down) accel = -decelAmount

  // steering
  if (control.keyA.down) steerAngle += steerSpeed * delta
  else if (control.keyD.down) steerAngle -= steerSpeed * delta
  else if (Math.abs(steerAngle) < 5) steerAngle = 0
  else if (steerAngle < 0) steerAngle += steerSpeed * delta
  else if (steerAngle > 0) steerAngle -= steerSpeed * delta
  steerAngle = clamp(steerAngle, steerMinAngle, steerMaxAngle)

  let isBraking = accel < 0 && isMovingForward
  let isReversing = accel < 0 && !isMovingForward
  let isGrounded = false

  // apply physics per wheel
  for (let i = 0; i < 4; i++) {
    const spring = springs[i]
    const hub = hubs[i]
    const tire = tires[i]
    const tireRadius = tireRadii[i]
    const springRestLength = springRestLengths[i]
    const springMat = spring.getWorldMatrix(_m1)
    const springPos = _v1.setFromMatrixPosition(springMat)
    const springQua = _q1.setFromRotationMatrix(springMat)
    const springDir = _v2.copy(down).applyQuaternion(springQua)    
    const raycastMaxLength = springRestLength + tireRadius
    const isPowered = powered[i]
    const isLeftSide = lefts[i]
    const isTurned = turns[i]
    const accelAmount = isPowered ? accel : 0
    const hit = world.raycast(springPos, springDir, raycastMaxLength)

    const availableTorque = 0.2 * accelAmount // todo
    const tireMass = 0.05 // todo
    const isHandBraking = false // todo

    const hbrakeGrip = 0 // ???

    const forwardSlip = 0 // todo: prop
    let wheelGrip = 0

    // steering
    if (isTurned) {
      hub.rotation.y = steerAngle * DEG2RAD
    }

    // check grounded
    if (hit) {
      isGrounded = true
    }
    
    // suspension force
    if (hit) {
      // OPTION: can use ground normal or vehicle normal for forces
      const normal = hit.normal
      // const normal = up
      const wheelVel = body.getLocalVelocityAtLocalPos(spring.position, _v4)
      const offset = springRestLength + tireRadius - hit.distance
      const compression = 1 - offset
      const vel = normal.dot(wheelVel)
      const amount = offset * springStrength - vel * springDamper
      const force = _v5.copy(normal).multiplyScalar(amount)
      body.addForceAtLocalPos(force, spring.position)
    }

    // lateral force (wheel grip)
    if (hit) {
      const steerDir = _v1.copy(isLeftSide ? left : right).applyQuaternion(hub.quaternion)
      const wheelVel = body.getLocalVelocityAtLocalPos(hub.position, _v2)
      const wheelMagnitude = wheelVel.length()
      // const forwardVel = v1.copy(_accelDir).dot(wheelVel)
      const steerVel = _v3.copy(steerDir).dot(wheelVel)
      // const slipRatio = clamp(Math.abs(steerVel) / (Math.abs(steerVel) + Math.abs(forwardVel)), 0, 1) || 0 
      const slipRatio = clamp(Math.abs(steerVel) / wheelMagnitude, 0, 1) || 0
      wheelGrip = 1 // TODO: gripCurve.evaluate(sliwpRatio)
      if (isHandBraking) wheelGrip = hbrakeGrip
      const desiredVelChange = -steerVel * wheelGrip
      const desiredAccel = desiredVelChange / delta
      const force = _v4.copy(steerDir).multiplyScalar(tireMass * desiredAccel)
      body.addForceAtLocalPos(force, spring.position)
    }
  
    // acceleration force
    if (hit) {
      const accelDir = _v1.copy(forward).applyQuaternion(hub.quaternion)
      const force = _v2.copy(accelDir).multiplyScalar(availableTorque)
      body.addForceAtLocalPos(force, spring.position)
    }

    // hub position (visual)
    if (hit) {
      hub.position.copy(spring.position)
      hub.position.y -= hit.distance - tireRadius
    } else {
      hub.position.copy(spring.position)
      hub.position.y -= springRestLength // max?
    }

    // tire rotation (visual)
    // - drive wheels that are accelerating spin forcefully on ground up to "forwardSlip" speed and when in the air
    // - otherwise the wheel spins to follow the ground, unless in the air which will slowly come to a stop.
    const powerSpin = isPowered && (!hit || hit && accel && Math.abs(speed) < forwardSlip)
    if (powerSpin) {
      // forceful drive spin
      // Formula: Wheel Angular Acceleration = (Available Power / (Wheel Radius * Wheel Mass)) - ((Grip * Gravity) / Wheel Radius)
      const grip = hit ? wheelGrip : 0.1
      const gravity = 9.81 //* 0.0254
      const wheelAngularAcceleration = (availableTorque / (tireRadius * tireMass)) - ((grip * gravity) / tireRadius)
      // if (!wheel.front && wheel.left) console.log('waa', wheelAngularAcceleration * delta)
      tire.rotation.x += wheelAngularAcceleration * delta
    } else if (hit) {
      // spin to match ground
      if (!isHandBraking) {
        const wheelRotation = ((magnitude * delta) / (2 * Math.PI * tireRadius)) * 360
        const wheelDirection = isMovingForward ? -1 : 1
        tire.rotation.x += wheelRotation * wheelDirection * DEG2RAD
      }
    } else {
      // slow spinning to a halt
      // todo: continue spinning but slow down over time when not touching the ground
    }
  }
})
}
