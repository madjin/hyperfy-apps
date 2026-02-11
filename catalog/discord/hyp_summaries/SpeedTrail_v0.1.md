# SpeedTrail_v0.1.hyp

## Metadata
- **Author**: Valiant
- **Channel**: #💻│developers
- **Date**: 2025-04-16
- **Size**: 84,641 bytes

## Discord Context
> if anyone wants to try it out. wip . supposed to be diff particle burst on landing but not working right. it does trigger, massively, on certain rates of descent when flying. client only just now so not visible to other players.

## Blueprint
- **Name**: SpeedTrail v0.1
- **Version**: 4
- **Model**: `asset://ce9c0ed188b5c500291b320d5f62203a76908fbb3d61028c9e42b7c89cc50b8b.glb`
- **Script**: `asset://33d1322e09830cdc44d40dffc886db86c3c892ba2183d5aba336e2cefaebb6fa.js`

## Props
- `enabled`: bool = `True`

## Assets
- `[model]` ce9c0ed188b5c500291b320d5f62203a76908fbb3d61028c9e42b7c89cc50b8b.glb (71,848 bytes)
- `[script]` 33d1322e09830cdc44d40dffc886db86c3c892ba2183d5aba336e2cefaebb6fa.js (12,088 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.get()`, `app.on()`
**World Methods**: `world.add()`, `world.getPlayer()`, `world.raycast()`, `world.remove()`
**Events Listened**: `update`

## Keywords (for Discord search)
angle, angleVariance, basePos, baseSpread, bellCurve, burst, clone, configs, configure, console, copy, create, currentPos, currentSpread, delta, description, detection, distance, distanceTo, distanceToGround

## Script Source
```javascript
app.configure([
    {
        key: 'enabled',
        type: 'toggle',
        label: 'Enable Speed Trails',
        description: 'Toggle speed trails on/off for all players',
        initial: true
    }
])

if (world.isClient) {
    const speedParticle = app.get('SpeedParticle')
    if (!speedParticle) {
        console.error('SpeedParticle particle template not found')
        return
    }
    speedParticle.visible = false

    // Add jump detection to existing CONFIG
    const CONFIG = {
        // Keep all original CONFIG values exactly as they were
        TRAIL_RATE: 10,           
        TRAIL_LIFETIME: 0.5,      
        TRAIL_HEIGHT_OFFSET: 0.05, 
        TRAIL_SPREAD: 0.35,       
        TRAIL_MAX_SPREAD: 0.45,   
        TRAIL_MIN_SPEED: 0.1,     
        TRAIL_MAX_SPEED: 0.6,     
        TRAIL_MIN_SCALE: 0.01,    
        TRAIL_MAX_SCALE: 0.1,     
        TRAIL_PARTICLES: 4,       
        TRAIL_RISE_SPEED: 0.25,   
        PLAYER_HEIGHT: 3,         
        MIN_SPEED_THRESHOLD: 5,   
        MAX_RISE_HEIGHT: 1.9,     
        SPAWN_VARIANCE: 0.2,      
        TRAIL_ZIGZAG: 0.15,

        // Add only these new configs
        GROUND_CHECK_DISTANCE: 0.2,
        MIN_LANDING_VELOCITY: 3
    }

    // Keep original state management
    const particles = []
    let lastFootPos = null
    let timeSinceLastTrail = 0
    
    // Add only these new state variables
    let isInAir = false
    let lastY = 0
    
    const DOWN = new Vector3(0, -1, 0)
    const RAY_DISTANCE = 10

    // Modified to include ground distance
    function getPositionInfo(playerPos) {
        const hit = world.raycast(playerPos, DOWN, RAY_DISTANCE)
        
        if (hit && hit.point) {
            const groundY = hit.point.y
            const footPos = playerPos.clone()
            footPos.y = groundY
            
            return {
                groundY,
                footPos,
                distanceToGround: playerPos.y - groundY
            }
        }
        
        const footPos = playerPos.clone()
        footPos.y -= CONFIG.PLAYER_HEIGHT
        return {
            groundY: footPos.y,
            footPos,
            distanceToGround: CONFIG.PLAYER_HEIGHT
        }
    }

    // Keep all original helper functions exactly as they were
    function getPlayerVelocity(currentPos, lastPos, delta) {
        if (!lastPos) return 0
        const distance = currentPos.distanceTo(lastPos)
        return distance / delta
    }

    function getSpreadMultiplier(lifeProgress) {
        const peak = 0.5
        const x = lifeProgress - peak
        const variance = 0.15
        const bellCurve = Math.exp(-(x * x) / (2 * variance * variance))
        
        const baseSpread = CONFIG.TRAIL_SPREAD
        const maxSpreadIncrease = CONFIG.TRAIL_MAX_SPREAD - CONFIG.TRAIL_SPREAD
        return baseSpread + (maxSpreadIncrease * bellCurve)
    }

    function randomizeSpawnPosition(basePos, moveDir) {
        const angle = num(0, Math.PI * 2, 2)
        const radius = num(0, CONFIG.TRAIL_SPREAD * 0.5, 2)
        
        basePos.x += Math.cos(angle) * radius
        basePos.z += Math.sin(angle) * radius
        
        basePos.x += moveDir.x * (num(-0.5, 0.5, 2)) * 0.3
        basePos.z += moveDir.z * (num(-0.5, 0.5, 2)) * 0.3
        
        return basePos
    }

    app.on('update', (delta) => {
        if (!props.enabled) return

        const player = world.getPlayer()
        if (!player?.position) return

        const posInfo = getPositionInfo(player.position)
        const footPos = posInfo.footPos

        if (!lastFootPos) {
            lastFootPos = footPos.clone()
            lastY = player.position.y
            return
        }

        const playerSpeed = getPlayerVelocity(footPos, lastFootPos, delta)

        // Check ground state
        const wasInAir = isInAir
        isInAir = posInfo.distanceToGround > CONFIG.GROUND_CHECK_DISTANCE

        // Check landing impact
        if (wasInAir && !isInAir) {
            const fallVelocity = Math.abs(lastY - player.position.y) / delta
            if (fallVelocity > CONFIG.MIN_LANDING_VELOCITY) {
                // Create landing burst using existing trail system
                const moveDir = footPos.clone().sub(lastFootPos).normalize()
                const perpDir = new Vector3(-moveDir.z, 0, moveDir.x)
                
                // Create burst of particles
                for (let i = 0; i < 8; i++) {
                    const trail = speedParticle.clone(true)
                    trail.visible = true
                    
                    const scale = CONFIG.TRAIL_MAX_SCALE * (0.8 + num(0, 0.4, 2))
                    trail.scale.multiplyScalar(scale)
                    trail.initialScale = scale
                    trail.targetScale = scale * 2

                    const spawnPos = footPos.clone()
                    const angle = (Math.PI * 2 * i / 8) + num(-0.2, 0.2, 2)
                    const radius = 0.4 * num(0.8, 1.2, 2)
                    
                    spawnPos.x += Math.cos(angle) * radius
                    spawnPos.z += Math.sin(angle) * radius
                    spawnPos.y = posInfo.groundY + CONFIG.TRAIL_HEIGHT_OFFSET
                    
                    trail.position.copy(spawnPos)
                    trail.groundY = posInfo.groundY
                    trail.initialY = spawnPos.y
                    
                    const speed = CONFIG.TRAIL_MAX_SPEED * 1.5
                    trail.velocity = {
                        x: Math.cos(angle) * speed,
                        y: CONFIG.TRAIL_RISE_SPEED * 2,
                        z: Math.sin(angle) * speed
                    }

                    trail.lifetime = 0
                    trail.maxLifetime = CONFIG.TRAIL_LIFETIME

                    particles.push(trail)
                    world.add(trail)
                }
            }
        }

        // Only create regular trails when on ground
        if (!isInAir && playerSpeed > CONFIG.MIN_SPEED_THRESHOLD) {
            timeSinceLastTrail += delta * (1 + (num(-0.5, 0.5, 2)) * CONFIG.SPAWN_VARIANCE)
            
            if (timeSinceLastTrail >= 1 / CONFIG.TRAIL_RATE) {
                timeSinceLastTrail = -num(0, 0.1, 2)

                const moveDir = footPos.clone().sub(lastFootPos).normalize()
                const perpDir = new Vector3(-moveDir.z, 0, moveDir.x)

                for (let i = 0; i < CONFIG.TRAIL_PARTICLES; i++) {
                    const trail = speedParticle.clone(true)
                    trail.visible = true
                    
                    const scaleVariance = num(0.7, 1.0, 2)
                    const initialScale = num(CONFIG.TRAIL_MIN_SCALE, CONFIG.TRAIL_MAX_SCALE * 0.5, 2) * scaleVariance
                    trail.scale.multiplyScalar(initialScale)
                    trail.initialScale = initialScale
                    trail.targetScale = initialScale * (num(1.5, 2.5, 2) * scaleVariance)

                    const spawnPos = footPos.clone()
                    randomizeSpawnPosition(spawnPos, moveDir)
                    
                    trail.moveDir = moveDir.clone()
                    trail.perpVector = perpDir.clone()
                    trail.basePos = spawnPos.clone()
                    
                    const spreadDist = num(-CONFIG.TRAIL_SPREAD, CONFIG.TRAIL_SPREAD, 2)
                    spawnPos.x += perpDir.x * spreadDist
                    spawnPos.z += perpDir.z * spreadDist
                    spawnPos.y = posInfo.groundY + CONFIG.TRAIL_HEIGHT_OFFSET + num(0, 0.05, 2)

                    trail.position.copy(spawnPos)
                    trail.groundY = posInfo.groundY
                    trail.initialY = spawnPos.y
                    trail.spreadOffset = spreadDist
    

// ... truncated ...
```

---
*Extracted from SpeedTrail_v0.1.hyp. Attachment ID: 1361987355212251279*