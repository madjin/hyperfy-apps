# RainV4.hyp

## Metadata
- **Author**: Gert-Jan Akerboom
- **Channel**: #🎨│showcase
- **Date**: 2025-04-10
- **Size**: 17,085 bytes

## Discord Context
> Added a cube for easier access, you can toggle it on and off in the UI

## Blueprint
- **Name**: RainV4
- **Version**: 136
- **Model**: `asset://e114dcde2120b91f2c943c50459a706c6a2efe7385ad4c9a8d127bc27ebea2ce.glb`
- **Script**: `asset://919efc4efe73f1947b99c8d0e50b97a098b19d500db74f86bc4086874688cf7e.js`

## Props
- `fireType`: str = `custom`
- `baseColor`: str = `#ff3800`
- `glowIntensity`: int = `5`
- `opacity`: float = `0.6000000000000001`
- `maxParticles`: int = `2000`
- `spawnRate`: int = `1000`
- `lifetime`: float = `1.8`
- `spawnRadius`: int = `50`
- `minScale`: float = `0.02`
- `maxScale`: float = `0.07`
- `minSpeed`: int = `3`
- `maxSpeed`: int = `12`
- `gravity`: float = `2.8000000000000003`
- `turbulence`: int = `2`
- `enableSmoke`: bool = `False`
- `smokeColor`: str = `#444444`
- `smokeOpacity`: int = `1`
- `smokeRatio`: int = `0`
- `presetName`: str = `Test Fire`
- `savePreset`: bool = `False`
- `loadPreset`: str = `heavy`
- `wind`: float = `0.9`
- `windDirection`: int = `195`
- `visible`: str = `true`

