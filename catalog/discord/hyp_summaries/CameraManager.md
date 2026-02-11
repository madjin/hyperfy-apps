# CameraManager.hyp

## Metadata
- **Author**: Shiffty
- **Channel**: #💻│developers
- **Date**: 2025-03-21
- **Size**: 34,814 bytes

## Discord Context
> I found myself writing camera code a lot so I pulled everything out into a Camera Manager app. Still fresh but feel free to try it out and use at will.

Controls for the test rig:
C - change camera mode
O - change object target
Z - camera shake

## Blueprint
- **Name**: Camera Manager
- **Version**: 22
- **Model**: `asset://b66285a1342dbc494a4a3da95cc661cd39d7fd9fbf7fe7a57c7629fd57ad79b1.glb`
- **Script**: `asset://a9469d50a6f41e93e01e5d171d0e027c6b71b212246bbe0738b0172943c2fb26.js`

## Assets
- `[model]` b66285a1342dbc494a4a3da95cc661cd39d7fd9fbf7fe7a57c7629fd57ad79b1.glb (6,032 bytes)
- `[script]` a9469d50a6f41e93e01e5d171d0e027c6b71b212246bbe0738b0172943c2fb26.js (27,986 bytes)

## Script Analysis
**App Methods**: `app.control()`, `app.get()`, `app.on()`, `app.remove()`
**World Methods**: `world.getPlayer()`, `world.on()`
**Events Listened**: `camera:follow`, `camera:orbit`, `camera:reset`, `camera:shake`, `camera:static`, `camera:transition`, `player`, `update`

## Keywords (for Discord search)
above, activated, active, adaptive, adaptiveDamping, ahead, already, always, angle, applied, applyQuaternion, apps, around, array, available, axes, back, baseDamping, based, behavior

