# generate_monstera_V1.hyp

## Metadata
- **Author**: Agent12
- **Channel**: #💻│developers
- **Date**: 2025-04-03
- **Size**: 90,868 bytes

## Discord Context
> <@601886221072990251> Have you seen this .hyp? 

i'm mostly an AI dev as well (and a poor one at that xD) 

But maybe this working App that does something similar could help you come up with a different path to the same end-goal? 

I'm sure some other dev will also pop in at some point and guide you as well!

## Blueprint
- **Name**: generate monstera V1
- **Version**: 15
- **Model**: `asset://1e11abc5f476b8e23cd77b23aac46ccd4f33712ffbb4e7f2b8280152d6f97053.glb`
- **Script**: `asset://ec78809e17ee8163148e9f628e7058cd2d670b7ee66840137d0fffcfaa5cd9a6.js`

## Props
- `clone_count`: int = `10`

## Assets
- `[model]` 1e11abc5f476b8e23cd77b23aac46ccd4f33712ffbb4e7f2b8280152d6f97053.glb (16,024 bytes)
- `[script]` ec78809e17ee8163148e9f628e7058cd2d670b7ee66840137d0fffcfaa5cd9a6.js (2,269 bytes)
- `[texture]` b4b5743e307726f4f6ddcaf5be4946b493f5ce622c58ef044197db1684879201.png (71,593 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.get()`

## Keywords (for Discord search)
angle, axis, based, between, bottom, client, clone, clones, cloning, console, convert, count, cube, cubes, cumulative, cumulativeSpacing, deep, degrees, enabled, error

## Script Source
```javascript
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

```

---
*Extracted from generate_monstera_V1.hyp. Attachment ID: 1357367596844056757*