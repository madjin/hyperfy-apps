# Platforms.hyp

## Metadata
- **Author**: .hyp shaman
- **Channel**: #💻│developers
- **Date**: 2025-11-11
- **Size**: 317,947 bytes

## Discord Context
> have fun

## Blueprint
- **Name**: Platforms
- **Version**: 21
- **Model**: `asset://ec7de0e2b5d147d4da252dbd30297286687c7ebc0c5dd68ca29d507141581718.glb`
- **Script**: `asset://4d9fa228c6331ced5bf9d0a5ee32ba95ffd0158f0eb8e026716e0e0f599d3fb1.js`

## Props
- `spawnMode`: str = `floating`
- `showTutorial`: bool = `True`
- `status`: str = `All cleared - ready for new launch!`
- `platformType`: str = `platform`
- `scaleX`: int = `1`
- `scaleY`: int = `1`
- `scaleZ`: int = `1`
- `fallingForce`: int = `10`
- `triggerVisibility`: str = `invisible`
- `fallDelay`: int = `1`
- `resetTime`: int = `5`
- `moveSpeed`: int = `3`
- `rotateSpeed`: int = `1`

## Assets
- `[model]` ec7de0e2b5d147d4da252dbd30297286687c7ebc0c5dd68ca29d507141581718.glb (228,048 bytes)
- `[script]` 4d9fa228c6331ced5bf9d0a5ee32ba95ffd0158f0eb8e026716e0e0f599d3fb1.js (4,665 bytes)
- `[texture]` e78911089c967dc3649829edf86766d01c96ed237eebdff9f3e8268cf48b8446.jpg (83,976 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.get()`, `app.on()`
**Events Listened**: `update`

## Keywords (for Discord search)
active, after, area, areaTrigger, based, before, cartridge, changes, clone, configure, copy, currentType, delay, detection, directly, display, drops, dynamic, enters, extraLargePlatform

## Script Source
```javascript
// Get individual platform nodes directly
const platform = app.get('Platform')
const mediumPlatform = app.get('MediumPlatform')
const largePlatform = app.get('LargePlatform')
const extraLargePlatform = app.get('ExtraLargePlatform')

const areaTrigger = app.get('AreaTrigger') // The trigger detection
const triggerMesh = app.get('LOD001') // Separate mesh for visualization
const fllnPltfrm = app.get('FllnPltfrm')

// Falling platform state
let originalPosition = null
let resetTimer = null

// init start with falling platform visible and static
if (platform) platform.active = false
if (mediumPlatform) mediumPlatform.active = false
if (largePlatform) largePlatform.active = false
if (extraLargePlatform) extraLargePlatform.active = false
if (fllnPltfrm) fllnPltfrm.type = 'static'


// Store original position for reset
if (fllnPltfrm) {
  originalPosition = fllnPltfrm.position.clone()
}

app.keepActive = true

// Handle trigger mesh visibility like cartridge.js
if (triggerMesh && props.triggerVisibility === 'invisible') {
  triggerMesh.active = false
}

// Configure props panel
app.configure([
  {
    type: 'switch',
    key: 'platformType',
    label: 'Platform Type',
    options: [
      { label: 'Platform', value: 'platform' },
      { label: 'Medium Platform', value: 'mediumPlatform' },
      { label: 'Large Platform', value: 'largePlatform' },
      { label: 'X-Large Platform', value: 'extraLargePlatform' },
      { label: 'Falling Platform', value: 'fallingPlatform' },
    ],
    initial: 'fallingPlatform',
    hint: 'Select which platform type to display. Falling Platform includes trigger-based physics.'
  },
  {
    type: 'switch',
    key: 'triggerVisibility',
    label: 'Area Trigger Visibility',
    options: [
      { label: 'Visible', value: 'visible' },
      { label: 'Invisible', value: 'invisible' },
    ],
    initial: 'invisible',
    hint: 'Control visibility of the falling platform trigger area. Keep invisible for gameplay.'
  },
  {
    type: 'range',
    key: 'fallDelay',
    label: 'Fall Delay (seconds)',
    min: 0,
    max: 5,
    step: 0.5,
    initial: 1,
    hint: 'Time in seconds before falling platform drops after player steps on trigger.'
  },
  {
    type: 'range',
    key: 'resetTime',
    label: 'Reset Time (seconds)',
    min: 2,
    max: 10,
    step: 0.5,
    initial: 5,
    hint: 'Time in seconds before fallen platform respawns to original position.',
  },
])

// Platform map
const platformMap = {
  platform: platform,
  mediumPlatform: mediumPlatform,
  largePlatform: largePlatform,
  extraLargePlatform: extraLargePlatform,
  fallingPlatform: fllnPltfrm,
}

// Show selected platform
function showPlatform(type) {
  // Hide all platforms first
  if (platform) platform.active = false
  if (mediumPlatform) mediumPlatform.active = false
  if (largePlatform) largePlatform.active = false
  if (extraLargePlatform) extraLargePlatform.active = false
  if (fllnPltfrm) fllnPltfrm.active = false

  // Show selected platform
  if (type === 'fallingPlatform') {
    // Show falling platform
    fllnPltfrm.active = true
    fllnPltfrm.type = 'static'

    // Control trigger mesh visibility - areaTrigger stays active for detection
    if (triggerMesh) {
      if (props.triggerVisibility === 'visible') {
        triggerMesh.active = true
      } else {
        triggerMesh.active = false
      }
    }

    // Make it fall when player enters trigger with delay
    areaTrigger.onTriggerEnter = hit => {
      if (hit.playerId && !resetTimer) {
        // Change to dynamic after delay
        setTimeout(() => {
          fllnPltfrm.type = 'dynamic'

          // Start reset timer - platform will respawn after resetTime
          resetTimer = setTimeout(() => {
            resetFallingPlatform()
          }, props.resetTime * 1000)
        }, props.fallDelay * 1000)
      }
    }

    // Platform reset function
    function resetFallingPlatform() {
      if (originalPosition && fllnPltfrm) {
        // Clear timer
        resetTimer = null

        // Reset position
        fllnPltfrm.position.copy(originalPosition)

        // Reset to static
        fllnPltfrm.type = 'static'
      }
    }
  } else {
    // Show selected platform
    const selectedPlatform = platformMap[type]
    if (selectedPlatform) {
      selectedPlatform.active = true
    }
  }
}


// Handle prop changes
let currentType = props.platformType || 'fallingPlatform'

app.on('update', () => {
  const newType = props.platformType || 'fallingPlatform'
  if (newType !== currentType) {
    currentType = newType
    showPlatform(currentType)
  }
})

// Initialize with falling platform
showPlatform(currentType)
```

---
*Extracted from Platforms.hyp. Attachment ID: 1437886474300166304*