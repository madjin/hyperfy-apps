# PVPblasterLATEST.hyp

## Metadata
- **Author**: .hyp shaman
- **Channel**: #💻│developers
- **Date**: 2025-03-25
- **Size**: 4,761,163 bytes

## Blueprint
- **Name**: PVPblasterLATEST
- **Version**: 34
- **Model**: `asset://22327b8a0cf4275aa2951ee13159d2ac79fc73f979e311bc5103c7883d2e9e32.glb`
- **Script**: `asset://08bb83b749e5513458ba8a28f28f0fe4839584b6776ca63442ca367c14026616.js`

## Props
- `attack`: emote → `asset://9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb`
- `attack1`: emote → `asset://9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb`
- `attack2`: emote → `asset://9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb`
- `emote`: emote → `asset://2977711767a0f016a93b7999ecc6ccecb52d1fa4b61858abee7fc5bd0ca3ed94.glb`
- `lightningSound`: audio → `asset://e00aef589923ca75b485d0713f3bcfb4941f200315867dff9256ac9b6f1ad6d1.mp3`
- `spawnOffsetForward`: int = `0`
- `spawnOffsetUp`: int = `0`
- `spawnOffsetRight`: int = `0`
- `weaponDamage`: int = `15`
- `headshotMultiplier`: float = `1.5`
- `fireRate`: float = `0.5`
- `weaponRange`: int = `100`
- `healthRegenAmount`: int = `1`
- `healthRegenDelay`: int = `5`
- `impactSound`: audio → `asset://e00aef589923ca75b485d0713f3bcfb4941f200315867dff9256ac9b6f1ad6d1.mp3`
- `soundVolume`: int = `3`

## Assets
- `[model]` 22327b8a0cf4275aa2951ee13159d2ac79fc73f979e311bc5103c7883d2e9e32.glb (4,314,884 bytes)
- `[script]` 08bb83b749e5513458ba8a28f28f0fe4839584b6776ca63442ca367c14026616.js (90,917 bytes)
- `[emote]` 9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb (60,912 bytes)
- `[emote]` 9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb (60,912 bytes)
- `[emote]` 9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb (60,912 bytes)
- `[emote]` 2977711767a0f016a93b7999ecc6ccecb52d1fa4b61858abee7fc5bd0ca3ed94.glb (140,980 bytes)
- `[audio]` e00aef589923ca75b485d0713f3bcfb4941f200315867dff9256ac9b6f1ad6d1.mp3 (14,516 bytes)
- `[audio]` e00aef589923ca75b485d0713f3bcfb4941f200315867dff9256ac9b6f1ad6d1.mp3 (14,516 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.control()`, `app.create()`, `app.off()`, `app.on()`, `app.remove()`, `app.send()`
**World Methods**: `world.add()`, `world.chat()`, `world.emit()`, `world.getPlayer()`, `world.getTime()`, `world.getTimestamp()`, `world.on()`, `world.raycast()`, `world.remove()`
**Events Listened**: `cleanup`, `hitConfirm`, `lateUpdate`, `leave`, `player:damaged`, `playerId`, `projectile:cleanup`, `projectile:hit`, `projectile:positions`, `projectile:spawn`, `release`, `request`, `update`, `weapon:effect`, `weapon:use`
**Events Emitted**: `hyperfy:dmg`
**Nodes Created**: `action`, `anchor`, `audio`, `ui`, `uitext`

## Keywords (for Discord search)
about, above, access, accuracy, action, activated, active, activeCount, activeParticles, actual, actually, added, after, ahead, alignItems, allowed, already, alternative, amount, anchor

## Script Source
```javascript
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
const LIGHTNING_PARTICLE_SPEED_MAX = 70  // Increased

// ... truncated ...
```

---
*Extracted from PVPblasterLATEST.hyp. Attachment ID: 1354225263701000274*