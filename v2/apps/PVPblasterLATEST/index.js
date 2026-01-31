export default function main(world, app, fetch, props, setTimeout) {
// Global error handler for isNumber errors
try {
  // Attempted workaround for isNumber errors
  if (typeof isNumber === 'undefined') {
    // Define globally if not already defined
    window.isNumber = function(value) {
      return typeof value === 'number' && !isNaN(value);
    };
  }
} catch (e) {
  // Ignore errors from the attempt, we'll handle them another way
}

// Utility function to check if a value is a number
function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

// Global variables
let lastUseTime = 0;
let player = null;
let control = null;
let inFirstPersonMode = false;
let controlReleaseFn = null;

// Timer management
let timers = {}; 

// Particle system configuration
const MAX_PARTICLES = 250; // Maximum allowed particles
const PARTICLE_POOL_SIZE = 50; // Size of our reusable particle pool
const particlePool = []; // Our pool of reusable particle objects
const particles = []; // Array to track active particles for effects

// Initialize the particle pool with pre-created objects 
function initParticlePool() {
  for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
    particlePool.push({
      anchor: null,
      velocity: { x: 0, y: 0, z: 0 },
      lifetime: 0,
      active: false
    });
  }
  console.log(`Particle pool initialized with ${PARTICLE_POOL_SIZE} objects`);
}

// Function to get a particle from the pool
function getParticleFromPool() {
  // First try to find an inactive particle
  for (let i = 0; i < particlePool.length; i++) {
    if (!particlePool[i].active) {
      particlePool[i].active = true;
      particlePool[i].lifetime = 0;
      return particlePool[i];
    }
  }
  
  // If the pool is full and all particles are active, create a new one
  // but only if we haven't reached the maximum
  if (particles.length < MAX_PARTICLES) {
    const newParticle = {
      anchor: null,
      velocity: { x: 0, y: 0, z: 0 },
      lifetime: 0,
      active: true
    };
    particlePool.push(newParticle);
    return newParticle;
  }
  
  // If we've reached the maximum, reuse the oldest one in the pool
  return particlePool[0];
}

// Function to return a particle to the pool
function returnParticleToPool(particle) {
  if (!particle) return;
  
  particle.active = false;
  particle.lifetime = 0;
  
  // Cleanup the anchor if needed
  if (particle.anchor) {
    try {
      world.remove(particle.anchor);
    } catch (e) {
      // Ignore errors during cleanup
    }
    particle.anchor = null;
  }
  
  // Reset velocity
  particle.velocity.x = 0;
  particle.velocity.y = 0;
  particle.velocity.z = 0;
}

// Play lightning sound at position
function playLightningSound(position) {
  try {
    const soundEffect = app.create('audio')
    
    // Use a relative path for default sound with proper error handling
    const defaultSound = 'sounds/lightning.mp3'
    soundEffect.src = app.config.lightningSound?.url || defaultSound
    
    // Use volume from config, default to 0.7 if not set
    const volume = (app.config.soundVolume || 7.0) / 10.0
    soundEffect.volume = volume
    soundEffect.spatial = true
    soundEffect.group = 'sfx'
    
    soundEffect.position.set(position[0], position[1], position[2])
    world.add(soundEffect)
    
    // Play with error handling
    try {
      soundEffect.play()
    } catch (e) {
      console.warn('Failed to play lightning sound:', e)
    }
    
    // Use timer system for cleanup
    const lightSoundTimerId = 'lightSound' + Date.now();
    createTimer(lightSoundTimerId, 5000, () => {
      try {
        if (soundEffect) {
          world.remove(soundEffect);
        }
      } catch (e) {
        console.error('Error removing sound effect:', e);
      }
    });
  } catch (e) {
    console.error('Error creating lightning sound effect:', e)
  }
}

// Hyperfy Weapons Script with Animation Features

app.configure(() => {
  return [
    {
      type: 'section',
      key: 'appearance',
      label: 'Weapon Appearance',
    },
  {
    key: 'emote',
    type: 'file',
    kind: 'emote',
    label: 'Weapon Use Animation'
  },
  {
    key: 'lightningColor',
    type: 'color',
    label: 'Lightning Color',
    value: '#00ffee'
  },
  {
    key: 'lightningSound',
    type: 'file',
    kind: 'audio',
    label: 'Lightning Sound Effect',
    description: 'Upload a sound file or leave empty to use default. Audio hosted on assets.hyperfy.io may not work.'
  },
  {
    key: 'impactSound',
    type: 'file',
    kind: 'audio',
    label: 'Impact Sound Effect',
    description: 'Upload a sound file or leave empty to use default. Audio hosted on assets.hyperfy.io may not work.'
  },
  {
    key: 'soundVolume',
    type: 'number',
    label: 'Sound Effect Volume (0-10)',
    value: 7.0,
    min: 0,
    max: 10,
    step: 0.5
  },
    {
      type: 'section',
      key: 'gameplay',
      label: 'Gameplay Settings',
    },
    {
      key: 'weaponDamage',
      type: 'number',
      label: 'Base Damage',
      min: 1,
      max: 100,
      initial: 25
    },
    {
      key: 'headshotMultiplier',
      type: 'number',
      dp: 1,
      label: 'Headshot Multiplier',
      min: 1,
      max: 5,
      step: 0.1,
      initial: 2.0
    },
    {
      key: 'fireRate',
      type: 'number',
      dp: 2,
      label: 'Fire Rate (seconds)',
      min: 0.01,
      max: 1,
      step: 0.05,
      initial: 0.1
    },
    {
      key: 'weaponRange',
      type: 'number',
      label: 'Weapon Range',
      min: 10,
      max: 200,
      initial: 100
    },
    {
      type: 'section',
      key: 'health',
      label: 'Health Settings',
    },
    {
      key: 'enableHealthRegen',
      type: 'switch',
      label: 'Health Regeneration',
      value: true,
      options: [
        { label: 'Enabled', value: true },
        { label: 'Disabled', value: false }
      ]
    },
    {
      key: 'healthRegenAmount',
      type: 'number',
      label: 'Regen Amount',
      min: 1,
      max: 20,
      initial: 1,
      when: [{ key: 'enableHealthRegen', op: 'eq', value: true }]
    },
    {
      key: 'healthRegenDelay',
      type: 'number',
      label: 'Regen Delay (seconds)',
      min: 1,
      max: 30,
      initial: 5,
      when: [{ key: 'enableHealthRegen', op: 'eq', value: true }]
    },
    {
      type: 'section',
      key: 'view',
      label: 'View Settings',
    },
  {
    key: 'enableFirstPerson',
    type: 'switch',
      label: 'First Person Mode',
    value: true,
    options: [
        { label: 'Enabled', value: true },
        { label: 'Disabled', value: false }
    ]
  }
  ]
})

// Animation timing
const WEAPON_ANIMATION_DURATION = 0.6 // Length of weapon use animation
const WEAPON_USE_DELAY = app.config.weaponUseDelay || 0.1 // Seconds before weapon fires
const WEAPON_COOLDOWN = app.config.weaponCooldown || 0.2 // Seconds between hits on same player
const WEAPON_MAX_DISTANCE = app.config.weaponMaxDistance || 100 // Maximum distance weapon can hit

// Health regeneration settings - read from config with fallbacks
const HEALTH_REGEN_AMOUNT = app.config.healthRegenAmount || 1
const HEALTH_REGEN_INTERVAL = 2     // Seconds between regen ticks
const HEALTH_REGEN_DELAY = app.config.healthRegenDelay || 5

// Weapon damage settings - read from config with fallbacks
const WEAPON_DAMAGE = app.config.weaponDamage || 25 // Base damage per hit
const WEAPON_HEADSHOT_MULTIPLIER = app.config.weaponHeadshotMultiplier || 2.0 // Multiplier for headshots
const WEAPON_FIRE_RATE = app.config.fireRate || 0.1 // Fire rate from config

// Lightning effect settings
const LIGHTNING_COUNT = 1 // Single beam for laser
const LIGHTNING_PARTICLE_SPEED_MIN = 50  // Increased from 40
const LIGHTNING_PARTICLE_SPEED_MAX = 70  // Increased from 60
const LIGHTNING_LIFETIME = 0.5   // Slightly longer lifetime
const LIGHTNING_SCALE_MIN = 0.005 // Reduced from 0.1
const LIGHTNING_SCALE_MAX = 0.005  // Reduced from 0.4
const LIGHTNING_SPREAD = 0 // No spread for perfect accuracy
const LIGHTNING_SPAWN_OFFSET_FORWARD = 0.2
const LIGHTNING_SPAWN_OFFSET_UP = 1.5
const LIGHTNING_SPAWN_OFFSET_RIGHT = 0.05
const LIGHTNING_FIRE_RANGE = 1 // Extended range for laser
const LIGHTNING_FIRE_RATE = app.config.fireRate || 0.1 // Fire rate from config

// Muzzle flash settings
const MUZZLE_FLASH_COUNT = 3      // Reduced from 5 for fewer effects
const MUZZLE_FLASH_LIFETIME = 0.3 // Slightly reduced lifetime
const MUZZLE_FLASH_SCALE = 0.05   // Reduced from 0.15
const MUZZLE_FLASH_SPREAD = 0.05  // Reduced spread
const MUZZLE_FLASH_OFFSET_FORWARD = 0.7  // Keep same position
const MUZZLE_FLASH_OFFSET_UP = 1.5      // Keep same position
const MUZZLE_FLASH_OFFSET_RIGHT = 0.1

// Impact effect settings
const IMPACT_PARTICLES = 5 // Reduced from 8
const IMPACT_SPEED_MIN = 4
const IMPACT_SPEED_MAX = 8 // Reduced from 12
const IMPACT_LIFETIME = 0.3 // Reduced from 0.4
const IMPACT_SCALE = 0.008  // Reduced from 0.012
const IMPACT_SPREAD = 0.4   // Reduced from 0.8
const IMPACT_CHARS = ['⚡'] // Reduced character set for better performance

// Effect character definitions
const LIGHTNING_CHARS = ['💥']

// Camera configuration for first person mode
const CAMERA_CONFIG = {
  // Camera view presets
  ANGLES: [
    { position: new Vector3(0, 1.3, -2.1), lookAhead: 14, name: "FIRST PERSON" }, // First person view
    { position: new Vector3(0, 1.8, 2), lookAhead: 8, name: "OVER SHOULDER" },   // Over shoulder view
    { position: new Vector3(0, 2.5, 4), lookAhead: 5, name: "CHASE" }            // Chase camera
  ],
  DEFAULT_ANGLE: 0,   // Default to first person
  DAMPING: 1,      // Camera movement smoothing
  TRANSITION_SPEED: 2 // How fast camera transitions between positions
}

