export default function main(world, app, fetch, props, setTimeout) {
// Helper: Convert an integer (1-100) to a float (0.1 - 2)
// Formula: effective = ((value - 1) / 99) * (2 - 0.1) + 0.1
function scaleValue(value) {
  return ((value - 1) / 99) * 1.9 + 0.1;
}

// --- Configuration ---
// Each field now has a min of 1 and a max of 100.
// Their integer value will be scaled to an effective range of 0.1 to 2.
app.configure([
  {
    key: 'shiftDistance',
    type: 'number',
    label: 'Shift Distance (1-100)',
    initial: 1, // Effective: 0.1
    min: 1,
    max: 100,
    step: 1
  },
  {
    key: 'shiftSpeed',
    type: 'number',
    label: 'Shift Speed (1-100)',
    initial: 50, // Effective: ~1.04
    min: 1,
    max: 100,
    step: 1
  },
  {
    key: 'oscillationAmplitude',
    type: 'number',
    label: 'Oscillation Amplitude (1-100)',
    initial: 10, // Effective: ~0.2717
    min: 1,
    max: 100,
    step: 1
  },
  {
    key: 'oscillationFrequency',
    type: 'number',
    label: 'Oscillation Frequency (1-100)',
    initial: 50, // Effective: ~1.04
    min: 1,
    max: 100,
    step: 1
  },
  {
    key: 'uvScrollSpeed',
    type: 'number',
    label: 'UV Scroll Speed (1-100)',
    initial: 50, // Effective: ~1.04
    min: 1,
    max: 100,
    step: 1
  },
  {
    key: 'uvTrailSpeed',
    type: 'number',
    label: 'UV Trail Speed (1-100)',
    initial: 50, // Effective: ~1.04
    min: 1,
    max: 100,
    step: 1
  }
]);

// Obtain effective configuration values by scaling the integer inputs.
const shiftDistance = scaleValue(props.shiftDistance);
const shiftSpeed = scaleValue(props.shiftSpeed);
const oscillationAmplitude = scaleValue(props.oscillationAmplitude);
const oscillationFrequency = scaleValue(props.oscillationFrequency);
const uvScrollSpeed = scaleValue(props.uvScrollSpeed);
const uvTrailSpeed = scaleValue(props.uvTrailSpeed);

// --- UV States ---
// Define 6 distinct UV states (normalized offsets) for texture scrolling.
const uvStates = [
  { x: 0.9,   y: 0.3 },
  { x: 0.5, y: 0.0 },
  { x: 0.332, y: 0.0 },
  { x: 0.0,   y: 0.5 },
  { x: 0.166, y: 0.5 },
  { x: 0.332, y: 0.5 }
];

// --- Storage for panel data ---
const panelConfigs = {};
const panelMeshes = {};
let time = 0; // Global timer for idle oscillation

// --- Setup each hexagon panel ---
// Panels are named "Hexagonal_Panel024" to "Hexagonal_Panel048".
// Their physical mesh is obtained by name (e.g., "Hexagonal_Panel025"),
// and their UV mesh is separately named with "MeshLOD0" appended.
for (let i = 24; i <= 48; i++) {
  const panelNumber = i.toString().padStart(3, '0');
  const panelName = `Hexagonal_Panel${panelNumber}`;
  const panel = app.get(panelName);
  if (!panel) continue;  // Skip if not found

  panelMeshes[panelName] = panel;
  
  // Get the UV mesh (assumed to be named like "Hexagonal_Panel025MeshLOD0")
  const uvMeshName = `${panelName}MeshLOD0`;
  const uvMesh = app.get(uvMeshName);
  
  // Deterministic phase for idle oscillation (evenly distributed between 0 and 2π)
  const phase = ((i - 24) / (48 - 24)) * 2 * Math.PI;
  
  // Initialize configuration for physical movement and UV scrolling.
  panelConfigs[panelName] = {
    // Physical movement parameters
    baseY: panel.position.y,             // Baseline vertical position.
    phase: phase,                        // Unique phase for idle oscillation.
    active: false,                       // True when the pad is stepped on.
    dipTarget: panel.position.y,         // Target when stepped on (baseY - shiftDistance).
    shifting: false,                     // Flag to indicate movement in progress.
    targetY: panel.position.y,           // Current target vertical position.
    // UV scrolling parameters
    uv: {
      active: false,                     // True when UV scrolling is active.
      stateIndex: 0,                     // Current index in the uvStates array.
      progress: 0,                       // Interpolation progress between UV states [0, 1).
      current: { x: uvStates[0].x, y: uvStates[0].y },
      target: { x: uvStates[1].x, y: uvStates[1].y },
      // lastOffset holds the last computed UV offset to allow trailing off from any point.
      lastOffset: { x: uvStates[0].x, y: uvStates[0].y }
    },
    uvMesh: uvMesh  // Reference to the UV mesh whose material will be updated.
  };

  // --- Contact Float Down Effect ---
  // When a player steps on the panel, start the float-down (dip) effect and begin UV scrolling.
  panel.onContactStart = (e) => {
    const cfg = panelConfigs[panelName];
    cfg.active = true;
    // Set dip target relative to the baseline.
    cfg.dipTarget = cfg.baseY - shiftDistance;
    cfg.shifting = true;
    // Start the UV scrolling cycle.
    cfg.uv.active = true;
    cfg.uv.progress = 0;
    cfg.uv.stateIndex = 0;
    cfg.uv.current = { x: uvStates[0].x, y: uvStates[0].y };
    cfg.uv.target = { x: uvStates[1].x, y: uvStates[1].y };
    // Also reset the lastOffset to start the fade from the beginning.
    cfg.uv.lastOffset = { x: uvStates[0].x, y: uvStates[0].y };
  };

  // When the player steps off, resume idle oscillation and begin trailing the UV offset back.
  panel.onContactEnd = (e) => {
    const cfg = panelConfigs[panelName];
    cfg.active = false;
    cfg.shifting = true;
    cfg.uv.active = false;
  };
}

// --- Update loop ---
// Handles both the physical movement (idle oscillation / contact float down)
// and the UV scrolling updates.
app.on('update', (delta) => {
  time += delta;  // Increment global time for oscillation
  
  // Process each panel.
  for (const panelName in panelConfigs) {
    const cfg = panelConfigs[panelName];
    const panel = panelMeshes[panelName];
    if (!panel) continue;
    
    // --- Physical Movement Update ---
    // If contact is active, target is the dip target; otherwise, oscillate about baseY.
    if (cfg.active) {
      cfg.targetY = cfg.dipTarget;
    } else {
      const oscillation = oscillationAmplitude * Math.sin(2 * Math.PI * oscillationFrequency * time + cfg.phase);
      cfg.targetY = cfg.baseY + oscillation;
    }
    
    // Smoothly move panel toward targetY.
    const diff = cfg.targetY - panel.position.y;
    const step = shiftSpeed * delta;
    if (Math.abs(diff) <= step) {
      panel.position.y = cfg.targetY;
      cfg.shifting = false;
    } else {
      panel.position.y += Math.sign(diff) * step;
    }
    
    // --- UV Scrolling Update ---
    let displayUV;
    if (cfg.uv.active) {
      // While contact is active, cycle through the UV states.
      cfg.uv.progress += uvScrollSpeed * delta;
      if (cfg.uv.progress >= 1) {
        cfg.uv.progress -= 1;
        // Advance the state index cyclically.
        cfg.uv.stateIndex = (cfg.uv.stateIndex + 1) % uvStates.length;
        // Set current to the previous target.
        cfg.uv.current = { x: cfg.uv.target.x, y: cfg.uv.target.y };
        let nextIndex = (cfg.uv.stateIndex + 1) % uvStates.length;
        cfg.uv.target = { x: uvStates[nextIndex].x, y: uvStates[nextIndex].y };
      }
      // Compute the active UV offset.
      const activeOffset = {
        x: cfg.uv.current.x + (cfg.uv.target.x - cfg.uv.current.x) * cfg.uv.progress,
        y: cfg.uv.current.y + (cfg.uv.target.y - cfg.uv.current.y) * cfg.uv.progress
      };
      // Store this offset so that trailing can start from here.
      cfg.uv.lastOffset = activeOffset;
      displayUV = activeOffset;
    } else {
      // When contact is not active, trail the UV offset back to the default state (uvStates[0])
      // starting from the last recorded offset.
      cfg.uv.lastOffset.x += (uvStates[0].x - cfg.uv.lastOffset.x) * uvTrailSpeed * delta;
      cfg.uv.lastOffset.y += (uvStates[0].y - cfg.uv.lastOffset.y) * uvTrailSpeed * delta;
      displayUV = { x: cfg.uv.lastOffset.x, y: cfg.uv.lastOffset.y };
    }
    
    // Apply the computed UV offset to the UV mesh.
    if (cfg.uvMesh && cfg.uvMesh.material) {
      cfg.uvMesh.material.textureX = displayUV.x;
      cfg.uvMesh.material.textureY = displayUV.y;
    }
  }
});

}
