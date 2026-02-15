# FTV.hyp

## Metadata
- **Author**: ~/drdoge.eth
- **Channel**: #💻│developers
- **Date**: 2025-04-15
- **Size**: 359,153 bytes

## Blueprint
- **Name**: FOTV
- **Version**: 41
- **Model**: `asset://7a51eb0d8fcbcab70300e20a5a527c0b9f07e4d5372f2add86d64ddb7e73e786.glb`
- **Script**: `asset://ef38d359149c2efd607884808f031f8080601566dab610271bc48561a05ba6ce.js`

## Props
- `video1Name`: str = `Vault-Tec Presentation`
- `video2Name`: str = `Wasteland Documentary`
- `video3Name`: str = `Nuka-Cola Advertisement`
- `video4Name`: str = `RobCo Terminal Tutorial`
- `video5Name`: str = `Atomic Age Wonders`
- `screenMeshName`: str = `Screen`
- `aspectRatio`: float = `1.7777777777777777`
- `defaultVolume`: int = `15`
- `autoplay`: bool = `True`
- `shuffle`: bool = `False`
- `controlColor`: str = `#00aaff`
- `isSpatial`: bool = `False`
- `minDistance`: int = `15`
- `maxDistance`: int = `20`
- `rolloffFactor`: int = `2`
- `showControls`: bool = `False`
- `video1`: NoneType = `None`
- `video2`: NoneType = `None`
- `video3`: NoneType = `None`
- `video4`: NoneType = `None`
- `showMiniControls`: bool = `True`
- `channelChangeSoundVolume`: int = `1`
- `video5`: NoneType = `None`
- `channelChangeSound`: audio → `asset://df1afd66ecf859e8f3ef64a88ae53eec4faf06df61454d7853ab5fce46d408b5.mp3`

