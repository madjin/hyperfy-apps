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

// Function to create a new butterfly with random movement
function createButterfly() {
  const wingRClone = wingROriginal.clone(true); // Clone right wing
  const wingLClone = wingLOriginal.clone(true); // Clone left wing

  if (!wingRClone || !wingLClone) {
    console.error('Could not clone wingR or wingL');
    return null;
  }

  // Generate random properties for each butterfly
  const scale = num(0.1, 0.5, 2); // Scale between 0.5x and 1.5x
  const startX = num(-10, 10, 2); // Start position on X
  const startY = num(3, 8, 2); // Start position on Y
  const startZ = num(-10, 10, 2); // Start position on Z
  const flapSpeed = num(1, 5, 2); // **Slow down flapping (was 6-12)**
  const maxFlap = (10 * Math.PI) / 180; // **Reduce max flap range (was 60°)**
  const moveSpeed = num(0.2, 0.6, 2); // Speed of movement
  const moveRange = num(1, 3, 2); // How far they move
  const driftSpeed = num(0.1, 0.5, 2); // Drifting effect
  const driftRange = num(0.5, 2, 2); // Drifting range
  

  // Create a butterfly object to store movement & rotation
  const butterfly = {
    position: { x: startX, y: startY, z: startZ },
    scale: scale,
    wings: { wingR: wingRClone, wingL: wingLClone },
    timeElapsed: num(0, Math.PI * 2), // Randomize start time
  };

  // Set scale
  wingRClone.scale.set(scale, scale, scale);
  wingLClone.scale.set(scale, scale, scale);

  // Attach wings to the butterfly and apply initial position
  wingRClone.position.set(butterfly.position.x, butterfly.position.y, butterfly.position.z);
  wingLClone.position.set(butterfly.position.x, butterfly.position.y, butterfly.position.z);

  // Animate wings & floating movement
  app.on('update', (delta) => {
    butterfly.timeElapsed += delta; // Accumulate time

    // **Slower Wing Flapping Animation**
    const flapAngle = Math.sin(butterfly.timeElapsed * flapSpeed) * maxFlap;

    // Apply flapping motion while keeping the butterfly rotation
    wingRClone.rotation.y += flapAngle;
    wingLClone.rotation.y -= flapAngle;

    // Smooth random movement in all directions (X, Y, Z)
    const moveX = Math.sin(butterfly.timeElapsed * moveSpeed) * moveRange;
    const moveY = Math.sin(butterfly.timeElapsed * moveSpeed * 0.8) * moveRange * 0.5;
    const moveZ = Math.cos(butterfly.timeElapsed * moveSpeed) * moveRange;

    // Additional drifting effect
    const driftX = Math.sin(butterfly.timeElapsed * driftSpeed) * driftRange;
    const driftZ = Math.cos(butterfly.timeElapsed * driftSpeed * 1.5) * driftRange;

    // Update butterfly position
    butterfly.position.x = startX + moveX + driftX;
    butterfly.position.y = startY + moveY;
    butterfly.position.z = startZ + moveZ + driftZ;

    // Apply new position to both wings
    wingRClone.position.set(butterfly.position.x, butterfly.position.y, butterfly.position.z);
    wingLClone.position.set(butterfly.position.x, butterfly.position.y, butterfly.position.z);
  });

  // Add the whole butterfly to the scene
  app.add(wingRClone);
  app.add(wingLClone);

  return butterfly;
}

// Create a SWARM of butterflies
const butterflies = [];
const BUTTERFLY_COUNT = 100; // Adjust for performance

for (let i = 0; i < BUTTERFLY_COUNT; i++) {
  const newButterfly = createButterfly();
  if (newButterfly) {
    // Apply a **random initial rotation** to each butterfly clone after creation
    const randomRotationX = num(-45, 45, 2) * (Math.PI / 180);
    const randomRotationY = num(0, 360, 2) * (Math.PI / 180);
    const randomRotationZ = num(-45, 45, 2) * (Math.PI / 180);

    
    butterflies.push(newButterfly);
  }
}

}
