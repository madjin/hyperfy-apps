export default function main(world, app, fetch, props, setTimeout) {
// =================================================================
// Wall Hang Mechanic Configuration
// =================================================================
app.configure([{
  key: 'hangingEmote',
  type: 'file',
  kind: 'emote',
  label: 'Hanging Emote'
}]);

const PLAYER_HALF_HEIGHT = 1.2;
const CAPSULE_RADIUS = 0.3;

const HANG_CONFIG = {
  maxGrabAbove: 0.6,
  minGrabBelow: -0.3,
  hangEndCooldown: 0.5,
  climbImpulse: 1,
  dropImpulse: 1,
  minFallSpeed: -1.5,
  layerMask: world.createLayerMask('environment')
};

// =================================================================
// Client-Side Wall Hang Mechanic
// =================================================================
if (world.isClient) {
  const { hangingEmote } = app.props;
  const player = world.getPlayer();
  const control = app.control();

  let lastPosition = null;
  let hanging = false;
  let ledgePoint = null;
  let wallNormal = null;
  let lastSpace = false;
  let lastS = false;
  let hangCooldown = 0;
  let currentEffect = null;

  const tempVec = new Vector3();
  const tempQuat = new Quaternion();
  const tempEuler = new Euler(0, 0, 0, 'YXZ');
  const downDir = new Vector3(0, -1, 0);
  const upDir = new Vector3(0, 1, 0);

  // Compute forward direction based on camera orientation
  function getForwardDirection(outVec) {
    tempEuler.setFromQuaternion(control.camera.quaternion);
    tempEuler.x = 0;
    tempEuler.z = 0;
    tempQuat.setFromEuler(tempEuler);
    return outVec.copy(new Vector3(0, 0, -1)).applyQuaternion(tempQuat);
  }

  // Check if player is grounded
  function isGrounded() {
    const origin = player.position.clone();
    const maxDistance = PLAYER_HALF_HEIGHT + 0.1;
    const hit = world.raycast(origin, downDir, maxDistance, HANG_CONFIG.layerMask);
    return hit && hit.distance <= PLAYER_HALF_HEIGHT + 0.05;
  }

  // Reset hanging state
  function resetHangingState(cooldownTime) {
    hanging = false;
    ledgePoint = null;
    wallNormal = null;
    hangCooldown = cooldownTime;
    if (currentEffect) {
      currentEffect.cancel();
      currentEffect = null;
    }
  }

  app.on('update', (dt) => {
    const currentPosition = player.position.clone();
    let velocity = new Vector3(0, 0, 0);
    if (lastPosition) {
      velocity = currentPosition.clone().sub(lastPosition).divideScalar(dt);
    }
    lastPosition = currentPosition.clone();

    if (hangCooldown > 0) {
      hangCooldown -= dt;
    }

    if (hanging) {
      const spacePressed = control.space?.pressed || false;
      const sPressed = control.keyS?.pressed || false;

      if (spacePressed && !lastSpace) {
        // Climb up: push up and away from wall
        tempVec.copy(wallNormal).negate().multiplyScalar(0.5);
        tempVec.add(upDir).normalize();
        player.push(tempVec.multiplyScalar(HANG_CONFIG.climbImpulse));
        resetHangingState(0.5);
        lastSpace = spacePressed;
        lastS = sPressed;
        return;
      }

      if (sPressed && !lastS) {
        // Drop: push away from wall
        player.push(tempVec.copy(wallNormal).multiplyScalar(HANG_CONFIG.dropImpulse));
        resetHangingState(0.3);
        lastSpace = spacePressed;
        lastS = sPressed;
        return;
      }

      lastSpace = spacePressed;
      lastS = sPressed;
      return;
    }

    // Early exit conditions
    if (isGrounded() || velocity.y >= 0 || velocity.y > HANG_CONFIG.minFallSpeed || hangCooldown > 0) {
      return;
    }

    // Get forward direction
    const dir = getForwardDirection(tempVec);

    // Calculate dynamic reach based on horizontal speed
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
    const dynamicReach = (speed * dt) + (CAPSULE_RADIUS * 2);

    // Lower raycast at chest level
    const chestY = PLAYER_HALF_HEIGHT * 0.5;
    const lowerOrigin = player.position.clone().add(new Vector3(0, chestY, 0));
    const lowerHit = world.raycast(lowerOrigin, dir, dynamicReach, HANG_CONFIG.layerMask);

    if (!lowerHit || !lowerHit.point || !lowerHit.normal || !lowerHit.distance) {
      return;
    }

    // Upper raycast at max grab height
    const upperY = PLAYER_HALF_HEIGHT + HANG_CONFIG.maxGrabAbove;
    const upperOrigin = player.position.clone().add(new Vector3(0, upperY, 0));
    const upperHit = world.raycast(upperOrigin, dir, dynamicReach, HANG_CONFIG.layerMask);

    // Only grab if there's no upper wall (it's a ledge)
    if (upperHit) {
      return;
    }

    // Raycast down to find exact ledge surface
    tempVec.copy(dir).multiplyScalar(lowerHit.distance);
    const ledgeOrigin = lowerOrigin.clone().add(tempVec).add(new Vector3(0, upperY - chestY + 0.1, 0));
    const ledgeMaxDist = (upperY - chestY) + HANG_CONFIG.maxGrabAbove + 0.1;
    const ledgeHit = world.raycast(ledgeOrigin, downDir, ledgeMaxDist, HANG_CONFIG.layerMask);

    if (!ledgeHit || !ledgeHit.point || !ledgeHit.distance) {
      return;
    }

    ledgePoint = ledgeOrigin.clone().add(downDir.clone().multiplyScalar(ledgeHit.distance));

    // Check if ledge is within grab range
    const headY = player.position.y + PLAYER_HALF_HEIGHT;
    const ledgeY = ledgePoint.y;
    if (ledgeY < headY + HANG_CONFIG.minGrabBelow || ledgeY > headY + HANG_CONFIG.maxGrabAbove) {
      return;
    }

    // Grab the ledge
    hanging = true;
    wallNormal = lowerHit.normal.clone();

    // Set hang position with offset to prevent wall penetration
    const hangPosition = ledgePoint.clone().add(wallNormal.clone().multiplyScalar(CAPSULE_RADIUS + 0.05));
    player.teleport(hangPosition);

    // Apply hanging effect
    const emoteUrl = hangingEmote?.url ? `${hangingEmote.url}?l=0` : '';
    currentEffect = player.applyEffect({
      emote: emoteUrl,
      freeze: true,
      turn: false,
      duration: null,
      cancellable: false,
      onEnd: () => {
        hanging = false;
        ledgePoint = null;
        wallNormal = null;
        currentEffect = null;
        hangCooldown = HANG_CONFIG.hangEndCooldown;
      }
    });
  });
}
}
