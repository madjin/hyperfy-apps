export default function main(world, app, fetch, props, setTimeout) {
/**
 * Confetti Popper - Hyperfy App
 * Creates confetti particles that spawn when the popper mesh is clicked
 * 
 * @author Gert-Jan Akerboom
 * @license MIT
 */

// Particle size constants
const MIN_PARTICLE_SIZE = 0.01
const MAX_PARTICLE_SIZE = 0.1

// Configure the app to accept confetti particle images and audio
app.configure([
    {
      key: 'confettiImage1',
      type: 'file',
      kind: 'texture',
      label: 'Confetti Image 1'
    },
    {
      key: 'confettiImage2',
      type: 'file',
      kind: 'texture',
      label: 'Confetti Image 2'
    },
    {
      key: 'confettiImage3',
      type: 'file',
      kind: 'texture',
      label: 'Confetti Image 3'
    },
    {
      key: 'confettiImage4',
      type: 'file',
      kind: 'texture',
      label: 'Confetti Image 4'
    },
    {
      key: 'confettiImage5',
      type: 'file',
      kind: 'texture',
      label: 'Confetti Image 5'
    },
    {
      key: 'confettiImage6',
      type: 'file',
      kind: 'texture',
      label: 'Confetti Image 6'
    },
    {
      key: 'confettiImage7',
      type: 'file',
      kind: 'texture',
      label: 'Confetti Image 7'
    },
    {
      key: 'confettiImage8',
      type: 'file',
      kind: 'texture',
      label: 'Confetti Image 8'
    },
    {
      key: 'clickSound',
      type: 'file',
      kind: 'audio',
      label: 'Click Sound'
    },
    {
      key: 'explosionSound',
      type: 'file',
      kind: 'audio',
      label: 'Explosion Sound'
    }
])

// Initialize app state
if (!app.state.confettiActive) {
    app.state.confettiActive = false
}

// Force reset confetti active state on startup
if (world.isClient) {
    app.state.confettiActive = false
}

if (world.isServer) {
    app.state.confettiActive = false
    app.send('setConfettiActive', false)
}

// Function to get a random confetti image from the uploaded ones
function getRandomConfettiImage() {
    const confettiImages = [
        props.confettiImage1?.url,
        props.confettiImage2?.url,
        props.confettiImage3?.url,
        props.confettiImage4?.url,
        props.confettiImage5?.url,
        props.confettiImage6?.url,
        props.confettiImage7?.url,
        props.confettiImage8?.url
    ].filter(url => url)
    
    if (confettiImages.length === 0) {
        return '/particle.png'
    }
    
    return confettiImages[Math.floor(Math.random() * confettiImages.length)]
}

// Function to get random number of confetti images based on percentages
function getRandomConfettiImageCount() {
    const rand = Math.random() * 100 // 0-100
    
    if (rand < 50) {
        return 1 // 50% chance: 1 image
    } else if (rand < 80) {
        return 2 // 30% chance: 2 images
    } else if (rand < 95) {
        return 4 // 15% chance: 4 images
    } else {
        return 8 // 5% chance: all 8 images
    }
}

// Function to get random confetti images based on count
function getRandomConfettiImages(count) {
    const allImages = [
        props.confettiImage1?.url,
        props.confettiImage2?.url,
        props.confettiImage3?.url,
        props.confettiImage4?.url,
        props.confettiImage5?.url,
        props.confettiImage6?.url,
        props.confettiImage7?.url,
        props.confettiImage8?.url
    ].filter(url => url)
    
    if (allImages.length === 0) {
        return ['/particle.png']
    }
    
    // Shuffle and take the first 'count' images
    const shuffled = [...allImages].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, shuffled.length))
}

// Fire function (client-side)
function fireConfetti() {
    if (app.state.confettiActive) {
        return
    }
    
    if (world.isClient) {
        // Play click sound
        if (props.clickSound?.url) {
            const clickAudio = app.create('audio', {
                src: props.clickSound.url,
                volume: 1.0,
                group: 'sfx',
                spatial: true,
                maxDistance: 20
            })
            world.add(clickAudio)
            clickAudio.play()
        }
        
        app.send('fire', {})
    }
}

