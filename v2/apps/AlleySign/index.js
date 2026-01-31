export default function main(world, app, fetch, props, setTimeout) {
// =================================================================
// Slow Rotation Script
// This script rotates the object slowly around its Y-axis.
// =================================================================

// Rotation speed in radians per second (adjust as needed)
const rotationSpeed = 0.1;

// Update loop: Called every frame
app.on('update', delta => {
  // Increase the Y-axis rotation based on the elapsed time
  app.rotation.y += rotationSpeed * delta;
});

}
