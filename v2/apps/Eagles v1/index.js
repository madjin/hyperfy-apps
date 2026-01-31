export default function main(world, app, fetch, props, setTimeout) {
app.configure(() => {
  return [
    {
      type: 'switch',
      key: 'visible',
      label: 'Original Eagle Visible',
      options: [
        { label: 'True', value: 'true' },
        { label: 'False', value: 'false' }
      ],
      initial: 'true',
    },
    {
      type: 'section',
      key: 'amount',
      label: 'Set the number of eagles (min 1 / max 6)',
    },
    {
      key: "eagle_count",
      label: "Eagle Count",
      type: "number",
      initial: 1,
      min: 1,
      max: 6,
      step: 1,
    },
    {
      type: 'section',
      key: 'scale',
      label: 'Set random scale (min 0.5 / max 1.5)',
    },
    {
      key: "scale_min",
      label: "Scale Min",
      type: "number",
      initial: 0.5,
      min: 0.5,
      max: 1.5,
      dp: 1,
      step: 0.1,
    },
    {
      key: "scale_max",
      label: "Scale Max",
      type: "number",
      initial: 1.5,
      min: 0.5,
      max: 1.5,
      dp: 1,
      step: 0.1,
    },
    {
      type: 'section',
      key: 'wingbeat',
      label: 'Set random wing-beat speed for flaps (min 5 / max 15)',
    },
    {
      key: "wingbeat_min",
      label: "Wing-beat Speed Min",
      type: "number",
      initial: 5,
      min: 5,
      max: 15,
      step: 1,
    },
    {
      key: "wingbeat_max",
      label: "Wing-beat Speed Max",
      type: "number",
      initial: 10,
      min: 5,
      max: 15,
      step: 1,
    },
    {
      type: 'section',
      key: 'soar-speed',
      label: 'Set random soar speed (min 0.5 / max 2)',
    },
    {
      key: "soarSpeed_min",
      label: "Soar Speed Min",
      type: "number",
      dp: 1,
      initial: 0.5,
      min: 0.5,
      max: 2,
      step: 0.1,
    },
    {
      key: "soarSpeed_max",
      label: "Soar Speed Max",
      type: "number",
      dp: 1,
      initial: 1.5,
      min: 0.5,
      max: 2,
      step: 0.1,
    },
    {
      type: 'section',
      key: 'height',
      label: 'Set height range (min 10m / max 100m)',
    },
    {
      key: "minHeight",
      label: "Minimum Height (m)",
      type: "number",
      initial: 20,
      min: 10,
      max: 100,
      step: 1,
    },
    {
      key: "maxHeight",
      label: "Maximum Height (m)",
      type: "number",
      initial: 40,
      min: 10,
      max: 100,
      step: 1,
    },
    {
      type: 'section',
      key: 'audio',
      label: 'Audio Settings',
    },
    {
      key: 'eagleSound',
      type: 'file',
      kind: 'audio',
      label: 'Eagle Call Sound 1',
    },
    {
      key: 'eagleSound2',
      type: 'file',
      kind: 'audio',
      label: 'Eagle Call Sound 2',
    },
    {
      type: 'switch',
      key: 'soundEnabled',
      label: 'Eagle Sound',
      options: [
        { label: 'On', value: 'true' },
        { label: 'Off', value: 'false' }
      ],
      initial: 'true',
    },
    {
      key: 'volume',
      label: 'Base Volume',
      type: 'number',
      initial: 0.3,
      min: 0,
      max: 1,
      step: 0.01,
      dp: 2
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

// Function to create a soaring eagle.
function createEagle(index) {
  const wingRClone = wingROriginal.clone(true);
  const wingLClone = wingLOriginal.clone(true);

  if (!wingRClone || !wingLClone) {
    console.error('Could not clone wingR or wingL');
    return null;
  }

  const scale = num(app.config.scale_min, app.config.scale_max, 2);
  const baseHeight = (app.config.minHeight + app.config.maxHeight) / 2;
  const heightOffset = index * num(-5, 5, 2);
  const startHeight = baseHeight + heightOffset;
  const radius = 20 + index * 10;
  const startAngle = num(0, Math.PI * 2);
  const wingBeatSpeed = num(app.config.wingbeat_min, app.config.wingbeat_max, 2);
  const maxFlap = (30 * Math.PI) / 180;
  const soarSpeed = num(app.config.soarSpeed_min, app.config.soarSpeed_max, 2);

  const container = app.create('group', {});
  container.position.set(
    radius * Math.cos(startAngle),
    startHeight,
    radius * Math.sin(startAngle)
  );
  container.scale.set(scale, scale, scale);
  container.rotation.y = startAngle + Math.PI;

  const wingRPivot = app.create('group', {});
  const wingLPivot = app.create('group', {});
  wingRClone.position.set(-0.5, 0, 0);
  wingLClone.position.set(0.5, 0, 0);
  wingRClone.rotation.set(Math.PI / 2, 0, 0);
  wingLClone.rotation.set(Math.PI / 2, 0, 0);
  wingRPivot.add(wingRClone);
  wingLPivot.add(wingLClone);
  container.add(wingRPivot);
  container.add(wingLPivot);

  return {
    container: container,
    wingRPivot: wingRPivot,
    wingLPivot: wingLPivot,
    baseHeight: startHeight,
    radius: radius,
    targetRadius: radius, // For smooth interpolation
    angle: startAngle,
    wingBeatSpeed: wingBeatSpeed,
    maxFlap: maxFlap,
    soarSpeed: soarSpeed,
    timeElapsed: 0,
    flapping: false,
    flapCounter: 0,
    thermalDrift: 0 // Upward spiral
  };
}

// Create a group of soaring eagles.
const eagles = [];
const EAGLE_COUNT = Math.min(app.config.eagle_count, 6);
for (let i = 0; i < EAGLE_COUNT; i++) {
  const eagle = createEagle(i);
  if (eagle) {
    eagles.push(eagle);
    app.add(eagle.container);
  }
}

// Add audio for the eagles.
let eagleAudio = null;
if (world.isClient && (props.eagleSound?.url || props.eagleSound2?.url)) {
  eagleAudio = app.create('audio', {
    volume: app.config.volume || 0.3,
    spatial: true,
    refDistance: 5,
    maxDistance: 50,
    rolloffFactor: 1.5,
    distanceModel: 'inverse',
    loop: false
  });
  app.add(eagleAudio);
}

// Animate the eagles and manage sound.
if (world.isClient) {
  app.on('update', (delta) => {
    eagles.forEach(eagle => {
      eagle.timeElapsed += delta;

      // Soaring motion with thermal drift and decay
      eagle.angle += eagle.soarSpeed * delta * 0.1;
      eagle.thermalDrift += delta * 0.05; // Slow upward spiral (0.05m/s)
      const heightRange = (app.config.maxHeight - app.config.minHeight) / 2;
      const midHeight = (app.config.minHeight + app.config.maxHeight) / 2;
      const heightDrift = heightRange * Math.sin(eagle.timeElapsed * 0.05);
      let currentHeight = eagle.baseHeight + heightDrift + eagle.thermalDrift;
      if (!eagle.flapping) currentHeight -= delta * 0.1; // Slow descent (0.1m/s)
      currentHeight = Math.max(app.config.minHeight, Math.min(app.config.maxHeight, currentHeight));
      
      // Smooth radius interpolation
      eagle.radius += (eagle.targetRadius - eagle.radius) * delta * 2; // Lerp to target
      eagle.container.position.set(
        eagle.radius * Math.cos(eagle.angle),
        currentHeight,
        eagle.radius * Math.sin(eagle.angle)
      );

      // Face flight direction with +60° offset
      const velocity = new Vector3(
        -eagle.radius * Math.sin(eagle.angle),
        0,
        eagle.radius * Math.cos(eagle.angle)
      ).normalize();
      const q = new Quaternion().setFromUnitVectors(new Vector3(1, 0, 0), velocity);
      const offset = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 3);
      q.multiply(offset);
      eagle.container.quaternion.copy(q);

      // Wing flap (anytime, 2% chance)
      if (!eagle.flapping && Math.random() < 0.02) {
        eagle.flapping = true;
        eagle.flapCounter = 0;
        if (eagleAudio && app.config.soundEnabled === 'true') {
          const soundKey = Math.random() < 0.5 ? 'eagleSound' : 'eagleSound2';
          const height = eagle.container.position.y;
          const volumeScale = (height - 10) / (100 - 10);
          eagleAudio.volume = app.config.volume * Math.max(0, Math.min(1, volumeScale));
          eagleAudio.src = props[soundKey]?.url;
          eagleAudio.play();
        }
      }

      if (eagle.flapping) {
        const t = eagle.flapCounter * eagle.wingBeatSpeed;
        const period = Math.PI;
        const phase = t % period;
        let flapAngle = (phase / period) * eagle.maxFlap * 2;
        if (phase > period / 2) {
          flapAngle = ((period - phase) / (period / 2)) * eagle.maxFlap;
        }
        eagle.wingRPivot.rotation.y = flapAngle;
        eagle.wingLPivot.rotation.y = -flapAngle;

        eagle.flapCounter += delta;
        if (eagle.flapCounter >= period / eagle.wingBeatSpeed) {
          eagle.flapping = false;
          eagle.wingRPivot.rotation.y = 0;
          eagle.wingLPivot.rotation.y = 0;
          eagle.baseHeight += num(2, 5, 2); // Height gain
          eagle.targetRadius += num(-5, 5, 2); // Smooth thermal shift
          eagle.targetRadius = Math.max(10, Math.min(eagle.targetRadius, 70));
        }
      }
    });

    if (eagleAudio && eagleAudio.volume !== app.config.volume) {
      eagleAudio.volume = app.config.volume;
    }
  });

  // Toggle visibility of original wing nodes
  wingROriginal.active = app.config.visible === 'true';
  wingLOriginal.active = app.config.visible === 'true';
}

// Utility function for random numbers
function num(min, max, dp = 0) {
  const rand = Math.random() * (max - min) + min;
  return dp > 0 ? Number(rand.toFixed(dp)) : Math.round(rand);
}
}
