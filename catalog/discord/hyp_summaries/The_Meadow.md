# The_Meadow.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-09-10
- **Size**: 1,110,960 bytes

## Discord Context
> here's 3 scenes to try out

## Blueprint
- **Name**: The Meadow
- **Version**: 269
- **Model**: `asset://1aa2381f0fb25ba2fe9941b62eb2cad1fe2c77afa0316df8828ba5eba5d3d374.glb`
- **Script**: `asset://fb50c3aae07a14b6e944c263d7737d8b678d0bbf0084db1b4a9dbf8e2e7bd017.js`

## Props
- `hour`: int = `4`
- `period`: str = `pm`
- `intensity`: int = `1`
- `sky`: texture → `asset://179d71586e675efc4af04185e1b2d3e6b7f4a5b707f1ef5e9b6497c5660ecab7.webp`
- `hdr`: hdr → `asset://62db0ffbcea86b5e9ba23fb5da739b160e8abfd3b390235fed5ac436750e1e2e.hdr`
- `verticalRotation`: int = `40`
- `horizontalRotation`: int = `230`
- `rotationY`: int = `0`
- `fogNear`: int = `450`
- `fogFar`: int = `1000`
- `fogColor`: str = `#97b4d3`
- `color`: str = `white`

## Assets
- `[model]` 1aa2381f0fb25ba2fe9941b62eb2cad1fe2c77afa0316df8828ba5eba5d3d374.glb (530,256 bytes)
- `[script]` fb50c3aae07a14b6e944c263d7737d8b678d0bbf0084db1b4a9dbf8e2e7bd017.js (2,844 bytes)
- `[texture]` 179d71586e675efc4af04185e1b2d3e6b7f4a5b707f1ef5e9b6497c5660ecab7.webp (283,028 bytes)
- `[hdr]` 62db0ffbcea86b5e9ba23fb5da739b160e8abfd3b390235fed5ac436750e1e2e.hdr (293,408 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`
**Nodes Created**: `sky`

## Keywords (for Discord search)
background, because, bigStep, blank, calculateSunDirection, color, config, configure, create, degrees, direction, disable, distance, down, elevation, file, fogColor, fogFar, fogNear, hint

## Script Source
```javascript
app.configure(() => {
  return [
    {
      key: 'sky',
      label: 'Sky',
      type: 'file',
      kind: 'texture',
      hint: 'The image to use as the background.',
    },
    {
      key: 'hdr',
      label: 'HDR',
      type: 'file',
      kind: 'hdr',
      hint: 'The HDRI to use for reflections and lighting.',
    },
    {
      key: 'rotationY',
      label: 'Rotation',
      type: 'number',
      step: 10,
      bigStep: 50,
      hint: 'The rotation of the sky in degrees'
    },
    {
      key: '002',
      type: 'section',
      label: 'Sun'
    },
    {
      key: 'horizontalRotation',
      label: 'Direction',
      type: 'number',
      min: 0,
      max: 360,
      step: 10,
      bigStep: 50,
      initial: 0,
      dp: 0,
      hint: 'The direction of the sun in degrees',
    },
    {
      key: 'verticalRotation',
      label: 'Elevation',
      type: 'number',
      min: 0,
      max: 360,
      step: 10,
      bigStep: 50,
      initial: 0,
      dp: 0,
      hint: 'The elevation of the sun in degrees',
    },
    {
      key: 'intensity',
      label: 'Intensity',
      type: 'number',
      min: 0,
      max: 10,
      step: 0.1,
      initial: 1,
      dp: 1,
      hint: 'The intensity of the sun light'
    },
    {
      key: 'color',
      label: 'Color',
      type: 'text',
      hint: 'The color of the sun light' 
    },
    {
      key: '003',
      type: 'section',
      label: 'Fog'
    },
    {
      key: 'fogColor',
      label: 'Color',
      type: 'text',
      hint: 'The fog color. Leave blank to disable fog' 
    },
    {
      key: 'fogNear',
      label: 'Near',
      type: 'number',
      dp: 0,
      min: 0,
      step: 10,
      initial: 0,
      hint: 'The near distance for fog in metres'
    },
    {
      key: 'fogFar',
      label: 'Far',
      type: 'number',
      dp: 0,
      min: 0,
      step: 10,
      initial: 1000,
      hint: 'The far distance for fog in metres'
    },
  ]
})

const sky = app.create('sky')

sky.bg = app.config.sky?.url
sky.hdr = app.config.hdr?.url
sky.rotationY = app.config.rotationY * -DEG2RAD

const sunDirection = calculateSunDirection(
  app.config.verticalRotation || 0,
  app.config.horizontalRotation || 0
)
sky.sunDirection = sunDirection
sky.sunIntensity = app.config.intensity
sky.sunColor = app.config.color

sky.fogNear = app.config.fogNear
sky.fogFar = app.config.fogFar
sky.fogColor = app.config.fogColor

app.add(sky)

function calculateSunDirection(verticalDegrees, horizontalDegrees) {
  const verticalRad = verticalDegrees * DEG2RAD
  const horizontalRad = horizontalDegrees * DEG2RAD
  const x = Math.sin(verticalRad) * Math.sin(horizontalRad)
  const y = -Math.cos(verticalRad) // Negative because 0° should point down
  const z = Math.sin(verticalRad) * Math.cos(horizontalRad)  
  return new Vector3(x, y, z)
}
```

---
*Extracted from The_Meadow.hyp. Attachment ID: 1415309780431536128*