# Builder_Drone_X501.hyp

## Metadata
- **Author**: ash
- **Channel**: #🎨│showcase
- **Date**: 2025-04-01
- **Size**: 271,102 bytes

## Discord Context
> fixed an issue where if you refresh while flying the drone it doesn't release it

## Blueprint
- **Name**: Builder Drone X501
- **Version**: 1
- **Model**: `asset://f7f15f38c035ae420dfb98c16c5dbda1a37c9051cdc20b0baa8dc294541cd4ed.glb`
- **Script**: `asset://ce8a64d42625b74471cfb5d7a08c88b2c5904949ae1fa2aef4b7e2179dada371.js`

## Assets
- `[model]` f7f15f38c035ae420dfb98c16c5dbda1a37c9051cdc20b0baa8dc294541cd4ed.glb (263,848 bytes)
- `[script]` ce8a64d42625b74471cfb5d7a08c88b2c5904949ae1fa2aef4b7e2179dada371.js (6,581 bytes)

## Script Analysis
**App Methods**: `app.control()`, `app.create()`, `app.get()`, `app.on()`, `app.remove()`, `app.send()`, `app.sendTo()`
**World Methods**: `world.add()`, `world.getPlayer()`, `world.on()`
**Events Listened**: `change`, `fixedUpdate`, `fly`, `flyer`, `init`, `lateUpdate`, `leave`, `release`, `update`
**Nodes Created**: `action`

## Keywords (for Discord search)
action, applyQuaternion, arr1, arr2, body, broadcast, camera, capture, change, console, control, copy, create, delta, didChange, down, dynamic, fixedUpdate, flyer, fromArray

## Script Source
```javascript
const SEND_RATE = 1 / 5

const v1 = new Vector3()
const v2 = new Vector3()
const q1 = new Quaternion()
const q2 = new Quaternion()
const m1 = new Matrix4()

const body = app.get('RigidBody')
const view = app.get('View')
const rotors = [
  app.get('RotorFL'),
  app.get('RotorFR'),
  app.get('RotorBR'),
  app.get('RotorBL'),
]

app.remove(body)

if (world.isServer) {
  body.type = 'dynamic'
  body.position.copy(app.position)
  body.quaternion.copy(app.quaternion)
  world.add(body)
  const state = app.state
  state.flyer = null
  state.p = body.position.toArray()
  state.q = body.quaternion.toArray()
  state.ready = true
  world.on('leave', e => {
    if (state.flyer === e.playerId) {
      state.flyer = null
      app.send('flyer', null)
      body.type = 'dynamic'
    }
  })
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
      position: new Vector3().copy(body.position),
      quaternion: new Quaternion().copy(body.quaternion),
      rotation: new Euler(0, 0, 0, 'YXZ')
    }
    target.rotation._onChange(() => target.quaternion.setFromEuler(target.rotation, false))
    target.quaternion._onChange(() => target.rotation.setFromQuaternion(target.quaternion, undefined, false))
    const action = app.create('action', {
      label: 'Fly',
      position: [0, 0.7, 0],
      onTrigger: () => {
        body.remove(action)
        app.send('fly')
      }
    })
    if (!state.flyer) body.add(action)
    let control
    let lastChange = 0
    app.on('flyer', playerId => {
      state.flyer = playerId
      if (state.flyer !== me) body.remove(action)
      if (!state.flyer) body.add(action)
      if (playerId === me) {
        target.position.copy(body.position)
        target.quaternion.copy(body.quaternion)
        control = app.control()
        control.camera.write = true
        control.keyW.capture = true
        control.keyA.capture = true
        control.keyS.capture = true
        control.keyD.capture = true
        control.space.capture = true
        lastChange = 0
      } else {
        control?.release()
        control = null
      }
    })
    app.on('change', change => {
      console.log(change)
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
      if (control) {
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
        if (control.keyQ.pressed) {
          app.send('release')
        }
        v2.copy(target.position).sub(body.position).multiplyScalar(10 * delta)
        body.position.add(v2)
        body.quaternion.slerp(target.quaternion, 20 * delta);
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
*Extracted from Builder_Drone_X501.hyp. Attachment ID: 1356755804694515833*