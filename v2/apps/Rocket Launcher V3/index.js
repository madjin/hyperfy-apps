export default function main(world, app, fetch, props, setTimeout) {
// Get the rocket mesh
const rocket = app.get('rocket')
if (!rocket) {
  console.error('Rocket mesh not found!')
  return
}

// Store original position
const originalPosition = rocket.position.clone()
// Set the resting height to 0.2
const restingHeight = 0.8

// Create the particle system
const particles = app.create('particles', {
  image: props.image?.url,
  shape: ['point'],
  direction: 1,
  speed: '0.1~0.5', // Increased speed range for more variation
  spread: '0.2', // Add spread to make particles move outward
  size: '0.02~0.5', // Random size between 0.02 and 0.5
  rate: 400,
  rateOverDistance: 100, // Emit 50 particles per unit of distance traveled
  blending: 'additive',
  emissive: '10~20', // Lower emissive range
  alphaOverLife: '0,0|0.1,0.5|0.9,0.5|1,0', // More transparent particles
  active: false,
  max: 1000,
  life: '1~3', // Random lifetime between 1 and 3 seconds
  rotate: '0~360' // Add random rotation
})

// Add particles to the rocket
rocket.add(particles)

// Create the action node
const action = app.create('action', {
  label: 'Launch Rocket',
  distance: 8, // Distance in meters to show the UI
  duration: 1, // Hold E for 3 seconds to trigger
  onStart: () => {
    console.log('Starting rocket launch...')
    // Start particles when E is first pressed
    particles.active = true
    particles.rate = 400 // Ensure rate is set when starting
  },
  onTrigger: () => {
    console.log('Rocket launched!')
    // Start launch sequence
    action.launching = true
    action.launchStartTime = world.getTime()
    // Hide the UI
    action.active = false
  },
  onCancel: () => {
    console.log('Launch sequence cancelled')
    // Reset position and stop particles
    rocket.position.y = restingHeight
    particles.rate = 0 // Stop emitting new particles
  }
})

// Add the action to the rocket
rocket.add(action)

// Make sure the action is positioned correctly relative to the rocket
action.position.set(0, 1, 0) // Position the UI 1 meter above the rocket

// Set initial position
rocket.position.y = restingHeight

// Update function for animations
app.on('update', (delta) => {
  if (!action) return

  // Handle launch sequence
  if (action.launching) {
    const elapsed = world.getTime() - action.launchStartTime
    const targetHeight = 500 // Increased height to 500 units
    const duration = 8 // Increased duration to 8 seconds for the longer distance

    if (elapsed < duration) {
      // Quadratic easing function for smooth acceleration
      const progress = Math.pow(elapsed / duration, 2)
      rocket.position.y = restingHeight + (targetHeight * progress)
    } else {
      // Sequence complete, start respawn sequence
      action.launching = false
      action.respawning = true
      action.respawnStartTime = world.getTime()
      // Move rocket underground
      rocket.position.y = -2
      // Show the UI again
      action.active = true
      particles.active = false
    }
  }

  // Handle respawn sequence
  if (action.respawning) {
    const elapsed = world.getTime() - action.respawnStartTime
    const respawnDuration = 2 // Time to rise from underground
    const riseSpeed = (restingHeight - (-2)) / respawnDuration

    if (elapsed < respawnDuration) {
      // Smoothly rise from underground
      rocket.position.y += riseSpeed * delta
    } else {
      // Respawn complete
      action.respawning = false
      rocket.position.y = restingHeight
    }
  }
}) 
}
