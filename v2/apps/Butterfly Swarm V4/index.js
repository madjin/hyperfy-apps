export default function main(world, app, fetch, props, setTimeout) {

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
      // Calculate the flapping angle using a sine wave based on time and flapSpeed
      const flapAngle = Math.sin(butterfly.timeElapsed * butterfly.flapSpeed) * butterfly.maxFlap;
      // Apply the computed flap angle to each wing (mirrored for natural motion)
      butterfly.wingR.rotation.y = flapAngle;   // Right wing rotates by the computed angle
      butterfly.wingL.rotation.y = -flapAngle;    // Left wing rotates oppositely

      // --- Movement Animation ---
      // Compute oscillatory movement offsets based on sine/cosine functions
      const moveX = Math.sin(butterfly.timeElapsed * butterfly.moveSpeed) * butterfly.moveRange; // X-axis movement
      const moveY = Math.sin(butterfly.timeElapsed * butterfly.moveSpeed * 0.8) * butterfly.moveRange * 0.5; // Y-axis movement (damped)
      const moveZ = Math.cos(butterfly.timeElapsed * butterfly.moveSpeed) * butterfly.moveRange; // Z-axis movement
      // Compute additional drifting offsets for a more natural flight
      const driftX = Math.sin(butterfly.timeElapsed * butterfly.driftSpeed) * butterfly.driftRange; // Drifting in X
      const driftZ = Math.cos(butterfly.timeElapsed * butterfly.driftSpeed * 1.5) * butterfly.driftRange; // Drifting in Z
      
      // Update the container's position by adding the movement and drift offsets to the original start position
      butterfly.container.position.set(
        butterfly.startPosition.x + moveX + driftX,
        butterfly.startPosition.y + moveY,
        butterfly.startPosition.z + moveZ + driftZ
      );
    });
  });
  // Remove the original wings from the scene so they don't render by themselves
wingROriginal.active = app.config.visible === 'true';
wingLOriginal.active = app.config.visible === 'true';
}

}