## Assets
- `[model]` 7a51eb0d8fcbcab70300e20a5a527c0b9f07e4d5372f2add86d64ddb7e73e786.glb (307,836 bytes)
- `[script]` ef38d359149c2efd607884808f031f8080601566dab610271bc48561a05ba6ce.js (29,089 bytes)
- `[audio]` df1afd66ecf859e8f3ef64a88ae53eec4faf06df61454d7853ab5fce46d408b5.mp3 (20,736 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.get()`, `app.on()`
**Events Listened**: `update`, `video:ended`, `video:error`
**Nodes Created**: `audio`, `ui`, `uitext`, `uiview`, `video`

## Keywords (for Discord search)
action, addVideoToPlaylist, advanced, advancedControls, alignItems, always, amber, appropriate, aspect, aspectRatio, audio, audioInfo, autoplay, backgroundColor, based, becomes, before, below, billboard, black

## Script Source
```javascript
app.configure([
    {
      type: 'section',
      label: 'Video Collection'
    },
    {
      key: 'video1',
      type: 'file',
      kind: 'video',
      label: 'Video 1',
    },
    {
      key: 'video1Name',
      type: 'text',
      label: 'Video 1 Name',
      initial: 'Vault-Tec Presentation'
    },
    {
      key: 'video2',
      type: 'file',
      kind: 'video',
      label: 'Video 2',
    },
    {
      key: 'video2Name',
      type: 'text',
      label: 'Video 2 Name',
      initial: 'Wasteland Documentary'
    },
    {
      key: 'video3',
      type: 'file',
      kind: 'video',
      label: 'Video 3',
    },
    {
      key: 'video3Name',
      type: 'text',
      label: 'Video 3 Name',
      initial: 'Nuka-Cola Advertisement'
    },
    {
      key: 'video4',
      type: 'file',
      kind: 'video',
      label: 'Video 4',
    },
    {
      key: 'video4Name',
      type: 'text',
      label: 'Video 4 Name',
      initial: 'RobCo Terminal Tutorial'
    },
    {
      key: 'video5',
      type: 'file',
      kind: 'video',
      label: 'Video 5',
    },
    {
      key: 'video5Name',
      type: 'text',
      label: 'Video 5 Name',
      initial: 'Atomic Age Wonders'
    },
    {
      type: 'section',
      label: 'Player Settings'
    },
    {
      key: 'screenMeshName',
      type: 'text',
      label: 'Screen Mesh Name',
      initial: 'Screen',
      description: 'Name of the mesh in your 3D model to use as the screen'
    },
    {
      key: 'aspectRatio',
      type: 'switch',
      label: 'Aspect Ratio',
      options: [
        { label: '16:9', value: 16/9 },
        { label: '4:3', value: 4/3 },
        { label: '1:1', value: 1 },
        { label: '21:9', value: 21/9 }
      ],
      initial: 16/9
    },
    {
      key: 'defaultVolume',
      type: 'switch',
      label: 'Default Volume',
      options: [
        { label: 'Low', value: 15 },
        { label: 'Medium', value: 25 },
        { label: 'High', value: 50 }
      ],
      initial: 10
    },
    {
      key: 'autoplay',
      type: 'switch',
      label: 'Auto-Play',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ],
      initial: true
    },
    {
      key: 'shuffle',
      type: 'switch',
      label: 'Shuffle Videos',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ],
      initial: false
    },
    {
      key: 'controlColor',
      type: 'color',
      label: 'Control UI Color',
      initial: '#00aaff'
    },
    {
      type: 'section',
      label: 'Audio Settings'
    },
    {
      key: 'isSpatial',
      type: 'switch',
      label: 'Audio Type',
      options: [
        { label: 'Spatial (3D)', value: true },
        { label: 'Global', value: false }
      ],
      initial: true
    },
    {
      key: 'minDistance',
      type: 'number',
      label: 'Min Distance',
      initial: 5,
      min: 1,
      max: 50,
      description: 'Distance where audio starts to fade (in meters)'
    },
    {
      key: 'maxDistance',
      type: 'number',
      label: 'Max Distance',
      initial: 20,
      min: 1,
      max: 100,
      description: 'Distance where audio becomes inaudible (in meters)'
    },
    {
      key: 'rolloffFactor',
      type: 'switch',
      label: 'Falloff Rate',
      options: [
        { label: 'Gradual', value: 1 },
        { label: 'Medium', value: 2 },
        { label: 'Steep', value: 4 }
      ],
      initial: 2
    },
    {
      key: 'showControls',
      type: 'switch',
      label: 'Show Controls',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ],
      initial: true
    },
    {
      key: 'showMiniControls',
      type: 'switch',
      label: 'Show Screen Controls',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ],
      initial: true
    },
    {
      type: 'section',
      label: 'Sound Effects'
    },
    {
      key: 'channelChangeSound',
      type: 'file',
      kind: 'audio',
      label: 'Channel Change Sound',
      description: 'Sound effect that plays when switching videos'
    },
    {
      key: 'channelChangeSoundVolume',
      type: 'switch',
      label: 'SFX Volume',
      options: [
        { label: 'Low', value: 0.3 },
        { label: 'Medium', value: 0.6 },
        { label: 'High', value: 1.0 }
      ],
      initial: 0.6
    }
  ])
  
  // Create the video playlist
  const videoPlaylist = []
  
  // Helper function to add videos to the playlist
  function addVideoToPlaylist(video, name, index) {
    if (video && video.url) {
      videoPlaylist.push({
        id: index,
        url: video.url,
        name: name || `Video ${index}`,
        duration: 0 // Will be updated when video plays
      })
    }
  }
  
  // Add all configured videos to the playlist
  addVideoToPlaylist(app.props.video1, app.props.video1Name, 1)
  addVideoToPlaylist(app.props.video2, app.props.video2Name, 2)
  addVideoToPlaylist(app.props.video3, app.props.video3Name, 3)
  addVideoToPlaylist(app.props.video4, app.props.video4Name, 4)
  addVideoToPlaylist(app.props.video5, app.props.video5Name, 5)
  
  // Set up video player state
  const player = {
    currentVideoIndex: 0,
    isPlaying: app.props.autoplay !== false,
    isShuffling: app.props.shuffle === true,
    volume: app.props.defaultVolume || 10,
    elapsedTime: 0,
    duration: 0
  }
  
  // If shuffle is enabled, randomize the first video
  if (player.isShuffling && videoPlaylist.length > 1) {
    player.currentVideoIndex = Math.floor(Math.random() * videoPlaylist.length)
  }
  
  if (world.isClient) {
    // Get screen mesh name from props or use default
    const screenName = app.props.screenMeshName || 'Screen'
    const mesh = app.get(screenName)
    
    // Create the channel change sound effect audio node if configured
    let channelChangeSound = null
    if (app.props.channelChangeSound && app.props.channelChangeSound.url) {
      channelChangeSound = app.create('audio', {
        src: app.props.channelChangeSound.url,
        spatial: false, // Make it non-spatial so it's always heard clearly
        loop: false,
        volume: app.props.channelChangeSoundVolume || 0.6
      })
      app.add(channelChangeSound)
    }
    
    // Helper function to play channel change sound effect
    function playChannelChangeSound() {
      if (channelChangeSound) {
        // Reset and play the sound
        channelChangeSound.pause()
        channelChangeSound.currentTime = 0
        channelChangeSound.play()
      }
    }
    
    // Error handling if screen mesh is not found
    if (!mesh) {
      console.error(`[VideoPlayer] Screen mesh "${screenName}" not found in the model. Please check the mesh name.`)
      
      // Create an error UI with billboard
      const errorUI = app.create('ui', {
        lit: true,
        doubleside: true,
        width: 300,
        height: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 8,
        padding: 10,
        display: 'flex',
        billboard: 'full' // Make UI always face the player
      })
      
      const errorText = app.create('uitext', {
        value: `Error: Screen mesh "${screenName}" not found.\nCheck configuration.`,
        color: '#ff3333',
        fontSize: 14,
        textAlign: 'center'
      })
      
      errorUI.add(errorText)
      app.add(errorUI)
      return // Exit early
    }
    
    // No videos found
    if (videoPlaylist.length === 0) {
      console.warn('[VideoPlayer] No videos configured.')
      
      // Create a warning UI with billboard
      con

// ... truncated ...
```

---
*Extracted from FTV.hyp. Attachment ID: 1361768826458341649*