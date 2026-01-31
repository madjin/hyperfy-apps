export default function main(world, app, fetch, props, setTimeout) {
// Configure app properties
app.configure([
  {
    type: 'toggle',
    key: 'showUI',
    label: 'UI Visable',
    initial: true
  }
])

// Create screenspace UI container
const uiContainer = app.create('ui', {
  space: 'screen',
  position: [0.99, 0.1, 0], // Moved away from right edge
  pivot: 'top-right',
  width: 300,
  height: 280, // Reduced height to remove excess space
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  borderWidth: 2,
  borderColor: '#333333',
  borderRadius: 8,
  padding: 15,
  gap: 8 // Add spacing between child elements
})

// Add to world
world.add(uiContainer)

// Create text elements for player location (first section)
const locationTitleText = app.create('uitext', {
  value: 'Player Location',
  fontSize: 20,
  color: '#FFFFFF',
  fontWeight: 'bold'
})

const posXText = app.create('uitext', {
  value: 'X: Loading...',
  fontSize: 16,
  color: '#96CEB4'
})

const posYText = app.create('uitext', {
  value: 'Y: Loading...',
  fontSize: 16,
  color: '#FFEAA7'
})

const posZText = app.create('uitext', {
  value: 'Z: Loading...',
  fontSize: 16,
  color: '#DDA0DD'
})

// Create text elements for player body rotation (second section)
const rotationTitleText = app.create('uitext', {
  value: 'Player Body Rotation',
  fontSize: 20,
  color: '#FFFFFF',
  fontWeight: 'bold'
})

const xText = app.create('uitext', {
  value: 'X: Loading...',
  fontSize: 16,
  color: '#FF6B6B'
})

const yText = app.create('uitext', {
  value: 'Y: Loading...',
  fontSize: 16,
  color: '#4ECDC4'
})

const zText = app.create('uitext', {
  value: 'Z: Loading...',
  fontSize: 16,
  color: '#45B7D1'
})

// Create text elements for camera direction (third section)
const cameraTitleText = app.create('uitext', {
  value: 'Player Camera Direction',
  fontSize: 20,
  color: '#FFFFFF',
  fontWeight: 'bold'
})

const dirXText = app.create('uitext', {
  value: 'X: Loading...',
  fontSize: 16,
  color: '#FF9F43'
})

const dirYText = app.create('uitext', {
  value: 'Y: Loading...',
  fontSize: 16,
  color: '#FF6B6B'
})

const dirZText = app.create('uitext', {
  value: 'Z: Loading...',
  fontSize: 16,
  color: '#5F27CD'
})

// Add text elements to container
uiContainer.add(locationTitleText)
uiContainer.add(posXText)
uiContainer.add(posYText)
uiContainer.add(posZText)
uiContainer.add(rotationTitleText)
uiContainer.add(xText)
uiContainer.add(yText)
uiContainer.add(zText)
uiContainer.add(cameraTitleText)
uiContainer.add(dirXText)
uiContainer.add(dirYText)
uiContainer.add(dirZText)

// Function to get camera direction vector
function getCameraDirection() {
  let control = null
  
  // Try to get control from player
  const player = world.getPlayer()
  if (player && player.control) {
    control = player.control
  }
  
  // If no control from player, try to get it from app
  if (!control && app.control) {
    control = app.control()
  }
  
  if (!control || !control.camera || !control.camera.quaternion) {
    return null
  }
  
  // Calculate forward direction from camera quaternion
  const forward = new Vector3(0, 0, -1).applyQuaternion(control.camera.quaternion)
  
  return forward
}

// Update function to show available rotation data
function updateRotationDisplay() {
  const player = world.getPlayer()
  if (!player) return
  
  // Get player rotation (body rotation, not camera)
  const playerRot = player.quaternion
  const playerPos = player.position
  
  // Convert to Euler angles
  const euler = new Euler()
  euler.setFromQuaternion(playerRot)
  
  // Update rotation displays
  xText.value = `X: ${(euler.x * 180 / Math.PI).toFixed(1)}°`
  yText.value = `Y: ${(euler.y * 180 / Math.PI).toFixed(1)}°`
  zText.value = `Z: ${(euler.z * 180 / Math.PI).toFixed(1)}°`
  
  // Update position displays
  posXText.value = `X: ${playerPos.x.toFixed(2)}`
  posYText.value = `Y: ${playerPos.y.toFixed(2)}`
  posZText.value = `Z: ${playerPos.z.toFixed(2)}`
  
  // NEW: Update camera direction displays
  const cameraDirection = getCameraDirection()
  if (cameraDirection) {
    dirXText.value = `X: ${cameraDirection.x.toFixed(3)}`
    dirYText.value = `Y: ${cameraDirection.y.toFixed(3)}`
    dirZText.value = `Z: ${cameraDirection.z.toFixed(3)}`
  } else {
    dirXText.value = 'X: No Camera'
    dirYText.value = 'Y: No Camera'
    dirZText.value = 'Z: No Camera'
  }
}

// Update every frame
app.on('update', (delta) => {
  // Toggle UI visibility based on props
  uiContainer.active = props.showUI
  
  updateRotationDisplay()
})

}
