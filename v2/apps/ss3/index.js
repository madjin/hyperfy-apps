export default function main(world, app, fetch, props, setTimeout) {
// Configure app with settings
app.configure([
  {
    type: 'section',
    label: 'Textures',
    key: 'textures'
  },
  {
    key: 'primaryTexture',
    type: 'file',
    kind: 'texture',
    label: 'Primary Aura Texture'
  },
  {
    key: 'secondaryTexture',
    type: 'file',
    kind: 'texture',
    label: 'Secondary Aura Texture'
  },
  {
    key: 'glowTexture',
    type: 'file',
    kind: 'texture',
    label: 'Glow Effect Texture'
  },
  {
    type: 'section',
    label: 'Style Presets',
    key: 'presets'
  },
  {
    key: 'theme',
    type: 'switch',
    label: 'Color Theme',
    options: [
      { value: 'nuka', label: 'Nuka Cola (Green/Pink)' },
      { value: 'plasma', label: 'Plasma (Blue/Cyan)' },
      { value: 'radiation', label: 'Radiation (Green/Yellow)' },
      { value: 'quantum', label: 'Quantum (Blue/Purple)' },
      { value: 'fire', label: 'Fire (Orange/Red)' },
      { value: 'ghost', label: 'Ghost (White/Blue)' },
      { value: 'toxic', label: 'Toxic (Green/Purple)' },
      { value: 'custom', label: 'Custom Colors' }
    ],
    initial: 'nuka'
  },
  {
    key: 'effectStyle',
    type: 'switch',
    label: 'Effect Style',
    options: [
      { value: 'flame', label: 'Rising Flames' },
      { value: 'energy', label: 'Energy Field' },
      { value: 'mist', label: 'Misty Aura' },
      { value: 'sparkle', label: 'Sparkling' },
      { value: 'storm', label: 'Storm Cloud' }
    ],
    initial: 'flame'
  },
  {
    type: 'section',
    label: 'Custom Colors',
    key: 'colors'
  },
  {
    key: 'primaryColor',
    type: 'color',
    label: 'Primary Color',
    initial: '#00ffaa'
  },
  {
    key: 'secondaryColor',
    type: 'color',
    label: 'Secondary Color',
    initial: '#ff00aa'
  },
  {
    type: 'section',
    label: 'Particle Emission',
    key: 'emission'
  },
  {
    key: 'primaryRate',
    type: 'number',
    label: 'Primary Particle Rate',
    initial: 20,
    min: 5,
    max: 60,
    step: 1
  },
  {
    key: 'secondaryRate',
    type: 'number',
    label: 'Secondary Particle Rate',
    initial: 15,
    min: 5,
    max: 45,
    step: 1
  },
  {
    key: 'glowRate',
    type: 'number',
    label: 'Glow Particle Rate',
    initial: 10,
    min: 5,
    max: 30,
    step: 1
  },
  {
    type: 'section',
    label: 'Particle Properties',
    key: 'properties'
  },
  {
    key: 'glowIntensity',
    type: 'number',
    label: 'Glow Intensity',
    initial: 150,
    dp: 0,
    min: 50,
    max: 500,
    step: 10
  },
  {
    key: 'particleLifetime',
    type: 'number',
    label: 'Particle Lifetime (seconds)',
    initial: 1.5,
    dp: 2,
    min: 0.5,
    max: 3.0,
    step: 0.1
  },
  {
    key: 'minScale',
    type: 'number',
    label: 'Minimum Particle Size',
    initial: 0.05,
    dp: 2,
    min: 0.01,
    max: 10,
    step: 0.01
  },
  {
    key: 'maxScale',
    type: 'number',
    label: 'Maximum Particle Size',
    initial: 0.2,
    dp: 2,
    min: 0.05,
    max: 10,
    step: 0.01
  },
  {
    type: 'section',
    label: 'Shape & Movement',
    key: 'shape'
  },
  {
    key: 'spreadRadius',
    type: 'number',
    label: 'Base Spread Radius',
    initial: 0.2,
    dp: 2,
    min: 0.1,
    max: 1.0,
    step: 0.05
  },
  {
    key: 'coneAngle',
    type: 'number',
    label: 'Cone Angle (degrees)',
    initial: 15,
    dp: 2,
    min: 5,
    max: 45,
    step: 1
  },
  {
    key: 'riseSpeed',
    type: 'number',
    label: 'Rise Speed',
    initial: 1.2,
    dp: 2,
    min: 0.5,
    max: 2.0,
    step: 0.1
  },
  {
    key: 'expansionRate',
    type: 'number',
    label: 'Expansion Rate',
    initial: 0.8,
    dp: 2,
    min: 0.2,
    max: 1.5,
    step: 0.1
  },
  {
    type: 'section',
    label: 'General',
    key: 'general'
  },
  {
    key: 'enabled',
    type: 'toggle',
    label: 'Enable Aura',
    initial: true
  }
])

if (world.isClient) {
  // Color theme presets
  const COLOR_THEMES = {
    nuka: {
      primary: '#00ffaa',
      secondary: '#ff00aa'
    },
    plasma: {
      primary: '#00ffff',
      secondary: '#0088ff'
    },
    radiation: {
      primary: '#7fff00',
      secondary: '#ffff00'
    },
    quantum: {
      primary: '#00aaff',
      secondary: '#aa00ff'
    },
    fire: {
      primary: '#ff4400',
      secondary: '#ff0000'
    },
    ghost: {
      primary: '#ffffff',
      secondary: '#00ffff'
    },
    toxic: {
      primary: '#00ff00',
      secondary: '#ff00ff'
    }
  }

  // Effect style presets
  const EFFECT_STYLES = {
    flame: {
      particleLifetime: 1.5,
      riseSpeed: 1.2,
      expansionRate: 0.8,
      coneAngle: 15,
      primaryRate: 20,
      secondaryRate: 15,
      glowRate: 10,
      minScale: 0.05,
      maxScale: 0.2,
      alphaOverLife: '0,0|0.1,1|0.7,1|1,0',
      scaleOverLife: '0,0.5|0.2,1|0.7,1|1,0.1',
      shape: ['circle', 2, 1],
      direction: 1,
      speedMultiplier: 1.0,
      glowMultiplier: 1.0
    },
    energy: {
      particleLifetime: 2.0,
      riseSpeed: 0.8,
      expansionRate: 0.4,
      coneAngle: 30,
      primaryRate: 25,
      secondaryRate: 20,
      glowRate: 15,
      minScale: 0.3,
      maxScale: 0.8,
      alphaOverLife: '0,0|0.2,1|0.8,1|1,0',
      scaleOverLife: '0,1|0.5,1.2|1,0.8',
      shape: ['circle', 4, 1],
      direction: -1,
      speedMultiplier: 0.7,
      glowMultiplier: 1.2
    },
    mist: {
      particleLifetime: 2.5,
      riseSpeed: 0.5,
      expansionRate: 0.3,
      coneAngle: 40,
      primaryRate: 30,
      secondaryRate: 25,
      glowRate: 20,
      minScale: 0.4,
      maxScale: 1.2,
      alphaOverLife: '0,0|0.3,0.7|0.7,0.7|1,0',
      scaleOverLife: '0,0.8|0.5,1.5|1,2',
      shape: ['circle', 8, 0.5],
      direction: 1,
      speedMultiplier: 0.5,
      glowMultiplier: 0.8
    },
    sparkle: {
      particleLifetime: 1.0,
      riseSpeed: 1.5,
      expansionRate: 1.0,
      coneAngle: 25,
      primaryRate: 35,
      secondaryRate: 30,
      glowRate: 25,
      minScale: 0.02,
      maxScale: 0.15,
      alphaOverLife: '0,0|0.1,1|0.4,0.8|0.6,1|0.8,0.5|1,0',
      scaleOverLife: '0,0.2|0.2,1|0.4,0.5|0.6,1|0.8,0.5|1,0',
      shape: ['circle', 5, 0.2],
      direction: 1,
      speedMultiplier: 1.3,
      glowMultiplier: 1.5
    },
    storm: {
      particleLifetime: 2.0,
      riseSpeed: 1.0,
      expansionRate: 1.2,
      coneAngle: 35,
      primaryRate: 40,
      secondaryRate: 35,
      glowRate: 30,
      minScale: 0.2,
      maxScale: 0.6,
      alphaOverLife: '0,0|0.2,0.8|0.5,0.6|0.8,0.8|1,0',
      scaleOverLife: '0,0.6|0.3,1.2|0.7,1|1,0.4',
      shape: ['circle', 6, 0.8],
      direction: -1,
      speedMultiplier: 1.2,
      glowMultiplier: 1.3
    }
  }

  // Configuration for the aura system
  const CONFIG = {
    get PRIMARY_RATE() { 
      const style = EFFECT_STYLES[app.props.effectStyle ?? 'flame']
      return app.props.primaryRate ?? style.primaryRate
    },
    get SECONDARY_RATE() {
      const style = EFFECT_STYLES[app.props.effectStyle ?? 'flame']
      return app.props.secondaryRate ?? style.secondaryRate
    },
    get GLOW_RATE() {
      const style = EFFECT_STYLES[app.props.effectStyle ?? 'flame']
      return app.props.glowRate ?? style.glowRate
    },
    get PARTICLE_LIFETIME() {
      const style = EFFECT_STYLES[app.props.effectStyle ?? 'flame']
      return app.props.particleLifetime ?? style.particleLifetime
    },
    HEIGHT_OFFSET: 0.1,
    get SPREAD_RADIUS() { return app.props.spreadRadius ?? 0.2 },
    get MIN_SCALE() {
      const style = EFFECT_STYLES[app.props.effectStyle ?? 'flame']
      return app.props.minScale ?? style.minScale
    },
    get MAX_SCALE() {
      const style = EFFECT_STYLES[app.props.effectStyle ?? 'flame']
      return app.props.maxScale ?? style.maxScale
    },
    get RISE_SPEED() {
      const style = EFFECT_STYLES[app.props.effectStyle ?? 'flame']
      return app.props.riseSpeed ?? style.riseSpeed
    },
    PLAYER_HEIGHT: 1.8,
    SPAWN_VARIANCE: 0.2,
    get CONE_ANGLE() {
      const style = EFFECT_STYLES[app.props.effectStyle ?? 'flame']
      return app.props.coneAngle ?? style.coneAngle
    },
    get EXPANSION_RATE() {
      const style = EFFECT_STYLES[app.props.effectStyle ?? 'flame']
      return app.props.expansionRate ?? style.expansionRate
    },
    get ALPHA_OVER_LIFE() {
      const style = EFFECT_STYLES[app.props.effectStyle ?? 'flame']
      return style.alphaOverLife
    },
    get SCALE_OVER_LIFE() {
      const style = EFFECT_STYLES[app.props.effectStyle ?? 'flame']
      return style.scaleOverLife
    },
    get GLOW_INTENSITY() {
      const style = EFFECT_STYLES[app.props.effectStyle ?? 'flame']
      return (app.props.glowIntensity ?? 150) * style.glowMultiplier
    }
  }

  function getThemeColors() {
    if (app.props.theme === 'custom') {
      return {
        primary: app.props.primaryColor,
        secondary: app.props.secondaryColor
      }
    }
    return COLOR_THEMES[app.props.theme] || COLOR_THEMES.nuka
  }

  // State management
  const particles = []
  let lastPlayerPos = null
  let timeSinceLastPrimary = 0
  let timeSinceLastSecondary = 0
  let timeSinceLastGlow = 0

  // Helper vector for calculations
  const DOWN = new Vector3(0, -1, 0)
  const RAY_DISTANCE = 10

  // Get player position and ground info
  function getPositionInfo(playerPos) {
    const hit = world.raycast(playerPos, DOWN, RAY_DISTANCE)
    
    if (hit && hit.point) {
      const groundY = hit.point.y
      const footPos = playerPos.clone()
      footPos.y = groundY + CONFIG.HEIGHT_OFFSET
      
      return {
        groundY,
        footPos,
        distanceToGround: playerPos.y - groundY
      }
    }
    
    const footPos = playerPos.clone()
    footPos.y -= CONFIG.PLAYER_HEIGHT - CONFIG.HEIGHT_OFFSET
    return {
      groundY: footPos.y - CONFIG.HEIGHT_OFFSET,
      footPos,
      distanceToGround: CONFIG.PLAYER_HEIGHT
    }
  }

  function createParticle(type, position) {
    // Get current effect style
    const style = EFFECT_STYLES[app.props.effectStyle ?? 'flame']
    
    // Calculate random angle for initial position
    const angle = Math.random() * Math.PI * 2
    const radiusAtBase = Math.random() * CONFIG.SPREAD_RADIUS
    
    // Calculate offset from center
    const offsetX = Math.cos(angle) * radiusAtBase
    const offsetZ = Math.sin(angle) * radiusAtBase
    
    // Create base position
    const spawnPos = position.clone()
    spawnPos.x += offsetX
    spawnPos.z += offsetZ

    // Calculate upward velocity with outward spread
    const upVector = new Vector3(0, CONFIG.RISE_SPEED, 0)
    const spreadAngle = (Math.random() * CONFIG.CONE_ANGLE) * (Math.PI / 180)
    const spreadDirection = angle + Math.PI * (Math.random() - 0.5)
    
    // Add horizontal spread to velocity
    const horizontalSpeed = Math.sin(spreadAngle) * CONFIG.RISE_SPEED * CONFIG.EXPANSION_RATE
    const velocityX = Math.cos(spreadDirection) * horizontalSpeed
    const velocityZ = Math.sin(spreadDirection) * horizontalSpeed

    // Adjust particle properties based on type and style
    const baseSpeed = (type === 'primary' ? 1.0 : type === 'secondary' ? 1.2 : 0.8) * style.speedMultiplier
    const particleSize = (CONFIG.MIN_SCALE + Math.random() * (CONFIG.MAX_SCALE - CONFIG.MIN_SCALE))
    
    const colors = getThemeColors()
    
    const particle = app.create('particles', {
      image: app.props[`${type}Texture`]?.url,
      shape: style.shape,
      direction: style.direction,
      speed: (baseSpeed * (1 + Math.random() * 0.4)).toString(),
      size: particleSize.toString(),
      rate: type === 'primary' ? CONFIG.PRIMARY_RATE : 
            type === 'secondary' ? CONFIG.SECONDARY_RATE : CONFIG.GLOW_RATE,
      life: (CONFIG.PARTICLE_LIFETIME * (0.8 + Math.random() * 0.4)).toString(),
      blending: 'additive',
      emissive: type === 'glow' ? 
                (CONFIG.GLOW_INTENSITY * 1.5).toString() : 
                type === 'primary' ? 
                CONFIG.GLOW_INTENSITY.toString() : 
                (CONFIG.GLOW_INTENSITY * 0.8).toString(),
      color: type === 'secondary' ? colors.secondary : colors.primary,
      alphaOverLife: CONFIG.ALPHA_OVER_LIFE,
      velocityLinear: new Vector3(
        velocityX * style.speedMultiplier,
        upVector.y * baseSpeed,
        velocityZ * style.speedMultiplier
      ),
      scaleOverLife: CONFIG.SCALE_OVER_LIFE
    })

    // Set initial position
    particle.position.copy(spawnPos)
    
    // Add to tracking arrays
    particles.push({
      particle,
      type,
      lifetime: 0,
      maxLifetime: CONFIG.PARTICLE_LIFETIME,
      basePos: spawnPos.clone()
    })

    return particle
  }

  app.on('update', (delta) => {
    if (!app.props.enabled) return

    const player = world.getPlayer()
    if (!player?.position) return

    const posInfo = getPositionInfo(player.position)
    const currentPos = posInfo.footPos

    if (!lastPlayerPos) {
      lastPlayerPos = currentPos.clone()
      return
    }

    // Update timers
    timeSinceLastPrimary += delta
    timeSinceLastSecondary += delta
    timeSinceLastGlow += delta

    // Spawn new particles
    if (timeSinceLastPrimary >= 1 / CONFIG.PRIMARY_RATE) {
      timeSinceLastPrimary = 0
      const particle = createParticle('primary', currentPos)
      world.add(particle)
    }

    if (timeSinceLastSecondary >= 1 / CONFIG.SECONDARY_RATE) {
      timeSinceLastSecondary = 0
      const particle = createParticle('secondary', currentPos)
      world.add(particle)
    }

    if (timeSinceLastGlow >= 1 / CONFIG.GLOW_RATE) {
      timeSinceLastGlow = 0
      const particle = createParticle('glow', currentPos)
      world.add(particle)
    }

    // Update existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particleObj = particles[i]
      particleObj.lifetime += delta

      if (particleObj.lifetime >= particleObj.maxLifetime) {
        world.remove(particleObj.particle)
        particles.splice(i, 1)
      }
    }

    lastPlayerPos.copy(currentPos)
  })

  // Cleanup on app destroy
  app.on('destroy', () => {
    particles.forEach(particleObj => {
      if (particleObj.particle) {
        world.remove(particleObj.particle)
      }
    })
    particles.length = 0
  })
}

}
