# Butterfly_Swarm_V6_Hyperfly_edition2_BW.hyp

## Metadata
- **Author**: Gert-Jan Akerboom
- **Channel**: #🎨│showcase
- **Date**: 2025-03-28
- **Size**: 278,387 bytes

## Discord Context
> and a black and white edition : )

## Blueprint
- **Name**: Butterfly Swarm V6 (Hyperfly edition)
- **Version**: 45
- **Model**: `asset://ecd2fff46dfe44acf567f46d5cc4ebff348f4df23635c7c0a52e84c9be9f1f51.glb`
- **Script**: `asset://80530025f4f2a229629ba517cfc3fe95be384d6cc802e8e1eb3d683ec62b8706.js`

## Props
- `scale`: float = `0.3`
- `startX`: int = `0`
- `startY`: int = `5`
- `startZ`: int = `0`
- `flapSpeed`: int = `10`
- `maxFlap`: int = `60`
- `moveSpeed`: float = `0.4`
- `moveRange`: int = `2`
- `driftSpeed`: float = `0.3`
- `driftRange`: int = `1`
- `baseStartX`: int = `10`
- `baseStartY`: int = `5`
- `baseStartZ`: int = `0`
- `areaWidth`: int = `10`
- `areaDepth`: int = `10`
- `clone_count`: int = `20`
- `area_size_x`: int = `10`
- `area_size_z`: int = `10`
- `min_size`: float = `0.2`
- `max_size`: int = `2`
- `butterfly_amount`: int = `2000`
- `scale_min`: float = `0.1`
- `scale_max`: float = `0.2`
- `flapspeed_min`: int = `5`
- `flapspeed_max`: int = `20`
- `flyspeed_min`: float = `0.3`
- `flyspeed_max`: float = `0.5`
- `og_onoff`: str = `no`
- `og_visible`: str = `false`
- `visible`: str = `true`
- `areaXZ`: int = `1`
- `how_high`: int = `100`