// Secure random number generator (alternative to Math.random which is blocked in SES)
const secureRandom = {
  // Seed value
  _seed: Date.now() % 2147483647,
  
  // LCG parameters - common values for a basic PRNG
  _a: 16807,       // multiplier
  _c: 0,           // increment
  _m: 2147483647,  // modulus (2^31 - 1)
  
  // Get next pseudorandom value between 0 and 1
  value() {
    this._seed = (this._a * this._seed + this._c) % this._m
    return this._seed / this._m
  },
  
  // Get random value in range [min, max)
  range(min, max) {
    return min + this.value() * (max - min)
  },
  
  // Random integer in range [min, max]
  int(min, max) {
    return Math.floor(this.range(min, max + 1))
  },
  
  // Reset seed based on current time
  resetSeed() {
    // Use current timestamp as new seed
    this._seed = (Date.now() % this._m) || 1 // Ensure seed is never 0
  }
}

// Reset the seed initially
secureRandom.resetSeed()

const initialPosition = app.position.toArray()
const initialQuaternion = app.quaternion.toArray()

if (world.isClient) {
  // Initialize particle pool for client
  initParticlePool();
  console.log('Weapon system: Particle pool initialized with recycling');
  
  // No need for the built-in performance monitor as Hyperfy has one
  
  let control = null
  let lastUseTime = 0 // Used for weapon use cooldown
  let pendingUse = null // Track pending weapon use
  const player = world.getPlayer()
  const action = app.create('action', {
    active: false,
    label: 'Equip',
    onTrigger: e => {
      action.active = false
      
      app.send('request', player.id)
    },
  })
  app.add(action)
  const state = app.state
  if (!state.playerId) {
    action.active = true
  }
  
  // First person camera variables
  let inFirstPersonMode = false
  let currentCameraPosition = new Vector3()
  let currentCameraAngle = CAMERA_CONFIG.DEFAULT_ANGLE
  
  // Health status UI
  let healthUI
  let healthText
  let damageOverlay
  
  // Create a hit marker UI for the shooter
  let hitMarker;
  let hitMarkerVisible = false;
  let hitMarkerTimeout;
  
  // Create health indicator UI (will be attached to player)
  healthUI = app.create('ui')
  healthUI.width = 70 // Reduced from 150
  healthUI.height = 30  // Reduced from 40
  healthUI.backgroundColor = 'rgba(0, 0, 0, 0)'  // Slightly more opaque
  // healthUI.backgroundColor = 'red'
  healthUI.borderRadius = 4  // Smaller radius
  healthUI.padding = 5   // Less padding
  healthUI.pivot = 'bottom-center' // Position from bottom center
  healthUI.billboard = 'full'
  healthUI.justifyContent = 'center'
  healthUI.alignItems = 'center'
  
  // Health text
  healthText = app.create('uitext')
  healthText.width = 70
  healthText.value = ''
  healthText.fontSize = .05  // Slightly smaller font
  healthText.color = '#00ffaa'
  healthUI.add(healthText)
  
  // Create a player-following anchor for the health UI
  const uiAnchor = app.create('anchor')
  uiAnchor.add(healthUI)
  
  // Position the UI above the player's head
  // Initial setup, will be updated each frame
  const localPlayer = world.getPlayer()
  if (localPlayer) {
    uiAnchor.position.copy(localPlayer.position)
    uiAnchor.position.y += 2.0 // Adjusted from 2.2
  }
  
  // Add to world instead of app so it follows player
  world.add(uiAnchor)
  
  // Update health UI position to follow player
  app.on('update', () => {
    const player = world.getPlayer()
    if (player && uiAnchor) {
      // Copy player position
      uiAnchor.position.copy(player.position)
      
      // Add height offset above player head
      uiAnchor.position.y += 2.0 // Adjusted from 2.2
      
      // Update health text with current health
      const health = player.health || 100
      
      // Change color based on health level
      if (health > 70) {
        healthText.color = '#00ffaa' // Healthy - green
      } else if (health > 30) {
        healthText.color = '#ffaa00' // Injured - orange
      } else {
        healthText.color = '#ff3300' // Critical - red
        // Make text pulse when critical
        const pulse = Math.sin(world.getTime() * 5) * 0.2 + 0.8
        healthText.fontSize = 18 + (pulse * 4)
      }
      
      // Update the text
      healthText.value = `♥ ${Math.floor(health)}`
    }
  })
  
  // Store the anchor for cleanup
  app._healthUIAnchor = uiAnchor
  
  // Weapon stats display (PIP-BOY style)
  const weaponStatsUI = app.create('ui')
  weaponStatsUI.width = 200
  weaponStatsUI.height = 120
  weaponStatsUI.backgroundColor = 'rgba(0, 15, 30, 0.7)'
  weaponStatsUI.borderRadius = 5
  weaponStatsUI.padding = 12
  weaponStatsUI.position.set(-0.3, 1.5, 0)
  weaponStatsUI.pivot = 'top-right'
  weaponStatsUI.billboard = 'full'
  weaponStatsUI.flexDirection = 'column'
  weaponStatsUI.justifyContent = 'flex-start'
  weaponStatsUI.alignItems = 'flex-start'
  weaponStatsUI.gap = 6
  
  // Weapon name
  const weaponNameText = app.create('uitext')
  weaponNameText.value = 'V4-P0R1Z3R'
  weaponNameText.fontSize = 16
  weaponNameText.fontWeight = 'bold'
  weaponNameText.color = '#00ffaa'
  weaponStatsUI.add(weaponNameText)
  
  // Damage stat
  const damageText = app.create('uitext')
  damageText.value = `DMG: ${WEAPON_DAMAGE} (x${WEAPON_HEADSHOT_MULTIPLIER} HS)`
  damageText.fontSize = 14
  damageText.color = '#00ffaa'
  weaponStatsUI.add(damageText)
  
  // Range stat
  const rangeText = app.create('uitext')
  rangeText.value = `RNG: ${WEAPON_MAX_DISTANCE}m`
  rangeText.fontSize = 14
  rangeText.color = '#00ffaa'
  weaponStatsUI.add(rangeText)
  
  // Fire rate stat
  const fireRateText = app.create('uitext')
  fireRateText.value = `ROF: ${(1 / LIGHTNING_FIRE_RATE).toFixed(1)}/sec`
  fireRateText.fontSize = 14
  fireRateText.color = '#00ffaa'
  weaponStatsUI.add(fireRateText)
  
  // Controls hint
  const controlsText = app.create('uitext')
  controlsText.value = `[LMB] FIRE  [C] ${inFirstPersonMode ? '3RD' : '1ST'} PERS`
  controlsText.fontSize = 12
  controlsText.color = '#ffff00'
  controlsText.marginTop = 8
  weaponStatsUI.add(controlsText)
  
  // Make it initially hidden
  weaponStatsUI.active = false
  app.add(weaponStatsUI)
  
  // Show/hide stats with F key
  let statsVisible = false
  if (control && control.keyF) {
    control.keyF.onPress = () => {
      statsVisible = !statsVisible
      weaponStatsUI.active = statsVisible
    }
  }
  
  // Damage overlay for visual feedback when hit
  damageOverlay = app.create('ui')
  damageOverlay.width = 400
  damageOverlay.height = 300
  damageOverlay.backgroundColor = 'rgba(255, 0, 0, 0.0)'  // Start transparent
  damageOverlay.position.set(0, 0, -0.5)  // Position slightly in front of camera
  damageOverlay.billboard = 'full'
  damageOverlay.active = false  // Start inactive
  app.add(damageOverlay)
  
  // Create hit marker UI (centered crosshair that appears when hitting players)
  hitMarker = app.create('ui');
  hitMarker.width = 40;
  hitMarker.height = 40;
  hitMarker.backgroundColor = 'transparent';
  hitMarker.position.set(0, 0, -0.5); // Positioned in front of camera
  hitMarker.pivot = 'center';
  hitMarker.billboard = 'full';
  hitMarker.justifyContent = 'center';
  hitMarker.alignItems = 'center';
  
  // Hit marker text (X symbol)
  const hitMarkerText = app.create('uitext');
  hitMarkerText.value = '✕'; // X symbol for hit marker
  hitMarkerText.fontSize = 24;
  hitMarkerText.color = '#ff3300'; // Red hit marker
  hitMarker.add(hitMarkerText);
  
  // Add to app but keep hidden initially
  hitMarker.active = false;
  app.add(hitMarker);
  
  // Function to show hit marker
  function showHitMarker(isCritical = false) {
    // Clear any existing timeout
    if (hitMarkerTimeout) {
      clearTimeout(hitMarkerTimeout);
    }
    
    // Update color based on critical hit
    const hitMarkerText = hitMarker.children[0];
    if (hitMarkerText) {
      hitMarkerText.color = isCritical ? '#ffff00' : '#ff3300'; // Yellow for crits, red for normal
      hitMarkerText.fontSize = isCritical ? 32 : 24; // Bigger for crits
    }
    
    // Show the hit marker with animation
    hitMarker.active = true;
    hitMarkerVisible = true;
    
    // Animation effect - start slightly larger and shrink to normal
    hitMarker.scale.set(1.5, 1.5, 1.5);
    
    // Animate back to normal size
    const startTime = Date.now();
    const animateDuration = 150; // 150ms animation
    
    function animateHitMarker() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animateDuration, 1);
      const scale = 1.5 - (0.5 * progress); // Scale from 1.5 to 1.0
      
      hitMarker.scale.set(scale, scale, scale);
      
      if (progress < 1 && hitMarkerVisible) {
        // Continue animation
        requestAnimationFrame(animateHitMarker);
      }
    }
    
    // Start animation
    animateHitMarker();
    
    // Hide after a short delay
    const timerId = 'hitMarker' + Date.now();
    createTimer(timerId, 200, () => {
      hitMarker.active = false;
      hitMarkerVisible = false;
      // Reset scale when hidden
      hitMarker.scale.set(1, 1, 1);
    }); // Show for 200ms
  }
  
  // Listen for hit confirmation events
  app.on('hitConfirm', (data) => {
    // Show hit marker when we hit someone
    if (data && data.hit) {
      showHitMarker(data.critical);
      
      // Play hit sound effect
      const hitSound = {
        url: data.critical ? 'sounds/crit_hit.mp3' : 'sounds/hit.mp3',
        volume: 0.5,
        spatial: false
      };
      
      try {
        app.audio.play(hitSound);
      } catch (e) {
        console.log('Could not play hit sound:', e);
      }
    }
  });
  
  // Helper function to play the weapon animation
  function playWeaponAnimation() {
    // Get the local player
    if (!world.isClient) return;
    const player = world.getPlayer();
    if (!player) return;
    
    // Check if emote URL exists
    const emoteUrl = app.config.emote?.url;
    console.log('Emote URL:', emoteUrl);
    
    if (!emoteUrl) {
      console.warn('No emote URL configured for weapon animation');
      return;
    }
    
    // Simple, direct approach - this is what worked before
    try {
      // Apply the animation effect
      player.applyEffect({
        emote: emoteUrl,
        duration: WEAPON_ANIMATION_DURATION,
        turn: true,
        cancellable: false
      });
      console.log('Applied animation to player');
    } catch (error) {
      console.error('Error applying animation:', error);
    }
  }
  
  // Update the control handlers to use this function
  function setupControls() {
    if (!control) return;
    
    // Add weapon use control (left mouse click and hold)
    control.mouseLeft.onPress = () => {
      // Initial shot and animation on press
      useWeapon();
      
      // Play weapon animation on initial press
      playWeaponAnimation();
    };
    
    // Set up continuous fire with direct onHold
    control.mouseLeft.onHold = useWeapon;
  }
  
  // Function to enter first person mode
  function enterFirstPersonMode() {
    if (inFirstPersonMode) return
    
    if (!control || !player) {
      console.error('Cannot enter first person mode: missing control or player')
      return
    }
    
    // Release current control and request a new one with camera write access
    control.release()
    control = app.control()
    
    if (!control) {
      console.error('Failed to get control for first person mode')
      return
    }
    
    console.log('Entering first person mode')
    
    inFirstPersonMode = true
    
    // Configure control for first person mode
    control.mouseLeft.capture = true
    control.keyC.capture = true  // Toggle camera view
    control.keyQ.capture = true  // Exit first person view
    control.camera.write = true  // Enable camera control
    
    // Initialize camera position based on current preset
    const preset = CAMERA_CONFIG.ANGLES[currentCameraAngle]
    currentCameraPosition = player.position.clone().add(
      preset.position.clone().applyQuaternion(player.quaternion)
    )
    control.camera.position.copy(currentCameraPosition)
    
    // Set up controls
    setupControls()
    
    // Start updating the camera
    app.on('update', updateFirstPersonView)
    
    // Log success
    console.log('First person mode activated')
  }
  
  // Function to exit first person mode
  function exitFirstPersonMode() {
    if (!inFirstPersonMode) return
    
    app.off('update', updateFirstPersonView)
    
    // Release the control
    if (control) {
      control.release()
      control = app.control() // Get a new control without camera override
      
      if (control) {
        // Set up controls for firing in third person
        setupControls()
      }
    }
    
    inFirstPersonMode = false
  }
  
  // Update function for first person view
  function updateFirstPersonView(delta) {
    if (!inFirstPersonMode || !control) return
    
    // Check for exit request
    if (control.keyQ.pressed) {
      exitFirstPersonMode()
      return
    }
    
    // Camera view switching
    if (control.keyC.pressed) {
      currentCameraAngle = (currentCameraAngle + 1) % CAMERA_CONFIG.ANGLES.length
    }
    
    // Calculate target camera position based on current preset
    const preset = CAMERA_CONFIG.ANGLES[currentCameraAngle]
    const targetPosition = player.position.clone().add(
      preset.position.clone().applyQuaternion(player.quaternion)
    )
    
    // Smoothly move camera to target position
    currentCameraPosition.lerp(targetPosition, CAMERA_CONFIG.DAMPING)
    control.camera.position.copy(currentCameraPosition)
    
    // Calculate look target ahead of player
    const lookAtPosition = player.position.clone().add(
      new Vector3(0, 0, -preset.lookAhead).applyQuaternion(player.quaternion)
    )
    
    // Point camera at look target
    const lookDirection = lookAtPosition.clone().sub(currentCameraPosition).normalize()
    control.camera.quaternion.setFromRotationMatrix(
      new Matrix4().lookAt(
        new Vector3(0, 0, 0),
        lookDirection,
        new Vector3(0, 1, 0)
      )
    )

    // In the update function, add this code to ensure the hit marker stays with the camera
    if (hitMarker && hitMarkerVisible) {
      // Position the hit marker in front of the camera
      const camera = world.camera;
      if (camera) {
        hitMarker.position.set(0, 0, -0.5);
        hitMarker.quaternion.copy(camera.quaternion);
      }
    }
  }
  
  app.on('playerId', playerId => {
    state.playerId = playerId
    action.active = !playerId
    
    if (player.id === playerId) {
      // Initialize controls for weapon use
      control = app.control()
      
      if (control) {
        // Add weapon use control (left mouse click and hold)
        setupControls()
        
        // Remove the old update-based firing system
        // control.mouseLeft.isDown tracking is no longer needed
        
        // Add C key for toggling first person mode
        control.keyC.onPress = () => {
          if (inFirstPersonMode) {
            exitFirstPersonMode()
          } else {
            enterFirstPersonMode()
          }
        }
      }
    } else {
      if (inFirstPersonMode) {
        exitFirstPersonMode()
      }
      
      if (control) {
        control.release()
        control = null
      }
    }
    
    if (!playerId) {
      app.position.fromArray(initialPosition)
      app.quaternion.fromArray(initialQuaternion)
    }
  })
  
  // Helper function for using the weapon - simplified to avoid type errors
  function useWeapon() {
    // Basic timestamp calculation 
    const now = Date.now();
    const currentTime = now / 1000;
    
    // Check firing rate with protective code
    if (lastUseTime && (currentTime - lastUseTime < PROJECTILE_CONFIG.FIRE_RATE)) {
      return; // Still on cooldown
    }
    
    // Update cooldown timestamp
    lastUseTime = currentTime;
    
    // Skip complex operations if no player or control
    if (!player || !control) {
      console.log("Cannot fire weapon: no player or control available");
      return;
    }
    
    // Simple forward vector calculation
    let forward;
    
    try {
      // Simple vector calculation
          if (inFirstPersonMode) {
        forward = new Vector3(0, 0, -1).applyQuaternion(control.camera.quaternion);
        console.log("Using first-person camera direction");
          } else {
        forward = new Vector3(0, 0, -1).applyQuaternion(player.quaternion);
        console.log("Using player quaternion direction");
      }
      
      // Normalize the forward vector (ensure it's a unit vector)
      const length = Math.sqrt(forward.x * forward.x + forward.y * forward.y + forward.z * forward.z);
      if (length > 0) {
        forward.x /= length;
        forward.y /= length;
        forward.z /= length;
      }
      
      // Play weapon animation
      playWeaponAnimation();
      
      // Send minimal data to server for projectile creation
      const weaponData = [
        player.position.toArray(),
        [forward.x, forward.y, forward.z]
      ];
      
      console.log("Sending weapon:use event to server with data:", JSON.stringify(weaponData));
      app.send('weapon:use', weaponData);
      
      console.log("Weapon fired successfully");
    } catch (err) {
      console.error("Error in weapon use:", err);
    }
  }
  
  app.on('update', (delta) => {
    // Check for pending weapon use
    if (pendingUse) {
      const currentTime = Date.now() / 1000
      if (currentTime - pendingUse.startTime >= WEAPON_USE_DELAY) {
        // Get the correct forward vector based on the mode
        let forward
        
        if (inFirstPersonMode && control) {
          // In first person mode, use exact camera direction
          forward = new Vector3(0, 0, -1).applyQuaternion(control.camera.quaternion)
        } else if (control && control.mousePosition && control.camera) {
          // In third person mode, use the actual aim direction
          try {
            const ray = control.camera.screenPointToRay(
              control.mousePosition.x || 0, 
              control.mousePosition.y || 0
            )
            forward = ray.direction
          } catch (err) {
            // Fallback to player direction if ray calculation fails
            forward = new Vector3(0, 0, -1).applyQuaternion(player.quaternion)
          }
        } else {
          // Fallback if no control or missing properties
          forward = new Vector3(0, 0, -1).applyQuaternion(player.quaternion)
        }
        
        // Ensure forward is normalized
        forward.normalize()
        
        // Send weapon use event to server
        app.send('weapon:use', [player.position.toArray(), forward.toArray()])
        
        // Clear pending use
        pendingUse = null
      }
    }
    
    // Health display update removed - now handled in player-following UI update
  })
  
  // Listen for damage events 
  app.on('player:damaged', ({amount}) => {
    // Flash the damage overlay for visual feedback
    if (damageOverlay) {
      // Set initial opacity based on damage amount (capped at 0.8)
      const opacity = Math.min(amount / 100, 0.8)
      damageOverlay.backgroundColor = `rgba(255, 0, 0, ${opacity})`
      damageOverlay.active = true
      
      // Add screen shake effect proportional to damage
      if (control && control.camera) {
        const shakeIntensity = Math.min(amount / 10, 0.3); // Cap at 0.3
        const shakeDuration = 0.4; // seconds
        
        // Apply screenshake
        let shakeTime = 0;
        const shakeOrigin = control.camera.position.clone();
        
        const shakeHandler = (delta) => {
          shakeTime += delta;
          
          if (shakeTime >= shakeDuration) {
            // Reset camera position and remove handler
            control.camera.position.copy(shakeOrigin);
            app.off('update', shakeHandler);
            return;
          }
          
          // Calculate shake falloff - more intense at start, fading out
          const shakeProgress = shakeTime / shakeDuration;
          const shakeFalloff = 1 - shakeProgress;
          
          // Apply random offset to camera
          control.camera.position.set(
            shakeOrigin.x + (Math.random() * 2 - 1) * shakeIntensity * shakeFalloff,
            shakeOrigin.y + (Math.random() * 2 - 1) * shakeIntensity * shakeFalloff,
            shakeOrigin.z + (Math.random() * 2 - 1) * shakeIntensity * shakeFalloff
          );
        };
        
        // Start the screen shake
        app.on('update', shakeHandler);
      }
      
      // Fade it out over time
      let duration = 0
      const fadeTime = 0.5 // Half a second fade
      
      const fadeHandler = (delta) => {
        duration += delta
        if (duration >= fadeTime) {
          // Remove when done
          damageOverlay.active = false
          app.off('update', fadeHandler)
          return
        }
        
        // Calculate fade progress
        const progress = duration / fadeTime
        const remaining = 1 - progress
        damageOverlay.backgroundColor = `rgba(255, 0, 0, ${opacity * remaining})`
      }
      
      // Start the fade effect
      app.on('update', fadeHandler)
    }
  })
  
  // Listen for hit confirmations
  app.on('hitConfirm', ({message}) => {
    // Show hit confirmation message
    if (message && healthUI) {
      const hitText = app.create('uitext')
      hitText.value = message
      hitText.fontSize = 16
      hitText.color = '#ffff00' // Yellow for hit confirmation
      hitText.position.set(0, 0.1, 0)
      
      // Create temporary UI for hit message
      const hitUI = app.create('ui')
      hitUI.width = 300
      hitUI.height = 40
      hitUI.padding = 8
      hitUI.backgroundColor = 'rgba(0, 0, 0, 0.7)'
      hitUI.borderRadius = 5
      hitUI.position.set(0, 1.3, 0) // Below health bar
      hitUI.pivot = 'top-center'
      hitUI.billboard = 'full'
      hitUI.justifyContent = 'center'
      hitUI.alignItems = 'center'
      hitUI.add(hitText)
      app.add(hitUI)
      
      // Remove after a few seconds
      let duration = 0
      const removeTime = 3 // Show for 3 seconds
      
      const removeHandler = (delta) => {
        duration += delta
        if (duration >= removeTime) {
          app.remove(hitUI)
          app.off('update', removeHandler)
          return
        }
        
        // Fade out in the last second
        if (duration > removeTime - 1) {
          const fadeProgress = (duration - (removeTime - 1))
          hitUI.backgroundColor = `rgba(0, 0, 0, ${0.7 * (1 - fadeProgress)})`
          hitText.color = `rgba(255, 255, 0, ${1 - fadeProgress})`
        }
      }
      
      // Start the remove timer
      app.on('update', removeHandler)
    }
  })
  
  app.on('lateUpdate', delta => {
    if (!state.playerId) return
    const player = world.getPlayer(state.playerId)
    const matrix = player.getBoneTransform('rightHand')
    if (matrix) {
      app.position.setFromMatrixPosition(matrix)
      app.quaternion.setFromRotationMatrix(matrix)
    }
    
    // Handle releasing weapon with Q when not in first person mode
    if (control && control.keyQ.pressed && !inFirstPersonMode) {
      app.send('release', player.id)
    }
  })
  
  // Creates an energy impact effect at the hit location
  function createLegacyImpactEffect(position, velocity) {
    // Create a small flash at impact point
    const flash = app.create('anchor')
    flash.visible = true
    flash.position.set(position[0], position[1], position[2])
    
    const flashUI = app.create('ui')
    flashUI.width = 30
    flashUI.height = 30
    flashUI.billboard = 'full'
    flashUI.size = IMPACT_SCALE * 2
    flashUI.backgroundColor = 'transparent'
    flash.add(flashUI)
    
    const flashText = app.create('uitext')
    flashText.value = '✺'
    flashText.color = app.config.lightningColor || '#ff0000'
    flashText.fontSize = 30
    flashText.textAlign = 'center'
    flashUI.add(flashText)
    
    // Pre-calculate lifetime values for performance
    const flashMaxLifetime = IMPACT_LIFETIME * 0.3
    
    // Animate central flash
    const updateFlash = (delta) => {
      flash.lifetime = (flash.lifetime || 0) + delta
      if (flash.lifetime >= flashMaxLifetime) {
        world.remove(flash)
        app.off('update', updateFlash)
        return
      }
      const progress = flash.lifetime / flashMaxLifetime
      flashText.opacity = (1 - progress) * (0.8 + 0.2 * Math.sin(progress * 20))
      flashUI.size = IMPACT_SCALE * 2 * (1 - progress * 0.5)
    }
    app.on('update', updateFlash)

    // Create particle pool
    const impactParticles = []
    let updateParticlesHandler = null
    
    // Create spreading particles
    for (let i = 0; i < IMPACT_PARTICLES; i++) {
      const particle = app.create('anchor')
      particle.visible = true
      particle.position.set(position[0], position[1], position[2])
      
      // Create UI element
      const particleUI = app.create('ui')
      particleUI.width = 20
      particleUI.height = 20
      particleUI.pivot = 'center'
      particleUI.billboard = 'full'
      particleUI.backgroundColor = 'transparent'
      particle.add(particleUI)
      
      // Add text
      const particleText = app.create('uitext')
      particleText.value = '✧' // Using a star character for sparkles
      particleText.fontSize = 12
      particleText.color = app.config.lightningColor || '#ff0000'
      particleUI.add(particleText)
      
      // Calculate random velocity
      const theta = Math.random() * Math.PI * 2 // Around a circle
      const phi = Math.random() * Math.PI // From center line
      const speed = IMPACT_SPEED_MIN + Math.random() * (IMPACT_SPEED_MAX - IMPACT_SPEED_MIN)
      
      // Convert spherical to cartesian coordinates with random spread
      const vx = Math.sin(phi) * Math.cos(theta)
      const vy = Math.cos(phi) // Upward bias
      const vz = Math.sin(phi) * Math.sin(theta)
      
      // Add to list
      impactParticles.push({
        anchor: particle,
        velocity: { x: vx * speed, y: vy * speed, z: vz * speed },
        lifetime: 0
      })
      
      // Add to world
      world.add(particle)
    }
    
    // Update particles
    updateParticlesHandler = (delta) => {
      let activeParticles = 0
      
      for (let i = 0; i < impactParticles.length; i++) {
        const particleObj = impactParticles[i]
        if (!particleObj || !particleObj.anchor) continue
        
        // Update lifetime
        particleObj.lifetime += delta
        if (particleObj.lifetime >= IMPACT_LIFETIME) {
          // Remove expired particle
          world.remove(particleObj.anchor)
          // Mark as inactive
          particleObj.anchor = null
          continue
        }
        
        // Update position
        const anchor = particleObj.anchor
        const vel = particleObj.velocity
        
        // Apply velocity
        anchor.position.x += vel.x * delta
        anchor.position.y += vel.y * delta
        anchor.position.z += vel.z * delta
        
        // Apply gravity
        vel.y -= 9.8 * delta
        
        // Fade out based on lifetime
        const progress = particleObj.lifetime / IMPACT_LIFETIME
        
        // Get the text element
        const ui = anchor.children[0]
        if (ui && ui.children.length > 0) {
          const text = ui.children[0]
          text.opacity = 1 - progress
        }
        
        activeParticles++
      }
      
      // If no active particles remain, clean up
      if (activeParticles === 0) {
        app.off('update', updateParticlesHandler)
        // Force cleanup any remaining particles
        impactParticles.forEach(particleObj => {
          if (particleObj && particleObj.anchor) {
            world.remove(particleObj.anchor)
          }
        })
        // Clear the array
        impactParticles.length = 0
      }
    }
    
    app.on('update', updateParticlesHandler)
  }

  // Creates lightning particle effects at the specified position
  function createLightningEffect(position, direction) {
    console.log('Creating lightning effect at:', position, 'direction:', direction);
    
    // Calculate muzzle flash spawn position with offsets
    const muzzleUp = new Vector3(0, 1, 0)
    const muzzleDir = new Vector3(direction[0], direction[1], direction[2]).normalize()
    const muzzleRight = new Vector3().crossVectors(muzzleDir, muzzleUp).normalize()
    
    // Improved positioning for muzzle effects - place them more directly in front of the character
    const muzzlePosition = [
      position[0] + (muzzleDir.x * MUZZLE_FLASH_OFFSET_FORWARD),
      position[1] + (muzzleDir.y * MUZZLE_FLASH_OFFSET_FORWARD) + MUZZLE_FLASH_OFFSET_UP,
      position[2] + (muzzleDir.z * MUZZLE_FLASH_OFFSET_FORWARD)
    ]
    
    console.log('Muzzle position calculated:', muzzlePosition);

    // Muzzle flash effect
    for (let i = 0; i < MUZZLE_FLASH_COUNT; i++) {
      const flash = app.create('anchor')
      flash.visible = true
      flash.position.set(muzzlePosition[0], muzzlePosition[1], muzzlePosition[2])
      
      const flashUI = app.create('ui')
      flashUI.width = 40
      flashUI.height = 40
      flashUI.billboard = 'full'
      flashUI.size = MUZZLE_FLASH_SCALE * 2
      flashUI.backgroundColor = 'transparent'
      flash.add(flashUI)
      
      const flashText = app.create('uitext')
      flashText.value = LIGHTNING_CHARS[i % LIGHTNING_CHARS.length]
      flashText.color = app.config.lightningColor || '#ff0000'
      flashText.fontSize = 40
      flashText.textAlign = 'center'
      flashUI.add(flashText)
      
      // Add a glow effect
      const glowUI = app.create('ui')
      glowUI.width = 50
      glowUI.height = 50
      glowUI.billboard = 'full'
      glowUI.size = MUZZLE_FLASH_SCALE * 2.5
      glowUI.backgroundColor = 'transparent'
      flash.add(glowUI)
      
      const glowText = app.create('uitext')
      glowText.value = 
      glowText.color = app.config.lightningColor || '#ff0000'
      glowText.opacity = 0.5
      glowText.fontSize = 0
      glowText.textAlign = 'center'
      glowUI.add(glowText)
      
      // Spread particles in a circle around firing direction
      const angle = (i / MUZZLE_FLASH_COUNT) * Math.PI * 2
      flash.velocity = new Vector3(
        Math.cos(angle) * MUZZLE_FLASH_SPREAD,
        Math.sin(angle) * MUZZLE_FLASH_SPREAD,
        0
      )
      
      flash.lifetime = 0
      world.add(flash)
      
      const updateFlash = (delta) => {
        flash.position.x += flash.velocity.x * delta
        flash.position.y += flash.velocity.y * delta
        
        flash.lifetime += delta
        if (flash.lifetime >= MUZZLE_FLASH_LIFETIME) {
          world.remove(flash)
          app.off('update', updateFlash)
          flash.velocity = null
        } else {
          const progress = flash.lifetime / MUZZLE_FLASH_LIFETIME
          flashText.opacity = 1 - progress
          flashUI.size = MUZZLE_FLASH_SCALE * (1 - progress)
        }
      }
      
      app.on('update', updateFlash)
    }

    // Use constant values for spawn offsets for the lightning beam
    const forwardOffset = LIGHTNING_SPAWN_OFFSET_FORWARD
    const upOffset = LIGHTNING_SPAWN_OFFSET_UP
    const rightOffset = LIGHTNING_SPAWN_OFFSET_RIGHT
    
    // Calculate right vector from direction
    const up = new Vector3(0, 1, 0)
    const dir = new Vector3(direction[0], direction[1], direction[2]).normalize()
    const right = new Vector3().crossVectors(dir, up).normalize()
    
    // Calculate spawn position with all offsets
    const spawnPosition = [
      position[0] + (direction[0] * forwardOffset) + (right.x * rightOffset),
      position[1] + (direction[1] * forwardOffset) + up.y * upOffset,
      position[2] + (direction[2] * forwardOffset) + (right.z * rightOffset)
    ]
    
    // Reset random seed for better variety
    secureRandom.resetSeed()
    
    // Generate velocity from direction - make it stronger and more focused
    const baseSpeed = LIGHTNING_PARTICLE_SPEED_MIN
    const baseVelocity = [
      direction[0] * baseSpeed,
      direction[1] * baseSpeed,
      direction[2] * baseSpeed
    ]
    
    // Optimize lightning beam effect
    const particle = app.create('anchor')
    particle.visible = true
    particle.position.set(spawnPosition[0], spawnPosition[1], spawnPosition[2])
    
    const particleUI = app.create('ui')
    particleUI.width = 40
    particleUI.height = 40
    particleUI.billboard = 'full'
    particleUI.size = LIGHTNING_SCALE_MAX * 2
    particleUI.backgroundColor = 'transparent'
    particle.add(particleUI)
    
    const particleText = app.create('uitext')
    particleText.value = LIGHTNING_CHARS[0]
    particleText.color = app.config.lightningColor || '#ff0000'
    particleText.fontSize = 40
    particleText.textAlign = 'center'
    particleUI.add(particleText)
    
    // Add a glow effect
    const glowUI = app.create('ui')
    glowUI.width = 50
    glowUI.height = 50
    glowUI.billboard = 'full'
    glowUI.size = LIGHTNING_SCALE_MAX * 2.5
    glowUI.backgroundColor = 'transparent'
    particle.add(glowUI)
    
    const glowText = app.create('uitext')
    glowText.value = 
    glowText.color = app.config.lightningColor || '#ff0000'
    glowText.opacity = 0.5
    glowText.fontSize = 0
    glowText.textAlign = 'center'
    glowUI.add(glowText)
    
    particle.velocity = new Vector3(
      baseVelocity[0],
      baseVelocity[1],
      baseVelocity[2]
    )
    
    particle.lifetime = 0
    world.add(particle)
    
    const updateParticle = (delta) => {
      particle.position.x += particle.velocity.x * delta
      particle.position.y += particle.velocity.y * delta
      particle.position.z += particle.velocity.z * delta
      
      particle.lifetime += delta
      if (particle.lifetime >= LIGHTNING_LIFETIME) {
        world.remove(particle)
        app.off('update', updateParticle)
        particle.velocity = null
        return
      }
      const progress = particle.lifetime / LIGHTNING_LIFETIME
      particleText.opacity = (1 - progress) * (0.8 + 0.2 * Math.sin(progress * 20))
    }
    
    app.on('update', updateParticle)
    
    // Play the laser sound from the weapon origin
    playLightningSound(position)
  }
  
  // Track last hit timestamps for damage cooldown
  const playerHitTimestamps = new Map()
  
  // Track last damage timestamps for health regeneration
  const playerDamageTimestamps = new Map()
  
  // Health regeneration system on server
  if (world.isServer) {
    let lastRegenTime = 0
    
    app.on('update', delta => {
      const currentTime = world.getTimestamp()
      
      // Check if health regen is enabled in config
      if (!app.config.enableHealthRegen) return;
      
      // Check for health regeneration every HEALTH_REGEN_INTERVAL seconds
      if (currentTime - lastRegenTime >= HEALTH_REGEN_INTERVAL) {
        lastRegenTime = currentTime
        
        // Process all players in the world
        world.players.forEach(player => {
          // Skip at full health
          if (player.health >= 100) return
          
          // Check if enough time has passed since last damage
          const lastDamageTime = playerDamageTimestamps.get(player.id) || 0
          if (currentTime - lastDamageTime >= HEALTH_REGEN_DELAY) {
            // Regenerate health
            player.heal(HEALTH_REGEN_AMOUNT)
          }
        })
      }
    })
  }
  
  // Safer, more direct weapon effect creation without complex calculations
  app.on('weapon:effect', (data) => {
    console.log('=== WEAPON EFFECT EVENT RECEIVED ===');
    console.log('Effect data:', JSON.stringify(data));
    
    try {
      if (!data || !Array.isArray(data)) {
        console.error('Invalid weapon:effect data received');
        return;
      }
      
      const [positionArray, directionArray, hitPosition, impactVelocity] = data;
      
      console.log('Position array:', positionArray);
      console.log('Direction array:', directionArray);
      console.log('Hit position:', hitPosition);
      console.log('Impact velocity:', impactVelocity);
      
      // Create lightning effect with minimal processing
      if (positionArray && directionArray) {
        // Simple lightning
        const position = positionArray;
        const direction = directionArray;
        
        console.log('Creating lightning effect from', position, 'in direction', direction);
        
        // Create the lightning effects
        try {
          // Create some visual effects directly
          const flash = app.create('anchor');
          flash.position.set(position[0], position[1], position[2]);
          
          const flashUI = app.create('ui');
          flashUI.width = 20;  // Reduced from 40
          flashUI.height = 20; // Reduced from 40
          flashUI.billboard = 'full';
          flashUI.backgroundColor = 'transparent';
          flash.add(flashUI);
          
          const flashText = app.create('uitext');
          flashText.value = '⚡'; // Lightning character
          flashText.color = app.config.lightningColor || '#00ffee';
          flashText.fontSize = 20; // Reduced from 40
          flashUI.add(flashText);
          
          // Add to world with cleanup
          world.add(flash);
          console.log('Lightning effect added to world');
          
          // Auto-remove after a short time
          const lightningTimerId = 'lightning' + Date.now();
          createTimer(lightningTimerId, 400, () => {
            try {
              if (flash) world.remove(flash);
              console.log('Lightning effect removed from world');
            } catch (e) {
              console.error('Error removing lightning effect:', e);
            }
          });
        } catch (e) {
          console.error('Error creating lightning effect:', e);
        }
      }
      
      // Create impact effect if hit
      if (hitPosition) {
        console.log('Creating impact effect at', hitPosition);
        try {
          // Simple impact flash
          const impact = app.create('anchor');
          impact.position.set(hitPosition[0], hitPosition[1], hitPosition[2]);
          
          const impactUI = app.create('ui');
          impactUI.width = 20;  // Reduced from 40
          impactUI.height = 20; // Reduced from 40
          impactUI.billboard = 'full';
          impactUI.backgroundColor = 'transparent';
          impact.add(impactUI);
          
          const impactText = app.create('uitext');
          impactText.value = '💥'; // Impact character
          impactText.color = app.config.impactColor || '#ff6600';
          impactText.fontSize = 20; // Reduced from 40
          impactUI.add(impactText);
          
          // Add to world with cleanup
          world.add(impact);
          console.log('Impact effect added to world');
          
          // Auto-remove after a short time
          const impactTimerId = 'impact' + Date.now();
          createTimer(impactTimerId, 2000, () => {
            try {
              if (impact) world.remove(impact);
              console.log('Impact effect removed from world');
            } catch (e) {
              console.error('Error removing impact effect:', e);
            }
          });
        } catch (e) {
          console.error('Error creating impact effect:', e);
        }
      } else {
        console.log('No impact position provided - skipping impact effect');
      }
    } catch (e) {
      console.error('Error in weapon:effect handler:', e);
    }
  });
  
  // Handle weapon use on server
  app.on('weapon:use', (data, sender) => {
    console.log('=== WEAPON USE EVENT RECEIVED ===');
    console.log('Raw data:', JSON.stringify(data));
    console.log('Sender:', sender);
    
    // Validate the data structure
    if (!data || !Array.isArray(data) || data.length < 2) {
      console.error('Invalid weapon:use data received:', data);
      return;
    }
    
    const [positionArray, forwardArray] = data
    
    // Validate position and direction arrays
    if (!Array.isArray(positionArray) || positionArray.length !== 3) {
      console.error('Invalid position array:', positionArray);
      return;
    }
    
    if (!Array.isArray(forwardArray) || forwardArray.length !== 3) {
      console.error('Invalid forward array:', forwardArray);
      return;
    }
    
    const senderPlayer = world.getPlayer(sender)
    console.log('Sender player:', senderPlayer ? senderPlayer.name : 'null');
    
    const currentTime = world.getTimestamp()
    
    // Create vectors once for reuse
    const position = new Vector3(positionArray[0], positionArray[1], positionArray[2])
    const direction = new Vector3(forwardArray[0], forwardArray[1], forwardArray[2])
    
    // Debug logging
    console.log(`Weapon fired from: [${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}]`)
    console.log(`Direction: [${direction.x.toFixed(2)}, ${direction.y.toFixed(2)}, ${direction.z.toFixed(2)}]`)
    
    // First check for player hits (using a combined mask that includes players)
    console.log("Attempting combined raycast to include players...");
    let combinedHit = null;
    try {
      // Use a mask that includes both players and environment
      combinedHit = world.raycast(
        position,
        direction,
        WEAPON_MAX_DISTANCE
      );
      console.log("Combined raycast completed. Result:", combinedHit ? "HIT" : "No hit");
      
      if (combinedHit) {
        console.log("Hit entity:", combinedHit.entity ? combinedHit.entity.id : 'unknown');
        console.log("Is player?", combinedHit.entity && combinedHit.entity.isPlayer);
      }
    } catch (error) {
      console.error("Error during combined raycast:", error);
    }

    if (combinedHit) {
      // Calculate impact velocity based on forward direction
      const impactVelocity = [
        forwardArray[0] * LIGHTNING_PARTICLE_SPEED_MIN,
        forwardArray[1] * LIGHTNING_PARTICLE_SPEED_MIN,
        forwardArray[2] * LIGHTNING_PARTICLE_SPEED_MIN
      ]
      
      // Broadcast effect with impact position
      app.send('weapon:effect', [positionArray, forwardArray, combinedHit.point.toArray(), impactVelocity])
      
      // Check if we hit a player entity
      if (combinedHit.entity && combinedHit.entity.isPlayer) {
        // Get the hit player
        const hitPlayerId = combinedHit.entity.id
        const hitPlayer = world.getPlayer(hitPlayerId)
        
        // Don't damage yourself
        if (hitPlayerId !== sender && hitPlayer) {
          // Check for cooldown
          const lastHitTime = playerHitTimestamps.get(hitPlayerId) || 0
          if (currentTime - lastHitTime >= WEAPON_COOLDOWN) {
            // Set cooldown
            playerHitTimestamps.set(hitPlayerId, currentTime)
            
            // Calculate damage based on hit location (simple headshot check)
            let damage = WEAPON_DAMAGE
            
            // Simple headshot detection by y-coordinate relative to player position
            // This is approximate - could be improved with proper collision meshes
            const headShotThreshold = 1.7 // Approximate head height
            const hitHeight = combinedHit.point.y - hitPlayer.position.y
            
            if (hitHeight >= headShotThreshold) {
              // Headshot - apply damage multiplier
              damage *= WEAPON_HEADSHOT_MULTIPLIER
              // Announce headshot
              world.chat(`⚡ HEADSHOT! ${senderPlayer?.name || 'Someone'} zapped ${hitPlayer.name}!`)
            }
            
            // Apply damage to the hit player
            hitPlayer.damage(damage)
            
            // Track last damage time for health regeneration
            playerDamageTimestamps.set(hitPlayerId, currentTime)
            
            // Send damage event to the hit player for client-side feedback
            app.send('player:damaged', { amount: damage }, hitPlayerId)
            
            // Emit damage event for PvpCore to show floating damage numbers
            // The third parameter indicates if it's a critical hit (headshot in our case)
            const isCritical = hitHeight >= headShotThreshold;
            world.emit('hyperfy:dmg', { 
              playerId: hitPlayerId, 
              amount: Math.round(damage), 
              crit: isCritical 
            });
            
            // Send hit confirmation to the shooter with critical hit info
            app.send('hitConfirm', { 
              message: isCritical ? `CRITICAL HIT on ${hitPlayer.name}!` : `Hit ${hitPlayer.name}!`,
              hit: true,
              critical: isCritical,
              damage: Math.round(damage)
            }, sender);
            
            // Check if the player was killed
            if (hitPlayer.health <= 0) {
              // Announce the kill in chat
              const attackerName = senderPlayer?.name || 'Unknown';
              const victimName = hitPlayer.name;
              
              // Create kill message with Wasteland style
              const killMessages = [
                `${attackerName} turned ${victimName} into atoms.`,
                `${attackerName} made ${victimName} meet their maker.`,
                `${attackerName} sent ${victimName} to the great vault in the sky.`,
                `${victimName} was vaporized by ${attackerName}'s energy weapon.`,
                `${attackerName} critically hit ${victimName} for a fatal blow.`
              ];
              
              // Select a random message
              const killMessage = killMessages[Math.floor(Math.random() * killMessages.length)];
              
              // Announce in chat
              world.chat(`☢️ ${killMessage}`);
              
              // Send kill confirmation to the attacker
              app.send('hitConfirm', { 
                message: `You eliminated ${victimName}!`,
                hit: true,
                critical: isCritical,
                damage: Math.round(damage),
                kill: true
              }, sender);
            } else if (hitPlayer.health <= 25) {
              // Send a message to the attacker that the target is low on health
              app.send('hitConfirm', { 
                message: `${hitPlayer.name} is critically injured!`,
                hit: true,
                critical: isCritical,
                damage: Math.round(damage),
                lowHealth: true
              }, sender);
            }
          }
        }
      }
    } else {
      // No hit, just show the beam effect
      console.log("No hit detected - showing beam effect only");
      
      // Calculate beam endpoint based on maximum distance
      const beamEndPoint = [
        position.x + (direction.x * WEAPON_MAX_DISTANCE),
        position.y + (direction.y * WEAPON_MAX_DISTANCE),
        position.z + (direction.z * WEAPON_MAX_DISTANCE)
      ];
      
      console.log("Beam start:", positionArray);
      console.log("Beam end:", beamEndPoint);
      
      // Send effect with just the beam
      app.send('weapon:effect', [positionArray, forwardArray]);
    }
  });
}

