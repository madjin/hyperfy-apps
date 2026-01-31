export default function main(world, app, fetch, props, setTimeout) {
// Get the original wings
const wingROriginal = app.get('wingR');
const wingLOriginal = app.get('wingL');

if (!wingROriginal || !wingLOriginal) {
  console.error('Could not find wingR or wingL');
  return;
}

// Remove the original wings from the scene
app.remove(wingROriginal);
app.remove(wingLOriginal);

// Function to create a new butterfly in a random position with random movement
function createButterfly() {
  const wingRClone = wingROriginal.clone(true); // Clone right wing
  const wingLClone = wingLOriginal.clone(true); // Clone left wing

  if (!wingRClone || !wingLClone) {
    console.error('Could not clone wingR or wingL');
    return null;
  }

  // Generate random size and position
  const scale = num(0.01, 0.5, 2); // Scale between 0.5x and 1.5x
  const startX = num(-3, 3, 2); // Spread out on X-axis
  const startY = num(3, 8, 2); // Vary heights
  const startZ = num(-3, 3, 2); // Spread out on Z-axis
  const flapSpeed = num(6, 12, 2); // Vary flapping speeds
  const maxFlap = (60 * Math.PI) / 180; // 60-degree range
  const floatSpeed = num(0.2, 0.6, 2); // Speed of floating up/down
  const floatAmount = num(0.5, 2, 2); // How much they float

  // Create a butterfly object that contains both wings and floating motion
  const butterfly = {
    position: { x: startX, y: startY, z: startZ }, // Start position
    scale: scale, // Store scale value
    wings: { wingR: wingRClone, wingL: wingLClone },
    timeElapsed: num(0, Math.PI * 2), // Randomize start time for variation
  };

  // Set initial wing rotation
  const baseAngle = (60 * Math.PI) / 180; // Convert 60 degrees to radians
  wingRClone.rotation.y = baseAngle;
  wingLClone.rotation.y = -baseAngle;

  // Apply scale
  wingRClone.scale.set(scale, scale, scale);
  wingLClone.scale.set(scale, scale, scale);

  // Position the wings at the butterfly's location
  wingRClone.position.set(butterfly.position.x, butterfly.position.y, butterfly.position.z);
  wingLClone.position.set(butterfly.position.x, butterfly.position.y, butterfly.position.z);

  // Animate wings and floating movement
  app.on('update', (delta) => {
    butterfly.timeElapsed += delta; // Accumulate time

    // Flapping motion
    const flapAngle = Math.sin(butterfly.timeElapsed * flapSpeed) * maxFlap;
    wingRClone.rotation.y = baseAngle + flapAngle;
    wingLClone.rotation.y = -baseAngle - flapAngle;

    // Floating movement (butterflies gently move up and down)
    const floatOffset = Math.sin(butterfly.timeElapsed * floatSpeed) * floatAmount;
    const newY = butterfly.position.y + floatOffset;

    // Apply updated positions
    wingRClone.position.set(butterfly.position.x, newY, butterfly.position.z);
    wingLClone.position.set(butterfly.position.x, newY, butterfly.position.z);
  });

  // Add cloned wings to the scene
  app.add(wingRClone);
  app.add(wingLClone);

  return butterfly;
}

// Create a SWARM of butterflies (adjust count for performance)
const butterflies = [];
const BUTTERFLY_COUNT = 50; // Increase this for more butterflies

for (let i = 0; i < BUTTERFLY_COUNT; i++) {
  const newButterfly = createButterfly();
  if (newButterfly) {
    butterflies.push(newButterfly);
  }
}

}
