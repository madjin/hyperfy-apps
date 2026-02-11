export default function main(world, app, fetch, props, setTimeout) {
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
      const warningUI = app.create('ui', {
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
      
      const warningText = app.create('uitext', {
        value: `No videos configured.\nPlease add videos in properties.`,
        color: '#ffaa33',
        fontSize: 14,
        textAlign: 'center'
      })
      
      warningUI.add(warningText)
      app.add(warningUI)
      return // Exit early
    }
    
    // Create video with screen geometry
    const video = app.create('video', {
      src: videoPlaylist.length > 0 ? videoPlaylist[player.currentVideoIndex].url : null,
      linked: true,
      loop: false, // We'll handle looping manually for playlist functionality
      aspect: app.props.aspectRatio || 16/9,
      geometry: mesh.geometry,
      cover: true,
      volume: player.volume / 15, // Convert to 0-1 range for the video element
      spatial: app.props.isSpatial !== false, // Spatial audio by default
      minDistance: app.props.minDistance || 5,
      maxDistance: app.props.maxDistance || 20,
      rolloffFactor: app.props.rolloffFactor || 2
    })
    
    // Move video to same place as mesh
    video.position.copy(mesh.position)
    video.quaternion.copy(mesh.quaternion)
    video.scale.copy(mesh.scale)
    video.position.z += 0.01
  
    // Add video to the scene
    app.add(video)
    
    // Helper function to format time in MM:SS format
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    
    // Functions to navigate the playlist
    function playCurrentVideo() {
      if (videoPlaylist.length === 0) {
        console.warn('No videos in playlist')
        return
      }
      
      const currentVideo = videoPlaylist[player.currentVideoIndex]
      video.src = currentVideo.url
      
      // Add a small delay before playing to ensure the source has loaded
      setTimeout(() => {
        try {
          video.play()
          player.isPlaying = true
          player.elapsedTime = 0
          
          // Update UI elements
          if (videoNameText) {
            videoNameText.value = currentVideo.name
          }
          if (statusText) {
            statusText.value = 'Playing'
          }
          if (videoSelector) {
            videoSelector.value = `Video: ${player.currentVideoIndex + 1}/${videoPlaylist.length}`
          }
          if (timeText) {
            timeText.value = '00:00 / --:--'
          }
        } catch (err) {
          console.error('[VideoPlayer] Error playing video:', err)
          statusText.value = 'Error Playing'
        }
      }, 100)
    }
    
    function nextVideo() {
      if (videoPlaylist.length === 0) return
      
      // Play channel change sound
      playChannelChangeSound()
      
      if (player.isShuffling) {
        // Pick a random video that's not the current one
        const oldIndex = player.currentVideoIndex
        do {
          player.currentVideoIndex = Math.floor(Math.random() * videoPlaylist.length)
        } while (player.currentVideoIndex === oldIndex && videoPlaylist.length > 1)
      } else {
        // Normal sequential next
        player.currentVideoIndex = (player.currentVideoIndex + 1) % videoPlaylist.length
      }
      
      playCurrentVideo()
    }
    
    function prevVideo() {
      if (videoPlaylist.length === 0) return
      
      // Play channel change sound
      playChannelChangeSound()
      
      if (player.isShuffling) {
        // Pick a random video that's not the current one
        const oldIndex = player.currentVideoIndex
        do {
          player.currentVideoIndex = Math.floor(Math.random() * videoPlaylist.length)
        } while (player.currentVideoIndex === oldIndex && videoPlaylist.length > 1)
      } else {
        // Normal sequential previous
        player.currentVideoIndex = (player.currentVideoIndex - 1 + videoPlaylist.length) % videoPlaylist.length
      }
      
      playCurrentVideo()
    }
    
    // Function to toggle shuffle mode
    function toggleShuffle() {
      player.isShuffling = !player.isShuffling
      if (shuffleBtn) {
        shuffleBtn.backgroundColor = player.isShuffling 
          ? app.props.controlColor || '#00aaff' 
          : 'rgba(30, 30, 30, 0.8)'
      }
    }
    
    // Handle video completion
    app.on('video:ended', () => {
      console.log('[VideoPlayer] Video ended, playing next video')
      nextVideo()
    })
    
    // Also handle errors
    app.on('video:error', (error) => {
      console.error('[VideoPlayer] Video error:', error)
      statusText.value = 'Error: Try Next Video'
    })
    
    // Only create controls if enabled
    let videoNameText, statusText, timeText, videoSelector, shuffleBtn
    
    if (app.props.showControls !== false) {
      // Create UI controls with extra height for playlist controls
      const controlUI = app.create('ui', {
        lit: true,
        doubleside: true,
        width: 200,
        height: 170, // Increased height for video playlist controls
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 8,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        billboard: 'full' // Make UI always face the player
      })
      
      // Calculate position below the video based on mesh scale
      controlUI.position.copy(mesh.position)
      controlUI.quaternion.copy(mesh.quaternion)
      
      // Calculate appropriate offset based on mesh scale
      const offsetY = mesh.scale.y / 1.5
      controlUI.position.y -= offsetY
      
      // Title bar
      const titleBar = app.create('uiview', {
        display: 'flex',
        padding: 6,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 180,
        height: 24,
        backgroundColor: app.props.controlColor || '#00aaff',
        borderRadius: 4,
      })
      
      const titleText = app.create('uitext', {
        value: 'VAULT-TEC VIDPLAYER',
        color: 'black',
        fontSize: 12,
        fontWeight: 'bold'
      })
      
      titleBar.add(titleText)
      
      // Video info display
      const videoInfoView = app.create('uiview', {
        display: 'flex',
        padding: 5,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: 180,
        height: 38,
        backgroundColor: 'rgba(20, 20, 20, 0.8)',
        borderRadius: 4
      })
      
      const nowPlayingText = app.create('uitext', {
        value: 'NOW PLAYING',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 10
      })
      
      videoNameText = app.create('uitext', {
        value: videoPlaylist.length > 0 ? videoPlaylist[player.currentVideoIndex].name : 'No Video',
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold'
      })
      
      videoInfoView.add(nowPlayingText)
      videoInfoView.add(videoNameText)
      
      // Time display
      const timeView = app.create('uiview', {
        display: 'flex',
        padding: 3,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 180,
        height: 20
      })
      
      timeText = app.create('uitext', {
        value: '00:00 / --:--',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 10
      })
      
      timeView.add(timeText)
      
      // Create playback container for controls
      const playbackControls = app.create('uiview', {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 180,
        height: 26,
        gap: 4
      })
      
      // Helper function to create control buttons
      const createButton = (icon, action) => {
        const button = app.create('uitext', {
          value: icon,
          color: '#ffffff',
          fontSize: 14,
          fontWeight: 'bold',
          padding: 4,
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
          borderRadius: 4,
          cursor: 'pointer'
        })
        
        button.onPointerDown = action
        return button
      }
      
      // Create playback buttons
      const prevBtn = createButton('⏮️', () => {
        prevVideo()
        console.log('[VideoPlayer] Previous video button pressed')
      })
      
      const playBtn = createButton('▶️', () => {
        if (!player.isPlaying) {
          try {
            video.play()
            player.isPlaying = true
            statusText.value = 'Playing'
            console.log('[VideoPlayer] Play button pressed')
          } catch (err) {
            console.error('[VideoPlayer] Error playing video:', err)
            statusText.value = 'Error Playing'
          }
        }
      })
      
      const pauseBtn = createButton('⏸️', () => {
        if (player.isPlaying) {
          try {
            video.pause()
            player.isPlaying = false
            statusText.value = 'Paused'
            console.log('[VideoPlayer] Pause button pressed')
          } catch (err) {
            console.error('[VideoPlayer] Error pausing video:', err)
          }
        }
      })
      
      const stopBtn = createButton('⏹️', () => {
        try {
          video.pause()
          // We can't directly set currentTime in Hyperfy, so we'll need to track time differently
          player.elapsedTime = 0
          player.isPlaying = false
          statusText.value = 'Stopped'
          timeText.value = '00:00 / --:--'
          console.log('[VideoPlayer] Stop button pressed')
        } catch (err) {
          console.error('[VideoPlayer] Error stopping video:', err)
        }
      })
      
      const nextBtn = createButton('⏭️', () => {
        nextVideo()
        console.log('[VideoPlayer] Next video button pressed')
      })
      
      // Add buttons to container
      playbackControls.add(prevBtn)
      playbackControls.add(playBtn)
      playbackControls.add(pauseBtn)
      playbackControls.add(stopBtn)
      playbackControls.add(nextBtn)
      
      // Advanced options
      const advancedControls = app.create('uiview', {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 180,
        height: 20,
        gap: 5
      })
      
      shuffleBtn = app.create('uitext', {
        value: '🔀',
        color: '#ffffff',
        fontSize: 14,
        padding: 3,
        backgroundColor: player.isShuffling 
          ? app.props.controlColor || '#00aaff' 
          : 'rgba(30, 30, 30, 0.8)',
        borderRadius: 4,
        cursor: 'pointer'
      })
      
      shuffleBtn.onPointerDown = toggleShuffle
      
      // Video selector (shows current/total)
      videoSelector = app.create('uitext', {
        value: videoPlaylist.length > 0 ? `Video: ${player.currentVideoIndex + 1}/${videoPlaylist.length}` : 'No Videos',
        color: 'white',
        fontSize: 10,
        padding: 3
      })
      
      advancedControls.add(shuffleBtn)
      advancedControls.add(videoSelector)
      
      // Volume controls
      const volumeControls = app.create('uiview', {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 180,
        height: 20,
        gap: 5
      })
      
      // Volume down button
      const volumeDown = createButton('🔉', () => {
        player.volume = Math.max(0, player.volume - 1)
        video.volume = player.volume / 15 // Convert to 0-1 range for the video element
        volumeText.value = `${player.volume}`
      })
      
      // Volume display
      const volumeText = app.create('uitext', {
        value: `${player.volume}`,
        color: '#ffffff',
        fontSize: 10,
        padding: 2
      })
      
      // Volume up button
      const volumeUp = createButton('🔊', () => {
        player.volume = Math.min(15, player.volume + 1)
        video.volume = player.volume / 15 // Convert to 0-1 range for the video element
        volumeText.value = `${player.volume}`
      })
      
      // Add volume controls to container
      volumeControls.add(volumeDown)
      volumeControls.add(volumeText)
      volumeControls.add(volumeUp)
      
      // Audio range info
      const audioInfo = app.create('uitext', {
        value: app.props.isSpatial 
          ? `Range: ${app.props.minDistance || 5}m - ${app.props.maxDistance || 20}m` 
          : 'Global Audio',
        color: '#cccccc',
        fontSize: 8,
        textAlign: 'center'
      })
      
      // Status text
      statusText = app.create('uitext', {
        value: player.isPlaying ? 'Playing' : 'Ready',
        color: app.props.controlColor || '#00aaff',
        fontSize: 10,
        textAlign: 'center'
      })
      
      // Add everything to the UI
      controlUI.add(titleBar)
      controlUI.add(videoInfoView)
      controlUI.add(timeView)
      controlUI.add(playbackControls)
      controlUI.add(advancedControls)
      controlUI.add(volumeControls)
      controlUI.add(audioInfo)
      controlUI.add(statusText)
      
      // Add the control UI to the app
      app.add(controlUI)
    }
    
    // Time updater function
    app.on('update', (dt) => {
      try {
        // Update time display if video is playing
        if (player.isPlaying && timeText) {
          // Update elapsed time
          player.elapsedTime += dt
          
          // Update time display
          const elapsed = formatTime(player.elapsedTime)
          const duration = player.duration > 0 
            ? formatTime(player.duration)
            : '--:--'
          timeText.value = `${elapsed} / ${duration}`
        }
      } catch (err) {
        console.error('[VideoPlayer] Error in update loop:', err)
      }
    })
    
    // Start playing if autoplay is enabled
    if (player.isPlaying && videoPlaylist.length > 0) {
      playCurrentVideo()
    }
    
    // Create a floating mini control panel for bottom right corner (similar to jukebox.js)
    if (world.isClient && videoPlaylist.length > 0) {
      // Create mini control panel
      const miniControlPanel = app.create('ui', {
        lit: true,
        doubleside: false,
        width: 210,
        height: 80,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 8,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        res: 2,  // Higher resolution for sharper UI
        space: 'screen',  // This makes it display on screen, not in world
        position: [1, 1, 1],  // Position at the bottom right
        offset: [-20, -20, 0],  // Offset from the bottom right
        pivot: 'bottom-right',  // Anchor from bottom right
        pointerEvents: true,  // Allow interaction with buttons
        gap: 5
      });
      
      // Video name display
      const miniTrackName = app.create('uitext', {
        value: videoPlaylist.length > 0 ? videoPlaylist[player.currentVideoIndex].name : 'No Video',
        color: app.props.controlColor || '#00aaff',
        fontSize: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 4,
        padding: 4,
        width: 200,
        textAlign: 'center'
      });
      
      // Create playback container for controls
      const miniPlaybackContainer = app.create('uiview', {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 200,
        height: 30,
        gap: 2
      });
      
      // Create mini control buttons with Fallout-style colors
      const createMiniButton = (icon, action, tooltip) => {
        const button = app.create('uitext', {
          value: icon,
          color: '#fcba03', // Fallout amber color
          fontSize: 18,
          fontWeight: 'bold',
          padding: 6,
          backgroundColor: 'transparent',
          borderRadius: 4,
          marginLeft: 3,
          marginRight: 3,
          onPointerDown: action,
          cursor: 'pointer'
        });
        return button;
      };
      
      // Previous track button
      const miniPrevBtn = createMiniButton('⏮️', () => {
        prevVideo();
        console.log('Mini controls: Previous video');
      });
      
      // Play button
      const miniPlayBtn = createMiniButton('▶️', () => {
        if (!player.isPlaying) {
          try {
            video.play();
            player.isPlaying = true;
            statusText.value = 'Playing';
            console.log('Mini controls: Play');
          } catch (err) {
            console.error('[VideoPlayer] Error playing from mini controls:', err);
          }
        }
      });
      
      // Pause button
      const miniPauseBtn = createMiniButton('⏸️', () => {
        if (player.isPlaying) {
          try {
            video.pause();
            player.isPlaying = false;
            statusText.value = 'Paused';
            console.log('Mini controls: Pause');
          } catch (err) {
            console.error('[VideoPlayer] Error pausing from mini controls:', err);
          }
        }
      });
      
      // Next track button
      const miniNextBtn = createMiniButton('⏭️', () => {
        nextVideo();
        console.log('Mini controls: Next video');
      });
      
      // Add playback buttons to container
      miniPlaybackContainer.add(miniPrevBtn);
      miniPlaybackContainer.add(miniPlayBtn);
      miniPlaybackContainer.add(miniPauseBtn);
      miniPlaybackContainer.add(miniNextBtn);
      
      // Create advanced options container
      const miniAdvancedContainer = app.create('uiview', {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 200,
        height: 24,
        gap: 2
      });
      
      // Shuffle button for mini controls
      const miniShuffleBtn = createMiniButton('🔀', () => {
        toggleShuffle();
        miniShuffleBtn.color = player.isShuffling ? app.props.controlColor || '#00aaff' : '#fcba03';
        console.log('Mini controls: Toggle shuffle');
      });
      
      // Volume down button for mini controls
      const miniVolumeDown = createMiniButton('🔉', () => {
        player.volume = Math.max(0, player.volume - 1);
        video.volume = player.volume / 15;
        miniVolumeText.value = `${player.volume}`;
        console.log('Mini controls: Volume down');
      });
      
      // Volume text for mini controls
      const miniVolumeText = app.create('uitext', {
        value: `${player.volume}`,
        color: '#fcba03',
        fontSize: 12,
        padding: 2
      });
      
      // Volume up button for mini controls
      const miniVolumeUp = createMiniButton('🔊', () => {
        player.volume = Math.min(15, player.volume + 1);
        video.volume = player.volume / 15;
        miniVolumeText.value = `${player.volume}`;
        console.log('Mini controls: Volume up');
      });
      
      // Add advanced buttons to container
      miniAdvancedContainer.add(miniShuffleBtn);
      miniAdvancedContainer.add(miniVolumeDown);
      miniAdvancedContainer.add(miniVolumeText);
      miniAdvancedContainer.add(miniVolumeUp);
      
      // Add elements to mini panel
      miniControlPanel.add(miniTrackName);
      miniControlPanel.add(miniPlaybackContainer);
      miniControlPanel.add(miniAdvancedContainer);
      
      // Add mini control panel to world
      app.add(miniControlPanel);
      
      // Update track name when changing videos
      const originalPlayCurrentVideo = playCurrentVideo;
      playCurrentVideo = function() {
        originalPlayCurrentVideo();
        if (miniTrackName) {
          miniTrackName.value = videoPlaylist.length > 0 ? videoPlaylist[player.currentVideoIndex].name : 'No Video';
        }
      };
      
      // Set mini control visibility based on a property we'll add to the main configure
      miniControlPanel.display = app.props.showMiniControls === false ? 'none' : 'flex';
    }
  }
}
