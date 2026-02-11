# Builder_Drone.hyp

## Metadata
- **Author**: devbyte
- **Channel**: #⚡│general
- **Date**: 2025-04-01
- **Size**: 272,521 bytes

## Discord Context
> I did a quick edit with cursor that lets you configure a keybind and not need to be near the drone. Just hold down the key.

## Blueprint
- **Name**: Builder Drone
- **Version**: 23
- **Model**: `asset://f7f15f38c035ae420dfb98c16c5dbda1a37c9051cdc20b0baa8dc294541cd4ed.glb`
- **Script**: `asset://b295dbbe4d74afed24fca714c4868bdce7d96fc938431d6ecb78ce27e537ca2d.js`

## Props
- `controlKey`: str = `P`
- `holdDuration`: int = `1`

## Assets
- `[model]` f7f15f38c035ae420dfb98c16c5dbda1a37c9051cdc20b0baa8dc294541cd4ed.glb (263,848 bytes)
- `[script]` b295dbbe4d74afed24fca714c4868bdce7d96fc938431d6ecb78ce27e537ca2d.js (7,971 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.control()`, `app.get()`, `app.on()`, `app.remove()`, `app.send()`, `app.sendTo()`
**World Methods**: `world.add()`, `world.getPlayer()`
**Events Listened**: `change`, `fixedUpdate`, `fly`, `flyer`, `init`, `lateUpdate`, `release`, `update`

## Keywords (for Discord search)
access, activeKey, additional, applyQuaternion, arr1, arr2, back, body, broadcast, camera, capture, change, charAt, character, configure, configured, console, control, controlKey, copy

## Script Source
```javascript
const SEND_RATE = 1 / 5

// Configure props for customization
app.configure([
  {
    key: 'controlKey',
    type: 'text',
    label: 'Drone Control Key',
    initial: 'P',
  },
  {
    key: 'holdDuration',
    type: 'number',
    label: 'Hold Duration (seconds)',
    min: 0.1,
    max: 2.0,
    step: 0.1,
    dp: 1,
    initial: 0.5,
  },
])

const v1 = new Vector3()
const v2 = new Vector3()
const q1 = new Quaternion()
const q2 = new Quaternion()
const m1 = new Matrix4()

const body = app.get('RigidBody')
const view = app.get('View')
const rotors = [app.get('RotorFL'), app.get('RotorFR'), app.get('RotorBR'), app.get('RotorBL')]

app.remove(body)
body.position.add(app.position)
body.quaternion.multiply(app.quaternion)

if (world.isServer) {
  body.type = 'dynamic'
  world.add(body)
  const state = app.state
  state.flyer = null
  state.p = body.position.toArray()
  state.q = body.quaternion.toArray()
  state.ready = true
  app.on('fly', (_, playerId) => {
    if (state.flyer) {
      return app.sendTo(playerId, 'flyer', state.flyer)
    }
    state.flyer = playerId
    app.send('flyer', state.flyer)
    body.type = state.flyer ? 'kinematic' : 'dynamic'
  })
  app.on('change', (change, playerId) => {
    if (state.flyer !== playerId) return
    if (change.p) {
      state.p = change.p
      body.position.fromArray(state.p)
    }
    if (change.q) {
      state.q = change.q
      body.quaternion.fromArray(state.q)
    }
    app.send('change', change, playerId)
  })
  app.on('release', (_, playerId) => {
    if (state.flyer !== playerId) return
    state.flyer = null
    app.send('flyer', null)
    body.type = 'dynamic'
  })
  let lastChange = 0
  app.on('fixedUpdate', delta => {
    if (!state.flyer) {
      lastChange += delta
      if (lastChange >= SEND_RATE) {
        lastChange = 0
        let didChange
        const change = {}
        const p = body.position.toArray()
        if (!isArrayEqual(state.p, p)) {
          state.p = p
          change.p = p
          didChange = true
        }
        const q = body.quaternion.toArray()
        if (!isArrayEqual(state.q, q)) {
          state.q = q
          change.q = q
          didChange = true
        }
        if (didChange) {
          app.send('change', change)
        }
      }
    }
  })
  app.send('init', state)
}

if (world.isClient) {
  if (app.state.ready) {
    init(app.state)
  } else {
    app.on('init', init)
  }
  function init(state) {
    const me = world.getPlayer().id
    body.type = 'kinematic'
    body.position.fromArray(state.p)
    body.quaternion.fromArray(state.q)
    world.add(body)
    const target = {
      position: new Vector3(),
      quaternion: new Quaternion(),
      rotation: new Euler(0, 0, 0, 'YXZ'),
    }
    target.rotation._onChange(() => target.quaternion.setFromEuler(target.rotation, false))
    target.quaternion._onChange(() => target.rotation.setFromQuaternion(target.quaternion, undefined, false))

    // Get the configured control key and hold duration
    // Convert input key to format "keyX" (take first character and uppercase it)
    const rawKey = props.controlKey || 'P'
    const keyChar = rawKey.charAt(0).toUpperCase()
    const controlKey = `key${keyChar}`
    const holdDuration = props.holdDuration || 0.5

    // Track control key timing
    let keyHoldTime = 0
    let lastChange = 0

    // Initialize control immediately to track control key even when not flying
    let control = app.control()

    // Make sure the key exists in the control object, fallback to keyP if not
    if (control[controlKey] === undefined) {
      console.warn(`Key "${keyChar}" not found, falling back to P key`)
      control.keyP.capture = true
    } else {
      control[controlKey].capture = true
    }

    let isFlying = false

    app.on('flyer', playerId => {
      state.flyer = playerId

      if (playerId === me) {
        isFlying = true
        target.position.copy(body.position)
        target.quaternion.copy(body.quaternion)

        // Update control to capture additional keys when flying
        control.camera.write = true
        control.keyW.capture = true
        control.keyA.capture = true
        control.keyS.capture = true
        control.keyD.capture = true
        control.space.capture = true
        lastChange = 0
      } else {
        isFlying = false

        // When not flying, only capture control key
        if (control) {
          control.camera.write = false
          control.keyW.capture = false
          control.keyA.capture = false
          control.keyS.capture = false
          control.keyD.capture = false
          control.space.capture = false
        }
      }
    })
    app.on('change', change => {
      if (change.p) {
        state.p = change.p
        target.position.fromArray(state.p)
      }
      if (change.q) {
        state.q = change.q
        target.quaternion.fromArray(state.q)
      }
    })
    app.on('update', delta => {
      if (state.flyer) {
        for (const rotor of rotors) {
          rotor.rotation.y += 40 * delta
        }
      }

      // Handle control key for entering/exiting drone
      // Use safe access with fallback to keyP if controlKey doesn't exist
      const activeKey = control[controlKey] || control.keyP
      if (activeKey.down) {
        keyHoldTime += delta
        if (keyHoldTime >= holdDuration) {
          if (isFlying) {
            keyHoldTime = 0
            app.send('release')
          } else if (!state.flyer) {
            keyHoldTime = 0
            app.send('fly')
          }
        }
      } else {
        keyHoldTime = 0
      }

      if (isFlying) {
        const moveSpeed = control.shiftLeft.down ? 20 : 10
        const move = v1.set(0, 0, 0)
        if (control.keyW.down) move.z -= 1
        if (control.keyS.down) move.z += 1
        if (control.keyA.down) move.x -= 1
        if (control.keyD.down) move.x += 1
        if (move.lengthSq() > 0) {
          move.normalize().multiplyScalar(moveSpeed * delta)
          move.applyQuaternion(target.quaternion)
          target.position.add(move)
        }
        if (control.space.down) {
          target.position.y += moveSpeed * delta
        }
        if (control.keyC.down) {
          target.position.y -= moveSpeed * delta
        }
        if (control.pointer.locked) {
          target.rotation.y -= control.pointer.delta.x * 0.1 * delta
          target.rotation.x -= control.pointer.delta.y * 0.1 * delta
        }
        v2.copy(target.position)
          .sub(body.position)
          .multiplyScalar(10 * delta)
        body.position.add(v2)
        body.quaternion.slerp(target.quaternion, 20 * delta)
        // broadcast updates
        lastChange += delta
        if (lastChange >= SEND_RATE) {
          lastChange = 0
          let didChange
          const change = {}
          const p = body.position.toArray()
          if (!isArrayEqual(state.p, p)) {
            state.p = p
            change.p = p
            didChange = true
          }
          const q = body.quaternion.toArray()
          if (!isArrayEqual(state.q, q)) {
            state.q = q
            change.q = q
            didChange = true
          }
          if (didChange) {
            app.send('change', change)
          }
        }
      } else {
        body.position.lerp(target.position, 2 * delta)
        body.quaternion.slerp(target.quaternion, 2 * delta)
      }
    })
    app.on('lateUpdate', delta => {
      if (control) {
        const matrix = view.getWorldMatrix(m1)
        control.camera.position.setFromMatrixPosition(matrix)
        control.camera.quaternion.setFromRotationMatrix(matrix)
        control.camera.zoom = 0
      }
    })
  }
}

// ==================================================
// Utils
function isArrayEqual(arr1, arr2) {
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false
    }
  }
  return true
}
// ==================================================

```

---
*Extracted from Builder_Drone.hyp. Attachment ID: 1356446200651452477*