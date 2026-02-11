# Butterfly_Swarm_V2a.hyp

## Metadata
- **Author**: Gert-Jan Akerboom
- **Channel**: #🎨│showcase
- **Date**: 2025-03-14
- **Size**: 235,855 bytes

## Discord Context
> Butterfly swarm for Hyperfy V2


Today i made version 3, the flying behavior is now better (pretty and random) 
I added UI inputs for:

Butterfly amount
Random butterfly scale min/max
Random wingflap-speed min/max
Random fly-speed min/max

I would like to have the possibility for people to upload their own ‘butterfly wing .png (not sure if this is possible though)

For now, if you like to create your own version of a butterfly swarm, you can use this blender file (change_wing_image.blend) to change the image in the wing_tex material and export as glb

Then add the app version 3 to your world and change the model for your own.

Things i want to add in later versions:
- Toggle original glb on/off (so you can see where the center of the swarm is)
- have users upload their own wing image
- expose some more variables to the UI
- prevent the butterflies from flying under the ground plane

Have a fun weekend !

## Blueprint
- **Name**: Butterfly Swarm V2a
- **Version**: 26
- **Model**: `asset://b785e0c03925506d6acf8e924f9c4333a13da26300a4f0b5632d105faa5fd16e.glb`
- **Script**: `asset://88ee158290ce9517b63d8709d7708f01f241540da92de4401cb5835cc81d4051.js`

## Assets
- `[model]` b785e0c03925506d6acf8e924f9c4333a13da26300a4f0b5632d105faa5fd16e.glb (30,580 bytes)
- `[script]` 88ee158290ce9517b63d8709d7708f01f241540da92de4401cb5835cc81d4051.js (3,998 bytes)
- `[texture]` 7783fca1251d8e4ae01bf9c29821e9193de189de64d94bec4c69310180ece563.jpg (200,276 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.get()`, `app.on()`, `app.remove()`
**Events Listened**: `update`

## Keywords (for Discord search)
after, apply, between, both, butterflies, butterfly, clone, console, create, createButterfly, creation, delta, directions, down, driftRange, driftSpeed, driftX, driftZ, drifting, each

## Script Source
```javascript
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

```

---
*Extracted from Butterfly_Swarm_V2a.hyp. Attachment ID: 1350129254234587329*