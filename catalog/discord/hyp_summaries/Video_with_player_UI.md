# Video_with_player_UI.hyp

## Metadata
- **Author**: Gert-Jan Akerboom
- **Channel**: #🎨│showcase
- **Date**: 2025-12-07
- **Size**: 217,033 bytes

## Discord Context
> there is now ; ) 
i added a player UI switch to the default video player, when 'on' the video player has a simple UI players can control, i added a play, pause and reset button.
if you need other buttons or a different style, let me know.

## Blueprint
- **Name**: Video with player UI
- **Version**: 29
- **Model**: `asset://2faa49a0505b0e7f143e2278e3aa4a5585cabe9e87cc850f3b9b3c1625b8ba69.glb`
- **Script**: `asset://940429bacd75181590b9e1dfba9e4cb1717a68660fb17bcd29a37fa93298a138.js`

## Props
- `width`: int = `0`
- `height`: int = `2`
- `fit`: str = `cover`
- `lit`: bool = `False`
- `shadows`: bool = `True`
- `video`: NoneType = `None`
- `loop`: bool = `True`
- `volume`: int = `1`
- `sync`: bool = `True`
- `doubleside`: bool = `True`
- `placeholder`: video → `asset://8fab0105d67539618ed9b9a68b2952aefc870be4f40d4541f1f773583950ff44.mp4`
- `playerUI`: bool = `True`

