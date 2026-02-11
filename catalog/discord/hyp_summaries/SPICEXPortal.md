# SPICEXPortal.hyp

## Metadata
- **Author**: .hyp shaman
- **Channel**: #🎨│showcase
- **Date**: 2025-03-26
- **Size**: 1,429,639 bytes

## Blueprint
- **Name**: SPICEX Portal
- **Version**: 44
- **Model**: `asset://2a168c02e8d3d909b13998a7db6d72494645ec01bce68e2d6d0c4bf1f76be0a7.glb`
- **Script**: `asset://a66ce1117bfa9a9b451e8904e515c817ad398249029217db03ad91a1f111f7a5.js`

## Props
- `portalName`: str = `Google`
- `subtitle`: str = `You can just go places`
- `newTab`: bool = `True`
- `worldUrl`: str = `https://google.com`
- `volume`: float = `0.6`
- `audioType`: str = `music`
- `loop`: bool = `False`
- `spatial`: bool = `True`
- `distanceModel`: str = `inverse`
- `refDistance`: int = `1`
- `maxDistance`: int = `40`
- `rolloffFactor`: int = `3`
- `coneInnerAngle`: int = `360`
- `coneOuterAngle`: int = `360`
- `coneOuterGain`: int = `0`
- `audio`: audio → `asset://629b4fd071c188da9676eb694b24f2e971a3048418827a43ca75a90a7b47e849.mp3`