if (world.isServer) {
  const state = app.state;
  state.playerId = null;
  app.on('request', playerId => {
    if (state.playerId) return;
    state.playerId = playerId;
    app.send('playerId', playerId);
  });
  app.on('release', playerId => {
    console.log(state.playerId, playerId);
    if (state.playerId !== playerId) return;
    state.playerId = null;
    app.send('playerId', null);
  });
  world.on('leave', e => {
    const player = world.getPlayer(e.playerId);
    if (player && state.playerId === player.id) {
      state.playerId = null;
      app.send('playerId', null);
    }
  });
}

// Cleanup function
app.on('cleanup', () => {
  console.log('=== WEAPON SYSTEM CLEANUP ===');
  
  // Remove all event listeners
  app.off('weapon:use');
  app.off('weapon:effect');
  app.off('player:damaged');
  app.off('hitConfirm');
  app.off('playerJoin');
  app.off('playerLeave');
  
  // Projectile system event listeners
  app.off('projectile:spawn');
  app.off('projectile:positions');
  app.off('projectile:hit');
  app.off('projectile:cleanup');
  
  const state = app.state;
  
  // Remove UI elements
  if (world.isClient) {
    console.log('Cleaning up UI elements...');
    if (healthUI) {
      console.log('Removing health UI');
      app.remove(healthUI);
    }
    if (damageOverlay) {
      console.log('Removing damage overlay');
      app.remove(damageOverlay);
    }
    if (weaponStatsUI) {
      console.log('Removing weapon stats UI');
      app.remove(weaponStatsUI);
    }
    if (hitMarker) {
      console.log('Removing hit marker');
      app.remove(hitMarker);
    }
    
    // Clean up client-side projectile objects
    if (typeof projectileObjects !== 'undefined' && projectileObjects) {
      console.log(`Cleaning up ${projectileObjects.size} projectile objects`);
      projectileObjects.forEach((obj) => {
        world.remove(obj);
      });
      projectileObjects.clear();
    }
    
    // Remove the player-following health UI anchor
    if (app._healthUIAnchor) {
      console.log('Removing health UI anchor');
      world.remove(app._healthUIAnchor);
    }
    
    // Clear any pending hit marker timeout
    if (hitMarkerTimeout) {
      console.log('Clearing hit marker timeout');
      clearTimeout(hitMarkerTimeout);
    }
  }
  
  // Server-side projectile cleanup
  if (world.isServer && typeof projectiles !== 'undefined' && projectiles) {
    console.log(`Cleaning up ${projectiles.size} server-side projectiles`);
    projectiles.clear();
  }
  
  // Reset state
  console.log('Resetting state');
  state.playerId = null;
  
  // Clear any active particles or effects
  console.log(`Cleaning up ${particles.length} particles`);
  particles.forEach(particleObj => {
    if (particleObj && particleObj.anchor) {
      world.remove(particleObj.anchor);
    }
  });
  particles.length = 0;
  
  console.log('Weapon system cleanup complete');
});

