export default function main(world, app, fetch, props, setTimeout) {
// Get the cube model
const cube = app.get('pinepart');

if (!cube) {
  console.error('Could not find Cube model');
  return;
}

// Global random scale for the entire structure
const GLOBAL_SCALE = num(0.5, 1.5, 2); // Random scale between 0.5x and 1.5x
const GLOBAL_Y_ROTATION = num(0, 360); // Random Y-axis rotation for the whole structure

const TOTAL_CUBES = 30;
const CURVE_AMOUNT = 2 * GLOBAL_SCALE; // Scale the curve amount
const TOTAL_HEIGHT = 10 * GLOBAL_SCALE; // Scale total height
const MIN_SCALE = 0.1; // Smallest size at the top
const SPACING_FACTOR = 2; // Controls how much spacing reduces at the top

// Create cubes along the curve
for (let i = 0; i < TOTAL_CUBES; i++) {
    const cubeClone = cube.clone(true);
    
    // Adjust t to create a non-linear height distribution
    const t = 1 - Math.pow(1 - (i / (TOTAL_CUBES - 1)), SPACING_FACTOR);
    
    // Position using sine curve
    const x = CURVE_AMOUNT * Math.sin(t * Math.PI);
    const y = t * TOTAL_HEIGHT;
    
    // Scale the cube (larger at the bottom, smaller at the top) and apply global scaling
    const scale = (1 - t * (1 - MIN_SCALE)) * GLOBAL_SCALE;
    cubeClone.scale.set(scale, scale, scale);
    
    // Apply individual random Y rotation using Hyperfy's num() function
    const randomYRotation = num(0, 360);
    cubeClone.rotation.set(0, randomYRotation, 0);
    
    // Apply global Y rotation
    const rotatedX = x * Math.cos(GLOBAL_Y_ROTATION * (Math.PI / 180)) - 0 * Math.sin(GLOBAL_Y_ROTATION * (Math.PI / 180));
    const rotatedZ = x * Math.sin(GLOBAL_Y_ROTATION * (Math.PI / 180)) + 0 * Math.cos(GLOBAL_Y_ROTATION * (Math.PI / 180));
    
    cubeClone.position.set(rotatedX, y, rotatedZ);
    
    app.add(cubeClone);
}

// Hide the original cube model
cube.visible = false;

}
