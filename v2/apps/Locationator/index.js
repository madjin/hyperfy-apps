export default function main(world, app, fetch, props, setTimeout) {
// =================================================================
// World Position and Rotation Text Display Script
// Displays the world coordinates and rotation of the app object as a compact, billboarded UI text label.
// =================================================================

// Ensure app, position, and rotation exist
if (!app || !app.position || !app.rotation) {
  console.error('[POSITION DISPLAY] App, app.position, or app.rotation not found');
  return;
}

// Create UI container
const ui = app.create('ui', {
  width: 270, // Compact width
  height: 50, // Increased height to fit rotation
  backgroundColor: 'rgba(0,15,30,0.9)', // Dark background
});
ui.billboard = 'y'; // Face camera on Y-axis
ui.position.set(0, 1.5, 0); // 1.5 units above app
ui.borderRadius = 8; // Subtle curve
ui.padding = 5; // Tight padding
ui.justifyContent = 'center';
ui.alignItems = 'center';

// Create UI text for position and rotation
const positionText = app.create('uitext');
positionText.value = 'X: 0.00, Y: 0.00, Z: 0.00\nRX: 0.00, RY: 0.00, RZ: 0.00'; // Initial value, multi-line
positionText.fontSize = 16; // Small font
positionText.color = '#ffffff'; // White text
positionText.textAlign = 'center';

// Add text to UI container
ui.add(positionText);

// Add UI container to app
app.add(ui);

// Update loop: Update text with world coordinates and rotation
app.on('update', () => {
  if (app && app.position && app.rotation) {
    const pos = app.position;
    const rot = app.rotation; // Euler angles in radians
    positionText.value = `X: ${pos.x.toFixed(2)}, Y: ${pos.y.toFixed(2)}, Z: ${pos.z.toFixed(2)}\nRX: ${rot.x.toFixed(2)}, RY: ${rot.y.toFixed(2)}, RZ: ${rot.z.toFixed(2)}`;
  }
});

// Optional: Function to move and rotate the app (for testing)
function moveAndRotateApp(x, y, z, rx, ry, rz) {
  if (app && app.position && app.rotation) {
    app.position.set(x, y, z);
    app.rotation.set(rx, ry, rz); // Radians
  }
}

// Example usage:
// moveAndRotateApp(2, 1, -3, 0, Math.PI / 4, 0); // Move and rotate 45 degrees on Y
}