// PROJECTILE SYSTEM
// Configuration for projectiles similar to PlaneFlight.js
const PROJECTILE_CONFIG = {
  // Projectile behavior
  SPEED: 150,             // Projectile velocity
  LIFETIME: 2.0,          // How long projectiles exist before despawning
  SCALE: 0.12,            // Visual size of projectiles
  FIRE_RATE: 0.1,         // Delay between shots
  SEND_RATE: 1/15,        // Network update frequency
  SPAWN_OFFSET: 3,        // How far in front of the player to spawn projectiles (INCREASED FROM 2)
  HEIGHT_OFFSET: 0.5,     // How much to raise the projectile from player center (NEW SETTING)

  // Visual appearance
  COLOR: 0x00ffee,        // Bright cyan for energy weapon (hex color)
  COLOR_STRING: '#00ffee', // Same color as string for UI elements
  PROJECTILE_CHAR: '⚡',   // Character for projectile
  
  // Impact effect parameters
  IMPACT_PARTICLES: 15,   // Number of particles in explosion
  IMPACT_SPEED_MIN: 4,    // Minimum particle velocity
  IMPACT_SPEED_MAX: 12,   // Maximum particle velocity
  IMPACT_LIFETIME: 0.8,   // How long impact effects last
  IMPACT_SCALE: 0.12,     // Size of impact particles
  IMPACT_COLOR_STRING: '#00ffee', // Color for impact particles
  PARTICLE_CHARS: ['✧', '✦', '⁎', '⚡', '✺', '✹', '∗'], // Particle characters
}

