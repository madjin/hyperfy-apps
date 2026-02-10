export default function main(world, app, fetch, props, setTimeout) {
const animations = [
  'idle',
  'run',
  'walk',
  'walkBack',
  'walkLeft',
  'walkRight',
  'sprintLeft',
  'sprintRight',
  'walkBackLeft',
  'walkBackRight',
  'sprintBackRight',
  'sprintBackLeft',
  'walkForwardLeft',
  'walkForwardRight',
  'sprintForwardRight',
  'sprintForwardLeft',
  'sprintBackward'
];

const animationConfig = animations.map(animation => {
  const label = animation
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
  return {
    key: animation,
    type: 'file',
    kind: 'emote',
    label: `${label} Animation`
  };
});

app.configure(animationConfig);

if (world.isClient) {
  const forwardVec = new Vector3(0, 0, -1)
  let currentEffect = undefined
  let holder = undefined
  if (holder === undefined && app.state.owner !== undefined) {
    holder = world.getPlayer(app.state.owner)
  }
  const { id: localId } = world.getPlayer()
  const controls = app.control()
  const action = app.create('action', {
    label: 'Pick Up',
    distance: 3,
    onTrigger: ({ playerId }) => {
      action.active = false;
      app.send('taken', playerId)
      holder = world.getPlayer(playerId)
    }
  });
  if (holder !== undefined) action.active = false

  app.on('taken', (playerId) => {
    holder = world.getPlayer(playerId)
    action.active = false
  })

  app.on('dropped', () => {
    holder = undefined
    action.active = true
  })

  controls.keyX.onRelease = () => {
    if (holder === undefined) return
    if (holder.id !== localId) return

    app.send('dropped', localId)

    holder = undefined
    currentEffect.cancel()
    action.active = true
  }

  app.add(action)

  const FIRE_RATE = 0.1;
  let shootCooldown = 0;
  let animationState = 'idle';

  app.on('update', (delta) => {
    if (!holder?.id || localId !== holder?.id) return;

    if (shootCooldown > 0) {
      shootCooldown -= delta;
    }

    const {
      keyW,
      keyA,
      keyS,
      keyD,
      shiftLeft,
      mouseLeft,
      mouseRight
    } = controls;

    const forward = keyW.down;
    const backward = keyS.down;
    const left = keyA.down;
    const right = keyD.down;
    const isRunning = shiftLeft.down;
    const shoot = mouseLeft.down;
    const scope = mouseRight.down;

    let newAnimationState = 'idle';

    if (forward && left) {
      newAnimationState = isRunning ? 'sprintForwardLeft' : 'walkForwardLeft';
    } else if (forward && right) {
      newAnimationState = isRunning ? 'sprintForwardRight' : 'walkForwardRight';
    } else if (backward && left) {
      newAnimationState = isRunning ? 'sprintBackLeft' : 'walkBackLeft';
    } else if (backward && right) {
      newAnimationState = isRunning ? 'sprintBackRight' : 'walkBackRight';
    }
    else if (forward) {
      newAnimationState = isRunning ? 'run' : 'walk';
    } else if (backward) {
      newAnimationState = isRunning ? 'sprintBackward' : 'walkBack';
    } else if (left) {
      newAnimationState = isRunning ? 'sprintLeft' : 'walkLeft';
    } else if (right) {
      newAnimationState = isRunning ? 'sprintRight' : 'walkRight';
    }
    if (shoot && shootCooldown <= 0 && !isRunning) {
      onShoot();
      shootCooldown = FIRE_RATE;
    }

    if (scope) {
      onScope();
    }

    if (newAnimationState !== animationState) {
      animationState = newAnimationState;

      currentEffect = holder.applyEffect({
        emote: props[animationState].url,
        turn: true
      });
    }
  });
  const onShoot = () => {
    const { quaternion: camQuat, position: camPos } = controls.camera;
    const camDirection = new Vector3().copy(forwardVec).applyQuaternion(camQuat);
    app.send('shoot', {
      bonePosition: camPos.toArray(),
      camDirection: camDirection.toArray(),
    });
  }

  const onScope = () => {

  }

  app.on('lateUpdate', () => {
    if (holder === undefined) return

    const matrix = holder.getBoneTransform('rightIndexProximal')
    if (matrix) {
      app.position.setFromMatrixPosition(matrix)
      app.quaternion.setFromRotationMatrix(matrix)
    }
  })
}

if (world.isServer) {
  const state = app.state
  app.on('taken', (playerId) => {
    state.owner = playerId
    app.send('taken', playerId, playerId)
  })
  app.on('dropped', (playerId) => {
    state.owner = undefined
    app.send('dropped', undefined, playerId)
  })
  app.on('shoot', ({ camDirection, bonePosition }) => {
    app.emit('shoot', {
      direction: camDirection,
      origin: bonePosition
    })
  })
}
}
