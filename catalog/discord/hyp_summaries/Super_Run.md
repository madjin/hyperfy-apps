# Super_Run.hyp

## Metadata
- **Author**: Dhin
- **Channel**: #🎨│showcase
- **Date**: 2025-12-02
- **Size**: 362,243 bytes

## Discord Context
> Super run. Put this hyp down and run for longer than 1 second for speeed.
Made with <@297290503181959169>

## Blueprint
- **Name**: Super Run
- **Version**: 22
- **Model**: `asset://97fc7289a38b5b49357e6fbd74e7e77fc78493dbb1c0dbc850cb8e9db9fd2530.glb`
- **Script**: `asset://21c88787a5a680bf91e72b637f44c9351d985b4f43c4e28d262bc371cafdee62.js`

## Props
- `collision`: bool = `True`
- `flipEmote`: emote → `asset://2dd66d8373afa804d20dc00b831ecc161b1fb78192e00ffb9824832ac3a990fc.glb`
- `doubleJumpEmote`: emote → `asset://2dd66d8373afa804d20dc00b831ecc161b1fb78192e00ffb9824832ac3a990fc.glb`
- `superRunEmote`: emote → `asset://247e84bc4556258e30d3e60908446c0d5a082174f12c20fea62b13c83f51440b.glb`
- `deactivationTime`: float = `0.5`

## Assets
- `[model]` 97fc7289a38b5b49357e6fbd74e7e77fc78493dbb1c0dbc850cb8e9db9fd2530.glb (3,380 bytes)
- `[script]` 21c88787a5a680bf91e72b637f44c9351d985b4f43c4e28d262bc371cafdee62.js (2,100 bytes)
- `[texture]` 39ad1b405cbf41a90825dadf0b554f3c3baba634636bb94a1057dd8ec0784c86.png (2,777 bytes)
- `[emote]` 2dd66d8373afa804d20dc00b831ecc161b1fb78192e00ffb9824832ac3a990fc.glb (85,768 bytes)
- `[emote]` 2dd66d8373afa804d20dc00b831ecc161b1fb78192e00ffb9824832ac3a990fc.glb (85,768 bytes)
- `[emote]` 247e84bc4556258e30d3e60908446c0d5a082174f12c20fea62b13c83f51440b.glb (180,624 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.control()`, `app.on()`
**World Methods**: `world.createLayerMask()`, `world.getPlayer()`, `world.raycast()`
**Events Listened**: `update`

## Keywords (for Discord search)
applyEffect, applyQuaternion, camera, cancellable, capture, clone, configure, control, copy, createLayerMask, distance, down, duration, emote, environment, file, getForwardDirection, getPlayer, isClient, isGrounded

## Script Source
```javascript
app.configure([
  {
    key: 'superRunEmote',
    type: 'file',
    kind: 'emote',
    label: 'Super Run Emote',
  },
])

const PLAYER_HALF_HEIGHT = 0.8
const ACTIVATION_TIME = 1
const EXTRA_SPEED = 30
const DEACTIVATION_TIME = 0.5
const layerMask = world.createLayerMask('environment')

if (world.isClient) {
  const { superRunEmote } = app.props
  const player = world.getPlayer()
  const control = app.control()
  let runTime = 0
  let superActive = false

  const tempVec = new Vector3()
  const tempQuat = new Quaternion()
  const tempEuler = new Euler(0, 0, 0, 'YXZ')

  function getForwardDirection(outVec) {
    tempEuler.setFromQuaternion(control.camera.quaternion)
    tempEuler.x = 0
    tempEuler.z = 0
    tempQuat.setFromEuler(tempEuler)
    return outVec.copy(new Vector3(0, 0, -1)).applyQuaternion(tempQuat)
  }

  function isGrounded() {
    if (!player?.position) return true
    const hit = world.raycast(
      player.position.clone(),
      new Vector3(0, -1, 0),
      PLAYER_HALF_HEIGHT + 0.1,
      layerMask
    )
    return hit !== null && hit.distance <= PLAYER_HALF_HEIGHT + 0.05
  }

  app.on('update', dt => {
    const isSprintingForward =
      control.keyW.down &&
      ((control.shiftLeft.down && !control.shiftLeft.capture) ||
        (control.shiftRight.down && !control.shiftRight.capture)) &&
      isGrounded()

    if (isSprintingForward) {
      runTime += dt
      if (runTime >= ACTIVATION_TIME && !superActive) {
        superActive = true
        player.applyEffect({
          emote: superRunEmote?.url || '',
          duration: null,
          cancellable: false,
        })
      }
    } else {
      if (superActive) {
        player.applyEffect({
          emote: superRunEmote?.url || '',
          duration: DEACTIVATION_TIME,
          cancellable: true,
        })
        superActive = false
      }
      runTime = 0
    }

    if (superActive && isSprintingForward) {
      player.push(getForwardDirection(tempVec).multiplyScalar(EXTRA_SPEED * dt))
    }
  })
}

```

---
*Extracted from Super_Run.hyp. Attachment ID: 1445419284003033259*