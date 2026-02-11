# CameraManagerTest.hyp

## Metadata
- **Author**: Shiffty
- **Channel**: #💻│developers
- **Date**: 2025-03-21
- **Size**: 14,586 bytes

## Discord Context
> I found myself writing camera code a lot so I pulled everything out into a Camera Manager app. Still fresh but feel free to try it out and use at will.

Controls for the test rig:
C - change camera mode
O - change object target
Z - camera shake

## Blueprint
- **Name**: Camera Manager Test
- **Version**: 23
- **Model**: `asset://b66285a1342dbc494a4a3da95cc661cd39d7fd9fbf7fe7a57c7629fd57ad79b1.glb`
- **Script**: `asset://8f50985100d6d3a9d50533a39198ae42446ae570b426d0cbbf18168b99ac18e0.js`

## Assets
- `[model]` b66285a1342dbc494a4a3da95cc661cd39d7fd9fbf7fe7a57c7629fd57ad79b1.glb (6,032 bytes)
- `[script]` 8f50985100d6d3a9d50533a39198ae42446ae570b426d0cbbf18168b99ac18e0.js (7,803 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.control()`, `app.create()`, `app.get()`, `app.on()`, `app.remove()`
**World Methods**: `world.add()`, `world.emit()`
**Events Listened**: `update`
**Events Emitted**: `camera:follow`, `camera:orbit`, `camera:reset`, `camera:shake`, `camera:static`
**Nodes Created**: `ui`, `uitext`

## Keywords (for Discord search)
active, alignItems, angle, animation, animationTime, animations, applyCameraMode, around, available, backgroundColor, between, bold, borderRadius, bouncing, bouncingCube, camera, capture, center, charAt, circle

## Script Source
```javascript
// CameraManagerTest.js - Test app with static and moving cubes
// Use C key to cycle between camera modes: Default, Follow, Orbit, Static
// Use O key to cycle between different target objects
// Use Z key to shake the camera

if (world.isClient) {
  // Get cube template
  const cubeTemplate = app.get('Cube')
  if (!cubeTemplate) {
    console.error('Failed to load Cube template')
  } else {
    app.remove(cubeTemplate)
  }
  
  // Configuration
  const TEST_CONFIG = {
    CUBE_SCALE: 0.25,
    SPAWN_HEIGHT: 1.0,
    SPAWN_RADIUS: 20.0,
    ORBIT_SPEED: 1.0
  }
  
  // UI Configuration
  const UI_CONFIG = {
    WIDTH: 600,
    HEIGHT: 140,
    FONT_SIZE: 48,
    BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.7)',
    TEXT_COLOR: '#ffffff',
    BORDER_RADIUS: 8,
    PADDING: 10
  }
  
  // Camera modes
  const CAMERA_MODES = [
    'default',   // Regular player camera
    'follow',    // Follow object
    'orbit',     // Orbit around object
    'static'     // Fixed camera at origin
  ]
  
  // State tracking
  let cubes = []
  let currentCameraMode = 0
  let currentTargetIndex = 0
  let control = null
  let modeUI = null
  
  // Create UI for displaying camera mode
  function createCameraModeUI() {
    if (modeUI) return modeUI;
    
    const ui = app.create('ui')
    ui.width = UI_CONFIG.WIDTH
    ui.height = UI_CONFIG.HEIGHT
    ui.space = 'screen'
    ui.backgroundColor = UI_CONFIG.BACKGROUND_COLOR
    ui.borderRadius = UI_CONFIG.BORDER_RADIUS
    ui.padding = UI_CONFIG.PADDING
    ui.justifyContent = 'center'
    ui.alignItems = 'center'
    ui.position.set(0.5, 0.1, 0) // Top center of screen
    ui.pivot = 'center'
    
    const modeText = app.create('uitext', {
      value: 'Mode: Default',
      fontSize: UI_CONFIG.FONT_SIZE,
      color: UI_CONFIG.TEXT_COLOR,
      fontWeight: 'bold',
      fontFamily: 'monospace'
    })
    
    ui.add(modeText)
    app.add(ui)
    return { ui, text: modeText }
  }
  
  // Initialize control
  control = app.control()
  if (control) {
    // Set up key handling
    control.keyC.capture = true
    control.keyO.capture = true
    control.keyZ.capture = true
  }
  
  // Create UI
  modeUI = createCameraModeUI()
  
  // Create static cube
  const staticCube = cubeTemplate.clone(true)
  staticCube.active = true
  staticCube.scale.set(TEST_CONFIG.CUBE_SCALE * 1.5, TEST_CONFIG.CUBE_SCALE * 1.5, TEST_CONFIG.CUBE_SCALE * 1.5)
  staticCube.position.set(0, TEST_CONFIG.SPAWN_HEIGHT, 0)
  world.add(staticCube)
  cubes.push(staticCube)
  
  // Create moving cubes
  // Circle moving cube
  const circleCube = cubeTemplate.clone(true)
  circleCube.active = true
  circleCube.scale.set(TEST_CONFIG.CUBE_SCALE, TEST_CONFIG.CUBE_SCALE, TEST_CONFIG.CUBE_SCALE)
  circleCube.position.set(TEST_CONFIG.SPAWN_RADIUS, TEST_CONFIG.SPAWN_HEIGHT, 0)
  world.add(circleCube)
  cubes.push(circleCube)
  
  // Bouncing cube
  const bouncingCube = cubeTemplate.clone(true)
  bouncingCube.active = true
  bouncingCube.scale.set(TEST_CONFIG.CUBE_SCALE, TEST_CONFIG.CUBE_SCALE, TEST_CONFIG.CUBE_SCALE)
  bouncingCube.position.set(-TEST_CONFIG.SPAWN_RADIUS, TEST_CONFIG.SPAWN_HEIGHT, 0)
  world.add(bouncingCube)
  cubes.push(bouncingCube)
  
  // Figure-8 cube
  const figureCube = cubeTemplate.clone(true)
  figureCube.active = true
  figureCube.scale.set(TEST_CONFIG.CUBE_SCALE, TEST_CONFIG.CUBE_SCALE, TEST_CONFIG.CUBE_SCALE)
  figureCube.position.set(0, TEST_CONFIG.SPAWN_HEIGHT, TEST_CONFIG.SPAWN_RADIUS)  
  world.add(figureCube)
  cubes.push(figureCube)
  
  // Time counter for animations
  let animationTime = 0
  
  // Update UI text with current camera mode and target
  function updateModeUI() {
    if (!modeUI) return
    
    const modeName = CAMERA_MODES[currentCameraMode].charAt(0).toUpperCase() + CAMERA_MODES[currentCameraMode].slice(1)
    const targetNum = currentTargetIndex + 1
    
    modeUI.text.value = `Mode: ${modeName} | Target: Cube ${targetNum}`
  }
  
  // Initial UI update
  updateModeUI()
  
  // Update loop for cube movement and input handling
  app.on('update', (delta) => {
    if (!control) return
    
    // Increment animation time
    animationTime += delta
    
    // Check for C key to cycle camera modes
    if (control.keyC.pressed) {
      cycleCamera()
    }
    
    // Check for O key to cycle objects
    if (control.keyO.pressed) {
      cycleTarget()
    }
    
    // Check for Z key to shake camera
    if (control.keyZ.pressed) {
      world.emit('camera:shake', {
        intensity: 2.0,
        duration: 1.0
      })
    }
    
    // Update cube movements
    for (let i = 0; i < cubes.length; i++) {
      const cube = cubes[i]
      if (cube) {
        // Rotate all cubes
        cube.rotation.x += delta * 0.5
        cube.rotation.y += delta * 0.3
      }
    }
    
    // Move the circle cube
    const angle = animationTime * 0.5
    circleCube.position.x = Math.cos(angle) * TEST_CONFIG.SPAWN_RADIUS
    circleCube.position.z = Math.sin(angle) * TEST_CONFIG.SPAWN_RADIUS
    
    // Move the bouncing cube
    bouncingCube.position.y = TEST_CONFIG.SPAWN_HEIGHT + Math.sin(animationTime * 2) * 2
    
    // Move the figure-8 cube
    const t = animationTime * 0.5
    figureCube.position.x = Math.sin(t) * TEST_CONFIG.SPAWN_RADIUS
    figureCube.position.z = Math.sin(t * 2) * TEST_CONFIG.SPAWN_RADIUS * 0.5
  })
  
  // Cycle through camera modes
  function cycleCamera() {
    currentCameraMode = (currentCameraMode + 1) % CAMERA_MODES.length
    console.log(`CameraManagerTest: Switched to camera mode: ${CAMERA_MODES[currentCameraMode]}`)
    
    // Apply the new mode
    applyCameraMode()
    
    // Update UI
    updateModeUI()
  }
  
  // Cycle through available targets
  function cycleTarget() {
    if (cubes.length === 0) return
    
    currentTargetIndex = (currentTargetIndex + 1) % cubes.length
    console.log(`CameraManagerTest: Switched to target cube ${currentTargetIndex + 1}`)
    
    // Apply current camera mode to new target
    if (currentCameraMode > 0) {
      applyCameraMode()
    }
    
    // Update UI
    updateModeUI()
  }
  
  // Apply the current camera mode to the current target
  function applyCameraMode() {
    if (cubes.length === 0 || currentTargetIndex < 0) return
    
    const target = cubes[currentTargetIndex]
    if (!target) return
    
    const mode = CAMERA_MODES[currentCameraMode]
    
    switch (mode) {
      case 'default':
        // Reset camera to player
        world.emit('camera:reset', {
          transitionTime: 0.0
        })
        break
        
      case 'follow':
        // Follow the current target
        world.emit('camera:follow', {
          target: target,
          options: {
            FOLLOW_HEIGHT: 2,
            FOLLOW_DISTANCE: 4,
            FOLLOW_HORIZONTAL_DAMPING: 0.2,
            FOLLOW_VERTICAL_DAMPING: 0.2
          }
        })                
        break
        
      case 'orbit':
        // Orbit around the current target
        world.emit('camera:orbit', {
          target: target,
          options: {
            ORBIT_RADIUS: 5,
            ORBIT_HEIGHT: 3,
            ORBIT_SPEED: TEST_CONFIG.ORBIT_SPEED
          }
        })        
        break
        
      case 'static':
        // Static camera at position looking at objects
        world.emit('camera:static', {
          position: { x: 0, y: 8, z: -21 },
          target: target,
          options: {
            CAMERA_DAMPING: 0.05  // Reduce damping to make movement smoother
          }
        })
        break
    }
  }
} 
```

---
*Extracted from CameraManagerTest.hyp. Attachment ID: 1352519145761144832*