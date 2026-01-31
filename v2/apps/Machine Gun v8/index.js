export default function main(world, app, fetch, props, setTimeout) {
const animations = [
  'idle', 'run', 'walk', 'jump', 'walkBack', 'walkLeft', 'walkRight',
  'sprintLeft', 'sprintRight', 'walkBackLeft', 'walkBackRight',
  'sprintBackRight', 'sprintBackLeft', 'walkForwardLeft', 'walkForwardRight',
  'sprintForwardRight', 'sprintForwardLeft', 'sprintBackward', 'reload'
];

const animationConfig = animations.map(animation => {
  const label = animation.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  return {
    key: animation,
    type: 'file',
    kind: 'emote',
    label: `${label} Animation`
  };
});

animationConfig.push({
  key: 'audio',
  type: 'file',
  kind: 'audio',
  label: 'Audio'
})

app.configure(animationConfig);

if (world.isClient) {
  let overheatStatus
  let pulseTime = 0;
  let isPulsing = false;

  const OVERHEAT_CONFIG = {
    width: 80,
    height: 10,
    padding: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    overheatColor: 'rgba(255, 50, 50, 0.9)',
    maxOverheat: 100,
    currentOverheat: 0,
    pulseSpeed: 5,
    pulseMinOpacity: 0.4,
    pulseMaxOpacity: 0.9
  }

  const overheatBarContainer = app.create('ui', {
    width: OVERHEAT_CONFIG.width,
    height: OVERHEAT_CONFIG.height,
    alignSelf: 'center',
    position: [0.5, 1, 0],
    offset: [0, -35, 0],
    space: 'screen',
    anchorPoint: [0.5, 1],
    backgroundColor: OVERHEAT_CONFIG.backgroundColor,
    borderRadius: OVERHEAT_CONFIG.borderRadius,
    padding: OVERHEAT_CONFIG.padding,
    pointerEvents: false,
  });

  const overheatFill = app.create('uiview', {
    width: 0,
    height: OVERHEAT_CONFIG.height - (OVERHEAT_CONFIG.padding * 2),
    backgroundColor: OVERHEAT_CONFIG.overheatColor,
    borderRadius: OVERHEAT_CONFIG.borderRadius / 2,
    pointerEvents: false,
  });
  overheatBarContainer.add(overheatFill);

  app.on('overheatStatus', (data) => {
    overheatStatus = data
    updateOverheat(data.overheat, data.coolingDown)
  })

  function updateOverheat(newOverheat, coolingDown) {
    const overheatValue = Math.max(0, Math.min(newOverheat, OVERHEAT_CONFIG.maxOverheat));
    OVERHEAT_CONFIG.currentOverheat = overheatValue;

    const fillWidth = (overheatValue / OVERHEAT_CONFIG.maxOverheat) * (OVERHEAT_CONFIG.width - (OVERHEAT_CONFIG.padding * 2));
    overheatFill.width = fillWidth;

    if (overheatValue < 33) {
      overheatFill.backgroundColor = 'rgba(255, 200, 200, 0.9)'; // Very light red
    } else if (overheatValue < 66) {
      overheatFill.backgroundColor = 'rgba(255, 120, 120, 0.9)'; // Medium red
    } else {
      overheatFill.backgroundColor = 'rgba(255, 30, 30, 0.9)'; // Intense red
    }

    isPulsing = coolingDown;
    if (coolingDown) {
      pulseTime = 0;
      overheatBarContainer.borderWidth = 1;
      overheatBarContainer.borderColor = 'rgba(255, 100, 100, 0.8)';
    } else {
      overheatBarContainer.borderWidth = 0;
    }
  }

  function updatePulseAnimation(delta) {
    if (isPulsing) {
      pulseTime += delta * OVERHEAT_CONFIG.pulseSpeed;
      const pulseOpacity = OVERHEAT_CONFIG.pulseMinOpacity +
        (Math.sin(pulseTime) * 0.5 + 0.5) *
        (OVERHEAT_CONFIG.pulseMaxOpacity - OVERHEAT_CONFIG.pulseMinOpacity);
      const pulseColor = `rgba(255, 30, 30, ${pulseOpacity})`;
      overheatFill.backgroundColor = pulseColor;
    }
  }

  const v1 = new Vector3()
  const v2 = new Vector3()

  const audio = app.create('audio', {
    src: props.audio?.url,
    volume: 0.75,
    group: 'sfx',
    spatial: true
  })
  app.add(audio)
  const forwardVec = new Vector3(0, 0, -1)
  let currentEffect, holder
  if (!holder && app.state.owner) holder = world.getPlayer(app.state.owner)

  if (app.state.lastPosition && !holder) {
    app.position.set(
      app.state.lastPosition.x,
      app.state.lastPosition.y,
      app.state.lastPosition.z
    )
    if (app.state.lastQuaternion) {
      app.quaternion.set(
        app.state.lastQuaternion.x,
        app.state.lastQuaternion.y,
        app.state.lastQuaternion.z,
        app.state.lastQuaternion.w
      )
    }
  }

  const { id: localId } = world.getPlayer()
  const controls = app.control()
  const action = app.create('action', {
    label: 'Pick Up',
    distance: 3,
    onTrigger: ({ playerId }) => {
      world.add(overheatBarContainer)
      action.active = false
      holder = world.getPlayer(playerId)
      app.send('taken', {
        playerId
      })
      holder.setZoomEnabled(false)
      holder.setZoom(1.5)
      holder.setDoubleJumpEnabled(false)
    }
  })
  if (holder) action.active = false

  app.on('taken', (playerId) => {
    holder = world.getPlayer(playerId)
    action.active = false
  })

  app.on('dropped', () => {
    holder = undefined
    action.active = true
  })

  controls.keyX.onRelease = () => {
    if (!holder || holder.id !== localId) return
    world.remove(overheatBarContainer)
    holder.setZoomEnabled(true)
    holder.setDoubleJumpEnabled(true)

    app.send('dropped', {
      playerId: localId,
      position: {
        x: app.position.x,
        y: app.position.y,
        z: app.position.z
      },
      quaternion: {
        x: app.quaternion.x,
        y: app.quaternion.y,
        z: app.quaternion.z,
        w: app.quaternion.w
      }
    })

    holder = undefined
    currentEffect.cancel()
    action.active = true
  }

  app.add(action)

  const FIRE_RATE = 0.1
  let shootCooldown = 0
  let animationState = 'idle'
  let isZoomedIn = false

  const ZOOM_CONFIG = {
    normalZoom: 1.5,
    scopedZoom: 0.5,
    zoomInDuration: 0.15,
    zoomOutDuration: 0.45,
  }

  let zoomTransition = {
    active: false,
    startValue: ZOOM_CONFIG.normalZoom,
    targetValue: ZOOM_CONFIG.scopedZoom,
    duration: ZOOM_CONFIG.duration,
    elapsed: 0,
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
  }

  const onShoot = () => {
    audio.stop()
    const { quaternion: camQuat, position: camPos } = controls.camera
    v1.copy(forwardVec).applyQuaternion(camQuat).normalize()
    v2.copy(camPos).addScaledVector(v1, 0.5)
    const hit = world.raycast(v2, v1, Infinity)
    if (!hit) return
    app.send('shoot', {
      shooter: holder.id,
      shooterHeight: holder.height,
      hitPoint: hit.point.toArray(),
      hitId: hit.playerId || null
    })
    audio.play()
  }

  const onScopeIn = () => {
    if (isZoomedIn) return
    zoomTransition = {
      active: true,
      startValue: ZOOM_CONFIG.normalZoom,
      targetValue: ZOOM_CONFIG.scopedZoom,
      duration: ZOOM_CONFIG.zoomInDuration,
      elapsed: 0,
      easeInOutQuad: t => 1 - Math.pow(1 - t, 3)
    }
    isZoomedIn = true
  }

  const onScopeOut = () => {
    if (!isZoomedIn) return
    zoomTransition = {
      active: true,
      startValue: ZOOM_CONFIG.scopedZoom,
      targetValue: ZOOM_CONFIG.normalZoom,
      duration: ZOOM_CONFIG.zoomOutDuration,
      elapsed: 0,
      easeInOutQuad: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }
    isZoomedIn = false
  }

  controls.mouseRight.onRelease = () => {
    if (!holder || holder.id !== localId) return
    onScopeOut()
  }

  app.on('update', (delta) => {
    if (!holder?.id || localId !== holder?.id) return

    updatePulseAnimation(delta);


    if (shootCooldown > 0) shootCooldown -= delta

    if (zoomTransition.active) {
      zoomTransition.elapsed += delta
      const progress = Math.min(zoomTransition.elapsed / zoomTransition.duration, 1)
      const easedProgress = zoomTransition.easeInOutQuad(progress)
      const zoomDifference = zoomTransition.targetValue - zoomTransition.startValue
      holder.setZoom(zoomTransition.startValue + zoomDifference * easedProgress)
      if (progress >= 1) zoomTransition.active = false
    }

    const { keyW, keyA, keyS, keyD, shiftLeft, mouseLeft, mouseRight } = controls
    const isJumping = holder.isInAir()
    const forward = keyW.down
    const backward = keyS.down
    const left = keyA.down
    const right = keyD.down
    const isRunning = shiftLeft.down
    const shoot = mouseLeft.down
    const scope = mouseRight.down

    // animation handling
    let newAnimationState = 'idle'

    if (isJumping) {
      newAnimationState = 'jump'
    } else if (forward && left) {
      newAnimationState = isRunning ? 'sprintForwardLeft' : 'walkForwardLeft'
    } else if (forward && right) {
      newAnimationState = isRunning ? 'sprintForwardRight' : 'walkForwardRight'
    } else if (backward && left) {
      newAnimationState = isRunning ? 'sprintBackLeft' : 'walkBackLeft'
    } else if (backward && right) {
      newAnimationState = isRunning ? 'sprintBackRight' : 'walkBackRight'
    } else if (forward) {
      newAnimationState = isRunning ? 'run' : 'walk'
    } else if (backward) {
      newAnimationState = isRunning ? 'sprintBackward' : 'walkBack'
    } else if (left) {
      newAnimationState = isRunning ? 'sprintLeft' : 'walkLeft'
    } else if (right) {
      newAnimationState = isRunning ? 'sprintRight' : 'walkRight'
    }

    if (newAnimationState !== animationState) {
      animationState = newAnimationState
      if (currentEffect) currentEffect.cancel()
      currentEffect = holder.applyEffect({
        emote: props[animationState].url,
        turn: true
      })
    }

    // shot handling
    if (overheatStatus?.coolingDown === true) return
    if (shoot && shootCooldown <= 0 && !isRunning) {
      onShoot()
      shootCooldown = FIRE_RATE
    }

    if (scope && !isZoomedIn && !isRunning && !isJumping) {
      onScopeIn()
    } else if (!scope && isZoomedIn) {
      onScopeOut()
    }

    if (isZoomedIn && (isRunning || isJumping)) onScopeOut()

  })

  app.on('lateUpdate', () => {
    if (!holder) return
    const matrix = holder.getBoneTransform('rightIndexProximal')
    if (matrix) {
      app.position.setFromMatrixPosition(matrix)
      app.quaternion.setFromRotationMatrix(matrix)
    }
  })
}

if (world.isServer) {
  const OVERHEAT_PER_SHOT = 7.5
  const MAX_OVERHEAT = 100
  const MIN_OVERHEAT = 0
  const RECOVER_PER_SECOND = 25
  const COOLDOWN_TIME = 2
  const OVERHEAT_UPDATES_PER_SECOND = 5
  const state = app.state

  if (state.overheat === undefined) {
    state.overheat = MIN_OVERHEAT
    state.coolingDown = false
    state.cooldownTimer = 0
    state.overheatUpdateCounter = 0
  }

  app.on('taken', ({ playerId }) => {
    if (playerId !== state.previousOwner) {
      state.overheat = MIN_OVERHEAT
      state.coolingDown = false
      state.cooldownTimer = 0
    }

    state.owner = playerId
    state.lastPosition = undefined
    state.lastQuaternion = undefined

    app.send('taken', playerId)
    app.send('overheatStatus', {
      overheat: state.overheat,
      coolingDown: state.coolingDown
    })
  })

  app.on('dropped', ({ playerId, position, quaternion }) => {
    state.previousOwner = playerId
    state.owner = undefined
    state.lastPosition = position
    state.lastQuaternion = quaternion
    app.send('dropped', undefined, playerId)
  })

  app.on('shoot', ({ shooter, shooterHeight, hitPoint, hitId }) => {
    if (!state.owner || state.coolingDown) {
      return
    }

    state.overheat += OVERHEAT_PER_SHOT

    if (state.overheat >= MAX_OVERHEAT) {
      state.overheat = MAX_OVERHEAT
      state.coolingDown = true
      state.cooldownTimer = COOLDOWN_TIME

      app.send('overheatStatus', {
        overheat: state.overheat,
        coolingDown: state.coolingDown
      })

      return
    }

    app.send('overheatStatus', {
      overheat: state.overheat,
      coolingDown: false
    })

    const { position } = world.getPlayer(state.owner)
    app.emit('shoot', {
      shooter,
      shooterHeight: [
        position.x,
        position.y + shooterHeight,
        position.z
      ],
      hitPoint,
      hitId
    })
  })

  app.on('fixedUpdate', (delta) => {
    if (state.coolingDown) {
      state.cooldownTimer -= delta
      if (state.cooldownTimer <= 0) {
        state.coolingDown = false
        state.overheat = MIN_OVERHEAT
        state.cooldownTimer = 0
        if (state.owner) {
          app.send('overheatStatus', {
            overheat: state.overheat,
            coolingDown: false
          })
        }
      }
    }

    if (!state.coolingDown && state.overheat > MIN_OVERHEAT) {
      const recoveryAmount = RECOVER_PER_SECOND * delta
      state.overheat = Math.max(MIN_OVERHEAT, state.overheat - recoveryAmount)

      state.overheatUpdateCounter += 1
      if (state.overheatUpdateCounter >= 1 / (delta * OVERHEAT_UPDATES_PER_SECOND)) {
        state.overheatUpdateCounter = 0

        if (state.owner) {
          app.send('overheatStatus', {
            overheat: state.overheat,
            coolingDown: state.coolingDown
          })
        }
      }
    }
  })
}
}