## Assets
- `[model]` ecd2fff46dfe44acf567f46d5cc4ebff348f4df23635c7c0a52e84c9be9f1f51.glb (68,604 bytes)
- `[script]` 80530025f4f2a229629ba517cfc3fe95be384d6cc802e8e1eb3d683ec62b8706.js (8,021 bytes)
- `[texture]` 7783fca1251d8e4ae01bf9c29821e9193de189de64d94bec4c69310180ece563.jpg (200,276 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.get()`, `app.on()`
**Events Listened**: `update`
**Nodes Created**: `group`

## Keywords (for Discord search)
above, active, aligned, amount, angle, animation, area, areaXZ, assign, axis, between, butterflies, butterfly, calculated, child, clamp, client, clone, cloned, clones

## Script Source
```javascript
app.configure(() => {
  return [
    {
      type: 'switch',
      key: 'visible', // the key on `app.config` to set this value
      label: 'Original Butterfly Visible',
      options: [
        { label: 'True', value: 'true' },
        { label: 'False', value: 'false' }
      ],
      initial: 'true',
    },
    {
      type: 'section',
      key: 'area',
      label: 'Set the area size the Butterflies will spawn in (min 1x1m / max 1000x1000m)',
    },
    {
      key: "areaXZ",
      label: "spawn Area",
      type: "number",
      initial: 10,
      min: 1,
      max: 1000,
      step: 1,
    },
    {
      type: 'section',
      key: 'area_up',
      label: 'Set how high the butterflies will spawn in (min 1m / max 1000m on the Y axis)',
    },
    {
      key: "how_high",
      label: "spawn Hight",
      type: "number",
      initial: 10,
      min: 1,
      max: 1000,
      step: 1,
    },
    {
      type: 'section',
      key: 'amount',
      label: 'Set the amount of butterflies (min 1 / max 5000)',
    },
    {
      key: "butterfly_amount",
      label: "Butterfly Amount",
      type: "number",
      initial: 50,
      min: 1,
      max: 5000,
      step: 1,
    },
    {
      type: 'section',
      key: 'scale',
      label: 'Set random scale (min 0.1 / max 10)',
    },
    {
      key: "scale_min",
      label: "Scale Min",
      type: "number",
      initial: 0.1,
      min: 0.1,
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
      key: 'flapspeed',
      label: 'Set random flap-speed (min 1 / max 50)',
    },
    {
      key: "flapspeed_min",
      label: "Flap-speed Min",
      type: "number",
      initial: 8,
      min: 1,
      max: 50,
      step: 1,
    },
    {
      key: "flapspeed_max",
      label: "Flap-speed Max",
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
    }
  ];
});

// Retrieve the original right and left wing nodes from the GLB file
const wingROriginal = app.get('wingR'); // Original right wing node from the model
const wingLOriginal = app.get('wingL'); // Original left wing node from the model

if (!wingROriginal || !wingLOriginal) {
  console.error('Could not find wingR or wingL');
  return;
}

// Helper function to return a new emissive material configuration
function getEmissiveMaterial() {
  return {
    emissive: '#00ffff',
    emissiveIntensity: 100,
    transparent: true,
    opacity: 0.7
  };
}

// Function to create a new butterfly with its own container for random rotation
function createButterfly() {
  // Clone the original wing nodes for a new butterfly
  const wingRClone = wingROriginal.clone(true); // Deep clone of right wing
  const wingLClone = wingLOriginal.clone(true); // Deep clone of left wing

  if (!wingRClone || !wingLClone) {
    console.error('Could not clone wingR or wingL');
    return null;
  }
  
  // --- Assign New Emissive Material to Each Mesh ---
  // Instead of modifying child.material, we assign a new material configuration
  wingRClone.traverse(child => {
    if (child.isMesh) {
      child.material = getEmissiveMaterial();
    }
  });
  wingLClone.traverse(child => {
    if (child.isMesh) {
      child.material = getEmissiveMaterial();
    }
  });
  
  // Generate random properties for this butterfly using the num() function
  const scale = num(app.config.scale_min, app.config.scale_max, 2); 
  const startX = num(-app.config.areaXZ, app.config.areaXZ, 2);
  // Adjusted the Y range so butterflies start above ground (between 1 and how_high)
  const startY = num(1, app.config.how_high, 2); 
  const startZ = num(-app.config.areaXZ, app.config.areaXZ, 2);
  const flapSpeed = num(app.config.flapspeed_min, app.config.flapspeed_max, 2);
  const maxFlap = (60 * Math.PI) / 180; // Maximum flap angle (60° in radians)
  const moveSpeed = num(app.config.flyspeed_min, app.config.flyspeed_max, 2);
  const moveRange = num(-10, 10, 2);
  const driftSpeed = num(0.1, 0.5, 2);
  const driftRange = num(0.5, 2, 2);

  // Create a container node (a group) to hold the butterfly parts
  const container = app.create('group', {});

  // Apply a random rotation to the container so butterflies are not all aligned
  const rotX = num(-45, 45, 2) * (Math.PI / 180);
  const rotY = num(0, 360, 2) * (Math.PI / 180);
  const rotZ = num(-45, 45, 2) * (Math.PI / 180);
  container.rotation.set(rotX, rotY, rotZ);

  // Set the container's initial position and scale
  container.position.set(startX, startY, startZ);
  container.scale.set(scale, scale, scale);

  // Position the cloned wings at the container's origin and reset their rotations
  wingRClone.position.set(0, 0, 0);
  wingLClone.position.set(0, 0, 0);
  wingRClone.rotation.set(0, 0, 0);
  wingLClone.rotation.set(0, 0, 0);

  // Attach the wing clones to the container
  container.add(wingRClone);
  container.add(wingLClone);

  // Return the butterfly's state for animation
  return {
    container: container,
    wingR: wingRClone,
    wingL: wingLClone,
    startPosition: { x: startX, y: startY, z: startZ },
    flapSpeed: flapSpeed,
    maxFlap: maxFlap,
    moveSpeed: moveSpeed,
    moveRange: moveRange,
    driftSpeed: driftSpeed,
    driftRange: driftRange,
    timeElapsed: num(0, Math.PI * 2)
  };
}

// Create a swarm of butterflies
const butterflies = [];
const BUTTERFLY_COUNT = app.config.butterfly_amount;

for (let i = 0; i < BUTTERFLY_COUNT; i++) {
  const butterfly = createButterfly();
  if (butterfly) {
    butterflies.push(butterfly);
    app.add(butterfly.container);
  }
}

// Animate the butterflies on the client side
if (world.isClient) {
  app.on('update', (delta) => {
    butterflies.forEach(butterfly => {
      // Update the timeElapsed property
      butterfly.timeElapsed += delta;

      // --- Wing Flapping Animation ---
      const flapAngle = Math.sin(butterfly.timeElapsed * butterfly.flapSpeed) * butterfly.maxFlap;
      butterfly.wingR.rotation.y = flapAngle;
      butterfly.wingL.rotation.y = -flapAngle;

      // --- Movement Animation ---
      const moveX = Math.sin(butterfly.timeElapsed * butterfly.moveSpeed) * butterfly.moveRange;
      const moveY = Math.sin(butterfly.timeElapsed * butterfly.moveSpeed * 0.8) * butterfly.moveRange * 0.5;
      const moveZ = Math.cos(butterfly.timeElapsed * butterfly.moveSpeed) * butterfly.moveRange;
      const driftX = Math.sin(butterfly.timeElapsed * butterfly.driftSpeed) * butterfly.driftRange;
      const driftZ = Math.cos(butterfly.timeElapsed * butterfly.driftSpeed * 1.5) * butterfly.driftRange;
      
      // Combine the calculated Y offset with the original start Y, then clamp to at least 1 (ground level)
      const newY = Math.max(butterfly.startPosition.y + moveY, 1);
      
      butterfly.container.position.set(
        butterfly.startPosition.x + moveX + driftX,
        newY,
        butterfly.startPosition.z + moveZ + driftZ
      );
    });
  });
  
  // Remove the original wings from the scene so they don't render by themselves.
  wingROriginal.active = app.config.visible === 'true';
  wingLOriginal.active = app.config.visi

// ... truncated ...
```

---
*Extracted from Butterfly_Swarm_V6_Hyperfly_edition2_BW.hyp. Attachment ID: 1355068612871716865*