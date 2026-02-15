# SS3.hyp

## Metadata
- **Author**: ~/drdoge.eth
- **Channel**: #💻│developers
- **Date**: 2025-04-17
- **Size**: 1,369,648 bytes

## Blueprint
- **Name**: SS3
- **Version**: 96
- **Model**: `asset://b619d3860e27516dc6945757467ad18b32e6f10517e8fd90a10695e20b590b3f.glb`
- **Script**: `asset://437199cdb3bd9653e0d02f4e82b2bb00da97241c494037edc44700d23618660d.js`

## Props
- `auraColor`: str = `#00ffaa`
- `auraSize`: int = `1`
- `particleCount`: int = `100`
- `particleTexture`: texture → `asset://f7c5f1f849657eed79fd7b663be5a57829450a1e4fdc4a062049a05b9a406e89.png`
- `primaryColor`: str = `#00ffaa`
- `secondaryColor`: str = `#ff00aa`
- `primaryCount`: int = `50`
- `secondaryCount`: int = `30`
- `glowCount`: int = `20`
- `primaryTexture`: texture → `asset://5902da3a324cad0a4b5a88ce1e3c9cc18fee50922c358ce93d8c9f1ad7708f0a.png`
- `secondaryTexture`: texture → `asset://9624ea2017b8b2767a9d3b82e978b7fdf5154d83e6756cd919da51447bb97138.png`
- `glowTexture`: texture → `asset://f7c5f1f849657eed79fd7b663be5a57829450a1e4fdc4a062049a05b9a406e89.png`
- `enabled`: bool = `True`
- `primaryRate`: int = `5`
- `secondaryRate`: int = `5`
- `glowRate`: int = `5`
- `particleLifetime`: float = `1.5`
- `minScale`: int = `0`
- `maxScale`: float = `0.8`
- `spreadRadius`: float = `0.1`
- `coneAngle`: int = `5`
- `riseSpeed`: float = `1.2`
- `expansionRate`: float = `0.8`
- `theme`: str = `quantum`
- `effectStyle`: str = `flame`
- `glowIntensity`: int = `50`

## Assets
- `[model]` b619d3860e27516dc6945757467ad18b32e6f10517e8fd90a10695e20b590b3f.glb (989,568 bytes)
- `[script]` 437199cdb3bd9653e0d02f4e82b2bb00da97241c494037edc44700d23618660d.js (14,790 bytes)
- `[texture]` f7c5f1f849657eed79fd7b663be5a57829450a1e4fdc4a062049a05b9a406e89.png (101,613 bytes)
- `[texture]` 5902da3a324cad0a4b5a88ce1e3c9cc18fee50922c358ce93d8c9f1ad7708f0a.png (95,070 bytes)
- `[texture]` 9624ea2017b8b2767a9d3b82e978b7fdf5154d83e6756cd919da51447bb97138.png (64,808 bytes)
- `[texture]` f7c5f1f849657eed79fd7b663be5a57829450a1e4fdc4a062049a05b9a406e89.png (101,613 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.create()`, `app.on()`
**World Methods**: `world.add()`, `world.getPlayer()`, `world.raycast()`, `world.remove()`
**Events Listened**: `destroy`, `update`
**Nodes Created**: `particles`

## Keywords (for Discord search)
aa00ff, additive, alphaOverLife, angle, arrays, aura, base, basePos, baseSpeed, based, blending, calculations, center, circle, clone, color, colors, coneAngle, configure, copy

## Script Source
```javascript
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
      const style = EFFECT_S

// ... truncated ...
```

---
*Extracted from SS3.hyp. Attachment ID: 1362219891691618486*