// Map to track active projectiles (server-side)
const projectiles = new Map();
let nextProjectileId = 0;
let lastProjectileUpdate = 0;

if (world.isServer) {
  // Process weapon use by converting it to projectile fire
  app.on('weapon:use', (data, sender) => {
    console.log('=== WEAPON USE EVENT RECEIVED ===');
    console.log('Raw data:', JSON.stringify(data));
    console.log('Sender:', sender);
    
    // Validate data
    if (!data || !Array.isArray(data) || data.length < 2) {
      console.error('Invalid weapon:use data received:', data);
      return;
    }
    
    const [positionArray, forwardArray] = data;
    const senderPlayer = world.getPlayer(sender);
    
    if (!senderPlayer) {
      console.error('Player not found for sender:', sender);
      return;
    }
    
    // Get the current timestamp for cooldown tracking
    const currentTime = world.getTimestamp();
    
    // Prepare origin position and direction
    const position = new Vector3(positionArray[0], positionArray[1], positionArray[2]);
    const direction = new Vector3(forwardArray[0], forwardArray[1], forwardArray[2]).normalize();
    
    console.log(`Firing projectile from: [${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}]`);
    console.log(`Direction: [${direction.x.toFixed(2)}, ${direction.y.toFixed(2)}, ${direction.z.toFixed(2)}]`);
    
    // Calculate spawn position with offset
    const spawnX = position.x + direction.x * PROJECTILE_CONFIG.SPAWN_OFFSET;
    const spawnY = position.y + direction.y * PROJECTILE_CONFIG.SPAWN_OFFSET + PROJECTILE_CONFIG.HEIGHT_OFFSET; // Added HEIGHT_OFFSET
    const spawnZ = position.z + direction.z * PROJECTILE_CONFIG.SPAWN_OFFSET;
    
    // Create a unique ID for this projectile
    const id = nextProjectileId++;
    
    // Create the projectile object with position and velocity
    const projectile = {
      id,
      position: new Vector3(spawnX, spawnY, spawnZ),
      velocity: new Vector3(
        direction.x * PROJECTILE_CONFIG.SPEED,
        direction.y * PROJECTILE_CONFIG.SPEED,
        direction.z * PROJECTILE_CONFIG.SPEED
      ),
      timeAlive: 0,
      owner: sender // Track who fired this projectile
    };
    
    // Store the projectile in our map
    projectiles.set(id, projectile);
    
    // Broadcast to all clients to spawn the projectile visually
    app.send('projectile:spawn', [id, [spawnX, spawnY, spawnZ], PROJECTILE_CONFIG.SCALE]);
    
    console.log(`Projectile ${id} created and broadcast to clients`);
  });
  
  // Main projectile update loop - runs every frame
  app.on('update', (delta) => {
    // Skip if no projectiles
    if (projectiles.size === 0) return;
    
    lastProjectileUpdate += delta;
    
    // Update each active projectile
    for (const [id, projectile] of projectiles.entries()) {
      // Apply velocity to position
      projectile.position.x += projectile.velocity.x * delta;
      projectile.position.y += projectile.velocity.y * delta;
      projectile.position.z += projectile.velocity.z * delta;
      
      // Check for collisions using raycasting
      const direction = projectile.velocity.clone().normalize();
      const hit = world.raycast(
        projectile.position, 
        direction, 
        PROJECTILE_CONFIG.SPEED * delta
      );
      
      if (hit) {
        console.log(`Projectile ${id} hit detected:`, hit.entity ? hit.entity.id : 'environment');
        
        // Handle the hit
        projectiles.delete(id);
        
        // Broadcast the hit to all clients
        app.send('projectile:hit', [id, hit.point.toArray(), projectile.velocity.toArray()]);
        
        // If we hit a player, apply damage
        if (hit.entity && hit.entity.isPlayer) {
          const hitPlayerId = hit.entity.id;
          const hitPlayer = world.getPlayer(hitPlayerId);
          
          // Don't damage yourself
          if (hitPlayerId !== projectile.owner && hitPlayer) {
            const currentTime = world.getTimestamp();
            
            // Check for cooldown
            const lastHitTime = playerHitTimestamps.get(hitPlayerId) || 0;
            if (currentTime - lastHitTime >= WEAPON_COOLDOWN) {
              // Set cooldown
              playerHitTimestamps.set(hitPlayerId, currentTime);
              
              // Calculate damage based on hit location (simple headshot check)
              let damage = WEAPON_DAMAGE;
              
              // Simple headshot detection by y-coordinate relative to player position
              const headShotThreshold = 1.7; // Approximate head height
              const hitHeight = hit.point.y - hitPlayer.position.y;
              
              if (hitHeight >= headShotThreshold) {
                // Headshot - apply damage multiplier
                damage *= WEAPON_HEADSHOT_MULTIPLIER;
                // Announce headshot
                world.chat(`⚡ HEADSHOT! ${senderPlayer?.name || 'Someone'} zapped ${hitPlayer.name}!`);
              }
              
              // Apply damage to the hit player
              hitPlayer.damage(damage);
              
              // Track last damage time for health regeneration
              playerDamageTimestamps.set(hitPlayerId, currentTime);
              
              // Send damage event to the hit player for client-side feedback
              app.send('player:damaged', { amount: damage }, hitPlayerId);
              
              // Emit damage event for PvpCore to show floating damage numbers
              const isCritical = hitHeight >= headShotThreshold;
              world.emit('hyperfy:dmg', { 
                playerId: hitPlayerId, 
                amount: Math.round(damage), 
                crit: isCritical 
              });
              
              // Send hit confirmation to the shooter with critical hit info
              app.send('hitConfirm', { 
                message: isCritical ? `CRITICAL HIT on ${hitPlayer.name}!` : `Hit ${hitPlayer.name}!`,
                hit: true,
                critical: isCritical,
                damage: Math.round(damage)
              }, projectile.owner);
              
              // Check if the player was killed
              if (hitPlayer.health <= 0) {
                // Create kill message
                const attackerName = world.getPlayer(projectile.owner)?.name || 'Unknown';
                const victimName = hitPlayer.name;
                
                // Create kill message with Wasteland style
                const killMessages = [
                  `${attackerName} turned ${victimName} into atoms.`,
                  `${attackerName} made ${victimName} meet their maker.`,
                  `${attackerName} sent ${victimName} to the great vault in the sky.`,
                  `${victimName} was vaporized by ${attackerName}'s energy weapon.`,
                  `${attackerName} critically hit ${victimName} for a fatal blow.`
                ];
                
                // Select a random message
                const killMessage = killMessages[Math.floor(Math.random() * killMessages.length)];
                
                // Announce in chat
                world.chat(`☢️ ${killMessage}`);
                
                // Send kill confirmation to the attacker
                app.send('hitConfirm', { 
                  message: `You eliminated ${victimName}!`,
                  hit: true,
                  critical: isCritical,
                  damage: Math.round(damage),
                  kill: true
                }, projectile.owner);
              } else if (hitPlayer.health <= 25) {
                // Send a message to the attacker that the target is low on health
                app.send('hitConfirm', { 
                  message: `${hitPlayer.name} is critically injured!`,
                  hit: true,
                  critical: isCritical,
                  damage: Math.round(damage),
                  lowHealth: true
                }, projectile.owner);
              }
            }
          }
        }
        
        continue;
      }
      
      // Remove expired projectiles
      projectile.timeAlive += delta;
      if (projectile.timeAlive >= PROJECTILE_CONFIG.LIFETIME) {
        console.log(`Projectile ${id} expired`);
        projectiles.delete(id);
        app.send('projectile:cleanup', [id]);
        continue;
      }
    }
    
    // Broadcast position updates at configured rate
    if (lastProjectileUpdate >= PROJECTILE_CONFIG.SEND_RATE) {
      lastProjectileUpdate = 0;
      
      // Send batch updates
      const updates = [];
      for (const projectile of projectiles.values()) {
        updates.push([
          projectile.id,
          projectile.position.toArray()
        ]);
      }
      
      if (updates.length > 0) {
        app.send('projectile:positions', updates);
      }
    }
  });
}

