# firstHYP.hyp

## Metadata
- **Author**: vox
- **Channel**: #🎨│showcase
- **Date**: 2025-04-23
- **Size**: 535,938 bytes

## Discord Context
> made my first test  .hyp app ever. sorry for beeing so late to the party.

## Blueprint
- **Name**: ROOMERS4
- **Version**: 1
- **Model**: `asset://789a8e63d520e9ea27bf9fcd4bb1132aa42258fc810d57cb2dd58a99221c1805.glb`
- **Script**: `asset://bfb20f83f91adf9d06b277b07974706b47965e067d74b35a82ae2d325697d11a.js`

## Assets
- `[model]` 789a8e63d520e9ea27bf9fcd4bb1132aa42258fc810d57cb2dd58a99221c1805.glb (533,968 bytes)
- `[script]` bfb20f83f91adf9d06b277b07974706b47965e067d74b35a82ae2d325697d11a.js (1,307 bytes)

## Script Analysis
**App Methods**: `app.get()`, `app.on()`
**Events Listened**: `update`

## Keywords (for Discord search)
axis, based, between, console, delta, error, every, find, frame, full, keep, looping, material, mesh, named, needed, offset, original, scale, scaling

## Script Source
```javascript
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

```

---
*Extracted from firstHYP.hyp. Attachment ID: 1364577094914539541*