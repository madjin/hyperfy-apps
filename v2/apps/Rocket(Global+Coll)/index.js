export default function main(world, app, fetch, props, setTimeout) {
// Get the rocket mesh
const rocket = app.get('rocket')
if (!rocket) {
  return
}

// Store original position
const originalPosition = rocket.position.clone()
// Set the resting height to 0.8
const restingHeight = 0.8

// Initialize app state for global rocket status
if (!app.state.rocketLaunching) {
  app.state.rocketLaunching = false
}

if (!app.state.rocketLaunchTime) {
  app.state.rocketLaunchTime = 0
}

// Create the particle system
const particles = app.create('particles', {
  image: props.image?.url,
  shape: ['point'],
  direction: 1,
  speed: '0.1~0.5',
  spread: '0.2',
  size: '0.02~0.5',
  rate: 0, // Start with 0 rate
  rateOverDistance: 100,
  blending: 'additive',
  emissive: '10~20',
  alphaOverLife: '0,0|0.1,0.5|0.9,0.5|1,0',
  active: false,
  max: 1000,
  life: '1~3',
  rotate: '0~360'
})

// Add particles to the rocket
rocket.add(particles)

// Create the action node
const action = app.create('action', {
  label: 'Launch Rocket',
  distance: 8,
  duration: 1,
  onStart: () => {
    if (world.isClient) {
      // Send start command to server
      app.send('rocketStart', {})
    }
  },
  onTrigger: () => {
    if (world.isClient) {
      // Send launch command to server
      app.send('rocketLaunch', {})
    }
    // Hide the UI
    action.active = false
  },
  onCancel: () => {
    if (world.isClient) {
      // Send cancel command to server
      app.send('rocketCancel', {})
    }
  }
})

// Add the action to the rocket
rocket.add(action)

// Make sure the action is positioned correctly relative to the rocket
action.position.set(0, 1, 0)

// Set initial position
rocket.position.y = restingHeight

// Client-side event handlers
if (world.isClient) {
  // Listen for rocket start from server
  app.on('rocketStart', () => {
    particles.active = true
    particles.rate = 400
  })

  // Listen for rocket launch from server
  app.on('rocketLaunch', (data) => {
    app.state.rocketLaunching = true
    app.state.rocketLaunchTime = data.launchTime
    action.active = false
    particles.active = true
    particles.rate = 400
  })

  // Listen for rocket cancel from server
  app.on('rocketCancel', () => {
    rocket.position.y = restingHeight
    particles.rate = 0
    particles.active = false
  })

  // Listen for rocket respawn from server
  app.on('rocketRespawn', (data) => {
    app.state.rocketLaunching = false
    app.state.rocketLaunchTime = 0
    action.active = true
    particles.active = false
    particles.rate = 0
    // Move rocket underground and start respawn animation
    rocket.position.y = -3
    action.respawning = true
    action.respawnStartTime = data.respawnTime
  })

  // Listen for particle stop from server
  app.on('rocketParticlesStop', () => {
    particles.active = false
    particles.rate = 0
  })
}

// Server-side event handlers
if (world.isServer) {
  // Handle rocket start command
  app.on('rocketStart', () => {
    app.send('rocketStart')
  })

  // Handle rocket launch command
  app.on('rocketLaunch', () => {
    const launchTime = world.getTime()
    app.state.rocketLaunching = true
    app.state.rocketLaunchTime = launchTime
    app.send('rocketLaunch', { launchTime })
  })

  // Handle rocket cancel command
  app.on('rocketCancel', () => {
    app.state.rocketLaunching = false
    app.state.rocketLaunchTime = 0
    app.send('rocketCancel')
  })
}

// Update function for animations
app.on('update', (delta) => {
  if (!action) return

  // Handle launch sequence
  if (app.state.rocketLaunching) {
    const elapsed = world.getTime() - app.state.rocketLaunchTime
    const targetHeight = 500
    const duration = 8

    if (elapsed < duration) {
      // Quadratic easing function for smooth acceleration
      const progress = Math.pow(elapsed / duration, 2)
      rocket.position.y = restingHeight + (targetHeight * progress)
    } else {
      // Sequence complete, start respawn sequence
      app.state.rocketLaunching = false
      app.state.rocketLaunchTime = 0
      
      // Move rocket underground
      rocket.position.y = -3
      
      if (world.isServer) {
        // Server broadcasts respawn and particle stop
        const respawnTime = world.getTime()
        app.send('rocketRespawn', { respawnTime })
        app.send('rocketParticlesStop')
      }
      
      // Show the UI again
      action.active = true
      particles.active = false
      particles.rate = 0
      
      // Start respawn animation (only on server, clients will get it via network)
      if (world.isServer) {
        action.respawning = true
        action.respawnStartTime = world.getTime()
      }
    }
  }

  // Handle respawn sequence
  if (action.respawning) {
    const elapsed = world.getTime() - action.respawnStartTime
    const respawnDuration = 3 // Longer duration for smoother rise
    const riseSpeed = (restingHeight - (-3)) / respawnDuration

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