// Get the popper mesh
let popperMesh = null
let isHovering = false

if (world.isClient) {
    popperMesh = app.get('popper')
    
    if (popperMesh) {
        // Break the material link to make this instance independent
        popperMesh.linked = false
        
        popperMesh.onPointerDown = () => {
            fireConfetti()
        }
        
        popperMesh.onPointerEnter = () => {
            popperMesh.cursor = 'pointer'
            isHovering = true
            // Add strong glow when hovering (only if confetti is not active)
            if (popperMesh.material && popperMesh.material.emissiveIntensity !== undefined && !app.state.confettiActive) {
                popperMesh.material.emissiveIntensity = 4.0
            }
        }
        
        popperMesh.onPointerLeave = () => {
            popperMesh.cursor = 'default'
            isHovering = false
            // Remove glow when leaving (only if confetti is not active)
            if (popperMesh.material && popperMesh.material.emissiveIntensity !== undefined && !app.state.confettiActive) {
                popperMesh.material.emissiveIntensity = 0.0
            }
        }
    }
}

if (world.isClient) {
    let currentParticles = null
    let particleTimer = 0
    let particleTravel = 0
    let hasExploded = false
    let isDestroyed = false
    const v1 = new Vector3()
    
    // Listen for global state changes from server
    app.on('setConfettiActive', (active) => {
        if (isDestroyed) return
        
        app.state.confettiActive = active
        if (popperMesh && popperMesh.material) {
            if (active) {
                // Make popper very dark when confetti is active (cooldown state)
                popperMesh.material.emissiveIntensity = -2.0
            } else {
                // Restore appropriate state when confetti is complete
                if (isHovering) {
                    // If hovering, show hover glow
                    popperMesh.material.emissiveIntensity = 4.0
                } else {
                    // If not hovering, restore to no glow (normal state)
                    popperMesh.material.emissiveIntensity = 0.0
                }
            }
        }
    })
    
    app.on('spawnConfetti', () => {
        if (isDestroyed) return
        
        // Get random number of images to use
        const imageCount = getRandomConfettiImageCount()
        const selectedImages = getRandomConfettiImages(imageCount)
        
        // Get random total particle count between 150 and 350
        const totalParticles = Math.floor(Math.random() * (350 - 150 + 1)) + 150
        
        // Calculate particles per image
        const particlesPerImage = Math.floor(totalParticles / selectedImages.length)
        
        // Create particle systems for each image
        const particleSystems = []
        
        selectedImages.forEach((imageUrl, index) => {
            const particleCount = index === selectedImages.length - 1 
                ? totalParticles - (particlesPerImage * (selectedImages.length - 1))
                : particlesPerImage
            
            // Create two particle systems for each image - one clockwise, one counterclockwise
            const particlesPerDirection = Math.floor(particleCount / 2)
            
            // Clockwise rotation system
            const clockwiseSystem = app.create('particles', {
                image: imageUrl,
                shape: ['sphere', 0.1, 1],
                direction: 0,
                rate: 0,
                max: particlesPerDirection,
                bursts: [
                    { time: 0, count: particlesPerDirection }
                ],
                size: `${MIN_PARTICLE_SIZE}~${MAX_PARTICLE_SIZE}`,
                alphaOverLife: '0,1|0.8,1|1,0',
                emissive: '1',
                speed: '0',
                force: new Vector3(0, 0, 0),
                life: '20',
                drag: 1,
                rotate: '0~360',
                rotateOverLife: '0,720~1440|0.3,1440~2160|0.6,2160~2880|1,2880~3600',
                space: 'local'
            })
            
            // Counterclockwise rotation system
            const counterclockwiseSystem = app.create('particles', {
                image: imageUrl,
                shape: ['sphere', 0.1, 1],
                direction: 0,
                rate: 0,
                max: particlesPerDirection,
                bursts: [
                    { time: 0, count: particlesPerDirection }
                ],
                size: `${MIN_PARTICLE_SIZE}~${MAX_PARTICLE_SIZE}`,
                alphaOverLife: '0,1|0.8,1|1,0',
                emissive: '1',
                speed: '0',
                force: new Vector3(0, 0, 0),
                life: '20',
                drag: 1,
                rotate: '0~360',
                rotateOverLife: '0,-720~-1440|0.3,-1440~-2160|0.6,-2160~-2880|1,-2880~-3600',
                space: 'local'
            })
            
            // Position both systems at app position
            clockwiseSystem.position.copy(app.position)
            counterclockwiseSystem.position.copy(app.position)
            world.add(clockwiseSystem)
            world.add(counterclockwiseSystem)
            particleSystems.push(clockwiseSystem, counterclockwiseSystem)
        })
        
        // Store all particle systems
        currentParticles = particleSystems
        
        // Start timer and reset travel
        particleTimer = 0
        particleTravel = 0
        hasExploded = false
    })
    
    app.on('update', delta => {
        if (isDestroyed || !currentParticles) return
        
        particleTimer += delta
        
        if (!hasExploded) {
            // Move particles upward with easing - fast start, slow end
            const targetHeight = 2.0
            const totalTime = 0.4
            const progress = particleTimer / totalTime
            
            // Easing function: fast start, slow end (ease-out)
            const easedProgress = 1 - Math.pow(1 - progress, 3)
            
            // Calculate target position based on eased progress
            const targetY = app.position.y + (targetHeight * easedProgress)
            
            // Move all particle systems to target position
            currentParticles.forEach(particleSystem => {
                if (particleSystem && particleSystem.position) {
                    particleSystem.position.y = targetY
                }
            })
            particleTravel = targetHeight * easedProgress
            
            // Check if we've reached the explosion height
            if (particleTravel >= 2.0) {
                // Play explosion sound
                if (props.explosionSound?.url) {
                    const explosionAudio = app.create('audio', {
                        src: props.explosionSound.url,
                        volume: 1.0,
                        group: 'sfx',
                        spatial: true,
                        maxDistance: 30
                    })
                    world.add(explosionAudio)
                    explosionAudio.play()
                }
                
                // Trigger explosion - paper/foil confetti physics
                currentParticles.forEach(particleSystem => {
                    if (particleSystem) {
                        particleSystem.speed = '1~3'
                        particleSystem.force = new Vector3(0, -4.0, 0)
                        particleSystem.drag = 0.85
                        particleSystem.life = '2'
                        particleSystem.alphaOverLife = '0,1|0.8,0.9|1,0'
                        particleSystem.space = 'world'
                    }
                })
                hasExploded = true
            }
        } else {
            // Explosion phase - let particles live their natural life
            if (particleTimer >= 2.4) {
                // Remove all particle systems
                currentParticles.forEach(particleSystem => {
                    if (particleSystem) {
                        world.remove(particleSystem)
                    }
                })
                currentParticles = null
                
                // Only send if not destroyed
                if (!isDestroyed) {
                    try {
                        app.send('confettiComplete', {})
                    } catch (error) {
                        // Silently handle WebSocket errors
                    }
                }
            }
        }
    })
    
    // Cleanup function to handle app destruction
    app.on('destroy', () => {
        isDestroyed = true
        
        // Clean up any remaining particles
        if (currentParticles) {
            currentParticles.forEach(particleSystem => {
                if (particleSystem) {
                    world.remove(particleSystem)
                }
            })
            currentParticles = null
        }
        
        // Remove event listeners
        if (popperMesh) {
            popperMesh.onPointerDown = null
            popperMesh.onPointerEnter = null
            popperMesh.onPointerLeave = null
        }
    })
}

if (world.isServer) {
    let isDestroyed = false
    
    app.on('fire', () => {
        if (isDestroyed) return
        
        app.state.confettiActive = true
        try {
            app.send('setConfettiActive', true)
            app.send('spawnConfetti', {})
        } catch (error) {
            // Silently handle WebSocket errors
        }
    })
    
    app.on('confettiComplete', () => {
        if (isDestroyed) return
        
        app.state.confettiActive = false
        try {
            app.send('setConfettiActive', false)
        } catch (error) {
            // Silently handle WebSocket errors
        }
    })
    
    // Cleanup function to handle app destruction
    app.on('destroy', () => {
        isDestroyed = true
    })
}

}