## Assets
- `[model]` 2faa49a0505b0e7f143e2278e3aa4a5585cabe9e87cc850f3b9b3c1625b8ba69.glb (2,832 bytes)
- `[script]` 940429bacd75181590b9e1dfba9e4cb1717a68660fb17bcd29a37fa93298a138.js (8,567 bytes)
- `[texture]` 2fecd2130b39ec39e00dce51c162247ce07500f419fbb188e0bf99b5cec415af.png (2,607 bytes)
- `[video]` 8fab0105d67539618ed9b9a68b2952aefc870be4f40d4541f1f773583950ff44.mp4 (201,576 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.get()`, `app.on()`, `app.remove()`, `app.send()`
**World Methods**: `world.getTime()`
**Events Listened**: `init`, `videoControl`
**Nodes Created**: `ui`, `uitext`, `video`

## Keywords (for Discord search)
action, adapt, alignItems, aspect, audio, automatically, backgroundColor, below, bigStep, bold, borderColor, borderRadius, borderWidth, both, bottom, broadcast, broadcasted, button, buttons, castShadow

## Script Source
```javascript
app.configure([
  {
    key: 'placeholder',
    type: 'file',
    kind: 'video',
    label: 'Placeholder',
    hidden: true,
  },
  {
    key: 'video',
    type: 'file',
    kind: 'video',
    label: 'Video',
    hint: 'The video file to play.'
  },
  {
    key: 'loop',
    type: 'toggle',
    label: 'Loop',
    hint: 'Whether the video should loop or stop when it reaches the end.',
    initial: true,
  },
  {
    key: 'sync',
    type: 'toggle',
    label: 'Sync',
    hint: 'When enabled, video state will be synchronized over multiplayer.',
    initial: true,
  },
  {
    key: 'playerUI',
    type: 'toggle',
    label: 'Player UI',
    hint: 'When enabled, shows control buttons (Play, Pause, Reset) below the video player.',
    initial: true,
  },
  {
    key: 'surface',
    type: 'section',
    label: 'Surface'
  },
  {
    key: 'width',
    type: 'number',
    label: 'Width',
    dp: 1,
    step: 0.1,
    bigStep: 1,
    hint: 'The width of the surface. This can be set to zero as long as you provide a height, and the width will automatically adapt to the videos aspect ratio.',
    initial: 0,
  },
  {
    key: 'height',
    type: 'number',
    label: 'Height',
    dp: 1,
    step: 0.1,
    bigStep: 1,
    hint: 'The height of the surface. This can be set to zero as long as you provide a width, and the height will automatically adapt to the videos aspect ratio.',
    initial: 1,
  },
  {
    key: 'fit',
    type: 'switch',
    label: 'Fit',
    options: [
      { label: 'Stretch', value: 'none' },
      { label: 'Cover', value: 'cover' },
      { label: 'Contain', value: 'contain' },
    ],
    hint: 'How the video should be scaled to fit the surface. This is only relevant when both height and width are set.',
    initial: 'none',
  },
  {
    key: 'lit',
    type: 'toggle',
    label: 'Lit',
    hint: 'Whether the surface reacts to world lighting or not.'
  },
  {
    key: 'shadows',
    type: 'toggle',
    label: 'Shadows',
  },
  {
    key: 'doubleside',
    type: 'toggle',
    label: 'Doubleside',
  },
  {
    key: 'audio',
    type: 'section',
    label: 'Audio'
  },
  {
    key: 'volume',
    type: 'number',
    label: 'Volume',
    dp: 1,
    step: 0.1,
    bigStep: 1,
    initial: 1,
  }
])

app.keepActive = true

const src = props.video?.url || props.placeholder?.url
const loop = props.loop
const sync = props.sync
const playerUI = props.playerUI
const width = props.width === 0 ? null : props.width
const height = props.height === 0 ? null : props.height
const fit = props.fit
const transparent = props.transparent
const lit = props.lit
const shadows = props.shadows
const doubleside = props.doubleside
const volume = props.volume

const surface = app.get('Surface')
app.remove(surface)

const video = app.create('video')
video.src = src
video.loop = loop
video.width = width
video.height = height
video.fit = fit
video.lit = lit
video.castShadow = shadows
video.receiveShadow = shadows
video.doubleside = doubleside
video.pivot = 'bottom-center'
video.volume = volume
video.position.set(0, playerUI ? 0.5 : 0, 0)

app.add(video)

if (!src) return

// Create control buttons only if playerUI is enabled
if (playerUI) {
  // Create Play button
  const playButton = app.create('ui', {
    space: 'world',
    position: [-1.0, 0.35, 0],
    pivot: 'center',
    width: 40,
    height: 20,
    size: 0.01,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 4,
    pointerEvents: true,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    lit: false
  })

  const playText = app.create('uitext', {
    value: 'Play',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center'
  })
  playButton.add(playText)
  app.add(playButton)

  // Create Pause button
  const pauseButton = app.create('ui', {
    space: 'world',
    position: [0, 0.35, 0],
    pivot: 'center',
    width: 40,
    height: 20,
    size: 0.01,
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 4,
    pointerEvents: true,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    lit: false
  })

  const pauseText = app.create('uitext', {
    value: 'Pause',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center'
  })
  pauseButton.add(pauseText)
  app.add(pauseButton)

  // Create Reset button
  const resetButton = app.create('ui', {
    space: 'world',
    position: [1.0, 0.35, 0],
    pivot: 'center',
    width: 40,
    height: 20,
    size: 0.01,
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 4,
    pointerEvents: true,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    lit: false
  })

  const resetText = app.create('uitext', {
    value: 'Reset',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center'
  })
  resetButton.add(resetText)
  app.add(resetButton)

  // Control functions
  function handlePlay() {
    if (sync) {
      if (world.isClient) {
        app.send('videoControl', { action: 'play' })
      } else if (world.isServer) {
        video.play()
        app.send('videoControl', { action: 'play' })
      }
    } else {
      video.play()
    }
  }

  function handlePause() {
    if (sync) {
      if (world.isClient) {
        app.send('videoControl', { action: 'pause' })
      } else if (world.isServer) {
        video.pause()
        app.send('videoControl', { action: 'pause' })
      }
    } else {
      video.pause()
    }
  }

  function handleReset() {
    if (sync) {
      if (world.isClient) {
        app.send('videoControl', { action: 'reset' })
      } else if (world.isServer) {
        video.time = 0
        video.pause()
        app.send('videoControl', { action: 'reset' })
      }
    } else {
      video.time = 0
      video.pause()
    }
  }

  // Hover effects
  playButton.onPointerEnter = () => {
    playButton.borderColor = '#808080'
  }
  playButton.onPointerLeave = () => {
    playButton.borderColor = '#ffffff'
  }

  pauseButton.onPointerEnter = () => {
    pauseButton.borderColor = '#808080'
  }
  pauseButton.onPointerLeave = () => {
    pauseButton.borderColor = '#ffffff'
  }

  resetButton.onPointerEnter = () => {
    resetButton.borderColor = '#808080'
  }
  resetButton.onPointerLeave = () => {
    resetButton.borderColor = '#ffffff'
  }

  // Click handlers
  playButton.onPointerDown = handlePlay
  pauseButton.onPointerDown = handlePause
  resetButton.onPointerDown = handleReset
}

// Sync handlers for multiplayer
if (sync) {
  // Server-side: receive commands from clients and broadcast to all
  if (world.isServer) {
    app.on('videoControl', (data) => {
      if (data.action === 'play') {
        video.play()
        app.send('videoControl', { action: 'play' })
      } else if (data.action === 'pause') {
        video.pause()
        app.send('videoControl', { action: 'pause' })
      } else if (data.action === 'reset') {
        video.time = 0
        video.pause()
        app.send('videoControl', { action: 'reset' })
      }
    })
  }

  // Client-side: receive broadcasted commands from server
  if (world.isClient) {
    app.on('videoControl', (data) => {
      if (data.action === 'play') {
        video.play()
      } else if (data.action === 'pause') {
        video.pause()
      } else if (data.action === 'reset') {
        video.time = 0
        video.pause()
      }
    })
  }
}

// Video sync initialization
if (sync) {
  if (world.isServer) {
    app.state.startAt = world.getTime()
    app.state.ready = true
    app.send('init', app.state)
  }
  if (world.isClient) {
    if (app.state.ready) {
      init(app.state)
    } else {
      app.on('init', init)
    }
    function init(state) {
      if (video.loading) {
        video.onLoad = () => s

// ... truncated ...
```

---
*Extracted from Video_with_player_UI.hyp. Attachment ID: 1447233811636162772*