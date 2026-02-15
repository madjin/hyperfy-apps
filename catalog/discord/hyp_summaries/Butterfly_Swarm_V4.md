# Butterfly_Swarm_V4.hyp

## Metadata
- **Author**: Gert-Jan Akerboom
- **Channel**: #🎨│showcase
- **Date**: 2025-03-25
- **Size**: 241,905 bytes

## Blueprint
- **Name**: Butterfly Swarm V4
- **Version**: 102
- **Model**: `asset://f1b429aafb76cd7bbe3355ad8c013182ed0ff2aa859a2192d4968f08b306b00f.glb`
- **Script**: `asset://ee686d31a078424a6c2b760b03432ae7327b9b0f671f2649fc758a7cc9f928ae.js`

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
- `butterfly_amount`: int = `50`
- `scale_min`: float = `0.1`
- `scale_max`: float = `0.5`
- `flapspeed_min`: int = `5`
- `flapspeed_max`: int = `20`
- `flyspeed_min`: float = `0.1`
- `flyspeed_max`: float = `0.5`
- `og_onoff`: str = `no`
- `og_visible`: str = `false`
- `visible`: str = `true`

## Assets
- `[model]` f1b429aafb76cd7bbe3355ad8c013182ed0ff2aa859a2192d4968f08b306b00f.glb (30,492 bytes)
- `[script]` ee686d31a078424a6c2b760b03432ae7327b9b0f671f2649fc758a7cc9f928ae.js (9,716 bytes)
- `[texture]` 7783fca1251d8e4ae01bf9c29821e9193de189de64d94bec4c69310180ece563.jpg (200,276 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.get()`, `app.on()`
**Events Listened**: `update`
**Nodes Created**: `group`

## Keywords (for Discord search)
active, acts, adding, additional, amount, angle, animation, animations, around, array, axis, based, between, butterflies, butterfly, client, clone, cloned, clones, computed

## Script Source
```javascript

app.configure(() => {
  return [

    {
      type: 'switch',
      key: 'visible',           // the key on `props` to set this value
      label: 'Original Butterfly Visible',         // the label for the text input
      options: [
        {
          label: 'True',     // the label to show on this switch item
          value: 'true',     // the value to set on the props when selected
        },
        {
          label: 'False',     // the label to show on this switch item
          value: 'false',     // the value to set on the props when selected
        }
      ],
      initial: 'true',       // the initial value to set if not configured
    },
    {
			type: 'section',
			key: 'amount',
			label: 'set the amount of butterflies min 1 / max 5000',
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
			label: 'Set random scale_min 0.1/max 10',
		},
    {
      key: "scale_min",
      label: "Scale Min",
      type: "number",
      initial: 0.1,
      min: 0.1,
      max: 10,
      dp:1,
      step: 0.1,
    },
    {
      key: "scale_max",
      label: "Scale Max",
      type: "number",
      initial: 0.5,
      min: 0.1,
      max: 10,
      dp:1,
      step: 0.1,
    },
    {
			type: 'section',
			key: 'flapspeed',
			label: 'Set random Flap-speed_min 1/max 50',
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
			label: 'Set random Fly-speed_min 0.1/max 20',
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




// Function to create a new butterfly with its own container for random rotation
function createButterfly() {
  // Clone the original wing nodes for a new butterfly
  const wingRClone = wingROriginal.clone(true); // Clone right wing (deep clone)
  const wingLClone = wingLOriginal.clone(true); // Clone left wing (deep clone)

  if (!wingRClone || !wingLClone) {
    console.error('Could not clone wingR or wingL');
    return null;
  }
  

  // Generate random properties for this butterfly using the num() function
  const scale = num(app.config.scale_min, app.config.scale_max, 2);           // Random scale factor between 0.1 and 0.5 (2 decimal places)
  const startX = num(-10, 10, 2);            // Random starting X coordinate between -10 and 10
  const startY = num(-10, 10, 2);               // Random starting Y coordinate between 3 and 8
  const startZ = num(-10, 10, 2);            // Random starting Z coordinate between -10 and 10
  const flapSpeed = num(app.config.flapspeed_min, app.config.flapspeed_max, 2);           // Random wing flapping speed between 8 and 15
  const maxFlap = (60 * Math.PI) / 180;      // Maximum flap angle (60° converted to radians)
  const moveSpeed = num(app.config.flyspeed_min, app.config.flyspeed_max, 2);         // Random movement speed between 0.2 and 0.6
  const moveRange = num(1, 10, 2);             // Random movement range between 1 and 3 units
  const driftSpeed = num(0.1, 0.5, 2);        // Random drifting speed between 0.1 and 0.5
  const driftRange = num(0.5, 2, 2);          // Random drifting range between 0.5 and 2 units

  // Create a container node (of type 'group') to hold the butterfly parts
  const container = app.create('group', {}); // Group acts as a container for position, rotation, and scale

  // Apply a random rotation to the container so butterflies are not all upright
  const rotX = num(-45, 45, 2) * (Math.PI / 180); // Random rotation around X-axis (between -45° and 45° in radians)
  const rotY = num(0, 360, 2) * (Math.PI / 180);   // Random rotation around Y-axis (between 0° and 360° in radians)
  const rotZ = num(-45, 45, 2) * (Math.PI / 180);  // Random rotation around Z-axis (between -45° and 45° in radians)
  container.rotation.set(rotX, rotY, rotZ);         // Set the container's rotation

  // Set the container's initial position and scale based on the generated random values
  container.position.set(startX, startY, startZ);   // Position the container at the random start coordinates
  container.scale.set(scale, scale, scale);          // Scale the container uniformly

  // Position the cloned wings at the origin of the container and reset their rotations
  wingRClone.position.set(0, 0, 0);                  // Position right wing at container's origin
  wingLClone.position.set(0, 0, 0);                  // Position left wing at container's origin
  wingRClone.rotation.set(0, 0, 0);                  // Reset right wing rotation to zero
  wingLClone.rotation.set(0, 0, 0);                  // Reset left wing rotation to zero

  // Attach the wing clones to the container so they inherit its transformation
  container.add(wingRClone);                         // Add right wing to container
  container.add(wingLClone);                         // Add left wing to container

  // Return an object that encapsulates the butterfly's state for animation
  return {
    container: container,                           // The container node holding the butterfly
    wingR: wingRClone,                              // Cloned right wing
    wingL: wingLClone,                              // Cloned left wing
    startPosition: { x: startX, y: startY, z: startZ }, // Original starting position
    flapSpeed: flapSpeed,                           // Flapping speed for wing animation
    maxFlap: maxFlap,                               // Maximum flap angle
    moveSpeed: moveSpeed,                           // Movement speed for oscillatory motion
    moveRange: moveRange,                           // Range of movement from the starting position
    driftSpeed: driftSpeed,                         // Speed for additional drifting motion
    driftRange: driftRange,                         // Range for drifting effect
    timeElapsed: num(0, Math.PI * 2)                // Initial time offset for animation (0 to 2π)
  };
}

// Create a swarm of butterflies
const butterflies = [];              // Array to hold all butterfly state objects
const BUTTERFLY_COUNT = app.config.butterfly_amount;          // Total number of butterflies to create

for (let i = 0; i < BUTTERFLY_COUNT; i++) {
  const butterfly = createButterfly();  // Create a new butterfly instance
  if (butterfly) {
    butterflies.push(butterfly);          // Add the butterfly to the array
    app.add(butterfly.container);           // Add the butterfly container to the scene
  }
}

// Animate the butterflies on the client side
if (world.isClient) {
  app.on('update', (delta) => {
    butterflies.forEach(butterfly => {
      // Increment the timeElapsed property to drive the animations
      butterfly.timeElapsed += delta;

      // --- Wing Flapping Animation ---
      // Calculate the flapping angle using a sine wave based on time an

// ... truncated ...
```

---
*Extracted from Butterfly_Swarm_V4.hyp. Attachment ID: 1354099790685802537*