# Camera_Trigger.hyp

## Metadata
- **Author**: Dhin
- **Channel**: #🧊│3d-design
- **Date**: 2025-10-15
- **Size**: 6,396 bytes

## Discord Context
> <@849162940699115530> 
This could potentially be pretty cool for a museum type environment.
It's a trigger that while standing on it changes the camera view. Would require setup but may give more control than the jumper.

## Blueprint
- **Name**: Camera Trigger
- **Version**: 85
- **Model**: `asset://ai.glb`
- **Script**: `asset://2d84b03ec6bb561e5b871208cccce27d868f9f99731e2c55bab337a67b40ffd2.js`

## Props
- `prompt`: str = `a sphere`
- `createdAt`: float = `6943.546197899999`
- `cameraHeight`: int = `5`
- `cameraDistance`: int = `7`
- `proximityDistance`: int = `5`

## Assets
- `[model]` ai.glb (3,380 bytes)
- `[script]` 2d84b03ec6bb561e5b871208cccce27d868f9f99731e2c55bab337a67b40ffd2.js (2,347 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.control()`, `app.create()`, `app.get()`, `app.off()`, `app.on()`, `app.remove()`
**World Methods**: `world.getPlayer()`
**Events Listened**: `update`
**Nodes Created**: `prim`

## Keywords (for Discord search)
above, avoid, back, blue, bottom, camera, center, centered, clone, color, control, create, delta, disorientation, enterTriggerCameraView, exitTriggerCameraView, ff0000, getPlayer, ground, high

## Script Source
```javascript
app.remove(app.get('Block'))

const triggerZone = app.create('prim', {
  type: 'box',
  size: [1, 0.2, 1], // 10x10x10 meters
  position: [0, 0, 0], // centered, bottom on ground
  opacity: 0.3, // semi-transparent
  color: '#0000ff', // blue when idle
  physics: 'static',
  trigger: true, // treat as trigger
  
  onTriggerEnter: e => {
    if (!e.isLocalPlayer) return
    triggerZone.color = '#ff0000' // red when inside
    enterTriggerCameraView()
  },
  onTriggerLeave: e => {
    if (!e.isLocalPlayer) return
    triggerZone.color = '#0000ff' // blue when outside
    exitTriggerCameraView()
  }
})

let control = null
const transitionDuration = 0.5 // seconds

function enterTriggerCameraView() {
  if (world.isClient) {
    control = app.control()
    if (!control) return
    control.camera.write = true
    const targetPos = new Vector3(5, 5, 5) // high overlook: 5m above, 5m back from center
    const lookAt = new Vector3(0, 2, 0) // look at trigger center
    const lookDir = lookAt.clone().sub(targetPos).normalize()
    const upVector = new Vector3(0, 1, 0)
    const rotationMatrix = new Matrix4().lookAt(new Vector3(0, 0, 0), lookDir, upVector)
    const targetRot = new Quaternion().setFromRotationMatrix(rotationMatrix)

    let progress = 0
    const update = delta => {
      progress = Math.min(progress + delta / transitionDuration, 1)
      control.camera.position.lerp(targetPos, progress)
      control.camera.quaternion.slerp(targetRot, progress)
      if (progress === 1) app.off('update', update)
    }
    app.on('update', update)
  }
}

function exitTriggerCameraView() {
  if (world.isClient && control) {
    const player = world.getPlayer()
    if (!player) return
    const startPos = control.camera.position.clone()
    const targetPos = new Vector3(player.position._x, player.position._y + 1.6, player.position._z) // player eye level

    let progress = 0
    const update = delta => {
      progress = Math.min(progress + delta / transitionDuration, 1)
      control.camera.position.lerpVectors(startPos, targetPos, progress)
      // Skip rotation interpolation to avoid disorientation
      if (progress === 1) {
        control.camera.write = false
        control.release()
        control = null
        app.off('update', update)
      }
    }
    app.on('update', update)
  }
}

app.add(triggerZone)
```

---
*Extracted from Camera_Trigger.hyp. Attachment ID: 1428031026504142888*