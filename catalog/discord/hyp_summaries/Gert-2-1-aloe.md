# Gert-2-1-aloe.hyp

## Metadata
- **Author**: 0mka
- **Channel**: #🎨│showcase
- **Date**: 2025-03-04
- **Size**: 226,394 bytes

## Blueprint
- **Name**: aloe.glb
- **Version**: 9
- **Model**: `asset://a3be9d4ee7178264bf0ef77d80328bef7788adb61e242e47fffc1e432c23e363.glb`
- **Script**: `asset://74266ad2d09038084c8ab33517657f72fdff037296090d0adc3835dcf80e2ffe.js`

## Props
- `clone_count`: int = `100`
- `area_size`: int = `10`
- `min_size`: float = `0.2`
- `max_size`: int = `2`
- `area_size_x`: int = `1`
- `area_size_z`: int = `10`

## Assets
- `[model]` a3be9d4ee7178264bf0ef77d80328bef7788adb61e242e47fffc1e432c23e363.glb (174,104 bytes)
- `[script]` 74266ad2d09038084c8ab33517657f72fdff037296090d0adc3835dcf80e2ffe.js (1,932 bytes)
- `[texture]` 42816fe9b12043e5ddc4c7d0463d2aa5c74a18ae5c1936d2a743d22d6059e5cc.jpg (49,245 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.get()`

## Keywords (for Discord search)
area, axis, between, clone, clones, config, configuration, configure, console, cube, degrees, distribute, error, find, ground, initial, inputs, label, meters, number

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
      max: 100,
      step: 1,
    },
    {
      key: "area_size_x",
      label: "Area Width (X meters)",
      type: "number",
      initial: 10,
      min: 1,
      max: 50,
      step: 1,
    },
    {
      key: "area_size_z",
      label: "Area Depth (Z meters)",
      type: "number",
      initial: 10,
      min: 1,
      max: 50,
      step: 1,
    },
    {
      key: "min_size",
      label: "Minimum Clone Size",
      type: "number",
      dp: 2,
      initial: 0.2,
      min: 0.1,
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
const cube = app.get('Cube');

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
*Extracted from Gert-2-1-aloe.hyp. Attachment ID: 1346629938626953306*