export default function main(world, app, fetch, props, setTimeout) {
// NPC Avatar with Walk, Run, Idle, and Talk Modes + Range Limit
app.configure([
    {
      key: 'walk',
      type: 'file',
      kind: 'emote',
      label: 'Walk',
    },
    {
      key: 'run',
      type: 'file',
      kind: 'emote',
      label: 'Run',
    },
    {
      key: 'idle',
      type: 'file',
      kind: 'emote',
      label: 'Idle',
    },
    {
      key: 'talk',
      type: 'file',
      kind: 'emote',
      label: 'Talk',
    }
  ])
  
  const v1 = new Vector3()
  const q1 = new Quaternion()
  const FORWARD = new Vector3(0, 0, -1)
  
  // Hardcoded range limit (editable in script)
  const range = 100 // Maximum distance from origin in meters (default: 100)
  
  // Create the controller and store initial position
  const initialPosition = new Vector3().fromArray(app.position.toArray())
  const ctrl = app.create('controller', {
    position: app.position.toArray(),
    radius: 0.3,
    height: 1,
  })
  world.add(ctrl)
  
  // Set up the avatar
  const src = props.avatar?.url
  const avatar = app.get('avatar')
  avatar.position.set(0, 0, 0)
  avatar.quaternion.set(0, 0, 0, 1)
  ctrl.add(avatar)
  avatar.emote = props.walk?.url // Start with walking
  
  // Movement variables
  const dir = new Vector3(0.7, 0, 1).normalize()
  const move = new Vector3()
  const gravity = 8
  const walkSpeed = 1.7 // Speed for walking mode
  const runSpeed = 8.0  // Faster speed for running mode
  
  // Direction change variables
  let frameCounter = 0
  let nextDirectionChange = 180 // Starting interval (~3 seconds at 60 FPS)
  const minTurnInterval = 120 // ~2 seconds
  const maxTurnInterval = 300 // ~5 seconds
  let directionIndex = 0
  const directionAngles = [0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4, Math.PI, 5 * Math.PI / 4, 3 * Math.PI / 2, 7 * Math.PI / 4]
  
  // State variables
  let state = ['walking', 'running', 'idle', 'talking'][Math.floor(Math.random() * 4)] // Random initial state
  let stateCounter = Math.floor(Math.random() * 300) // Random initial counter
  const idleDuration = 300 + Math.floor(Math.random() * 300) // Random idle duration between 5-10 seconds
  const talkDuration = 200 + Math.floor(Math.random() * 200) // Random talk duration between 3-6 seconds
  
  // Remove pseudo-random sequence and use Math.random directly
  function getRandom() {
    return Math.random()
  }
  
  // Function to set direction based on pre-defined angles
  function updateDirection() {
    const theta = directionAngles[directionIndex]
    dir.set(Math.cos(theta), 0, Math.sin(theta)).normalize()
    directionIndex = (directionIndex + 1) % directionAngles.length
    nextDirectionChange = minTurnInterval + Math.floor(getRandom() * (maxTurnInterval - minTurnInterval))
  }
  
  // Function to add slight drift to direction
  function driftDirection(delta) {
    const driftAmount = 0.1 * delta
    const driftAngle = getRandom() * driftAmount - (driftAmount / 2)
    const newX = dir.x * Math.cos(driftAngle) - dir.z * Math.sin(driftAngle)
    const newZ = dir.x * Math.sin(driftAngle) + dir.z * Math.cos(driftAngle)
    dir.set(newX, 0, newZ).normalize()
  }
  
  // Function to check range and adjust direction if exceeded
  function checkRangeAndAdjust() {
    const currentPosition = ctrl.position // Controller's current position
    const distanceFromOrigin = currentPosition.distanceTo(initialPosition)
  
    if (distanceFromOrigin > range) {
      // Turn back toward the origin
      dir.subVectors(initialPosition, currentPosition).normalize()
      dir.y = 0 // Keep direction horizontal
      nextDirectionChange = frameCounter + 60 // Force a direction change in ~1 second
    }
  }
  
  // Function to update NPC state and animation
  function updateState() {
    if (state === 'walking' || state === 'running') {
      if (frameCounter >= nextDirectionChange) {
        updateDirection()
        frameCounter = 0
        const rand = getRandom()
        if (rand < 0.2) { // 20% chance to idle
          state = 'idle'
          stateCounter = 0
          avatar.emote = props.idle?.url
        } else if (rand < 0.3) { // 10% chance to talk (20% to 30%)
          state = 'talking'
          stateCounter = 0
          avatar.emote = props.talk?.url
        } else if (rand < 0.5 && state === 'walking') { // 20% chance to switch to running (30% to 50%)
          state = 'running'
          stateCounter = 0
          avatar.emote = props.run?.url
        } else if (rand < 0.7 && state === 'running') { // 20% chance to switch to walking (50% to 70%)
          state = 'walking'
          stateCounter = 0
          avatar.emote = props.walk?.url
        }
      }
    } else if (state === 'idle' && stateCounter >= idleDuration) {
      state = ['walking', 'running'][Math.floor(getRandom() * 2)] // Randomly choose between walking and running
      stateCounter = 0
      avatar.emote = state === 'walking' ? props.walk?.url : props.run?.url
    } else if (state === 'talking' && stateCounter >= talkDuration) {
      state = ['walking', 'running'][Math.floor(getRandom() * 2)] // Randomly choose between walking and running
      stateCounter = 0
      avatar.emote = state === 'walking' ? props.walk?.url : props.run?.url
    }
  }
  
  app.on('fixedUpdate', delta => {
    frameCounter++
    stateCounter++
  
    if (state === 'walking' || state === 'running') {
      // Subtle direction drift
      driftDirection(delta)
  
      // Check range and adjust direction if necessary
      checkRangeAndAdjust()
  
      // Check for state change (includes direction update)
      updateState()
  
      // Calculate and apply movement
      move.copy(dir)
      move.y -= gravity
      const speed = (state === 'running') ? runSpeed : walkSpeed
      move.multiplyScalar(speed * delta)
      ctrl.move(move)
    } else {
      // Idle or talking: only apply gravity
      move.set(0, -gravity, 0).multiplyScalar(delta)
      ctrl.move(move)
      updateState()
    }
  })
  
  app.on('update', delta => {
    const alpha = 1 - Math.pow(0.00000001, delta)
    q1.setFromUnitVectors(FORWARD, dir)
    avatar.quaternion.slerp(q1, alpha) // Smoothly rotate to face direction
  })

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
ui.position.set(0, 2.5, 0); // 2.5 units above app
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

// Add UI container to controller
ctrl.add(ui);

// Update loop: Update text with world coordinates and rotation
app.on('update', () => {
  if (ctrl && ctrl.position && ctrl.rotation) {
    const pos = ctrl.position;
    const rot = ctrl.rotation; // Euler angles in radians
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
