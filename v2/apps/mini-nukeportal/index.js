export default function main(world, app, fetch, props, setTimeout) {
// Import important dependencies at the top
// Configure the app with audio options
app.configure([
	{
		key: 'radiationAudio',
		type: 'file',
		kind: 'audio',
		label: 'Radiation Sound',
		description: 'Upload an MP3 file for the radiation cloud ambience'
	},
	{
		key: 'geigerAudio',
		type: 'file',
		kind: 'audio',
		label: 'Geiger Counter Sound',
		description: 'Upload an MP3 file for Geiger counter clicks (should be a short sound)'
	},
	{
		key: 'damageSfx',
		type: 'file',
		kind: 'audio',
		label: 'Radiation Damage SFX',
		description: 'Upload an MP3 file for radiation damage sound effect'
	},
	{
		key: 'warningSfx',
		type: 'file',
		kind: 'audio',
		label: 'Radiation Warning SFX',
		description: 'Upload an MP3 file for radiation zone entry warning'
	},
	{
		key: 'explosionSfx',
		type: 'file',
		kind: 'audio',
		label: 'Explosion Sound',
		description: 'Upload an MP3 file for the initial nuke explosion'
	},
	{
		key: 'refDistance',
		type: 'number',
		label: 'Reference Distance',
		description: 'Distance at which the radiation sound is at full volume (in meters)',
		initial: 3,
		min: 0.5,
		max: 10,
		step: 0.5
	},
	{
		key: 'maxDistance',
		type: 'number',
		label: 'Maximum Distance',
		description: 'Distance at which the radiation sound becomes inaudible (in meters)',
		initial: 20,
		min: 5,
		max: 50,
		step: 1
	},
	{
		key: 'rolloffFactor',
		type: 'number',
		label: 'Rolloff Factor',
		description: 'How quickly the radiation sound fades with distance (higher = faster falloff)',
		initial: 1.5,
		min: 0.5,
		max: 5,
		step: 0.1
	},
	{
		key: 'distanceModel',
		type: 'switch',
		label: 'Distance Model',
		description: 'How radiation sound volume decreases with distance',
		options: [
			{ label: 'Linear', value: 'linear' },
			{ label: 'Inverse', value: 'inverse' },
			{ label: 'Exponential', value: 'exponential' }
		],
		initial: 'inverse'
	},
	// Portal configuration
	{
		type: 'section',
		key: 'portal',
		label: 'Portal Settings'
	},
	{
		key: 'worldUrl',
		type: 'text',
		label: 'Destination World URL',
		placeholder: 'https://example.com',
		description: 'URL of the world to jump to after detonation'
	},
	{
		key: 'newTab',
		type: 'switch',
		label: 'Open in New Tab',
		options: [
			{ label: 'Yes', value: true },
			{ label: 'No', value: false }
		],
		initial: true,
		description: 'Whether to open the world in a new tab or the current tab'
	},
	{
		key: 'portalDelay',
		type: 'number',
		label: 'Portal Delay',
		description: 'Percentage of flash duration before triggering portal (80 = 80%)',
		initial: 80,
		min: 50,
		max: 95,
		step: 5
	}
])

// Global state to track if nuke has been detonated
let nukeDetonated = false;
let portalActivated = false;

// Create our own particle template instead of looking for an existing one
let particleTemplate;
try {
	// Try to get the template first in case it exists
	particleTemplate = app.get('RadiationParticle');
	
	// If not found, create our own template
	if (!particleTemplate) {
		console.log('[CAMPFIRE] Creating custom radiation particle template');
		
		// Create a UI container instead of mesh
		particleTemplate = app.create('ui', {
			width: 12,
			height: 12,
			backgroundColor: 'rgba(0,0,0,0)', // Important: Transparent background
			padding: 0,
			billboard: 'full',  // Make particles face player
			id: 'RadiationParticleTemplate' // Set ID in constructor instead of directly
		});
		
		// Create text for the particle using radiation symbols
		// Using fewer symbols for better performance
		const radiationChars = ['☢', '☣']; // Just 2 main radiation symbols for better performance
		const text = app.create('uitext', {
			value: radiationChars[Math.floor(num(0, 1, 2) * radiationChars.length)],
			fontSize: 16,  // Size of text
			color: '#39ff14', // Bright green for radiation
			textAlign: 'center',
			verticalAlign: 'middle', // Center vertically too
			padding: 0,
			fontFamily: 'monospace',
			width: '100%',
			height: '100%'
		});
		
		// Add text to container
		particleTemplate.add(text);
		particleTemplate.text = text;
		particleTemplate.charSet = radiationChars;
		
		// No need to try setting ID or using app.set (not supported)
		// Just use the template directly
		
		// Log template creation
		console.log('[CAMPFIRE] Radiation particle template created with text symbol');
	}
	
	// Hide the template
	particleTemplate.visible = false;
} catch (error) {
	console.error('[CAMPFIRE] Error creating particle template:', error);
	
	// Create a fallback simple template - with text instead of background color
	particleTemplate = app.create('ui', {
		width: 10,
		height: 10,
		backgroundColor: 'rgba(0,0,0,0)', // Transparent
		padding: 0,
		billboard: 'full'
	});
	
	// Add fallback text
	const fallbackText = app.create('uitext', {
		value: '☢',
		fontSize: 8,
		color: '#39ff14', // Bright green for radiation
		textAlign: 'center',
		verticalAlign: 'middle',
		padding: 0,
		fontFamily: 'monospace',
		width: '100%',
		height: '100%'
	});
	
	particleTemplate.add(fallbackText);
	particleTemplate.text = fallbackText;
	particleTemplate.charSet = ['☢', '☣', '⚛'];
	particleTemplate.visible = false;
	
	console.log('[CAMPFIRE] Created fallback radiation particle template');
}

// Configuration for the particle system
const CONFIG = {
	MAX_PARTICLES: 200,          // Reduced from 400 to 200 for better performance
	SPAWN_RATE: 15,              // Reduced from 20 to 15 particles per second
	LIFETIME: 2.5,               // Slightly shorter lifetime for better performance
	MIN_SPEED: 0.6,              // slower initial speed for floating effect
	MAX_SPEED: 1.2,
	MIN_SCALE: 0.05,             // smaller starting size
	MAX_SCALE: 0.2,              // larger max size for more visibility
	SPAWN_RADIUS: 35,           // wider area for the radiation cloud
	GRAVITY: -0.15,              // lighter negative gravity for slower rise
	BURST_INTERVAL: 0.15,         // Increased from 0.1 to 0.15 for fewer spawns (better performance)
	PARTICLES_PER_BURST: 2,      // Reduced from 5 to 2 for better performance
	TURBULENCE: 0.4,             // Reduced from 0.8 to 0.4 for simpler movement (better performance)
	
	// Damage settings
	DAMAGE_RADIUS: 27,          // Larger radius for radiation damage
	DAMAGE_INTERVAL: 1,          // Check for damage every second
	DAMAGE_AMOUNT: 15,            // Damage per tick
	BURN_DURATION: 10,           // Burning effect lasts 10 seconds after leaving fire
	BURN_REFRESH_INTERVAL: 5,    // Refresh burning effect every 5 seconds while in fire
	
	// Effect settings (visual and gameplay)
	ENABLE_DAMAGE: true,         // Whether can damage players
	DAMAGE_LOCAL_PLAYER: true,   // Whether damages the local player
	DAMAGE_REMOTE_PLAYERS: true, // Whether damages other players
	
	// Audio configuration
	AUDIO_VOLUME: 0.7,  // Default volume for radiation sounds
	AUDIO_PANNING: 0.2, // Slight panning effect for unsettling feeling
	GEIGER_VOLUME: 0.5, // Default volume for Geiger counter
	GEIGER_MIN_INTERVAL: 0.1, // Minimum time between clicks (seconds)
	GEIGER_MAX_INTERVAL: 2.0, // Maximum time between clicks (seconds)
	GEIGER_RANGE: 15,    // Range at which Geiger counter starts clicking
	GEIGER_INTENSITY_SCALE: 5.0, // How quickly intensity increases with proximity
	DAMAGE_SFX_VOLUME: 0.8, // Volume for radiation damage sound effect
	WARNING_SFX_VOLUME: 0.9, // Volume for radiation warning sound
	WARNING_RANGE: 10,   // Range at which warning triggers (slightly before damage range)
	
	// Explosion effect settings
	EXPLOSION_FLASH_DURATION: 3.6, // Duration of the white flash in seconds
	EXPLOSION_INTENSITY: 1.0,     // Intensity of the flash (0-1)
	EXPLOSION_SFX_VOLUME: 1.0,    // Volume for explosion sound
	PARTICLE_BURST_COUNT: 25,     // Reduced from 50 to 25 for better performance
	
	// Radiation tint effect settings
	RADIATION_TINT_DURATION: 30, // Duration of the radiation tint (seconds)
	RADIATION_TINT_COLOR: 'rgba(180, 255, 68, 0.15)', // Green-yellow radioactive tint
	RADIATION_TINT_PULSE_SPEED: 0.8, // How quickly the tint pulses (higher = faster)
	RADIATION_TINT_PULSE_INTENSITY: 0.05, // How much to vary opacity (0-1)
}

console.log('[MININUKE] Initializing mininuke with damage radius:', CONFIG.DAMAGE_RADIUS)

// Find the nuke model in our 3D object
let nukeModel = null;
try {
    nukeModel = app.get('NukeModel') || app.get('Nuke') || app.get('Mininuke') || app;
    console.log('[MININUKE] Found nuke model:', nukeModel.id);
} catch (error) {
    console.error('[MININUKE] Could not find nuke model, using app as fallback:', error);
    nukeModel = app;
}

// Create an action for the nuke that players can interact with
const detonateAction = app.create('action');
detonateAction.label = '☢️ DETONATE NUKE ☢️';
detonateAction.distance = 5;
app.add(detonateAction);

// Create a collision area for the fire
if (world.isServer) {
	console.log('[MININUKE] Setting up server-side fire collision detection')
	console.log('[MININUKE] Mininuke position:', app.position)
	
	// Track players in the radiation and burning state
	const playersInRadiation = new Set()
	const playersBurningState = new Map() // Track burning state and timers
	let damageTimer = 0
	
	// Helper function to apply the burning effect to players
	function applyBurningEffect(player, duration) {
		if (!player || !player.id) {
			console.error('[MININUKE] Invalid player reference in applyBurningEffect')
			return null
		}
		
		const playerId = player.id
		console.log(`[MININUKE] Applying burning effect to ${playerId} for ${duration} seconds`)
		
		try {
			// Check if already burning
			const existingState = playersBurningState.get(playerId)
			const now = world.getTimestamp()
			
			// Either create a new burning state or refresh/extend existing one
			const burnState = existingState || {
				startTime: now,
				endTime: now + duration * 1000, // Convert to milliseconds
				lastTickTime: now,
				lastRefreshTime: now,
				effectApplied: false
			}
			
			// Update end time if extending duration
			if (existingState) {
				// Extend end time if new duration would make it burn longer
				const newEndTime = now + duration * 1000
				if (newEndTime > existingState.endTime) {
					burnState.endTime = newEndTime
				}
				burnState.lastRefreshTime = now
			}
			
			// Store state
			playersBurningState.set(playerId, burnState)
			
			// Calculate remaining time in seconds
			const remainingTime = (burnState.endTime - now) / 1000
			
			// Apply burning emote directly to the player - this is critical
			if (app.config && app.config.burning?.url && player && typeof player.applyEffect === 'function') {
				try {
					// Apply the emote with looping enabled
					player.applyEffect({
						emote: app.config.burning.url + '?l=1', // loop=true
						duration: remainingTime
					})
					burnState.effectApplied = true
				} catch (e) {
					console.error('[MININUKE] Error applying burning emote:', e)
				}
			}
			
			// Apply visual effect only instead of emote to avoid animation conflicts
			// Let the playerEffectsCore handle the visual effects
			app.send('effect:applied', { 
				playerId, 
				type: 'burning', 
				duration: remainingTime 
			})
			
			// Also notify effect system for additional effects
			app.send('effect:burning', {
				playerId,
				duration: remainingTime
			})
			
			return burnState
		} catch (e) {
			console.error('[MININUKE] Error in applyBurningEffect:', e)
			return null
		}
	}
	
	// Server-side explosion handler
	function handleExplosion(playerId) {
		if (nukeDetonated) return; // Prevent multiple detonations
		
		console.log('[MININUKE] Detonation triggered by player:', playerId);
		nukeDetonated = true;
		
		// Send explosion event to all clients
		app.send('nuke:detonate', {
			triggeredBy: playerId,
			position: app.position,
			timestamp: world.getTimestamp()
		});
		
		// Get the detonator player
		const detonatorPlayer = world.getPlayer(playerId);
		
		// Guarantee the detonator dies immediately using direct approach from RadiationCloud.js
		if (detonatorPlayer) {
			console.log(`[MININUKE] Killing player ${playerId} for detonating the nuke`);
			
			try {
				// Simple, direct damage application
				if (detonatorPlayer.health > 0) {
					// Apply lethal damage (100)
					detonatorPlayer.damage(100);
					
					// Send damage notification with critical flag for visual effect
					world.emit('hyperfy:dmg', { 
						playerId, 
						amount: 100, 
						crit: true,
						effectType: 'radiation'
					});
					
					// Apply burning effect for visual feedback
					applyBurningEffect(detonatorPlayer, CONFIG.BURN_DURATION);
					
					console.log(`[MININUKE] Player ${playerId} killed by nuke detonation`);
				}
						} catch (e) {
				console.error('[MININUKE] Error killing player:', e);
			}
		}
		
		// Apply immediate blast damage to nearby players
		const players = world.getPlayers();
		const damageMultiplier = 2.0;
		
			players.forEach(player => {
			// Skip invalid players or the detonator (already handled)
			if (!player || !player.id || player.id === playerId) return;
			
			const distance = player.position.distanceTo(app.position);
			
			// Skip players outside blast radius
			if (distance > CONFIG.DAMAGE_RADIUS * 1.5) return;
			
			// Calculate damage based on distance
			const distanceFactor = 1 - Math.min(1, distance / (CONFIG.DAMAGE_RADIUS * 1.5));
			const blastDamage = Math.round(CONFIG.DAMAGE_AMOUNT * damageMultiplier * (0.5 + distanceFactor * 0.5));
			const isCritical = distanceFactor > 0.8;
			
			console.log(`[MININUKE] Applying blast damage to ${player.id}: ${blastDamage}`);
			
			// Simple, direct damage application exactly like RadiationCloud.js
						if (player && player.health > 0) {
							try {
					player.damage(blastDamage);
					
					// Send damage notification event
							world.emit('hyperfy:dmg', { 
						playerId: player.id, 
						amount: blastDamage, 
						crit: isCritical,
						effectType: 'radiation'
					});
					
					// Apply burning effect
					applyBurningEffect(player, CONFIG.BURN_DURATION);
						} catch (e) {
					console.error('[MININUKE] Error applying blast damage:', e);
				}
			}
		});
		
		// Set up damage area for ongoing radiation damage
		setupRadiationDamageArea();
	}
	
	// Wire up the detonate action
	detonateAction.onTrigger = (e) => {
		if (e && e.playerId) {
			handleExplosion(e.playerId);
		}
	}
	
	// Rest of the server-side code with trigger areas...
	// ... existing code ...
}

if (world.isClient) {
	console.log('[MININUKE] Initializing client-side particle system');
	
	// Get control handle for screen dimensions
	const controlHandle = app.control();
	let screenWidth = 1920;  // Default fallback
	let screenHeight = 1080; // Default fallback
	
	// Try to get actual screen dimensions
	if (controlHandle && controlHandle.screen) {
		screenWidth = controlHandle.screen.width || 1920;
		screenHeight = controlHandle.screen.height || 1080;
		console.log(`[MININUKE] Screen dimensions: ${screenWidth}x${screenHeight}`);
	} else {
		console.log('[MININUKE] Could not get screen dimensions, using defaults');
	}
	
	// Particle pool tracking
	const particles = [];
	const inactiveIndices = [];
	let timeSinceLastBurst = 0;
	let explosionFlashTimer = 0;
	let isShowingExplosionFlash = false;
	let radiationTintTimer = 0;
	let isShowingRadiationTint = false;
	let lastScreenCheck = 0; // Track when we last checked screen dimensions

	// Initialize particle pool
	try {
		console.log('[MININUKE] Initializing particle pool');
		for (let i = 0; i < CONFIG.MAX_PARTICLES; i++) {
			try {
				const particle = particleTemplate.clone(true);
				if (!particle) {
					console.warn(`[MININUKE] Failed to clone particle ${i}, skipping`);
					continue;
				}
				
				particle.visible = false;

				// Add metadata to particle
				particle.velocity = { x: 0, y: 0, z: 0 };  // Simple object instead of Vector3
				particle.velocity.set = function(x, y, z) {  // Add a set method
					this.x = x;
					this.y = y;
					this.z = z;
				};
				particle.lifetime = 0;
				particle.active = false;
				
				// Set random character for each particle
				const radiationChars = ['☢', '☣']; // Simplified character set
				if (particle.text) {
					particle.text.value = radiationChars[Math.floor(num(0, 1, 2) * radiationChars.length)];
					particle.charSet = radiationChars;
				}

				particles.push(particle);
				inactiveIndices.push(i);
				app.add(particle);
			} catch (particleError) {
				console.error(`[MININUKE] Error creating particle ${i}:`, particleError);
			}
		}
		console.log(`[MININUKE] Created ${particles.length} particles`);
	} catch (poolError) {
		console.error('[MININUKE] Error initializing particle pool:', poolError);
	}

	const localPlayer = world.getPlayer();

	// Get an available particle from the pool
	function getParticle() {
		try {
			if (inactiveIndices.length === 0) return null;
			const index = inactiveIndices.pop();
			return particles[index];
		} catch (error) {
			console.error('[MININUKE] Error getting particle:', error);
			return null;
		}
	}

	// Spawn a new particle
	function spawnParticle() {
		try {
			const particle = getParticle();
			if (!particle) return;

			// Random position within spawn radius (concentrated at base)
			const angle = num(0, 1, 2) * Math.PI * 2;
			// Ensure radius is positive
			const spawnRadius = Math.max(0.1, CONFIG.SPAWN_RADIUS);
			const radius = Math.pow(num(0, 1, 2), 0.5) * spawnRadius; // Square root for more concentration in center
			particle.position.set(
				Math.cos(angle) * radius,
				0,
				Math.sin(angle) * radius
			);

			// Velocity mostly upward with slight variation
			const speed = CONFIG.MIN_SPEED + num(0, 1, 2) * (CONFIG.MAX_SPEED - CONFIG.MIN_SPEED);
			const horizontalDirection = num(0, 1, 2) * Math.PI * 2;
			const horizontalStrength = 0.3; // More horizontal movement for radiation cloud
			
			// Set velocity 
			if (!particle.velocity) {
				particle.velocity = { x: 0, y: 0, z: 0 };  // Simple object instead of Vector3
				particle.velocity.set = function(x, y, z) {  // Add a set method
					this.x = x;
					this.y = y;
					this.z = z;
				};
			}
			particle.velocity.set(
				speed * horizontalStrength * Math.cos(horizontalDirection),
				speed * (0.7 + 0.3 * num(0, 1, 2)), // Mostly upward
				speed * horizontalStrength * Math.sin(horizontalDirection)
			);

			// Set initial scale
			const scale = CONFIG.MIN_SCALE + num(0, 1, 2) * (CONFIG.MAX_SCALE - CONFIG.MIN_SCALE);
			particle.scale.set(scale, scale, scale);
			particle.maxScale = scale;  // Store for later scaling

			// Reset lifetime
			particle.lifetime = 0;
			
			// Initialize text with random character if it exists
			if (particle.text) {
				// Force check if text reference is valid
				try {
					const charSet = particle.charSet || ['☢', '☣'];  // Simplified character set
					particle.text.value = charSet[Math.floor(num(0, 1, 2) * charSet.length)];
					particle.text.color = '#39ff14'; // Start with bright green
					particle.text.opacity = 0.5; // Start somewhat transparent
					
					// Make sure text is visible
					particle.backgroundColor = 'rgba(0,0,0,0)'; // Transparent
					
					// Only log 1% of the time to avoid console spam
					if (num(0, 1, 2) < 0.01) { 
						console.log(`[MININUKE] Particle spawned with symbol: ${particle.text.value}`);
					}
				} catch (textError) {
					console.error('[MININUKE] Error setting particle text:', textError);
					
					// Try to recreate text if it doesn't exist
					if (!particle.text.value) {
						try {
							console.log('[MININUKE] Recreating text element for particle');
							const text = app.create('uitext', {
								value: '☢',
								fontSize: 8,
								color: '#39ff14',
								textAlign: 'center',
								verticalAlign: 'middle',
								padding: 0,
								fontFamily: 'monospace',
								width: '100%',
								height: '100%'
							});
							
							// Clear and re-add
							while (particle.children.length > 0) {
								particle.remove(particle.children[0]);
							}
							
							particle.add(text);
							particle.text = text;
							particle.charSet = ['☢', '☣'];  // Simplified character set
						} catch (recreateError) {
							console.error('[MININUKE] Failed to recreate text:', recreateError);
						}
					}
				}
			} else {
				// If no text exists, try to create it
				try {
					console.log('[MININUKE] Creating missing text element for particle');
					const text = app.create('uitext', {
						value: '☢',
						fontSize: 8,
						color: '#39ff14',
						textAlign: 'center',
						verticalAlign: 'middle',
						padding: 0,
						fontFamily: 'monospace',
						width: '100%',
						height: '100%'
					});
					
					particle.add(text);
					particle.text = text;
					particle.charSet = ['☢', '☣'];
				} catch (createError) {
					console.error('[MININUKE] Failed to create text for particle:', createError);
				}
			}

			// Make particle visible and active
			particle.visible = true;
			particle.active = true;

		} catch (error) {
			console.error('[MININUKE] Error spawning particle:', error);
		}
	}
	
	// Helper function to calculate distance between player and radiation source
	function getPlayerDistance() {
		const player = world.getPlayer();
		if (!player) return 999;
		
		const playerPos = player.position;
		const cloudPos = app.position;
		const dx = playerPos.x - cloudPos.x;
		const dy = playerPos.y - cloudPos.y;
		const dz = playerPos.z - cloudPos.z;
		return Math.sqrt(dx*dx + dy*dy + dz*dz);
	}

	// Add a function to update Geiger counter based on player proximity
	function updateGeigerCounter(delta) {
		if (!geigerAudio) return;
		
		const now = world.getTime();
		if (now < nextGeigerTime) return;
		
		const distance = getPlayerDistance();
		lastPlayerDistance = distance;
		
		// Only click if within range
		if (distance <= CONFIG.GEIGER_RANGE) {
			// Calculate intensity based on proximity (closer = more intense)
			const proximityFactor = 1 - Math.min(1, distance / CONFIG.GEIGER_RANGE);
			const clickInterval = CONFIG.GEIGER_MAX_INTERVAL - 
				(proximityFactor * (CONFIG.GEIGER_MAX_INTERVAL - CONFIG.GEIGER_MIN_INTERVAL));
			
			// Add some randomness to the interval
			const randomFactor = 0.2; // 20% variance
			const intervalVariance = clickInterval * randomFactor;
			const finalInterval = clickInterval + (num(0, 1, 2) * intervalVariance - intervalVariance/2);
			
			// Set volume based on proximity too
			geigerAudio.volume = CONFIG.GEIGER_VOLUME * (0.5 + proximityFactor * 0.5);
			
			// Play the Geiger click
			geigerAudio.stop();
			geigerAudio.play();
			
			// Set next click time
			nextGeigerTime = now + finalInterval;
		} else {
			// Outside of range, set a longer interval for checking again
			nextGeigerTime = now + 1.0;
		}
	}

	// Add function to check player proximity for warning
	function checkRadiationWarning(delta) {
		if (!warningSfx) return;
		
		// Decrease warning cooldown
		if (warningCooldown > 0) {
			warningCooldown -= delta;
			return;
		}
		
		const distance = getPlayerDistance();
		
		// Check if player just entered warning range
		const inWarningRange = distance <= CONFIG.WARNING_RANGE;
		
		// Play warning when first entering range or after cooldown
		if (inWarningRange && (!hasPlayedWarning || lastPlayerDistance > CONFIG.WARNING_RANGE)) {
			warningSfx.stop();
			warningSfx.play();
			hasPlayedWarning = true;
			warningCooldown = 30; // 30 seconds cooldown before warning can play again
		}
		
		// Reset warning flag when player leaves the area
		if (!inWarningRange && distance > CONFIG.WARNING_RANGE + 5) {
			hasPlayedWarning = false;
		}
		
		// Update last known distance
		lastPlayerDistance = distance;
	}

	// Track radiation level for player (0-100)
	let radiationLevel = 0;
	let maxRadiationLevel = 100;
	// How quickly radiation builds up when in radiation zone
	const RADIATION_BUILDUP_RATE = 10;  // points per second
	// How quickly radiation dissipates when away from radiation
	const RADIATION_DECAY_RATE = 5;    // points per second

	// Function to update radiation level based on proximity to radiation cloud
	function updateRadiationLevel(delta) {
		const player = world.getPlayer();
		if (!player) return;
		
		const distance = getPlayerDistance();
		
		// Determine if in radiation zone
		const inRadiationZone = distance <= CONFIG.DAMAGE_RADIUS;
		
		// Update radiation level
		if (inRadiationZone) {
			// Radiation builds up faster the closer you are to the center
			const proximityFactor = 1 - Math.min(1, distance / CONFIG.DAMAGE_RADIUS);
			const buildupRate = RADIATION_BUILDUP_RATE * (0.5 + proximityFactor * 2.0);
			
			// Increase radiation level
			radiationLevel = Math.min(maxRadiationLevel, radiationLevel + buildupRate * delta);
			
			// Log when radiation level changes significantly
			if (Math.floor(radiationLevel) % 10 === 0 && radiationLevel > 1) {
				console.log(`[RADIATION] Radiation increasing: ${radiationLevel.toFixed(1)}/${maxRadiationLevel}`);
			}
		} else {
			// Radiation decreases when away from radiation
			radiationLevel = Math.max(0, radiationLevel - RADIATION_DECAY_RATE * delta);
		}
		
		// Send event to update the HUD with current radiation level
		app.send('radiation:update', { 
			level: radiationLevel,
			maxLevel: maxRadiationLevel,
			inZone: inRadiationZone
		});
	}
    
	// Create the flash overlay for explosion effect with dynamic dimensions
	const flashOverlay = app.create('ui', {
		width: screenWidth,
		height: screenHeight,
		backgroundColor: 'rgba(255, 255, 255, 0)', // Start transparent
		space: 'screen', // Use screen space like compass
		position: [0.5, 0.5, 0], // Center of screen
		offset: [0, 0, 0], // No offset needed
		pivot: 'center',
		pointerEvents: false, // Don't block interaction
		zIndex: 1000 // Ensure it's on top of other UI
	});

	// No need to position the overlay - it's already screen space
	flashOverlay.visible = false;
	app.add(flashOverlay);

	// Create the radiation tint overlay with dynamic dimensions
	const radiationTintOverlay = app.create('ui', {
		width: screenWidth,
		height: screenHeight,
		backgroundColor: 'rgba(0, 0, 0, 0)', // Start fully transparent
		space: 'screen', // Use screen space
		position: [0.5, 0.5, 0], // Center of screen
		offset: [0, 0, 0], // No offset
		pivot: 'center',
		pointerEvents: false, // Don't block interaction
		zIndex: 999, // Just below the flash overlay
		opacity: 0 // Start with zero opacity
	});

	// Add cracked screen effect image - also hidden initially
	const crackedEffect = app.create('uitext', {
		value: '☢️ RADIATION EXPOSURE ☢️',
		fontSize: 24,
		fontWeight: 'bold',
		color: '#ffff00',
		textShadow: '0 0 5px #39ff14',
		position: 'absolute',
		marginTop: 40, // Place at top of screen with some margin
		opacity: 0, // Start invisible
		fontFamily: 'monospace'
	});

	radiationTintOverlay.add(crackedEffect);

	// Force hide initially
	radiationTintOverlay.visible = false;
	app.add(radiationTintOverlay);

	// Set up audio elements
	let radiationAudio = null;
	let geigerAudio = null;
	let damageSfx = null;
	let warningSfx = null;
	let explosionSfx = null;
	let nextGeigerTime = 0;
	let lastPlayerDistance = 999;
	let hasPlayedWarning = false;
	let warningCooldown = 0;

	// Helper function for creating audio elements
	function createAudio(config, options) {
		if (!config) return null;
		
		const audio = app.create('audio', {
			src: config.url,
			...options
		});
		
		app.add(audio);
		return audio;
	}

	// Initialize audio elements
	if (app.config.radiationAudio) {
		radiationAudio = createAudio(app.config.radiationAudio, {
			volume: CONFIG.AUDIO_VOLUME,
			spatial: true,
			refDistance: app.config.refDistance || 3,
			maxDistance: app.config.maxDistance || 20,
			rolloffFactor: app.config.rolloffFactor || 1.5,
			distanceModel: app.config.distanceModel || 'inverse',
			loop: true,
			panning: CONFIG.AUDIO_PANNING * (num(0, 1, 2) > 0.5 ? 1 : -1)
		});
		
		// Don't start playing radiation audio until detonation
		if (radiationAudio) radiationAudio.volume = 0;
	}

	// Setup Geiger counter effect
	geigerAudio = app.config.geigerAudio ? createAudio(app.config.geigerAudio, {
		volume: CONFIG.GEIGER_VOLUME,
		spatial: false,
		loop: false
	}) : null

	// Setup damage sound effect
	damageSfx = app.config.damageSfx ? createAudio(app.config.damageSfx, {
		volume: CONFIG.DAMAGE_SFX_VOLUME,
		spatial: false,
		loop: false
	}) : null

	// Setup warning sound effect
	warningSfx = app.config.warningSfx ? createAudio(app.config.warningSfx, {
		volume: CONFIG.WARNING_SFX_VOLUME,
		spatial: false,
		loop: false
	}) : null

	// Setup explosion sound effect
	explosionSfx = app.config.explosionSfx ? createAudio(app.config.explosionSfx, {
		volume: CONFIG.EXPLOSION_SFX_VOLUME,
		spatial: true,
		refDistance: app.config.refDistance || 3,
		maxDistance: app.config.maxDistance * 2 || 40, // Explosion heard from further away
		rolloffFactor: app.config.rolloffFactor || 1.5,
		distanceModel: app.config.distanceModel || 'inverse',
		loop: false
	}) : null

	// Handle the explosion effect
	function handleClientExplosion() {
		console.log('[MININUKE] Triggering client-side explosion effects');
		
		// Play explosion sound
		if (explosionSfx) {
			explosionSfx.stop();
			explosionSfx.play();
		}
		
		// Start radiation sound
		if (radiationAudio) {
			radiationAudio.volume = CONFIG.AUDIO_VOLUME;
			radiationAudio.play();
		}
		
		// Show flash effect
		flashOverlay.backgroundColor = `rgba(255, 255, 255, ${CONFIG.EXPLOSION_INTENSITY})`;
		flashOverlay.visible = true;
		isShowingExplosionFlash = true;
		explosionFlashTimer = 0;
		
		// Reset radiation tint effect to start after flash
		radiationTintTimer = 0;
		isShowingRadiationTint = true;
		
		// Make sure radiation tint is not visible yet and reset its properties
		radiationTintOverlay.visible = false;
		radiationTintOverlay.opacity = 0;
		radiationTintOverlay.backgroundColor = 'rgba(0, 0, 0, 0)';
		crackedEffect.opacity = 0;
		
		// Trigger initial particle burst
		for (let i = 0; i < CONFIG.PARTICLE_BURST_COUNT; i++) {
			spawnParticle();
		}
		
		// Hide the nuke model
		if (nukeModel && nukeModel !== app) {
			nukeModel.visible = false;
		}
		
		// Hide the detonate action
		detonateAction.visible = false;
		
		// Set global detonation state
		nukeDetonated = true;
		// Reset portal activation state
		portalActivated = false;
		
		// Shake the camera
		app.send('camera:shake', {
			duration: 2.0,
			intensity: 0.5
		});
		
		// Send event to update the HUD
		app.send('radiation:blast', {
			position: app.position
		});
	}
	
	// Listen for detonation event from server
	app.on('nuke:detonate', (data) => {
		handleClientExplosion();
	});
	
	// Also allow local detonation through the action for immediate feedback
	detonateAction.onTrigger = () => {
		if (!nukeDetonated) {
			// Send detonation request to server
			app.send('nuke:request-detonation', {
				playerId: world.getPlayer().id
			});
			
			// Show immediate client-side effects without waiting for server
			handleClientExplosion();
		}
	};

	// Main update loop
	app.on('update', (delta) => {
		try {
			// Check for screen dimension changes occasionally (every 2 seconds)
			// This is a safer approach than using event listeners
			const currentTime = world.getTime();
			if (currentTime - lastScreenCheck > 2) {
				lastScreenCheck = currentTime;
				if (controlHandle && controlHandle.screen) {
					const newWidth = controlHandle.screen.width || screenWidth;
					const newHeight = controlHandle.screen.height || screenHeight;
					
					// Only update if dimensions have changed
					if (newWidth !== screenWidth || newHeight !== screenHeight) {
						console.log(`[MININUKE] Screen dimensions updated: ${newWidth}x${newHeight}`);
						screenWidth = newWidth;
						screenHeight = newHeight;
						
						// Update overlay dimensions
						flashOverlay.width = screenWidth;
						flashOverlay.height = screenHeight;
						radiationTintOverlay.width = screenWidth;
						radiationTintOverlay.height = screenHeight;
					}
				}
			}
			
			// Only process flash and radiation effects if nuke has been detonated
			if (nukeDetonated) {
				// Handle explosion flash fade out
				if (isShowingExplosionFlash) {
					explosionFlashTimer += delta;
					
					if (explosionFlashTimer <= CONFIG.EXPLOSION_FLASH_DURATION) {
						// Gradually fade out the flash with easing
						const progress = explosionFlashTimer / CONFIG.EXPLOSION_FLASH_DURATION;
						const eased = 1 - (progress * progress); // Quadratic ease out
						const opacity = CONFIG.EXPLOSION_INTENSITY * eased;
						flashOverlay.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
						
						// Start showing the radiation tint when the flash is around 70% complete
						if (progress > 0.7 && isShowingRadiationTint && !radiationTintOverlay.visible) {
							console.log('[MININUKE] Starting radiation tint transition');
							// Start with lower opacity that will increase as flash fades
							const initialTintOpacity = (progress - 0.7) / 0.3; // Ramps up from 0 to 1 as flash fades
							radiationTintOverlay.backgroundColor = CONFIG.RADIATION_TINT_COLOR;
							radiationTintOverlay.opacity = initialTintOpacity;
							radiationTintOverlay.visible = true;
							crackedEffect.opacity = 0.8 * initialTintOpacity;
						}
						
						// If radiation tint is already visible, gradually increase its opacity as flash fades
						if (radiationTintOverlay.visible && progress > 0.7) {
							const tintOpacityIncrease = (progress - 0.7) / 0.3; // Increases as flash fades
							radiationTintOverlay.opacity = tintOpacityIncrease;
							// Extract the current green tint color components and just adjust opacity
							const baseOpacity = 0.15 * tintOpacityIncrease; 
							radiationTintOverlay.backgroundColor = `rgba(180, 255, 68, ${baseOpacity})`;
						}
						
						// Check for portal activation when flash is at desired threshold
						// Use the portalDelay config to determine when to trigger (default 80%)
						const portalThreshold = (app.props.portalDelay || 80) / 100;
						if (app.props.worldUrl && !portalActivated && progress >= portalThreshold) {
							console.log(`[MININUKE] Flash at ${Math.round(progress * 100)}% - Activating portal to: ${app.props.worldUrl}`);
							portalActivated = true;
							try {
								// Attempt to open the destination world
								world.open(app.props.worldUrl, app.props.newTab);
								console.log('[MININUKE] Portal activated successfully!');
							} catch (err) {
								console.error('[MININUKE] Portal activation error:', err);
							}
						}
					} else {
						// End flash effect
						flashOverlay.visible = false;
						isShowingExplosionFlash = false;
						
						// Ensure radiation tint is fully visible when flash is gone
						if (isShowingRadiationTint) {
							if (!radiationTintOverlay.visible) {
								console.log('[MININUKE] Showing radiation tint effect');
								radiationTintOverlay.backgroundColor = CONFIG.RADIATION_TINT_COLOR;
								radiationTintOverlay.opacity = 1;
								radiationTintOverlay.visible = true;
								crackedEffect.opacity = 0.8;
							} else {
								// If it was already showing during transition, ensure full opacity
								radiationTintOverlay.opacity = 1;
								radiationTintOverlay.backgroundColor = CONFIG.RADIATION_TINT_COLOR;
							}
						}
					}
				}
				
				// Handle radiation tint effect - only if detonated AND if the tint should be showing
				if (isShowingRadiationTint && radiationTintOverlay.visible) {
					radiationTintTimer += delta;
					
					if (radiationTintTimer <= CONFIG.RADIATION_TINT_DURATION) {
						// Only start the pulsing effect once the flash is completely gone
						if (!isShowingExplosionFlash) {
							// Create pulsing/flickering effect for the tint
							const baseOpacity = 0.15; // Base opacity from original color
							const pulsePhase = Math.sin(radiationTintTimer * CONFIG.RADIATION_TINT_PULSE_SPEED * Math.PI);
							const pulseOpacity = baseOpacity + (pulsePhase * CONFIG.RADIATION_TINT_PULSE_INTENSITY);
							
							// Update tint color with pulsing opacity
							radiationTintOverlay.backgroundColor = `rgba(180, 255, 68, ${pulseOpacity})`;
							
							// Make the radiation text flicker occasionally
							if (radiationTintTimer % 2 < 0.1) {
								crackedEffect.opacity = 0.3 + Math.random() * 0.7;
							}
						}
						
						// Gradually fade out as we approach the end
						if (radiationTintTimer > CONFIG.RADIATION_TINT_DURATION - 5) {
							const fadeProgress = (radiationTintTimer - (CONFIG.RADIATION_TINT_DURATION - 5)) / 5;
							radiationTintOverlay.opacity = 1 - fadeProgress;
						}
					} else {
						// End radiation tint effect
						radiationTintOverlay.visible = false;
						isShowingRadiationTint = false;
						radiationTintOverlay.opacity = 0;
					}
				}
			} else {
				// Ensure effects are hidden when not detonated - be extremely aggressive
				if (flashOverlay) {
					flashOverlay.visible = false;
					flashOverlay.opacity = 0;
				}
				
				if (radiationTintOverlay) {
					radiationTintOverlay.visible = false;
					radiationTintOverlay.opacity = 0;
					radiationTintOverlay.backgroundColor = 'rgba(0, 0, 0, 0)';
					
					if (crackedEffect) {
						crackedEffect.opacity = 0;
					}
				}
			}
			
			// Only spawn and update particles if nuke has been detonated
			if (nukeDetonated) {
			// Spawn new particles in bursts
				timeSinceLastBurst += delta;
				if (timeSinceLastBurst >= CONFIG.BURST_INTERVAL) {
					timeSinceLastBurst = 0;
				// Spawn multiple particles per burst
				for (let i = 0; i < CONFIG.PARTICLES_PER_BURST; i++) {
							spawnParticle();
				}
			}

			// Update active particles
			for (let i = 0; i < particles.length; i++) {
						const particle = particles[i];
						if (!particle.active) continue;

				// Add some turbulence/flickering to simulate radiation cloud
						particle.velocity.x += (num(0, 1, 2) - 0.5) * CONFIG.TURBULENCE * delta;
						particle.velocity.z += (num(0, 1, 2) - 0.5) * CONFIG.TURBULENCE * delta;

				// Update position based on velocity
						particle.position.x += particle.velocity.x * delta;
						particle.position.y += particle.velocity.y * delta;
						particle.position.z += particle.velocity.z * delta;

				// Apply "negative gravity" to make particles rise
						particle.velocity.y += CONFIG.GRAVITY * delta;

				// Update lifetime and check for despawn
						particle.lifetime += delta;
						const lifeRatio = particle.lifetime / CONFIG.LIFETIME;

				if (particle.lifetime >= CONFIG.LIFETIME) {
							particle.visible = false;
							particle.active = false;
							inactiveIndices.push(i);
				} else {
					// Scale effect - grow slightly then shrink
							let scaleMultiplier = 1.0;
					if (lifeRatio < 0.3) {
						// Grow in the first 30% of lifetime
								scaleMultiplier = 1.0 + lifeRatio * 1.5;
					} else {
						// Shrink for the rest
								scaleMultiplier = 1.45 - (lifeRatio - 0.3) * 1.45 / 0.7;
					}
						
					// Apply scale to the UI container
							const newScale = CONFIG.MIN_SCALE + (CONFIG.MAX_SCALE - CONFIG.MIN_SCALE) * scaleMultiplier;
							particle.scale.set(newScale, newScale, newScale);
					
					// Opacity effect - fade in then fade out
							let opacity = 1.0;
					if (lifeRatio < 0.1) {
						// Fade in quickly
								opacity = lifeRatio * 10;
					} else if (lifeRatio > 0.7) {
						// Fade out in the last 30%
								opacity = 1.0 - ((lifeRatio - 0.7) / 0.3);
					}
					
					// Apply the opacity to the particle text
					if (particle.text) {
								particle.text.opacity = opacity;
						
						// Only change characters and color less frequently to improve performance
						// Change character much less often (1% chance instead of 5%)
						if (num(0, 1, 2) < 0.01) {
							const charSet = particle.charSet || ['☢', '☣'];
							particle.text.value = charSet[Math.floor(num(0, 1, 2) * charSet.length)];
							
							// Update color at the same time as character change
							// Simplified color - just go from green to yellow without calculating every frame
							const stage = Math.floor(lifeRatio * 3); // 0, 1, or 2
							if (stage === 0) {
								particle.text.color = '#39ff14'; // Bright green
							} else if (stage === 1) {
								particle.text.color = '#a0ff14'; // Yellow-green
							} else {
								particle.text.color = '#ffff14'; // Yellow
							}
						}
					}
				}
			}

			// Update radiation level
					updateRadiationLevel(delta);
			
			// Update Geiger counter
					updateGeigerCounter(delta);
			
			// Check if warning needs to be played
					checkRadiationWarning(delta);
			}
			
		} catch (error) {
			console.error('[MININUKE] Error in update:', error);
		}
	});
	
	// Add initial location information
	app.send('location:update', { 
		name: 'TOXIC VALLEY',
		region: 'wasteland'
	});
	
	// Handle server-side detonation requests
	app.on('nuke:request-detonation', (data) => {
		if (world.isServer && !nukeDetonated) {
			handleExplosion(data.playerId);
		}
	});
} 

// New function to set up ongoing radiation damage area
function setupRadiationDamageArea() {
	if (!world.isServer) return; // Only run on server
	
	console.log('[MININUKE] Setting up radiation damage area');
	
	// Create trigger area for radiation zone
	const radiationArea = app.create('rigidbody', { type: 'static' });
	const collider = app.create('collider', { trigger: true });
	collider.type = 'sphere';
	collider.radius = CONFIG.DAMAGE_RADIUS;
	radiationArea.add(collider);
	app.add(radiationArea);
	
	// Position radiation area
	radiationArea.position.copy(app.position);
	radiationArea.position.y += 0.5; // Move up slightly to better match player height
	
	console.log('[MININUKE] Radiation area created with radius:', CONFIG.DAMAGE_RADIUS);
	console.log('[MININUKE] Radiation area position:', radiationArea.position);
	
	// Track players in the radiation zone
	const playersInRadiation = new Set();
	let damageTimer = 0;
	
	// Handle players entering the radiation zone
	radiationArea.onTriggerEnter = (other) => {
		console.log('[MININUKE] Trigger entered by:', other);
		// Check if it's a player
		if (other && other.hasOwnProperty('networkId')) {
			const playerId = other.networkId;
			if (!playersInRadiation.has(playerId)) {
				playersInRadiation.add(playerId);
				console.log(`[MININUKE] Player ${playerId} entered radiation zone! Current players in radiation:`, Array.from(playersInRadiation));
				
				// Immediately apply initial damage
				const player = world.getPlayer(playerId);
				if (player && player.health > 0) {
					console.log(`[MININUKE] Applying initial damage to player ${playerId} with health ${player.health}`);
					
					// Apply damage directly - simplified like RadiationCloud.js
					try {
						player.damage(CONFIG.DAMAGE_AMOUNT);
					} catch (e) {
						console.error('[MININUKE] Error applying damage:', e);
					}
					
					// Apply burning effect
					try {
						applyBurningEffect(player, CONFIG.BURN_DURATION);
					} catch (e) {
						console.error('[MININUKE] Error applying burning effect:', e);
					}
					
					// Send damage notification - simplified
					world.emit('hyperfy:dmg', { 
						playerId, 
						amount: CONFIG.DAMAGE_AMOUNT, 
						crit: false,
						effectType: 'radiation'
					});
				}
			}
		}
	};
	
	// Handle players leaving the radiation zone
	radiationArea.onTriggerLeave = (other) => {
		if (other && other.hasOwnProperty('networkId')) {
			const playerId = other.networkId;
			if (playersInRadiation.has(playerId)) {
				playersInRadiation.delete(playerId);
				console.log(`[MININUKE] Player ${playerId} left radiation zone`);
			}
		}
	};
	
	// Apply damage over time to players in the radiation zone
	app.on('update', (delta) => {
		if (!nukeDetonated) return;
		
		// Process radiation damage on interval
		damageTimer += delta;
		
		if (damageTimer >= CONFIG.DAMAGE_INTERVAL) {
			damageTimer = 0;
			
			// Actively check for players in range
			const players = world.getPlayers();
			const now = world.getTimestamp();
			
			// First check all players for proximity to radiation
			players.forEach(player => {
				if (!player || !player.id) return;
				
				const playerId = player.id;
				const distance = player.position.distanceTo(radiationArea.position);
				const inRange = distance <= CONFIG.DAMAGE_RADIUS;
				
				// If player is in range but not in our set, add them
				if (inRange && !playersInRadiation.has(playerId) && player.health > 0) {
					console.log(`[MININUKE] Player ${playerId} detected in radiation range but not tracked! Distance: ${distance.toFixed(2)}, adding to tracked players`);
					playersInRadiation.add(playerId);
					
					// Apply initial damage using direct damage method
					if (player && player.health > 0) {
						console.log(`[MININUKE] Applying direct initial damage of ${CONFIG.DAMAGE_AMOUNT} to player ${playerId}`);
						
						// Apply damage directly - exactly like RadiationCloud.js
						try {
							player.damage(CONFIG.DAMAGE_AMOUNT);
						} catch (e) {
							console.error('[MININUKE] Error applying damage:', e);
						}
						
						// Apply burning effect
						try {
							applyBurningEffect(player, CONFIG.BURN_DURATION);
						} catch (e) {
							console.error('[MININUKE] Error applying burning effect:', e);
						}
						
						// Send damage notification - simplified
						world.emit('hyperfy:dmg', { 
							playerId, 
							amount: CONFIG.DAMAGE_AMOUNT, 
							crit: false,
							effectType: 'radiation'
						});
					}
				}
				
				// If player is out of range but in our set, remove them
				if (!inRange && playersInRadiation.has(playerId)) {
					console.log(`[MININUKE] Player ${playerId} no longer in radiation range but still tracked! Distance: ${distance.toFixed(2)}, removing from tracked players`);
					playersInRadiation.delete(playerId);
				}
			});
			
			// Deal damage to each player in the radiation zone
			if (playersInRadiation.size > 0) {
				console.log(`[MININUKE] Damage tick. Players in radiation:`, Array.from(playersInRadiation));
				
				playersInRadiation.forEach(playerId => {
					const player = world.getPlayer(playerId);
					if (player && player.health > 0) {
						console.log(`[MININUKE] Applying direct damage tick of ${CONFIG.DAMAGE_AMOUNT} to player ${playerId}, health before: ${player.health}`);
						
						// Apply damage directly - exactly like RadiationCloud.js
						try {
							player.damage(CONFIG.DAMAGE_AMOUNT);
						} catch (e) {
							console.error('[MININUKE] Error applying damage:', e);
						}
						
						// Apply burning effect periodically
						const burnState = playersBurningState.get(playerId);
						if (!burnState || (now - burnState.lastRefreshTime) >= CONFIG.BURN_REFRESH_INTERVAL * 1000) {
							// Refresh the burning effect while in radiation
							try {
								applyBurningEffect(player, CONFIG.BURN_DURATION);
							} catch (e) {
								console.error('[MININUKE] Error applying burning effect:', e);
							}
						}
						
						// Send damage notification - same as RadiationCloud.js
						world.emit('hyperfy:dmg', { 
							playerId, 
							amount: CONFIG.DAMAGE_AMOUNT, 
							crit: false,
							effectType: 'radiation'
						});
						
						console.log(`[MININUKE] Player health after damage: ${player.health}`);
					}
				});
			}
		}
	});
} 
}