## Assets
- `[model]` 2a168c02e8d3d909b13998a7db6d72494645ec01bce68e2d6d0c4bf1f76be0a7.glb (1,317,044 bytes)
- `[script]` a66ce1117bfa9a9b451e8904e515c817ad398249029217db03ad91a1f111f7a5.js (12,377 bytes)
- `[texture]` 26d7d37ed758b9f9a31bd8cfdfa846313fe5be3d842893de017fc17b1687493f.jpg (4,106 bytes)
- `[audio]` 629b4fd071c188da9676eb694b24f2e971a3048418827a43ca75a90a7b47e849.mp3 (94,560 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.create()`, `app.get()`, `app.on()`
**World Methods**: `world.getPlayer()`, `world.getTime()`, `world.open()`
**Events Listened**: `update`
**Nodes Created**: `audio`, `collider`, `mesh`, `rigidbody`, `ui`, `uitext`

## Keywords (for Discord search)
added, alignItems, angle, area, around, audio, audioSection, audioType, axis, background, backgroundColor, between, billboard, blue, body, borderRadius, bright, burst, bursts, center

## Script Source
```javascript
const portal = app.get('SpiceXPortal')
const rim = app.get('Rim')
const particle = app.get('Particle')

app.configure([
	{
		type: 'section',
		key: 'general',
		label: 'Portal Settings'
	},
	{
		key: 'portalName',
		type: 'text',
		label: 'Warp Destination',
		initial: 'Google',
	},
	{
		key: 'subtitle',
		type: 'text',
		label: 'Warp Description',
		initial: 'You can just go places',
	},
	{
		key: 'worldUrl',
		type: 'text',
		label: 'Destination World URL',
		placeholder: 'https://google.com',
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
		type: 'section',
		key: 'audioSection',
		label: 'Audio Settings'
	},
	{
		type: 'file',
		key: 'audio',
		kind: 'audio',
		label: 'Audio File'
	},
	{
		type: 'range',
		key: 'volume',
		label: 'Volume',
		min: 0,
		max: 1,
		step: 0.1,
		initial: 0.6
	},
	{
		type: 'dropdown',
		key: 'audioType',
		label: 'Audio Type',
		options: [
			{ label: 'Music', value: 'music' },
			{ label: 'Sound Effect', value: 'sfx' }
		],
		initial: 'music'
	},
	{
		type: 'switch',
		key: 'loop',
		label: 'Loop Audio',
		options: [
			{ label: 'Loop On', value: true },
			{ label: 'Loop Off', value: false }
		],
		initial: false
	},
	{
		type: 'checkbox',
		key: 'spatial',
		label: 'Spatial Audio',
		initial: true
	},
	{
		type: 'section',
		key: 'spatialSection',
		label: 'Spatial Audio Settings'
	},
	{
		type: 'dropdown',
		key: 'distanceModel',
		label: 'Distance Model',
		options: [
			{ label: 'Linear', value: 'linear' },
			{ label: 'Inverse', value: 'inverse' },
			{ label: 'Exponential', value: 'exponential' }
		],
		initial: 'inverse'
	},
	{
		type: 'number',
		key: 'refDistance',
		label: 'Reference Distance',
		min: 0,
		max: 10,
		step: 0.1,
		initial: 1
	},
	{
		type: 'number',
		key: 'maxDistance',
		label: 'Maximum Distance',
		min: 1,
		max: 100,
		step: 1,
		initial: 40
	},
	{
		type: 'number',
		key: 'rolloffFactor',
		label: 'Rolloff Factor',
		min: 0,
		max: 10,
		step: 0.1,
		initial: 3
	},
	{
		type: 'section',
		key: 'coneSection',
		label: 'Sound Cone Settings'
	},
	{
		type: 'number',
		key: 'coneInnerAngle',
		label: 'Cone Inner Angle',
		min: 0,
		max: 360,
		step: 1,
		initial: 360
	},
	{
		type: 'number',
		key: 'coneOuterAngle',
		label: 'Cone Outer Angle',
		min: 0,
		max: 360,
		step: 1,
		initial: 360
	},
	{
		type: 'range',
		key: 'coneOuterGain',
		label: 'Cone Outer Gain',
		min: 0,
		max: 1,
		step: 0.1,
		initial: 0
	}
])

const audio = app.create('audio', {
	src: props.audio?.url,
	volume: props.volume || 0.6,
	group: props.audioType || 'music',
	loop: props.loop || false,
	spatial: props.spatial || true,
	distanceModel: props.distanceModel || 'inverse',
	refDistance: props.refDistance || 1,
	maxDistance: props.maxDistance || 40,
	rolloffFactor: props.rolloffFactor || 3,
	coneInnerAngle: props.coneInnerAngle || 360,
	coneOuterAngle: props.coneOuterAngle || 360,
	coneOuterGain: props.coneOuterGain || 0
})

// Add a static rigidbody and trigger collider to the portal
const portalBody = app.create('rigidbody')
portalBody.type = 'static'
portal.add(portalBody)
portal.add(audio)

const portalCollider = app.create('collider')
portalCollider.type = 'box'
portalCollider.setSize(2, 3, 1) // Adjust size as needed for your portal
portalCollider.trigger = true
portalBody.add(portalCollider)

// Create our own particle template instead of looking for an existing one
let particleTemplate;
try {
	// Try to get the template first in case it exists
	particleTemplate = particle

	// If not found, create our own template
	if (!particleTemplate) {
		console.log('[PORTAL] Creating custom portal particle template');
		particleTemplate = app.create('mesh');

		// Set template properties
		particleTemplate.scale.set(0.1, 0.1, 0.1);

		// Create material for the template - using a bright blue portal color
		const material = {
			emissive: '#00ffff',
			emissiveIntensity: 3,
			transparent: true,
			opacity: 0.7
		};
		particleTemplate.material = material;

		// Set an ID for reference
		particleTemplate.id = 'PortalParticle';
	}

	// Hide the template
	particleTemplate.visible = false;
} catch (error) {
	console.error('[PORTAL] Error creating particle template:', error);

	// Create a fallback simple template
	particleTemplate = app.create('mesh');
	particleTemplate.scale.set(0.1, 0.1, 0.1);
	particleTemplate.visible = false;
}

// Configuration for the particle system
const CONFIG = {
	MAX_PARTICLES: 400,
	SPAWN_RATE: 60,
	LIFETIME: 0.8, // shorter lifetime for more chaos
	MIN_SPEED: 3, // faster for more energy
	MAX_SPEED: 6,
	MIN_SCALE: 0.05,
	MAX_SCALE: 0.15,
	SPAWN_RADIUS: 0.3, // slightly larger spawn area
	GRAVITY: 0,
	BURST_INTERVAL: 0.02, // more frequent bursts
	PARTICLES_PER_BURST: 3, // fewer per burst but more frequent
	TURBULENCE: 1, // more randomness
	RIM_SPIN_SPEED: 1,
	Z_SPEED_MIN: 2, // Minimum Z velocity (negative for outward)
	Z_SPEED_MAX: -0.5 // Maximum Z velocity (smaller negative for variation)
}

// Portal Configuration
const PORTAL_CONFIG = {
	UI: {
		width: 200,
		height: 80,
		yOffset: 2,
		fontSize: {
			title: 20,
			subtitle: 16
		},
		colors: {
			title: '#ffffff',
			subtitle: '#33ff00',
			background: 'rgba(0, 15, 30, 0.85)' // Dark blue-ish background with high opacity
		},
		style: {
			padding: 15,
			borderRadius: 12,
			gap: 5 // Space between title and subtitle
		}
	}
};

if (world.isClient) {
	// Create UI container
	const ui = app.create('ui', {
		width: PORTAL_CONFIG.UI.width,
		height: PORTAL_CONFIG.UI.height,
		backgroundColor: 'transparent'
	})
	ui.billboard = 'y'
	ui.position.y = PORTAL_CONFIG.UI.yOffset
	ui.backgroundColor = PORTAL_CONFIG.UI.colors.background
	ui.borderRadius = PORTAL_CONFIG.UI.style.borderRadius
	ui.padding = PORTAL_CONFIG.UI.style.padding
	ui.gap = PORTAL_CONFIG.UI.style.gap
	ui.justifyContent = 'center'
	ui.alignItems = 'center'
	ui.position.x = -2
	ui.position.z = 3


	// Create portal name label
	const label = app.create('uitext')
	label.value = props.portalName
	label.fontSize = PORTAL_CONFIG.UI.fontSize.title
	label.color = PORTAL_CONFIG.UI.colors.title
	label.textAlign = 'center'

	// Create subtitle label
	const subtitleLabel = app.create('uitext')
	subtitleLabel.value = props.subtitle
	subtitleLabel.fontSize = PORTAL_CONFIG.UI.fontSize.subtitle
	subtitleLabel.color = PORTAL_CONFIG.UI.colors.subtitle
	subtitleLabel.textAlign = 'center'
	subtitleLabel.position.y = -25

	ui.add(label)
	ui.add(subtitleLabel)
	portal.add(ui)

	// Particle system state
	const particles = []
	let lastSpawnTime = 0
	let isPortalActive = false

	// Create a new particle
	function spawnParticle() {
		if (particles.length >= CONFIG.MAX_PARTICLES) return

		const particle = particleTemplate.clone()
		particle.visible = true

		// Random position within spawn radius
		const angle = Math.random() * Math.PI * 2
		const radius = Math.random() * CONFIG.SPAWN_RADIUS

		particle.position.set(
			Math.cos(angle) * radius,
			Math.sin(angle) * radius,
			0
		)

		// Random direction for true entropy
		const randomAngle = Math.random() * Math.PI * 2
		const speed = CONFIG.MIN_SPEED + Math.random() * (CONFIG.MAX_SPEED - CONFIG.MIN_SPEED)

		// Random Z speed between min and max
		const zSpeed = CONFIG.Z_SPEED_MIN + Math.random() * (CONFIG.Z_SPEED_MAX - CONFIG.Z_SPEED_MIN)

		// Velocity in random direction with extra chaos and controlled Z movement
		particle.velocity = {
			x: Math.cos(randomAngle) * speed + (Math.random() - 0.5) * CONFIG.TURBU

// ... truncated ...
```

---
*Extracted from SPICEXPortal.hyp. Attachment ID: 1354289315990995035*