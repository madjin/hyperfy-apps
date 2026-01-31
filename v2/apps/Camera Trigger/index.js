export default function main(world, app, fetch, props, setTimeout) {
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
}