// CLIENT-SIDE PROJECTILE EFFECTS
if (world.isClient) {
  // Map to track client-side projectile objects
  const projectileObjects = new Map();
  
  // Log readiness
  console.log("Projectile system initialized with empty projectile map");
  
  // Handle projectile spawning
  app.on('projectile:spawn', (data) => {
    const [id, positionArray, scale] = data;
    console.log(`Spawning projectile ${id} at [${positionArray[0].toFixed(2)}, ${positionArray[1].toFixed(2)}, ${positionArray[2].toFixed(2)}]`);
    
    try {
      // Create parent anchor for the projectile
      const projectile = app.create('anchor');
      projectile.position.set(positionArray[0], positionArray[1], positionArray[2]);
      
      // Create UI container for the projectile
      const projectileUI = app.create('ui');
      projectileUI.width = 30;
      projectileUI.height = 30;
      projectileUI.billboard = 'full';
      projectileUI.backgroundColor = 'transparent';
      projectile.add(projectileUI);
      
      // Add text for the projectile character
      const projectileText = app.create('uitext');
      projectileText.value = PROJECTILE_CONFIG.PROJECTILE_CHAR;
      projectileText.color = PROJECTILE_CONFIG.COLOR_STRING;
      projectileText.fontSize = 24;
      projectileUI.add(projectileText);
      
      // Add to world
      world.add(projectile);
      
      // Store in our map
      projectileObjects.set(id, projectile);
      
      // Play fire sound
      playLightningSound(positionArray);
      
    } catch (e) {
      console.error('Error spawning projectile:', e);
    }
  });
  
  // Handle projectile position updates
  app.on('projectile:positions', (updates) => {
    for (const [id, positionArray] of updates) {
      const projectile = projectileObjects.get(id);
      if (projectile) {
        projectile.position.set(positionArray[0], positionArray[1], positionArray[2]);
      }
    }
  });
  
  // Handle projectile hits
  app.on('projectile:hit', (data) => {
    const [id, positionArray, velocityArray] = data;
    console.log(`Projectile ${id} hit at [${positionArray[0].toFixed(2)}, ${positionArray[1].toFixed(2)}, ${positionArray[2].toFixed(2)}]`);
    
    // Play hit sound directly (fallback if createImpactEffect fails)
    try {
      const soundEffect = app.create('audio');
      soundEffect.src = app.config.impactSound?.url || 'sounds/impact.mp3';
      const impactVolume = (app.config.soundVolume || 7.0) / 10.0;
      soundEffect.volume = impactVolume;
      soundEffect.spatial = true;
      soundEffect.group = 'sfx';
      soundEffect.position.set(positionArray[0], positionArray[1], positionArray[2]);
      world.add(soundEffect);
      try {
        soundEffect.play();
      } catch (e) {
        console.warn('Failed to play impact sound:', e);
      }
      
      // Auto-cleanup
      const impactSoundTimerId = 'impactSound' + Date.now();
      createTimer(impactSoundTimerId, 2000, () => {
        try {
          world.remove(soundEffect);
        } catch (e) {}
      });
    } catch (e) {
      console.error('Error playing hit sound:', e);
    }
    
    // Create impact effect
    try {
      createImpactEffect(positionArray, velocityArray);
    } catch (e) {
      console.error('Error creating impact effect:', e);
    }
    
    // Remove the projectile object
    const projectile = projectileObjects.get(id);
    if (projectile) {
      try {
        world.remove(projectile);
        projectileObjects.delete(id);
        console.log(`Removed projectile ${id} from world`);
      } catch (e) {
        console.error(`Error removing projectile ${id}:`, e);
        projectileObjects.delete(id); // Still remove from map
      }
    } else {
      console.warn(`Projectile ${id} not found in projectileObjects map`);
    }
  });
  
  // Handle projectile cleanup (timeout/expiration)
  app.on('projectile:cleanup', (data) => {
    const [id] = data;
    console.log(`Cleaning up expired projectile ${id}`);
    
    // Remove the projectile object
    const projectile = projectileObjects.get(id);
    if (projectile) {
      try {
        world.remove(projectile);
        projectileObjects.delete(id);
        console.log(`Removed expired projectile ${id} from world`);
      } catch (e) {
        console.error(`Error removing expired projectile ${id}:`, e);
        projectileObjects.delete(id); // Still remove from map
      }
    } else {
      console.warn(`Expired projectile ${id} not found in projectileObjects map`);
    }
  });
  
  // Create enhanced impact effect function
  function createLegacyImpactEffect(position, velocity) {
    console.log('Creating impact effect at', position);
    
    // Create a simple pseudo-random number generator
    let seed = Date.now() % 2147483647;
    function randomFloat() {
      // Simple LCG (Linear Congruential Generator)
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    }
    
    // Helper function for randomization with power curve
    function randomNum(min, max, pow = 1) {
      const r = randomFloat();
      const powR = Math.pow(r, pow);
      return min + powR * (max - min);
    }
    
    // Create multiple particles for the impact
    for (let i = 0; i < PROJECTILE_CONFIG.IMPACT_PARTICLES; i++) {
      // Select a random particle character
      const randomIndex = Math.floor(randomFloat() * PROJECTILE_CONFIG.PARTICLE_CHARS.length);
      const particleChar = PROJECTILE_CONFIG.PARTICLE_CHARS[randomIndex];
      
      // Create parent anchor for positioning
      const particle = app.create('anchor');
      particle.visible = true;
      particle.position.set(position[0], position[1], position[2]);
      
      // Create UI container
      const particleUI = app.create('ui');
      particleUI.width = 20;
      particleUI.height = 20;
      particleUI.billboard = 'full';
      particleUI.backgroundColor = 'transparent';
      particle.add(particleUI);
      
      // Add text for the particle
      const particleText = app.create('uitext');
      particleText.value = particleChar;
      particleText.color = PROJECTILE_CONFIG.IMPACT_COLOR_STRING;
      particleText.fontSize = 20;
      particleUI.add(particleText);
      
      // Calculate random velocity for the particle
      const speed = PROJECTILE_CONFIG.IMPACT_SPEED_MIN + randomNum(0, 1, 2) * 
                   (PROJECTILE_CONFIG.IMPACT_SPEED_MAX - PROJECTILE_CONFIG.IMPACT_SPEED_MIN);
      
      // Random direction in a cone
      const theta = randomNum(0, 1, 1) * Math.PI * 2; // Random angle around circle
      const phi = randomNum(0, 1, 2) * Math.PI * 0.5; // Random angle from center
      
      // Create 3D vector from spherical coordinates
      const vx = Math.sin(phi) * Math.cos(theta);
      const vy = Math.sin(phi) * Math.sin(theta);
      const vz = Math.cos(phi);
      
      // Add a bit of the original projectile velocity
      const particleVel = {
        x: vx * speed + velocity[0] * 0.2,
        y: vy * speed + velocity[1] * 0.2,
        z: vz * speed + velocity[2] * 0.2
      };
      
      // Track particle state for animation
      const particleObj = {
        anchor: particle,
        velocity: particleVel,
        lifetime: 0
      };
      
      // Add to particles array for tracking
      if (typeof particles !== 'undefined') {
        particles.push(particleObj);
      } else {
        console.error('particles array is not defined');
      }
      
      // Add to world
      world.add(particle);
    }
    
    // Play impact sound
    playLightningSound(position);
  }
}

