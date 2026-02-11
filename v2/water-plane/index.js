export default function main(world, app, fetch, props, setTimeout) {
// Water surface simulation with waves, spray, and fish splash effects
// Uses a grid of segments for the water surface with dynamic wave patterns
// and particle systems for spray and splash effects

const CONFIG = {
    // Surface grid configuration
    GRID_SIZE: 20,          // Number of segments per side in water grid
    SEGMENT_SIZE: 5.0,      // Size of each water segment in world units
    SURFACE_HEIGHT: 1.0,    // Base water level height
    
    // Wave animation parameters
    WAVE_SPEED: 0.8,        // Base speed of wave movement
    WAVE_HEIGHT: 0.8,       // Maximum wave peak height
    WAVE_ROTATION: 0.1,    // Wave tilt intensity
    WAVE_FREQUENCY: 0.8,    // Wave pattern frequency
    
    // Water spray particle system
    SPRAY_RATE: 10,         // Number of spray particles emitted per second
    SPRAY_LIFETIME: 2.0,    // Duration of spray particles in seconds
    SPRAY_HEIGHT: 1.0,      // Maximum height of spray particles

    // Fish splash effect parameters
    FISH_SPLASH_INTERVAL: [1, 1],  // Time range between fish splashes
    FISH_SPLASH_PARTICLES: 50,      // Number of particles in each splash
    FISH_SPLASH_HEIGHT: 2.0,        // Maximum splash particle height
    FISH_SPLASH_SPREAD: 2.0,        // Splash particle dispersion radius
    FISH_SPLASH_LIFETIME: 1.5,      // Duration of splash particles
    FISH_SPLASH_MIN_SPEED: 1.0,     // Minimum particle velocity
    FISH_SPLASH_MAX_SPEED: 4.0,     // Maximum particle velocity

    // Player movement trail configuration
    PLAYER_TRAIL_RATE: 50,          // Increased number of particles per second
    PLAYER_TRAIL_LIFETIME: 0.8,     // Shorter lifetime for quicker fading
    PLAYER_TRAIL_HEIGHT: 0.1,       // Much lower height to stay at surface
    PLAYER_TRAIL_SPREAD: 0.05,      // Slightly wider spread for more coverage
    PLAYER_TRAIL_MIN_SPEED: 0.2,    // Slower movement for surface-like effect
    PLAYER_TRAIL_MAX_SPEED: 0.8,    // Slower max speed
    PLAYER_TRAIL_SCALE: 0.2,        // Smaller particle size
    PLAYER_TRAIL_PARTICLES: 3       // Number of particles per emission
}

if (world.isClient) {
    // Initialize required template objects
    const waterSegment = app.get('WaterPlane')    
    const sprayParticle = app.get('WaterSpray')   
    
    if (!waterSegment || !sprayParticle) {
        console.error('Required templates not found')
        return
    }
    
    // Hide original templates
    waterSegment.visible = false
    sprayParticle.visible = false
    
    // Initialize water surface grid
    const segments = []
    
    for (let z = 0; z < CONFIG.GRID_SIZE; z++) {
        for (let x = 0; x < CONFIG.GRID_SIZE; x++) {
            const segment = waterSegment.clone(true)
            segment.visible = true
            
            // Calculate grid position
            const posX = (x - CONFIG.GRID_SIZE/2) * CONFIG.SEGMENT_SIZE
            const posZ = (z - CONFIG.GRID_SIZE/2) * CONFIG.SEGMENT_SIZE
            segment.position.set(
                posX,
                CONFIG.SURFACE_HEIGHT,
                posZ
            )
            
            // Add wave phase offset based on distance from center
            const distFromCenter = Math.sqrt(posX * posX + posZ * posZ)
            segment.timeOffset = num(0, Math.PI * 2, 2) + distFromCenter * CONFIG.WAVE_FREQUENCY
            
            segments.push(segment)
            world.add(segment)
        }
    }
    
    // Particle system state
    const particles = []
    let timeSinceLastSpray = 0
    
    // Fish splash timing state
    let timeSinceLastFishSplash = 0
    let nextFishSplashIn = num(CONFIG.FISH_SPLASH_INTERVAL[0], CONFIG.FISH_SPLASH_INTERVAL[1], 2)
    
    // Player trail timing state
    let timeSinceLastTrail = 0
    let lastPlayerPos = null
    
    app.on('update', (delta) => {
        // Get current player position
        const player = world.getPlayer()
        const playerPos = player?.position
        
        // Update water surface wave animation
        for (const segment of segments) {
            const time = Date.now() / 1000
            const posX = segment.position.x
            const posZ = segment.position.z
            
            // Combine multiple wave patterns for natural water movement
            const wave1 = Math.sin(time * CONFIG.WAVE_SPEED + segment.timeOffset)
            const wave2 = Math.sin(time * CONFIG.WAVE_SPEED * 0.7 + posX * CONFIG.WAVE_FREQUENCY)
            const wave3 = Math.sin(time * CONFIG.WAVE_SPEED * 0.5 + posZ * CONFIG.WAVE_FREQUENCY)
            const wave4 = Math.sin(time * CONFIG.WAVE_SPEED * 0.9 + (posX + posZ) * CONFIG.WAVE_FREQUENCY * 0.5)
            
            const height = (wave1 + wave2 + wave3 + wave4) * CONFIG.WAVE_HEIGHT / 4
            segment.position.y = CONFIG.SURFACE_HEIGHT + height
            
            // Apply wave-based rotation
            segment.rotation.z = (wave2 - wave1) * CONFIG.WAVE_ROTATION
            segment.rotation.x = (wave3 - wave1) * CONFIG.WAVE_ROTATION
        }
        
        // Generate ambient water spray
        timeSinceLastSpray += delta
        if (timeSinceLastSpray >= 1 / CONFIG.SPRAY_RATE) {
            timeSinceLastSpray = 0
            
            const segment = segments[Math.floor(num(0, segments.length - 1, 0))]
            const spray = sprayParticle.clone(true)
            spray.visible = true
            
            spray.position.copy(segment.position)
            spray.position.y += 0.1
            
            const angle = num(0, Math.PI * 2, 2)
            spray.velocity = {
                x: Math.cos(angle) * 0.3,
                y: CONFIG.SPRAY_HEIGHT,
                z: Math.sin(angle) * 0.3
            }
            
            spray.lifetime = 0
            
            particles.push(spray)
            world.add(spray)
        }

        // Generate fish splash effects
        timeSinceLastFishSplash += delta
        if (timeSinceLastFishSplash >= nextFishSplashIn) {
            timeSinceLastFishSplash = 0
            nextFishSplashIn = num(CONFIG.FISH_SPLASH_INTERVAL[0], CONFIG.FISH_SPLASH_INTERVAL[1], 2)

            const segment = segments[Math.floor(num(0, segments.length - 1, 0))]
            
            for (let i = 0; i < CONFIG.FISH_SPLASH_PARTICLES; i++) {
                const splash = sprayParticle.clone(true)
                splash.visible = true
                
                splash.position.copy(segment.position)
                splash.position.x += num(-0.3, 0.3, 2)
                splash.position.z += num(-0.3, 0.3, 2)
                
                const angle = num(0, Math.PI * 2, 2)
                const speed = num(CONFIG.FISH_SPLASH_MIN_SPEED, CONFIG.FISH_SPLASH_MAX_SPEED, 2)
                const spreadX = num(-CONFIG.FISH_SPLASH_SPREAD, CONFIG.FISH_SPLASH_SPREAD, 2)
                const spreadZ = num(-CONFIG.FISH_SPLASH_SPREAD, CONFIG.FISH_SPLASH_SPREAD, 2)
                
                splash.velocity = {
                    x: Math.cos(angle) * speed + spreadX,
                    y: CONFIG.FISH_SPLASH_HEIGHT + num(-0.5, 0.5, 2),
                    z: Math.sin(angle) * speed + spreadZ
                }
                
                splash.lifetime = 0
                splash.maxLifetime = CONFIG.FISH_SPLASH_LIFETIME
                
                particles.push(splash)
                world.add(splash)
            }
        }
        
        // Generate player movement trail
        if (playerPos) {
            if (!lastPlayerPos) {
                lastPlayerPos = playerPos.clone()
            }
            
            // Check if player has moved
            const moveDistance = lastPlayerPos.distanceTo(playerPos)
            if (moveDistance > 0.1) { // Only emit if moved more than threshold
                timeSinceLastTrail += delta
                if (timeSinceLastTrail >= 1 / CONFIG.PLAYER_TRAIL_RATE) {
                    timeSinceLastTrail = 0
                    
                    // Create multiple trail particles per emission
                    for (let i = 0; i < CONFIG.PLAYER_TRAIL_PARTICLES; i++) {
                        const trail = sprayParticle.clone(true)
                        trail.visible = true
                        trail.scale.multiplyScalar(CONFIG.PLAYER_TRAIL_SCALE)
                        
                        // Position at player's feet with slight height variation
                        trail.position.copy(playerPos)
                        trail.position.y = CONFIG.SURFACE_HEIGHT + num(0.02, 0.08, 2)
                        
                        // Add spread based on movement direction
                        const moveDir = playerPos.clone().sub(lastPlayerPos).normalize()
                        const perpX = -moveDir.z
                        const perpZ = moveDir.x
                        
                        const spreadDist = num(-CONFIG.PLAYER_TRAIL_SPREAD, CONFIG.PLAYER_TRAIL_SPREAD, 2)
                        trail.position.x += moveDir.x * num(-0.2, 0.2, 2) + perpX * spreadDist
                        trail.position.z += moveDir.z * num(-0.2, 0.2, 2) + perpZ * spreadDist
                        
                        // Velocity follows movement direction with slight variation
                        const speed = num(CONFIG.PLAYER_TRAIL_MIN_SPEED, CONFIG.PLAYER_TRAIL_MAX_SPEED, 2)
                        trail.velocity = {
                            x: moveDir.x * speed + num(-0.1, 0.1, 2),
                            y: CONFIG.PLAYER_TRAIL_HEIGHT,
                            z: moveDir.z * speed + num(-0.1, 0.1, 2)
                        }
                        
                        trail.lifetime = 0
                        trail.maxLifetime = CONFIG.PLAYER_TRAIL_LIFETIME
                        
                        particles.push(trail)
                        world.add(trail)
                    }
                }
                
                lastPlayerPos.copy(playerPos)
            }
        }
        
        // Update and expire particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const spray = particles[i]
            spray.lifetime += delta
            
            const maxLifetime = spray.maxLifetime || CONFIG.SPRAY_LIFETIME
            
            if (spray.lifetime >= maxLifetime) {
                world.remove(spray)
                particles.splice(i, 1)
            } else {
                spray.position.x += spray.velocity.x * delta
                spray.position.y += spray.velocity.y * delta
                spray.position.z += spray.velocity.z * delta
                
                // Reduced gravity effect for trail particles to keep them more at surface level
                const gravityScale = spray.maxLifetime === CONFIG.PLAYER_TRAIL_LIFETIME ? 2.0 : 9.8
                spray.velocity.y += -gravityScale * delta
                
                // Keep trail particles from sinking below surface
                if (spray.maxLifetime === CONFIG.PLAYER_TRAIL_LIFETIME && 
                    spray.position.y < CONFIG.SURFACE_HEIGHT) {
                    spray.position.y = CONFIG.SURFACE_HEIGHT
                    spray.velocity.y = 0
                }
                
                spray.opacity = 1 - (spray.lifetime / maxLifetime)
            }
        }
    })
}
}
