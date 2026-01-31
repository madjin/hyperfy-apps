export default function main(world, app, fetch, props, setTimeout) {
// ...// UV Scroll Script for Hyperfy
// Scrolls the texture on a mesh named UVSCROLL

// Get the UVSCROLL mesh
const mesh = app.get('UVSCROLL');
if (!mesh) {
    console.error('Could not find UVSCROLL mesh');
    return;
}

// Configuration for UV scrolling
const scrollConfig = {
    speedX: 0,        // Scroll speed on X-axis (0, as per your original setup)
    speedY: 0.5,      // Scroll speed on Y-axis (0.5, as per your original setup)
    offset: { x: 0, y: 0 } // Current UV offset
};

// Update scrolling every frame
app.on('update', delta => {
    if (!mesh) return;

    // Update the UV offset based on speed and delta time
    scrollConfig.offset.x += scrollConfig.speedX * delta;
    scrollConfig.offset.y += scrollConfig.speedY * delta;

    // Normalize the offset to keep it between 0 and 1 (for seamless looping)
    scrollConfig.offset.x = scrollConfig.offset.x % 1;
    scrollConfig.offset.y = scrollConfig.offset.y % 1;

    // Apply the updated UV offset to the material
    mesh.material.textureX = scrollConfig.offset.x;
    mesh.material.textureY = scrollConfig.offset.y;

    // Ensure the texture scale is set to 1 (full texture, no scaling needed for scrolling)
    mesh.material.textureScaleX = 1;
    mesh.material.textureScaleY = 1;
});

}