// Handle particle updates on the client side
if (world.isClient) {
  // Update particles in every frame
  app.on('update', (delta) => {
    // Skip if no particles
    if (!particles || particles.length === 0) return;
    
    // Cache the gravity calculation to avoid repeated multiplication
    const gravityDelta = 9.8 * delta;
    
    // Track how many particles we actually processed (active)
    let activeCount = 0;
    
    // Update each particle
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      
      // Skip invalid particles
      if (!particle || !particle.anchor || !particle.active) {
        // Remove invalid entries
        particles.splice(i, 1);
        continue;
      }
      
      // Increment active count
      activeCount++;
      
      // Cache the anchor reference to avoid repeated property lookup
      const anchor = particle.anchor;
      const velocity = particle.velocity;
      
      // Update position based on velocity
      // Direct property access is faster than chained lookups
      anchor.position.x += velocity.x * delta;
      anchor.position.y += velocity.y * delta;
      anchor.position.z += velocity.z * delta;
      
      // Apply pseudo-gravity
      velocity.y -= gravityDelta;
      
      // Update lifetime
      particle.lifetime += delta;
      
      // Check if particle should be removed
      if (particle.lifetime >= PROJECTILE_CONFIG.IMPACT_LIFETIME) {
        // Return to pool instead of just removing
        returnParticleToPool(particle);
        particles.splice(i, 1);
      }
    }
    
    // No need to log particle count every frame as Hyperfy has built-in monitoring
  });
  
  // Cleanup all particles on world cleanup
  app.on('cleanup', () => {
    if (particles && particles.length > 0) {
      console.log(`Cleaning up ${particles.length} remaining particles`);
      particles.forEach(p => {
        if (p && p.anchor) {
          try {
            world.remove(p.anchor);
          } catch (e) {
            // Ignore errors during cleanup
          }
        }
      });
      particles.length = 0;
    }
  });
}