## Script Source
```javascript
// CameraManager.js - Reusable camera management system for Hyperfy apps
// Controls camera behavior including follow, static, orbit, and transitions

if (world.isClient) {
  // Default camera configuration
  const DEFAULT_CONFIG = {
    // Follow mode settings
    FOLLOW_HEIGHT: 3,              // Height above target when following
    FOLLOW_DISTANCE: 3,            // Distance behind target when following
    FOLLOW_HORIZONTAL_DAMPING: 0.2, // Horizontal movement smoothing (0-1)
    FOLLOW_VERTICAL_DAMPING: 0.2,   // Vertical movement smoothing (0-1)
    FOLLOW_LEAD_FACTOR: 0.05,      // How much to look ahead based on velocity
    
    // Camera damping setting
    CAMERA_DAMPING: 0.2,           // Camera movement smoothing (0-1)
    
    // Orbit mode settings
    ORBIT_RADIUS: 5,               // Distance from target in orbit mode
    ORBIT_HEIGHT: 2,               // Height above target in orbit mode
    ORBIT_SPEED: 0.5,              // Rotation speed in orbit mode
    
    // Transition settings
    TRANSITION_DURATION: 1.0,      // Default transition time in seconds
    
    // Shake settings
    SHAKE_DECAY: 0.9,              // How quickly shake effect decays
    SHAKE_MAX_ANGLE: 0.05,         // Maximum rotation in radians during shake
  }
  
  // Camera states
  const CAMERA_STATES = {
    DEFAULT: 'default',           // Regular player camera
    FOLLOW: 'follow',             // Following an object
    STATIC: 'static',             // Fixed camera position looking at a target
    ORBIT: 'orbit',               // Orbiting around a target
    TRANSITIONING: 'transitioning' // In transition between states
  }
  
  // State tracking
  let currentState = CAMERA_STATES.DEFAULT
  let targetObject = null
  let config = { ...DEFAULT_CONFIG }
  let control = null
  
  // Position tracking 
  let cameraPosition = new Vector3()
  let cameraTarget = new Vector3()
  let orbitAngle = 0
  
  // Static camera position (when in static mode)
  let staticPosition = new Vector3()
  
  // Transition tracking
  let transitionStartTime = 0
  let transitionDuration = 0
  let transitionStartPos = new Vector3()
  let transitionEndPos = new Vector3()
  let transitionStartRot = new Quaternion()
  let transitionEndRot = new Quaternion()
  
  // Shake effect tracking
  let shakeIntensity = 0
  let shakeDuration = 0
  let shakeStartTime = 0
  let shakeOffset = new Vector3()
  let shakeRotation = new Quaternion()

  // Hide camera template if it exists
  const cameraModel = app.get('Cube')
  if (cameraModel) {
    app.remove(cameraModel)
  }
  
  // Initialize camera control function
  function initCamera(player) {
    if (!player) return
    console.log('CameraManager: Player loaded')
    
    // Get camera control
    control = app.control()
    if (control) {
      console.log('CameraManager: Successfully obtained camera control')
      cameraPosition.copy(control.camera.position)
    }
  }
  
  // Check for already existing player when app loads
  const existingPlayer = world.getPlayer()
  if (existingPlayer) {
    initCamera(existingPlayer)
  }
  
  // Setup when player loads
  world.on('player', (player) => {
    initCamera(player)
  })
  
  // Listen for follow event - start following an object
  world.on('camera:follow', (data) => {
    if (!control || !control.camera) {
      console.error('CameraManager: Cannot follow - no camera control')
      return
    }
    
    console.log('CameraManager: Received follow request', data)
    
    const { target, options = {} } = data
    if (!target) {
      console.error('CameraManager: Follow request missing target object')
      return
    }
    
    // Update state
    currentState = CAMERA_STATES.FOLLOW
    targetObject = target
    
    // Apply custom configuration if provided
    if (options) {
      config = { ...DEFAULT_CONFIG, ...options }
    }
    
    // Take control of camera
    control.camera.write = true
    
    // Initialize camera position behind the target
    const targetPosition = getTargetPosition()
    if (targetPosition) {
      // Get initial direction (use camera or -Z if not available)
      let direction = new Vector3(0, 0, -1)
      if (control.camera) {
        direction.applyQuaternion(control.camera.quaternion)
      }
      direction.y = 0
      direction.normalize()
      
      // Set initial camera position behind target
      cameraTarget.copy(targetPosition)
      cameraTarget.x -= direction.x * config.FOLLOW_DISTANCE
      cameraTarget.z -= direction.z * config.FOLLOW_DISTANCE 
      cameraTarget.y += config.FOLLOW_HEIGHT
      
      // Snap camera to target position initially
      cameraPosition.copy(cameraTarget)
      control.camera.position.copy(cameraPosition)
      
      // Point camera at target
      lookAtTarget(targetPosition, 1.0) 
    }
    
    console.log('CameraManager: Follow mode activated', { target, config })
  })
 
  // Listen for static camera event - fixed position camera looking at a target
  world.on('camera:static', (data) => {
    if (!control || !control.camera) {
      console.error('CameraManager: Cannot set static camera - no camera control')
      return
    }
    
    const { position, target, options = {} } = data
    if (!position || !target) {
      console.error('CameraManager: Static camera request missing position or target')
      return
    }
    
    console.log('CameraManager: Static camera request received', data)
    
    // Update state
    currentState = CAMERA_STATES.STATIC
    targetObject = target
    
    // Store the static camera position
    staticPosition.copy(position)
    
    // Apply custom configuration if provided
    if (options) {
      config = { ...DEFAULT_CONFIG, ...options }
    }
    
    // Take control of camera
    control.camera.write = true
    
    // Move camera to position
    control.camera.position.copy(staticPosition)
    cameraPosition.copy(staticPosition)
    
    // Look at target
    lookAtTarget(target, 1.0)
    
    console.log('CameraManager: Static camera mode activated', { position, target, config })
  })
  
  // Listen for orbit event - orbit around a target
  world.on('camera:orbit', (data) => {
    if (!control || !control.camera) {
      console.error('CameraManager: Cannot orbit - no camera control')
      return
    }
    
    const { target, options = {} } = data
    if (!target) {
      console.error('CameraManager: Orbit request missing target')
      return
    }
    
    // Update state
    currentState = CAMERA_STATES.ORBIT
    targetObject = target
    
    // Apply custom configuration if provided
    if (options) {
      config = { ...DEFAULT_CONFIG, ...options }
    }
    
    // Take control of camera
    control.camera.write = true
    
    console.log('CameraManager: Orbit mode activated', { target, config })
  })
  
  // Listen for reset event - return to default player camera
  world.on('camera:reset', (data = {}) => {
    if (!control) return
    
    const { transitionTime = config.TRANSITION_DURATION } = data
    
    console.log('CameraManager: Reset request received', data)
    
    // If we need a transition, set up transition state
    if (transitionTime > 0 && currentState !== CAMERA_STATES.DEFAULT) {
      startTransition(CAMERA_STATES.DEFAULT, transitionTime)
    } else {
      // Immediate switch
      currentState = CAMERA_STATES.DEFAULT
      targetObject = null
      
      // Release camera control
      control.camera.write = false      
    }
  })
  
  // Listen for shake event - add screen shake effect
  world.on('camera:shake', (data) => {
    const { intensity = 1.0, duration = 0.5 } = data
    
    shakeIntensity = Math.min(Math.max(intensity, 0), 2)
    shakeDuration = duration
    shakeStartTime = Date.n

// ... truncated ...
```

---
*Extracted from CameraManager.hyp. Attachment ID: 1352519145232535602*