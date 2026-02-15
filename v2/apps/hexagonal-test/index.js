export default function main(world, app, fetch, props, setTimeout) {
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
          y: cfg.uv.current.y + (cfg.uv.target.y - cfg.uv.current.y) * cfg.uv.progress
        };
        cfg.uv.lastOffset = activeOffset;
        displayUV = activeOffset;
      } else {
        // Fade/trail the UV offset back to the default state.
        cfg.uv.lastOffset.x += (uvStates[0].x - cfg.uv.lastOffset.x) * uvTrailSpeed * delta;
        cfg.uv.lastOffset.y += (uvStates[0].y - cfg.uv.lastOffset.y) * uvTrailSpeed * delta;
        displayUV = { x: cfg.uv.lastOffset.x, y: cfg.uv.lastOffset.y };
      }
      
      // Update the UV child mesh material.
      if (cfg.uvMesh && cfg.uvMesh.material) {
        cfg.uvMesh.material.textureX = displayUV.x;
        cfg.uvMesh.material.textureY = displayUV.y;
      }
      
      // Record state for networking.
      netState[panelName] = {
        y: obj.position.y,
        uv: {
          textureX: displayUV.x,
          textureY: displayUV.y
        },
        active: cfg.active
      };
    }
    
    // Broadcast the computed state to all clients.
    app.send('padStateUpdate', netState);
  });
} else {
  // --- Client: Process Network Updates ---
  app.on('padStateUpdate', (netState) => {
    for (const panelName in netState) {
      const state = netState[panelName];
      const obj = panelObjects[panelName];
      if (obj) {
        obj.position.y = state.y;
      }
      if (panelConfigs[panelName] && panelConfigs[panelName].uvMesh && panelConfigs[panelName].uvMesh.material) {
        panelConfigs[panelName].uvMesh.material.textureX = state.uv.textureX;
        panelConfigs[panelName].uvMesh.material.textureY = state.uv.textureY;
      }
      if (panelConfigs[panelName]) {
        panelConfigs[panelName].active = state.active;
      }
    }
  });
}

}
