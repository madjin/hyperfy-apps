# Amanita.hyp

## Metadata
- **Author**: Gert-Jan Akerboom
- **Channel**: #💻│developers
- **Date**: 2025-04-03
- **Size**: 107,576 bytes

## Discord Context
> i think this app could work for grasses too, its basically just a grass particle system (but with mushrooms)
if you have some images of the style of grass you are interested in i could try to make some in blender and switch out the model on the app.

## Blueprint
- **Name**: Amanita
- **Version**: 17
- **Model**: `asset://8c88fd46d91ec0803fad12220b7d8db3d8672a4d419539f73194e60e72cf8184.glb`
- **Script**: `asset://b8fb1160767cb85708801d502aa99f0ffbcebe9d8f448b87d5468712b54435e4.js`

## Props
- `clone_count`: int = `500`
- `area_size_x`: int = `100`
- `area_size_z`: int = `30`
- `min_size`: float = `0.01`
- `max_size`: int = `1`

## Assets
- `[model]` 8c88fd46d91ec0803fad12220b7d8db3d8672a4d419539f73194e60e72cf8184.glb (104,888 bytes)
- `[script]` b8fb1160767cb85708801d502aa99f0ffbcebe9d8f448b87d5468712b54435e4.js (1,938 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.get()`

## Keywords (for Discord search)
amanita, area, axis, between, clone, clones, config, configuration, configure, console, cube, degrees, distribute, error, find, ground, initial, inputs, label, meters

## Script Source
```javascript
// Configure UI inputs for the clone parameters
app.configure(() => {
  return [
    {
      key: "clone_count",
      label: "Clone Count",
      type: "number",
      initial: 20,
      min: 1,
      max: 500,
      step: 1,
    },
    {
      key: "area_size_x",
      label: "Area Width (X meters)",
      type: "number",
      initial: 10,
      min: 1,
      max: 100,
      step: 1,
    },
    {
      key: "area_size_z",
      label: "Area Depth (Z meters)",
      type: "number",
      initial: 10,
      min: 1,
      max: 100,
      step: 1,
    },
    {
      key: "min_size",
      label: "Minimum Clone Size",
      type: "number",
      dp: 2,
      initial: 0.2,
      min: 0.01,
      max: 5,
      step: 0.1,
    },
    {
      key: "max_size",
      label: "Maximum Clone Size",
      type: "number",
      dp: 2,
      initial: 2,
      min: 0.1,
      max: 5,
      step: 0.1,
    }
  ];
});

// Get configuration values
const CLONE_COUNT = app.config.clone_count;
const AREA_SIZE_X = app.config.area_size_x;
const AREA_SIZE_Z = app.config.area_size_z;
const MIN_SIZE = app.config.min_size;
const MAX_SIZE = app.config.max_size;

// Get the original cube
const cube = app.get('amanita');

if (!cube) {
  console.error('Could not find Cube');
  return;
}

// Create clones and distribute them randomly
for (let i = 1; i <= CLONE_COUNT; i++) {
  const clone = cube.clone(true);
  
  // Generate random positions within our area
  clone.position.x = num(-AREA_SIZE_X, AREA_SIZE_X, 2);
  clone.position.z = num(-AREA_SIZE_Z, AREA_SIZE_Z, 2);
  clone.position.y = 0;  // Keep on ground
  
  // Random rotation on Y axis (0 to 360 degrees)
  clone.rotation.y = num(0, 360, 2);
  
  // Random uniform scale between min and max size
  const scale = num(MIN_SIZE, MAX_SIZE, 2);
  clone.scale.set(scale, scale, scale);
  
  app.add(clone);
} 
```

---
*Extracted from Amanita.hyp. Attachment ID: 1357382776353198242*