// Create enhanced impact effect function for projectile system
function createProjectileImpactEffect(position, velocity) {
  console.log('Creating projectile impact effect at', position);
  
  // Create a simple pseudo-random number generator
  let seed = Date.now() % 2147483647;
  function randomFloat() {
    // Simple LCG (Linear Congruential Generator)
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }
  
  // Helper function for randomization with power curve
  function randomNum(min, max, pow = 1) {
    const r = randomFloat();
    const powR = Math.pow(r, pow);
    return min + powR * (max - min);
  }
  
  // Limit total particles for performance
  const particleCount = Math.min(PROJECTILE_CONFIG.IMPACT_PARTICLES, MAX_PARTICLES - particles.length);
  
  // Create multiple particles for the impact
  for (let i = 0; i < particleCount; i++) {
    // Get a particle from our pool
    const particleObj = getParticleFromPool();
    
    // Skip if we couldn't get a particle
    if (!particleObj) continue;
    
    // Select a random particle character
    const randomIndex = Math.floor(randomFloat() * PROJECTILE_CONFIG.PARTICLE_CHARS.length);
    const particleChar = PROJECTILE_CONFIG.PARTICLE_CHARS[randomIndex];
    
    // Create or reuse anchor
    let particle;
    if (!particleObj.anchor) {
      // Create new anchor if needed
      particle = app.create('anchor');
      particle.visible = true;
      
      // Create UI container
      const particleUI = app.create('ui');
      particleUI.width = 20;
      particleUI.height = 20;
      particleUI.billboard = 'full';
      particleUI.backgroundColor = 'transparent';
      particle.add(particleUI);
      
      // Add text for the particle
      const particleText = app.create('uitext');
      particleText.color = PROJECTILE_CONFIG.IMPACT_COLOR_STRING;
      particleText.fontSize = 20;
      particleUI.add(particleText);
      
      // Store in our particle object
      particleObj.anchor = particle;
    } else {
      // Reuse existing anchor
      particle = particleObj.anchor;
      
      // Reset visibility
      particle.visible = true;
      
      // Make sure the UI structure exists
      if (particle.children && 
          particle.children.length > 0 && 
          particle.children[0].children && 
          particle.children[0].children.length > 0) {
        // Update the text
        const particleText = particle.children[0].children[0];
        particleText.opacity = 1.0; // Reset opacity
      }
    }
    
    // Position the particle
    particle.position.set(position[0], position[1], position[2]);
    
    // Update the text character
    if (particle.children && 
        particle.children.length > 0 && 
        particle.children[0].children && 
        particle.children[0].children.length > 0) {
      const particleText = particle.children[0].children[0];
      particleText.value = particleChar;
    }
    
    // Calculate random velocity for the particle
    const speed = PROJECTILE_CONFIG.IMPACT_SPEED_MIN + randomNum(0, 1, 2) * 
                 (PROJECTILE_CONFIG.IMPACT_SPEED_MAX - PROJECTILE_CONFIG.IMPACT_SPEED_MIN);
    
    // Random direction in a cone
    const theta = randomNum(0, 1, 1) * Math.PI * 2; // Random angle around circle
    const phi = randomNum(0, 1, 2) * Math.PI * 0.5; // Random angle from center
    
    // Create 3D vector from spherical coordinates
    const vx = Math.sin(phi) * Math.cos(theta);
    const vy = Math.sin(phi) * Math.sin(theta);
    const vz = Math.cos(phi);
    
    // Add a bit of the original projectile velocity
    particleObj.velocity.x = vx * speed + velocity[0] * 0.2;
    particleObj.velocity.y = vy * speed + velocity[1] * 0.2;
    particleObj.velocity.z = vz * speed + velocity[2] * 0.2;
    
    // Reset lifetime
    particleObj.lifetime = 0;
    
    // Add to the world if needed
    if (!particle.parent) {
      world.add(particle);
    }
    
    // Add to particles array for tracking
    particles.push(particleObj);
  }
  
  // After particle creation loop, add back sound playback
  // Play impact sound - simplified version that doesn't rely on external function
  try {
    const soundEffect = app.create('audio');
    soundEffect.src = app.config.impactSound?.url || 'sounds/impact.mp3';
    const impactVolume = (app.config.soundVolume || 7.0) / 10.0;
    soundEffect.volume = impactVolume;
    soundEffect.spatial = true;
    soundEffect.group = 'sfx';
    
    soundEffect.position.set(position[0], position[1], position[2]);
    world.add(soundEffect);
    try {
      soundEffect.play();
    } catch (e) {
      console.warn('Failed to play impact sound:', e);
    }
    
    // Auto-cleanup after 2 seconds
    const impactSoundTimerId = 'impactSound' + Date.now();
    createTimer(impactSoundTimerId, 2000, () => {
      try {
        if (soundEffect) {
          world.remove(soundEffect);
        }
      } catch (e) {
        console.error('Error removing impact sound effect:', e);
      }
    });
  } catch (e) {
    console.error('Error playing impact sound:', e);
  }
}

// Unified impact effect function that chooses the appropriate implementation
function createImpactEffect(position, velocity) {
  // Use projectile system's implementation
  createProjectileImpactEffect(position, velocity);
}

// Add timer management variables at the top of the file (after imports/declarations)
// Removed duplicate declaration - timers is already defined at the top of the file

// Timer utility functions
function createTimer(id, duration, callback) {
  timers[id] = {
    remaining: duration,
    callback: callback,
    active: true
  };
  return id;
}

function removeTimer(id) {
  if (timers[id]) {
    delete timers[id];
  }
}

// Optimize timer update function
function updateTimers(delta) {
  // Cache delta conversion to avoid repeated calculations
  const deltaMs = delta * 1000;
  
  // Use for-in loop instead of Object.keys().forEach for better performance
  // This avoids creating an unnecessary array
  for (const id in timers) {
    const timer = timers[id];
    if (timer.active) {
      timer.remaining -= deltaMs;
      if (timer.remaining <= 0) {
        timer.active = false;
        try {
          timer.callback();
        } catch (e) {
          console.error('Error in timer callback:', e);
        }
        delete timers[id]; // Direct deletion is faster than calling removeTimer
      }
    }
  }
}

// Remove frameCount and simplify update function
function update(delta) {
  // Update timers every frame
  updateTimers(delta);
  
  // Update first-person view if active
  if (isFirstPersonMode) {
    updateFirstPersonView(delta);
  }
  
  // Call particle maintenance less frequently by checking
  // time values rather than frame count
  // Assuming 60fps, this runs about every 1/6th second
  if (Math.random() < 0.1) {
    performParticleMaintenance();
  }
}

// Add a maintenance function for optimizing particles
function performParticleMaintenance() {
  // Emergency cleanup if we have too many particles
  if (particles && particles.length > 200) {
    console.warn(`Particle count high (${particles.length}), removing oldest`);
    // Remove the oldest 20% of particles to maintain performance
    const removeCount = Math.floor(particles.length * 0.2);
    particles.splice(0, removeCount);
  }
}

// Update the app initialization in a client-only block
if (world.isClient) {
  // Initialize any other systems that need to be set up once
  // This is a good place for one-time setup
  
  // Add instrumentation to measure performance
  let lastTime = Date.now();
  let frameCount = 0;
  const PERF_LOG_INTERVAL = 300; // Log every 300 frames
  
  app.on('update', (delta) => {
    // Performance monitoring
    frameCount++;
    if (frameCount % PERF_LOG_INTERVAL === 0) {
      const now = Date.now();
      const elapsed = now - lastTime;
      const fps = Math.round((PERF_LOG_INTERVAL / elapsed) * 1000);
      console.log(`Performance: ${fps} FPS, Particles: ${particles.length}, Timers: ${Object.keys(timers).length}`);
      lastTime = now;
    }
  });
}

// Initialize the particle pool after all configuration is done
if (world.isClient) {
  // Initialize particle pool
  initParticlePool();
  
  console.log('Weapon system initialized with particle pool');
}
}
