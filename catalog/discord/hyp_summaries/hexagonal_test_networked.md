# hexagonal_test_networked.hyp

## Metadata
- **Author**: cru
- **Channel**: #🎨│showcase
- **Date**: 2025-03-29
- **Size**: 473,394 bytes

## Discord Context
> interesting hexagonal panels that react to player and change color 
made em for a mini-game project

## Blueprint
- **Name**: hexagonal_test
- **Version**: 115
- **Model**: `asset://62a8304a6f23cec0e3c628533d3aacf99beefd743ee2daf670225e4a0fe3e09c.glb`
- **Script**: `asset://9cd5758c9e7abcc46c33a5426a4a6f45b8f3ba151176dfb3663afa4778630765.js`

## Props
- `shiftDistance`: int = `10`
- `shiftSpeed`: int = `50`
- `oscillationAmplitude`: int = `1`
- `oscillationFrequency`: int = `25`
- `uvTransitionSpeed`: int = `2`
- `uvCycleFPS`: int = `6`
- `uvScrollSpeed`: int = `100`
- `uvTrailSpeed`: int = `6`

## Assets
- `[model]` 62a8304a6f23cec0e3c628533d3aacf99beefd743ee2daf670225e4a0fe3e09c.glb (462,844 bytes)
- `[script]` 9cd5758c9e7abcc46c33a5426a4a6f45b8f3ba151176dfb3663afa4778630765.js (9,720 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.get()`, `app.on()`, `app.send()`
**Events Listened**: `padContactEnd`, `padContactStart`, `padStateUpdate`, `update`

## Keywords (for Discord search)
active, activeOffset, appended, assumed, back, baseY, based, between, broadcasts, child, client, clients, colliders, computed, configuration, configure, current, cycle, data, default

## Script Source
```javascript
// Helper: Convert an integer (1-100) to a float (0.1 - 2)
// Formula: effective = ((value - 1) / 99) * 1.9 + 0.1
function scaleValue(value) {
  return ((value - 1) / 99) * 1.9 + 0.1;
}

// --- Configuration ---
// Each field uses an integer range of 1–100 that is scaled to the effective range 0.1–2.
app.configure([
  {
    key: 'shiftDistance',
    type: 'number',
    label: 'Shift Distance (1-100)',
    initial: 1, // effective 0.1
    min: 1,
    max: 100,
    step: 1
  },
  {
    key: 'shiftSpeed',
    type: 'number',
    label: 'Shift Speed (1-100)',
    initial: 50, // effective ~1.04
    min: 1,
    max: 100,
    step: 1
  },
  {
    key: 'oscillationAmplitude',
    type: 'number',
    label: 'Oscillation Amplitude (1-100)',
    initial: 10, // effective ~0.27
    min: 1,
    max: 100,
    step: 1
  },
  {
    key: 'oscillationFrequency',
    type: 'number',
    label: 'Oscillation Frequency (1-100)',
    initial: 50, // effective ~1.04
    min: 1,
    max: 100,
    step: 1
  },
  {
    key: 'uvScrollSpeed',
    type: 'number',
    label: 'UV Scroll Speed (1-100)',
    initial: 50, // effective ~1.04
    min: 1,
    max: 100,
    step: 1
  },
  {
    key: 'uvTrailSpeed',
    type: 'number',
    label: 'UV Trail Speed (1-100)',
    initial: 50, // effective ~1.04
    min: 1,
    max: 100,
    step: 1
  }
]);

// Scale the configuration values.
const shiftDistance = scaleValue(props.shiftDistance);
const shiftSpeed = scaleValue(props.shiftSpeed);
const oscillationAmplitude = scaleValue(props.oscillationAmplitude);
const oscillationFrequency = scaleValue(props.oscillationFrequency);
const uvScrollSpeed = scaleValue(props.uvScrollSpeed);
const uvTrailSpeed = scaleValue(props.uvTrailSpeed);

// --- UV States ---
// Define 6 distinct UV states (normalized offsets) for texture scrolling.
const uvStates = [
  { x: 0.0,   y: 0.0 },
  { x: 0.166, y: 0.0 },
  { x: 0.332, y: 0.0 },
  { x: 0.0,   y: 0.5 },
  { x: 0.166, y: 0.5 },
  { x: 0.332, y: 0.5 }
];

// --- Data Storage ---
// panelObjects holds the parent objects (with colliders) which will be moved.
// panelConfigs holds the simulation state for each pad and a reference to its UV child mesh.
const panelConfigs = {};
const panelObjects = {};
let time = 0; // Global timer for idle oscillation

// --- Setup Each Hexagon Panel ---
// Panels are named "Hexagonal_Panel024" to "Hexagonal_Panel048".
// The parent object (e.g., "Hexagonal_Panel025") is moved, while the UV mesh is the child object (e.g., "Hexagonal_Panel025MeshLOD0").
for (let i = 24; i <= 48; i++) {
  const panelNumber = i.toString().padStart(3, '0');
  const panelName = `Hexagonal_Panel${panelNumber}`;
  const parentObj = app.get(panelName);
  if (!parentObj) continue; // Skip if not found

  panelObjects[panelName] = parentObj;
  
  // Get the UV mesh; assumed to be named with "MeshLOD0" appended.
  const uvMeshName = `${panelName}MeshLOD0`;
  const uvMesh = app.get(uvMeshName);
  
  // Deterministic phase for idle oscillation (evenly distributed between 0 and 2π)
  const phase = ((i - 24) / (48 - 24)) * 2 * Math.PI;
  
  // Initialize simulation state.
  panelConfigs[panelName] = {
    // Physical movement state.
    baseY: parentObj.position.y,       // Baseline vertical position.
    phase: phase,                      // Unique phase for idle oscillation.
    active: false,                     // True when the pad is stepped on.
    dipTarget: parentObj.position.y,   // Target when stepped on (baseY - shiftDistance).
    shifting: false,                   // Indicates movement is in progress.
    targetY: parentObj.position.y,     // Current target vertical position.
    // UV scrolling state.
    uv: {
      active: false,                   // True when UV scrolling is active.
      stateIndex: 0,                   // Current index in uvStates.
      progress: 0,                     // Interpolation progress between states.
      current: { x: uvStates[0].x, y: uvStates[0].y },
      target: { x: uvStates[1].x, y: uvStates[1].y },
      // lastOffset is used for trailing/fading off mid-cycle.
      lastOffset: { x: uvStates[0].x, y: uvStates[0].y }
    },
    uvMesh: uvMesh                     // Reference to the UV child mesh.
  };

  // --- Event Handlers for Contact ---
  // In a networked setup, if running on a client, send events to the server.
  parentObj.onContactStart = (e) => {
    if (world.isServer) {
      const cfg = panelConfigs[panelName];
      cfg.active = true;
      cfg.dipTarget = cfg.baseY - shiftDistance;
      cfg.shifting = true;
      cfg.uv.active = true;
      cfg.uv.progress = 0;
      cfg.uv.stateIndex = 0;
      cfg.uv.current = { x: uvStates[0].x, y: uvStates[0].y };
      cfg.uv.target = { x: uvStates[1].x, y: uvStates[1].y };
      cfg.uv.lastOffset = { x: uvStates[0].x, y: uvStates[0].y };
    } else {
      app.send('padContactStart', { panelName: panelName });
    }
  };

  parentObj.onContactEnd = (e) => {
    if (world.isServer) {
      const cfg = panelConfigs[panelName];
      cfg.active = false;
      cfg.shifting = true;
      cfg.uv.active = false;
    } else {
      app.send('padContactEnd', { panelName: panelName });
    }
  };
}

// --- Server: Process Incoming Contact Events from Clients ---
if (world.isServer) {
  app.on('padContactStart', (data) => {
    const panelName = data.panelName;
    const cfg = panelConfigs[panelName];
    if (cfg) {
      cfg.active = true;
      cfg.dipTarget = cfg.baseY - shiftDistance;
      cfg.shifting = true;
      cfg.uv.active = true;
      cfg.uv.progress = 0;
      cfg.uv.stateIndex = 0;
      cfg.uv.current = { x: uvStates[0].x, y: uvStates[0].y };
      cfg.uv.target = { x: uvStates[1].x, y: uvStates[1].y };
      cfg.uv.lastOffset = { x: uvStates[0].x, y: uvStates[0].y };
    }
  });
  app.on('padContactEnd', (data) => {
    const panelName = data.panelName;
    const cfg = panelConfigs[panelName];
    if (cfg) {
      cfg.active = false;
      cfg.shifting = true;
      cfg.uv.active = false;
    }
  });
}

// --- Update Loop ---
// The server runs the simulation and then broadcasts the state.
// Clients simply update their local parent objects and UV meshes based on the received state.
if (world.isServer) {
  app.on('update', (delta) => {
    time += delta; // Increment global timer for idle oscillation.
    const netState = {};

    for (const panelName in panelConfigs) {
      const cfg = panelConfigs[panelName];
      const obj = panelObjects[panelName];
      if (!obj) continue;

      // --- Physical Movement Update ---
      if (cfg.active) {
        cfg.targetY = cfg.dipTarget;
      } else {
        const oscillation = oscillationAmplitude * Math.sin(2 * Math.PI * oscillationFrequency * time + cfg.phase);
        cfg.targetY = cfg.baseY + oscillation;
      }
      const diff = cfg.targetY - obj.position.y;
      const step = shiftSpeed * delta;
      if (Math.abs(diff) <= step) {
        obj.position.y = cfg.targetY;
        cfg.shifting = false;
      } else {
        obj.position.y += Math.sign(diff) * step;
      }

      // --- UV Scrolling Update ---
      let displayUV;
      if (cfg.uv.active) {
        cfg.uv.progress += uvScrollSpeed * delta;
        if (cfg.uv.progress >= 1) {
          cfg.uv.progress -= 1;
          cfg.uv.stateIndex = (cfg.uv.stateIndex + 1) % uvStates.length;
          cfg.uv.current = { x: cfg.uv.target.x, y: cfg.uv.target.y };
          let nextIndex = (cfg.uv.stateIndex + 1) % uvStates.length;
          cfg.uv.target = { x: uvStates[nextIndex].x, y: uvStates[nextIndex].y };
        }
        const activeOffset = {
          x: cfg.uv.current.x + (cfg.uv.target.x - cfg.uv.current.x) * cfg.uv.progress,
          y: cfg.uv.current.y + (cfg.uv.target.y - cfg.uv.current.y) * cfg

// ... truncated ...
```

---
*Extracted from hexagonal_test_networked.hyp. Attachment ID: 1355683927712600184*