## Assets
- `[model]` e114dcde2120b91f2c943c50459a706c6a2efe7385ad4c9a8d127bc27ebea2ce.glb (6,796 bytes)
- `[script]` 919efc4efe73f1947b99c8d0e50b97a098b19d500db74f86bc4086874688cf7e.js (9,102 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.control()`, `app.get()`, `app.on()`, `app.remove()`
**Events Listened**: `update`

## Keywords (for Discord search)
acceleration, active, after, already, area, atan2, available, based, below, between, billboard, billboarding, bursts, camera, ceil, client, clone, config, configuration, configure

## Script Source
```javascript
// Realistic Rain Effect for Hyperfy
// This script creates a customizable, realistic rain effect with extensive configuration options

// Initialize app configuration
app.configure(() => {
	return [
		{
			type: 'switch',
			key: 'visible',
			label: 'Move Cube',
			options: [
				{
					label: 'Show',
					value: 'true',
				},
				{
					label: 'Hide',
					value: 'false',
				}
			],
			initial: 'true',
		},
		{
			key: 'maxParticles',
			type: 'number',
			label: 'Max Particles',
			min: 1,
			max: 5000,
			step: 50,
			initial: 1000,
		},
		{
			key: 'spawnRate',
			type: 'number',
			label: 'Spawn Rate (per sec)',
			min: 1,
			max: 3000,
			step: 10,
			initial: 200,
		},
		{
			key: 'spawnRadius',
			type: 'number',
			label: 'Rain Area (meters)',
			min: 1,
			max: 300,
			step: 1,
			initial: 20,
		},
		{
			key: 'minScale',
			type: 'range',
			label: 'Min Particle Size',
			min: 0.01,
			max: 0.1,
			step: 0.01,
			initial: 0.02,
		},
		{
			key: 'maxScale',
			type: 'range',
			label: 'Max Particle Size',
			min: 0.02,
			max: 0.2,
			step: 0.01,
			initial: 0.05,
		},
		{
			type: 'section',
			key: 'physics',
			label: 'Rain Physics',
		},
		{
			key: 'minSpeed',
			type: 'range',
			label: 'Min Speed',
			min: 1.0,
			max: 10.0,
			step: 0.5,
			initial: 3.0,
		},
		{
			key: 'maxSpeed',
			type: 'range',
			label: 'Max Speed',
			min: 2.0,
			max: 20.0,
			step: 0.5,
			initial: 6.0,
		},
		{
			key: 'gravity',
			type: 'range',
			label: 'Gravity',
			min: 0.5,
			max: 5.0,
			step: 0.1,
			initial: 2.0,
		},
	]
})

// Get the raindrop mesh
const raindrop = app.get('Icosphere');
if (!raindrop) {
	console.error('Could not find raindrop');
	return;
}

// Get the ring mesh for splash effects
const ring = app.get('ring');
if (!ring) {
	console.error('Could not find ring');
	return;
}

// Get the grab mesh
const grab = app.get('grab');
if (!grab) {
	console.error('Could not find grab');
	return;
}

// Hide the original meshes
raindrop.visible = false;
ring.visible = false;
//grab.visible = false;

// Track splash effects
const splashEffects = [];

// Configure based on selected preset or settings
const CONFIG = {
	BURST_INTERVAL: 0.05, // Time between particle bursts (seconds)
}

// Apply configuration values
CONFIG.MAX_PARTICLES = app.config.maxParticles || 500
CONFIG.SPAWN_RATE = app.config.spawnRate || 200
CONFIG.MIN_SPEED = app.config.minSpeed || 3.0
CONFIG.MAX_SPEED = app.config.maxSpeed || 6.0
CONFIG.MIN_SCALE = app.config.minScale || 0.02
CONFIG.MAX_SCALE = app.config.maxScale || 0.05
CONFIG.SPAWN_RADIUS = app.config.spawnRadius || 20
CONFIG.GRAVITY = app.config.gravity || 2.0
CONFIG.PARTICLES_PER_BURST = Math.ceil(CONFIG.SPAWN_RATE * CONFIG.BURST_INTERVAL)



console.log(`[RAIN] Initializing rain effect with ${CONFIG.MAX_PARTICLES} particles`)

if (world.isClient) {
	console.log('[RAIN] Initializing client-side particle system')
	
	// Particle pool tracking
	const rainParticles = []
	const inactiveRainIndices = []
	let timeSinceLastBurst = 0

	// Get camera control for particle billboarding
	let control
	try {
		control = app.control()
	} catch (error) {
		console.error('[RAIN] Error getting control:', error)
		// Create a fallback control with camera
		control = { camera: { position: new Vector3() } }
	}

	// Initialize rain particle pool
	try {
		console.log('[RAIN] Initializing particle pool')
		for (let i = 0; i < CONFIG.MAX_PARTICLES; i++) {
			try {
				const particle = raindrop.clone(true)
				if (!particle) {
					console.warn(`[RAIN] Failed to clone particle ${i}, skipping`)
					continue
				}
				
				particle.visible = false
				particle.velocity = new Vector3()
				particle.lifetime = 0
				particle.active = false
				particle.maxScale = 0 // Will be set when spawned

				rainParticles.push(particle)
				inactiveRainIndices.push(i)
				app.add(particle)
			} catch (particleError) {
				console.error(`[RAIN] Error creating particle ${i}:`, particleError)
			}
		}
		console.log(`[RAIN] Created ${rainParticles.length} rain particles`)
	} catch (poolError) {
		console.error('[RAIN] Error initializing particle pool:', poolError)
	}

	// Get an available particle from the pool
	function getParticle() {
		try {
			if (inactiveRainIndices.length === 0) {
				// If no inactive particles, find the oldest active particle to reuse
				let oldestIndex = 0;
				let oldestLifetime = 0;
				for (let i = 0; i < rainParticles.length; i++) {
					if (rainParticles[i].active && rainParticles[i].lifetime > oldestLifetime) {
						oldestIndex = i;
						oldestLifetime = rainParticles[i].lifetime;
					}
				}
				return rainParticles[oldestIndex];
			}
			const index = inactiveRainIndices.pop();
			return rainParticles[index];
		} catch (error) {
			console.error('[RAIN] Error getting particle:', error);
			return null;
		}
	}

	// Spawn a new rain particle
	function spawnRainParticle() {
		try {
			const particle = getParticle();
			if (!particle) return;

			// Random position within spawn radius area at the top
			// The radius is now directly in meters
			particle.position.set(
				(num(0, 1, 2) - 0.5) * CONFIG.SPAWN_RADIUS, // Random x within radius
				20, // Start higher up
				(num(0, 1, 2) - 0.5) * CONFIG.SPAWN_RADIUS  // Random z within radius
			);

			// Velocity straight down with slight speed variation
			const speed = CONFIG.MIN_SPEED + num(0, 1, 2) * (CONFIG.MAX_SPEED - CONFIG.MIN_SPEED);
			
			if (!particle.velocity) {
				particle.velocity = new Vector3();
			}
			
			// Set velocity straight down
			particle.velocity.set(0, -speed, 0);

			// Random scale for variation
			const scale = CONFIG.MIN_SCALE + num(0, 1, 2) * (CONFIG.MAX_SCALE - CONFIG.MIN_SCALE);
			particle.scale.set(scale, scale, scale);

			// Reset particle state
			particle.lifetime = 0;
			particle.visible = true;
			particle.active = true;
			particle.maxScale = scale;
			particle.hasSplashed = false; // Track if this particle has created a splash
		} catch (error) {
			console.error('[RAIN] Error spawning rain particle:', error);
		}
	}
	
	// Update rain particles
	app.on('update', (delta) => {
		// Continuous particle emission
		timeSinceLastBurst += delta;
		if (timeSinceLastBurst >= CONFIG.BURST_INTERVAL) {
			timeSinceLastBurst = 0;
			// Spawn rain particles
			for (let i = 0; i < CONFIG.PARTICLES_PER_BURST; i++) {
				spawnRainParticle();
			}
		}

		// Update active rain particles
		for (let i = 0; i < rainParticles.length; i++) {
			const particle = rainParticles[i];
			if (!particle.active) continue;

			// Update position based on velocity
			particle.position.x += particle.velocity.x * delta;
			particle.position.y += particle.velocity.y * delta;
			particle.position.z += particle.velocity.z * delta;

			// Apply gravity for downward acceleration
			particle.velocity.y -= CONFIG.GRAVITY * delta;

			// Make particles face camera for billboard effect
			const dx = control.camera.position.x - particle.position.x;
			const dz = control.camera.position.z - particle.position.z;
			const rotY = Math.atan2(dx, dz);
			particle.rotation.set(0, rotY, 0);

			// Check if particle hits the ground and hasn't splashed yet
			if (particle.position.y <= 0 && !particle.hasSplashed) {
				// Create splash effect
				const splash = ring.clone(true);
				splash.position.set(particle.position.x, 0, particle.position.z);
				splash.scale.set(0.1, 0.1, 0.1); // Start small
				splash.visible = true;
				splash.lifetime = 0;
				app.add(splash);
				splashEffects.push(splash);
				
				// Mark this particle as having splashed
				particle.hasSplashed = true;
			}

			// Despawn if below ground level
			if (particle.position.y < -1) {
				particle.visible = 

// ... truncated ...
```

---
*Extracted from RainV4.hyp. Attachment ID: 1359841758925815889*