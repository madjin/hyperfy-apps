# Bats_v1.hyp

## Metadata
- **Author**: Valiant
- **Channel**: #💻│developers
- **Date**: 2025-03-27
- **Size**: 88,469 bytes

## Blueprint
- **Name**: Bats v1
- **Version**: 17
- **Model**: `asset://7a87d90650114b10a14d107042ffbefc1db0c395c992540964e9b58ce6b9c81c.glb`
- **Script**: `asset://3e5d5ece1d3e843054ccb5c104233d2ffba092225da59b0df89b4bec9287cc9b.js`

## Props
- `visible`: str = `true`
- `bat_amount`: int = `1050`
- `scale_min`: float = `0.1`
- `scale_max`: float = `0.1`
- `wingbeat_min`: int = `12`
- `wingbeat_max`: int = `25`
- `flyspeed_min`: float = `0.3`
- `flyspeed_max`: int = `1`
- `soundEnabled`: str = `true`
- `batSound`: audio → `asset://1e67e6107a30a190f2033ae154e6da85082ec5bf7f2adad359a28f44c145c82b.mp3`

## Assets
- `[model]` 7a87d90650114b10a14d107042ffbefc1db0c395c992540964e9b58ce6b9c81c.glb (11,780 bytes)
- `[script]` 3e5d5ece1d3e843054ccb5c104233d2ffba092225da59b0df89b4bec9287cc9b.js (7,641 bytes)
- `[audio]` 1e67e6107a30a190f2033ae154e6da85082ec5bf7f2adad359a28f44c145c82b.mp3 (67,903 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.get()`, `app.on()`
**Events Listened**: `update`
**Nodes Created**: `audio`, `group`

## Keywords (for Discord search)
active, adjusted, amount, animation, audio, based, batSound, bats, beat, clone, config, configure, console, container, continuous, create, createBat, delta, distanceModel, driftRange

## Script Source
```javascript
app.configure(() => {
  return [
    {
      type: 'switch',
      key: 'visible',
      label: 'Original Bat Visible',
      options: [
        { label: 'True', value: 'true' },
        { label: 'False', value: 'false' }
      ],
      initial: 'true',
    },
    {
      type: 'section',
      key: 'amount',
      label: 'Set the amount of bats (min 1 / max 5000)',
    },
    {
      key: "bat_amount",
      label: "Bat Amount",
      type: "number",
      initial: 50,
      min: 1,
      max: 5000,
      step: 1,
    },
    {
      type: 'section',
      key: 'scale',
      label: 'Set random scale (min 0.05 / max 10)',
    },
    {
      key: "scale_min",
      label: "Scale Min",
      type: "number",
      initial: 0.1,
      min: 0.05,
      max: 10,
      dp: 1,
      step: 0.1,
    },
    {
      key: "scale_max",
      label: "Scale Max",
      type: "number",
      initial: 0.5,
      min: 0.1,
      max: 10,
      dp: 1,
      step: 0.1,
    },
    {
      type: 'section',
      key: 'wingbeat',
      label: 'Set random wing-beat speed (min 1 / max 50)',
    },
    {
      key: "wingbeat_min",
      label: "Wing-beat Speed Min",
      type: "number",
      initial: 8,
      min: 1,
      max: 50,
      step: 1,
    },
    {
      key: "wingbeat_max",
      label: "Wing-beat Speed Max",
      type: "number",
      initial: 15,
      min: 1,
      max: 50,
      step: 1,
    },
    {
      type: 'section',
      key: 'fly-speed',
      label: 'Set random fly-speed (min 0.1 / max 20)',
    },
    {
      key: "flyspeed_min",
      label: "Fly-speed Min",
      type: "number",
      dp: 1,
      initial: 0.1,
      min: 0.1,
      max: 20,
      step: 0.1,
    },
    {
      key: "flyspeed_max",
      label: "Fly-speed Max",
      type: "number",
      dp: 1,
      initial: 1,
      min: 0.1,
      max: 20,
      step: 0.1,
    },
    {
      type: 'section',
      key: 'audio',
      label: 'Audio Settings',
    },
    {
      key: 'batSound',
      type: 'file',
      kind: 'audio',
      label: 'Swarming Bat Sound',
    },
    {
      type: 'switch',
      key: 'soundEnabled',
      label: 'Swarm Sound',
      options: [
        { label: 'On', value: 'true' },
        { label: 'Off', value: 'false' }
      ],
      initial: 'true',
    }
  ];
});

// Retrieve the original right and left wing nodes from the GLB file.
const wingROriginal = app.get('wingR');
const wingLOriginal = app.get('wingL');

if (!wingROriginal || !wingLOriginal) {
  console.error('Could not find wingR or wingL');
  return;
}

// Function to create a new bat with pivot groups adjusted for horizontal wings.
function createBat() {
  const wingRClone = wingROriginal.clone(true);
  const wingLClone = wingLOriginal.clone(true);

  if (!wingRClone || !wingLClone) {
    console.error('Could not clone wingR or wingL');
    return null;
  }
  
  const scale = num(app.config.scale_min, app.config.scale_max, 2);
  const startX = num(-10, 10, 2);
  const startY = num(1, 10, 2);
  const startZ = num(-10, 10, 2);
  const wingBeatSpeed = num(app.config.wingbeat_min, app.config.wingbeat_max, 2);
  const maxFlap = (45 * Math.PI) / 180;
  const moveSpeed = num(app.config.flyspeed_min, app.config.flyspeed_max, 2);
  const moveRange = num(1, 10, 2);
  const driftSpeed = num(0.1, 0.5, 2);
  const driftRange = num(0.5, 2, 2);

  const container = app.create('group', {});
  const rotX = num(-45, 45, 2) * (Math.PI / 180);
  const rotY = num(0, 360, 2) * (Math.PI / 180);
  const rotZ = num(-45, 45, 2) * (Math.PI / 180);
  container.rotation.set(rotX, rotY, rotZ);
  container.rotation.x -= Math.PI / 4;
  container.position.set(startX, startY, startZ);
  container.scale.set(scale, scale, scale);

  const wingRPivot = app.create('group', {});
  const wingLPivot = app.create('group', {});
  wingRClone.position.set(-0.5, 0, 0);
  wingLClone.position.set(0.5, 0, 0);
  wingRClone.rotation.set(0, 0, 0);
  wingLClone.rotation.set(0, 0, 0);
  wingRPivot.add(wingRClone);
  wingLPivot.add(wingLClone);
  container.add(wingRPivot);
  container.add(wingLPivot);

  return {
    container: container,
    wingRPivot: wingRPivot,
    wingLPivot: wingLPivot,
    startPosition: { x: startX, y: startY, z: startZ },
    wingBeatSpeed: wingBeatSpeed,
    maxFlap: maxFlap,
    moveSpeed: moveSpeed,
    moveRange: moveRange,
    driftSpeed: driftSpeed,
    driftRange: driftRange,
    timeElapsed: num(0, Math.PI * 2)
  };
}

// Create a swarm of bats.
const bats = [];
const BAT_COUNT = app.config.bat_amount;
for (let i = 0; i < BAT_COUNT; i++) {
  const bat = createBat();
  if (bat) {
    bats.push(bat);
    app.add(bat.container);
  }
}

// Add audio for the swarm.
let swarmAudio = null;
if (world.isClient && props.batSound?.url) {
  swarmAudio = app.create('audio', {
    src: props.batSound.url,
    volume: 0.6,
    spatial: true,
    refDistance: 2,
    maxDistance: 15,
    rolloffFactor: 2,
    distanceModel: 'inverse',
    loop: true // Swarm sound loops for continuous effect
  });
  app.add(swarmAudio); // Attach to app root, not a bat, for swarm-wide sound
}

// Animate the bats and manage sound.
if (world.isClient) {
  app.on('update', (delta) => {
    bats.forEach(bat => {
      bat.timeElapsed += delta;

      // Wing flapping animation
      const t = bat.timeElapsed * bat.wingBeatSpeed;
      const period = 2 * Math.PI;
      const phase = t % period;
      let flapAngle;
      if (phase < Math.PI) {
        flapAngle = (phase / Math.PI) * bat.maxFlap * 1.5;
      } else {
        flapAngle = ((period - phase) / Math.PI) * bat.maxFlap;
      }
      bat.wingRPivot.rotation.z = flapAngle;
      bat.wingLPivot.rotation.z = -flapAngle;

      // Flight movement
      const moveX = Math.sin(bat.timeElapsed * bat.moveSpeed) * bat.moveRange;
      const moveY = Math.sin(bat.timeElapsed * bat.moveSpeed * 1.3) * bat.moveRange * 0.7;
      const moveZ = Math.cos(bat.timeElapsed * bat.moveSpeed) * bat.moveRange;
      const erraticX = Math.sin(bat.timeElapsed * bat.moveSpeed * 3) * (bat.moveRange * 0.3);
      const erraticY = Math.cos(bat.timeElapsed * bat.moveSpeed * 2.2) * (bat.moveRange * 0.3);
      const erraticZ = Math.sin(bat.timeElapsed * bat.moveSpeed * 2) * (bat.moveRange * 0.3);
      const driftX = Math.sin(bat.timeElapsed * bat.driftSpeed) * bat.driftRange;
      const driftZ = Math.cos(bat.timeElapsed * bat.driftSpeed * 1.5) * bat.driftRange;

      const newY = Math.max(bat.startPosition.y + moveY + erraticY, 1);
      bat.container.position.set(
        bat.startPosition.x + moveX + driftX + erraticX,
        newY,
        bat.startPosition.z + moveZ + driftZ + erraticZ
      );
      bat.container.rotation.y += delta * 0.2;
    });

    // Toggle swarm sound based on switch
    if (swarmAudio) {
      if (app.config.soundEnabled === 'true' && !swarmAudio.playing) {
        swarmAudio.play();
      } else if (app.config.soundEnabled === 'false' && swarmAudio.playing) {
        swarmAudio.stop();
      }
    }
  });

  // Toggle visibility of original wing nodes
  wingROriginal.active = app.config.visible === 'true';
  wingLOriginal.active = app.config.visible === 'true';
}

// Utility function for random numbers (unchanged from original)
function num(min, max, dp = 0) {
  const rand = Math.random() * (max - min) + min;
  return dp > 0 ? Number(rand.toFixed(dp)) : Math.round(rand);
}
```

---
*Extracted from Bats_v1.hyp. Attachment ID: 1354922630251155477*