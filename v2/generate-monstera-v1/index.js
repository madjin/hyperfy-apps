export default function main(world, app, fetch, props, setTimeout) {
// Ensure the script only runs on the client side
if (!world.isClient) return;

// Get the original cube GLB from the scene
const cube = app.get('monstera');
if (!cube) {
  console.error('Could not find Cube');
  return;
}

// Generate a random clone count between 3 and 30 (inclusive)
// Using Math.floor on num(3, 31) guarantees an integer between 3 and 30
const CLONE_COUNT = Math.floor(num(3, 31));

console.log(`Random clone count selected: ${CLONE_COUNT}`);

// Variables for managing cumulative vertical spacing
let cumulativeSpacing = 0;

// Define the min and max values for random spacing (in world units)
const MIN_SPACING = 0.01;
const MAX_SPACING = 0.5;

// Define the min and max values for random rotation (in degrees)
const MIN_ROTATION = 0;
const MAX_ROTATION = 360;

// Define max and min scale values for the clones
const MAX_SCALE = 3;  // Largest scale for the bottom clone
const MIN_SCALE = 0.5;  // Smallest scale for the top clone

// Clone and position the cubes based on the random clone count
for (let i = 1; i <= CLONE_COUNT; i++) {
  // Clone the original cube (deep cloning enabled)
  const clone = cube.clone(true);
  
  // Generate a random spacing value using the global num method
  const randomSpacing = num(MIN_SPACING, MAX_SPACING);
  cumulativeSpacing += randomSpacing;
  
  // Position the clone upward using the cumulative random spacing
  clone.position.y = cube.position.y + cumulativeSpacing;
  
  // Generate a random rotation angle (in degrees) using the global num method
  const randomRotation = num(MIN_ROTATION, MAX_ROTATION);
  // Set the clone's y-axis rotation (convert degrees to radians)
  clone.rotation.y = randomRotation * (Math.PI / 180);
  
  // Calculate a scale factor for this clone so that the bottom clone is the largest
  // and the top clone is the smallest. We linearly interpolate between MAX_SCALE and MIN_SCALE.
  let scaleFactor;
  if (CLONE_COUNT > 1) {
    scaleFactor = MAX_SCALE - ((MAX_SCALE - MIN_SCALE) * ((i - 1) / (CLONE_COUNT - 1)));
  } else {
    scaleFactor = MAX_SCALE;
  }
  
  // Apply the scale uniformly
  clone.scale.set(scaleFactor, scaleFactor, scaleFactor);
  
  // Add the clone to the scene
  app.add(clone);
}

}
