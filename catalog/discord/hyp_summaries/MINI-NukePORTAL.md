# MINI-NukePORTAL.hyp

## Metadata
- **Author**: ~/drdoge.eth
- **Channel**: #💻│developers
- **Date**: 2025-04-04
- **Size**: 5,719,445 bytes

## Blueprint
- **Name**: MINI-NukePORTAL
- **Version**: 129
- **Model**: `asset://4c5af0689f63d2818c3d79b7905832a12dc39823f0f992e6ba41150782a334f6.glb`
- **Script**: `asset://eb223fab00c46dcb8a4c55ec1768ceea98be529a5796ed6f9a48fb97880c4a18.js`

## Props
- `refDistance`: int = `3`
- `maxDistance`: int = `20`
- `rolloffFactor`: float = `1.5`
- `distanceModel`: str = `inverse`
- `explosionDuration`: int = `60`
- `explosionRadius`: int = `30`
- `explosionAudio`: audio → `asset://66e46f31bcdd04463c6b2eecfb3098a49c8738603a9384b26d095f6d7ddf9d9d.mp3`
- `radiationAudio`: audio → `asset://13dfaca31a65bfe0cad62febf418b2f8e25f15a4e046992f4ff4ca40749069d8.mp3`
- `explosionSfx`: audio → `asset://66e46f31bcdd04463c6b2eecfb3098a49c8738603a9384b26d095f6d7ddf9d9d.mp3`
- `newTab`: bool = `False`
- `portalDelay`: int = `50`
- `worldUrl`: str = `https://nuked.tattedalien.club/`

## Assets
- `[model]` 4c5af0689f63d2818c3d79b7905832a12dc39823f0f992e6ba41150782a334f6.glb (5,286,816 bytes)
- `[script]` eb223fab00c46dcb8a4c55ec1768ceea98be529a5796ed6f9a48fb97880c4a18.js (48,891 bytes)
- `[audio]` 66e46f31bcdd04463c6b2eecfb3098a49c8738603a9384b26d095f6d7ddf9d9d.mp3 (53,080 bytes)
- `[audio]` 13dfaca31a65bfe0cad62febf418b2f8e25f15a4e046992f4ff4ca40749069d8.mp3 (275,828 bytes)
- `[audio]` 66e46f31bcdd04463c6b2eecfb3098a49c8738603a9384b26d095f6d7ddf9d9d.mp3 (53,080 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.control()`, `app.create()`, `app.get()`, `app.on()`, `app.send()`, `app.set()`
**World Methods**: `world.emit()`, `world.getPlayer()`, `world.getPlayers()`, `world.getTime()`, `world.getTimestamp()`, `world.open()`
**Events Listened**: `nuke:detonate`, `nuke:request-detonation`, `update`
**Events Emitted**: `hyperfy:dmg`
**Nodes Created**: `action`, `audio`, `collider`, `rigidbody`, `ui`, `uitext`

## Keywords (for Discord search)
a0ff14, absolute, action, activated, activation, active, actual, adding, additional, adjust, after, again, aggressive, allow, already, also, ambience, amount, angle, animation

## Script Source
```javascript
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
	PARTICLE_BURST_COUNT: 25,     // Reduced f

// ... truncated ...
```

---
*Extracted from MINI-NukePORTAL.hyp. Attachment ID: 1357785271701078036*