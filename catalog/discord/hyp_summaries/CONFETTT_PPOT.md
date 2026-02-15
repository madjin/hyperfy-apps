# CONFETTT_PPOT.hyp

## Metadata
- **Author**: Gert-Jan Akerboom
- **Channel**: #🎨│showcase
- **Date**: 2025-08-05
- **Size**: 204,962 bytes

## Discord Context
> Confetti Popper

## Blueprint
- **Name**: CONFETTT PPOT
- **Version**: 1
- **Model**: `asset://d91f5a14dce54f679b6a2c982da3a9cfefcddc0e0a48e55357519c18a8f993a6.glb`
- **Script**: `asset://3202ca24272d1127354e28a60f99eda8ff02dbaf573101417035783fa1e895da.js`

## Props
- `confettiImage1`: texture → `asset://c68d78ac09493fb61732fbde6cf6bcf2083ebb302404273d5dba06df43b002ed.png`
- `confettiImage2`: texture → `asset://09c8bc8c7a5316301fdec7523ff751efb67458eaaeea7eeeee2495021ec9bdc7.png`
- `confettiImage3`: texture → `asset://19ffdd3a8a7591313f1fd259f75c74b08a3e2cb26154db5ad9847587c74ebccc.png`
- `confettiImage4`: texture → `asset://7c6a060a9a38aa57601b6f467e7d61c7493462431b570fa3276a066327aabf46.png`
- `confettiImage5`: texture → `asset://4078a72786c33dced79346816eaeac29d223d0c9c9667624c521aa55274f8891.png`
- `confettiImage6`: texture → `asset://8fbf6b897cda628db151ab177d3497f1a9b84d5800aaa47d4e0843f0db7f0bfc.png`
- `confettiImage7`: texture → `asset://418abad39699f7a83bf12e96449ee8065d34c179fb4830f90c35eaa1c233d7f8.png`
- `confettiImage8`: texture → `asset://ad882122cbb24872df3c558e4d73a56c9007bcaabe7a2a158a7d0983c08996cf.png`
- `clickSound`: audio → `asset://303addb43bf5fa7bcc6828163caca12890e4c8c852b9b97afe6a4ea9a8c04e27.mp3`
- `explosionSound`: audio → `asset://e340725a9d803c8a2739a8e77afcca452fe3cec7ce8036e9d8369d4088f06dc2.mp3`

## Assets
- `[model]` d91f5a14dce54f679b6a2c982da3a9cfefcddc0e0a48e55357519c18a8f993a6.glb (84,144 bytes)
- `[script]` 3202ca24272d1127354e28a60f99eda8ff02dbaf573101417035783fa1e895da.js (14,509 bytes)
- `[texture]` c68d78ac09493fb61732fbde6cf6bcf2083ebb302404273d5dba06df43b002ed.png (358 bytes)
- `[texture]` 09c8bc8c7a5316301fdec7523ff751efb67458eaaeea7eeeee2495021ec9bdc7.png (3,410 bytes)
- `[texture]` 19ffdd3a8a7591313f1fd259f75c74b08a3e2cb26154db5ad9847587c74ebccc.png (3,930 bytes)
- `[texture]` 7c6a060a9a38aa57601b6f467e7d61c7493462431b570fa3276a066327aabf46.png (4,583 bytes)
- `[texture]` 4078a72786c33dced79346816eaeac29d223d0c9c9667624c521aa55274f8891.png (5,446 bytes)
- `[texture]` 8fbf6b897cda628db151ab177d3497f1a9b84d5800aaa47d4e0843f0db7f0bfc.png (5,007 bytes)
- `[texture]` 418abad39699f7a83bf12e96449ee8065d34c179fb4830f90c35eaa1c233d7f8.png (2,212 bytes)
- `[texture]` ad882122cbb24872df3c558e4d73a56c9007bcaabe7a2a158a7d0983c08996cf.png (5,762 bytes)
- `[audio]` 303addb43bf5fa7bcc6828163caca12890e4c8c852b9b97afe6a4ea9a8c04e27.mp3 (49,581 bytes)
- `[audio]` e340725a9d803c8a2739a8e77afcca452fe3cec7ce8036e9d8369d4088f06dc2.mp3 (22,509 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.create()`, `app.get()`, `app.on()`, `app.send()`
**World Methods**: `world.add()`, `world.remove()`
**Events Listened**: `confettiComplete`, `destroy`, `fire`, `setConfettiActive`, `spawnConfetti`, `update`
**Nodes Created**: `audio`, `particles`

## Keywords (for Discord search)
accept, active, allImages, alphaOverLife, appropriate, audio, author, based, between, both, bursts, chance, changes, click, clickAudio, clickSound, clicked, client, clockwise, clockwiseSystem

## Script Source
```javascript
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
                    { time: 0, co

// ... truncated ...
```

---
*Extracted from CONFETTT_PPOT.hyp. Attachment ID: 1402249836136501398*