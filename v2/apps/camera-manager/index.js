export default function main(world, app, fetch, props, setTimeout) {
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
    shakeStartTime = Date.now() / 1000
    
    // Take control of camera if in default mode
    if (currentState === CAMERA_STATES.DEFAULT && control && control.camera) {
      control.camera.write = true
    }
    
    console.log('CameraManager: Shake effect applied', { intensity, duration })
  })
  
  // Listen for transition event - smoothly transition between camera states
  world.on('camera:transition', (data) => {
    if (!control || !control.camera) return
    
    const { targetState, duration = config.TRANSITION_DURATION, options = {} } = data
    
    // Apply custom configuration if provided
    if (options) {
      config = { ...DEFAULT_CONFIG, ...options }
    }
    
    console.log('CameraManager: Transition request received', data)
    
    // Start transition to new state
    startTransition(targetState, duration)
  })
  
  // Main update loop - handle camera logic
  app.on('update', (delta) => {
    if (!control || !control.camera) return
    
    // Don't process camera if we're in default state and don't have control
    if (currentState === CAMERA_STATES.DEFAULT && !control.camera.write && shakeIntensity <= 0) return
    
    switch (currentState) {
      case CAMERA_STATES.FOLLOW:
        updateFollowCamera(delta)
        break
        
      case CAMERA_STATES.STATIC:
        updateStaticCamera(delta)
        break
        
      case CAMERA_STATES.ORBIT:
        updateOrbitCamera(delta)
        break
        
      case CAMERA_STATES.TRANSITIONING:
        updateTransition(delta)
        break
        
      default:
        // No camera update needed in default state
        break
    }
    
    // Apply screen shake effect if active
    updateCameraShake(delta)
  })
  
  // Helper: Update camera in follow mode
  function updateFollowCamera(delta) {
    if (!targetObject) return
    
    const targetPosition = getTargetPosition()
    if (!targetPosition) return
    
    // Get velocity if available (for camera lead)
    const velocity = getTargetVelocity() || new Vector3()
    const horizontalVelocity = new Vector3(velocity.x, 0, velocity.z)
    const speed = horizontalVelocity.length()
    
    // Calculate ideal target position
    // 1. Start with target's position
    cameraTarget.copy(targetPosition)
    
    // 2. Apply direction offset based on velocity or current camera direction
    let direction = new Vector3()
    if (speed > 0.01) {
      // Use velocity direction
      direction.copy(horizontalVelocity).normalize()
    } else {
      // Use current camera direction as fallback
      direction.set(0, 0, -1).applyQuaternion(control.camera.quaternion)
      direction.y = 0
      direction.normalize()
    }
    
    // Dynamic distance based on speed - further back at higher speeds
    const dynamicDistance = config.FOLLOW_DISTANCE * (1 + Math.min(speed / 50, 0.5))
    
    // Apply offset
    cameraTarget.x -= direction.x * dynamicDistance
    cameraTarget.z -= direction.z * dynamicDistance
    
    // Adjust height - higher when the target is higher
    const dynamicHeight = config.FOLLOW_HEIGHT + Math.min(targetPosition.y * 0.3, 1.5)
    cameraTarget.y += dynamicHeight
    
    // Smooth movement toward target position (adaptive damping)
    const distToTarget = cameraPosition.distanceTo(cameraTarget)
    const adaptiveDamping = Math.min(distToTarget * 0.1, 0.95) 
    const baseDamping = 0.85
    const finalDamping = Math.min(baseDamping + adaptiveDamping, 0.98)
    
    // Apply calculated damping to all axes
    cameraPosition.x += (cameraTarget.x - cameraPosition.x) * (1 - finalDamping) * delta * 60 
    cameraPosition.z += (cameraTarget.z - cameraPosition.z) * (1 - finalDamping) * delta * 60
    cameraPosition.y += (cameraTarget.y - cameraPosition.y) * (1 - finalDamping * 0.8) * delta * 60
    
    // Apply the camera position
    control.camera.position.copy(cameraPosition)
    
    // Update camera look direction to always face the target
    // Also add a slight lead to where the target is going
    const lookTarget = targetPosition.clone()
    
    if (speed > 1) {
      // Add a slight lead based on velocity (look ahead of the target)
      if (speed > 0.01) horizontalVelocity.normalize()
      lookTarget.x += horizontalVelocity.x * Math.min(speed * config.FOLLOW_LEAD_FACTOR, 0.5)
      lookTarget.z += horizontalVelocity.z * Math.min(speed * config.FOLLOW_LEAD_FACTOR, 0.5)
    }
    
    lookAtTarget(lookTarget, 1.0)
  }
  
  // Helper: Update camera in static mode
  function updateStaticCamera(delta) {
    if (!targetObject) return
    
    const targetPosition = getTargetPosition()
    if (!targetPosition) return
    
    // Keep camera at static position
    control.camera.position.copy(staticPosition)
    cameraPosition.copy(staticPosition)
    
    // Just update where we're looking at - don't move camera
    lookAtTarget(targetPosition, config.CAMERA_DAMPING)
  }
  
  // Helper: Update camera in orbit mode
  function updateOrbitCamera(delta) {
    if (!targetObject) return
    
    const targetPosition = getTargetPosition()
    if (!targetPosition) return
    
    // Update orbit angle
    orbitAngle += config.ORBIT_SPEED * delta
    
    // Calculate new camera position based on orbit angle
    cameraTarget.x = targetPosition.x + Math.sin(orbitAngle) * config.ORBIT_RADIUS
    cameraTarget.z = targetPosition.z + Math.cos(orbitAngle) * config.ORBIT_RADIUS
    cameraTarget.y = targetPosition.y + config.ORBIT_HEIGHT
    
    // Smooth movement toward target position
    cameraPosition.lerp(cameraTarget, 1 - Math.pow(config.FOLLOW_HORIZONTAL_DAMPING, delta * 60))
    
    // Apply the camera position
    control.camera.position.copy(cameraPosition)
    
    // Look at target
    lookAtTarget(targetPosition, config.CAMERA_DAMPING)
  }
  
  // Helper: Update camera during transitions
  function updateTransition(delta) {
    const currentTime = Date.now() / 1000
    const elapsed = currentTime - transitionStartTime
    
    // Calculate progress (0 to 1)
    let progress = Math.min(elapsed / transitionDuration, 1)
    
    // Apply easing (smooth start/stop)
    progress = easeInOutCubic(progress)
    
    // Interpolate position
    const newPosition = new Vector3().lerpVectors(
      transitionStartPos,
      transitionEndPos,
      progress
    )
    
    // Interpolate rotation
    const newRotation = new Quaternion().slerpQuaternions(
      transitionStartRot,
      transitionEndRot,
      progress
    )
    
    // Apply new transform
    control.camera.position.copy(newPosition)
    control.camera.quaternion.copy(newRotation)
    cameraPosition.copy(newPosition)
    
    // Check if transition is complete
    if (progress >= 1) {
      // Transition complete - update state
      if (targetObject === null) {
        currentState = CAMERA_STATES.DEFAULT
        control.camera.write = false        
      } else {
        // Enter the target state
        currentState = targetState
      }
      
      console.log('CameraManager: Transition complete to', currentState)
    }
  }
  
  // Helper: Update camera shake effect
  function updateCameraShake(delta) {
    if (shakeIntensity <= 0) return
    
    const currentTime = Date.now() / 1000
    const elapsed = currentTime - shakeStartTime
    
    // Check if shake effect has expired
    if (elapsed > shakeDuration) {
      shakeIntensity = 0
      return
    }
    
    // Take control of camera during shake if in default mode
    if (currentState === CAMERA_STATES.DEFAULT && !control.camera.write) {
      control.camera.write = true
    }
    
    // Calculate remaining intensity based on time
    const remainingIntensity = shakeIntensity * (1 - (elapsed / shakeDuration))
    
    // Generate random offsets
    const offsetX = (Math.random() * 2 - 1) * 0.05 * remainingIntensity
    const offsetY = (Math.random() * 2 - 1) * 0.05 * remainingIntensity
    const offsetZ = (Math.random() * 2 - 1) * 0.02 * remainingIntensity
    
    // Generate random rotation
    const rotX = (Math.random() * 2 - 1) * config.SHAKE_MAX_ANGLE * remainingIntensity
    const rotY = (Math.random() * 2 - 1) * config.SHAKE_MAX_ANGLE * remainingIntensity
    const rotZ = (Math.random() * 2 - 1) * config.SHAKE_MAX_ANGLE * remainingIntensity
    
    // Apply to camera
    shakeOffset.set(offsetX, offsetY, offsetZ)
    control.camera.position.add(shakeOffset)
    
    // Apply rotation shake (more subtle)
    shakeRotation.setFromEuler(new Euler(rotX, rotY, rotZ))
    control.camera.quaternion.multiply(shakeRotation)
    
    // Release camera control when shake ends if in default mode
    if (currentState === CAMERA_STATES.DEFAULT && elapsed + delta >= shakeDuration) {
      control.camera.write = false
    }
  }
  
  // Helper: Point camera at a target position
  function lookAtTarget(targetPosition, factor = 1.0) {
    if (!control || !control.camera) return
    
    // Get target position more safely
    const lookTarget = getVectorValues(targetPosition);
    if (!lookTarget) {
      console.warn('CameraManager: Invalid target position for lookAt', targetPosition);
      return;
    }
    
    // Calculate look direction using clone and subtract instead of subVectors
    const cameraPos = {
      x: control.camera.position.x,
      y: control.camera.position.y,
      z: control.camera.position.z
    };
    
    // Manual calculation of direction vector
    const lookDirection = new Vector3(
      lookTarget.x - cameraPos.x,
      lookTarget.y - cameraPos.y,
      lookTarget.z - cameraPos.z
    );
    
    // Check if the direction is a zero vector (camera and target at same position)
    const length = Math.sqrt(
      lookDirection.x * lookDirection.x + 
      lookDirection.y * lookDirection.y + 
      lookDirection.z * lookDirection.z
    );
    
    if (length < 0.001) {
      // Trivial case, no rotation needed
      return;
    }
    
    // Normalize manually instead of using vector method
    lookDirection.x /= length;
    lookDirection.y /= length;
    lookDirection.z /= length;
    
    // Either snap or smooth transition to look direction
    if (factor >= 1.0) {
      // Immediate look
      try {
        control.camera.quaternion.setFromRotationMatrix(
          new Matrix4().lookAt(
            new Vector3(0, 0, 0),
            lookDirection,
            new Vector3(0, 1, 0)
          )
        );
      } catch(e) {
        console.warn('CameraManager: Error setting camera orientation', e);
      }
    } else {
      // Smooth look
      try {
        const targetQuaternion = new Quaternion().setFromRotationMatrix(
          new Matrix4().lookAt(
            new Vector3(0, 0, 0),
            lookDirection,
            new Vector3(0, 1, 0)
          )
        );
        
        // Use a safer limited factor
        const safeFactor = Math.min(0.2, Math.max(0.001, factor));
        control.camera.quaternion.slerp(targetQuaternion, safeFactor);
      } catch(e) {
        console.warn('CameraManager: Error during smooth camera orientation', e);
      }
    }
  }
  
  // Helper: Extract vector values regardless of Vector3 implementation
  function getVectorValues(vector) {
    if (!vector) return null;
    
    // Handle different Vector3-like object formats
    if (typeof vector.x === 'number' && typeof vector.y === 'number' && typeof vector.z === 'number') {
      return { x: vector.x, y: vector.y, z: vector.z };
    }
    
    if (typeof vector._x === 'number' && typeof vector._y === 'number' && typeof vector._z === 'number') {
      return { x: vector._x, y: vector._y, z: vector._z };
    }
    
    // Handle when vector itself is a position
    if (vector.position) {
      return getVectorValues(vector.position);
    }
    
    // Handle array format
    if (Array.isArray(vector) && vector.length >= 3) {
      return { x: vector[0], y: vector[1], z: vector[2] };
    }
    
    // Handle object with custom position properties
    if (vector.getWorldPosition && typeof vector.getWorldPosition === 'function') {
      const pos = new Vector3();
      vector.getWorldPosition(pos);
      return getVectorValues(pos);
    }
    
    return null;
  }
  
  // Helper: Start a transition between camera states
  function startTransition(targetState, duration) {
    if (!control || !control.camera) return
    
    // Store transition parameters
    transitionStartTime = Date.now() / 1000
    transitionDuration = duration
    
    // Store target state
    targetObject = targetState === CAMERA_STATES.DEFAULT ? null : targetObject
    
    // Store starting transform
    transitionStartPos.copy(control.camera.position)
    transitionStartRot.copy(control.camera.quaternion)
    
    // Calculate ending transform based on target state
    switch (targetState) {
      case CAMERA_STATES.DEFAULT: {
        // End at player position
        const player = world.getPlayer()
        if (player) {
          transitionEndPos.copy(player.position)
          transitionEndPos.y += 1.6 // Eye height
          
          // Keep player's current rotation
          transitionEndRot.copy(player.quaternion)
        } else {
          // Fallback to current position/rotation
          transitionEndPos.copy(control.camera.position)
          transitionEndRot.copy(control.camera.quaternion)
        }
        break
      }
      
      case CAMERA_STATES.FOLLOW: {
        if (targetObject) {
          const targetPosition = getTargetPosition()
          if (targetPosition) {
            // Calculate position behind target
            const direction = new Vector3(0, 0, -1)
              .applyQuaternion(control.camera.quaternion)
            direction.y = 0
            const dirLength = direction.length()
            if (dirLength > 0.001) {
              direction.divideScalar(dirLength)
              
              transitionEndPos.copy(targetPosition)
              transitionEndPos.x -= direction.x * config.FOLLOW_DISTANCE
              transitionEndPos.z -= direction.z * config.FOLLOW_DISTANCE
              transitionEndPos.y += config.FOLLOW_HEIGHT
              
              // Calculate rotation to look at target
              const lookDirection = new Vector3()
                .subVectors(targetPosition, transitionEndPos)
              
              // Check if valid direction
              const lookLength = lookDirection.length()
              if (lookLength > 0.001) {
                lookDirection.divideScalar(lookLength)
                
                transitionEndRot.setFromRotationMatrix(
                  new Matrix4().lookAt(
                    new Vector3(0, 0, 0),
                    lookDirection,
                    new Vector3(0, 1, 0)
                  )
                )
              } else {
                // Use current rotation as fallback
                transitionEndRot.copy(control.camera.quaternion)
              }
            } else {
              // Fallback to current position
              transitionEndPos.copy(control.camera.position)
              transitionEndRot.copy(control.camera.quaternion)
            }
          }
        }
        break
      }
      
      case CAMERA_STATES.STATIC: {
        if (targetObject) {
          const targetPosition = getTargetPosition()
          if (targetPosition) {
            // Use the stored static position
            transitionEndPos.copy(staticPosition)
            
            // Calculate rotation to look at target
            const lookDirection = new Vector3()
              .subVectors(targetPosition, transitionEndPos)
            
            // Check if the direction is a zero vector (camera and target at same position)
            const length = lookDirection.length()
            if (length > 0.001) {
              // Normalize the direction
              lookDirection.divideScalar(length)
              
              transitionEndRot.setFromRotationMatrix(
                new Matrix4().lookAt(
                  new Vector3(0, 0, 0),
                  lookDirection,
                  new Vector3(0, 1, 0)
                )
              )
            } else {
              // Use current rotation as fallback
              transitionEndRot.copy(control.camera.quaternion)
            }
          }
        }
        break
      }
      
      case CAMERA_STATES.ORBIT: {
        if (targetObject) {
          const targetPosition = getTargetPosition()
          if (targetPosition) {
            // Start at a fixed position in the orbit
            transitionEndPos.x = targetPosition.x + config.ORBIT_RADIUS
            transitionEndPos.z = targetPosition.z
            transitionEndPos.y = targetPosition.y + config.ORBIT_HEIGHT
            
            // Calculate rotation to look at target
            const lookDirection = new Vector3()
              .subVectors(targetPosition, transitionEndPos)
            
            // Check if the direction is a zero vector (camera and target at same position)
            const length = lookDirection.length()
            if (length > 0.001) {
              // Normalize the direction
              lookDirection.divideScalar(length)
              
              transitionEndRot.setFromRotationMatrix(
                new Matrix4().lookAt(
                  new Vector3(0, 0, 0),
                  lookDirection,
                  new Vector3(0, 1, 0)
                )
              )
            } else {
              // Use current rotation as fallback
              transitionEndRot.copy(control.camera.quaternion)
            }
          }
        }
        break
      }
    }
    
    // Enter transition state
    currentState = CAMERA_STATES.TRANSITIONING
    
    // Ensure we have camera control during transition
    control.camera.write = true
    
    console.log('CameraManager: Starting transition to', targetState, 'duration:', duration)
  }
  
  // Helper: Get current position of target object (with fallbacks)
  function getTargetPosition() {
    if (!targetObject) return null;
    
    // Get position using our robust vector helper
    const positionValues = getVectorValues(targetObject);
    if (positionValues) {
      return new Vector3(positionValues.x, positionValues.y, positionValues.z);
    }
    
    // If we couldn't get a position directly, try common patterns
    if (targetObject.object) {
      const objPos = getVectorValues(targetObject.object);
      if (objPos) {
        return new Vector3(objPos.x, objPos.y, objPos.z);
      }
    }
    
    if (targetObject.networkPosition) {
      const netPos = getVectorValues(targetObject.networkPosition);
      if (netPos) {
        return new Vector3(netPos.x, netPos.y, netPos.z);
      }
    }
    
    console.warn('CameraManager: Could not determine position of target object');
    return null;
  }
  
  // Helper: Get velocity of target if available
  function getTargetVelocity() {
    if (!targetObject) return null
    
    if (targetObject.velocity) {
      return targetObject.velocity
    }
    
    if (targetObject.networkVelocity) {
      return targetObject.networkVelocity
    }
    
    if (targetObject.predictedVelocity) {
      return targetObject.predictedVelocity
    }
    
    return null
  }
  
  // Easing function for smooth transitions
  function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
  }
  
  console.log('CameraManager: Initialized and ready for commands')
} 
}
