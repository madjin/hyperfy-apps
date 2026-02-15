export default function main(world, app, fetch, props, setTimeout) {
// WASTELAND JUKEBOX 3000
// A multi-track audio jukebox for Hyperfy

// Configure our jukebox properties
app.configure([
	{
		key: 'title',
		type: 'text',
		label: 'Jukebox Title',
		initial: 'Wasteland Jukebox 3000'
	},
	{
		type: 'section',
		label: 'Audio Tracks'
	},
	{
		key: 'track1',
		type: 'file',
		kind: 'audio',
		label: 'Track 1'
	},
	{
		key: 'track1Name',
		type: 'text',
		label: 'Track 1 Name',
		initial: 'Wasteland Blues'
	},
	{
		key: 'track2',
		type: 'file',
		kind: 'audio',
		label: 'Track 2'
	},
	{
		key: 'track2Name',
		type: 'text',
		label: 'Track 2 Name',
		initial: 'Nuclear Swing'
	},
	{
		key: 'track3',
		type: 'file',
		kind: 'audio',
		label: 'Track 3'
	},
	{
		key: 'track3Name',
		type: 'text',
		label: 'Track 3 Name',
		initial: 'Atomic Road'
	},
	{
		key: 'track4',
		type: 'file',
		kind: 'audio',
		label: 'Track 4'
	},
	{
		key: 'track4Name',
		type: 'text',
		label: 'Track 4 Name',
		initial: 'Desert Mirage'
	},
	{
		key: 'track5',
		type: 'file',
		kind: 'audio',
		label: 'Track 5'
	},
	{
		key: 'track5Name',
		type: 'text',
		label: 'Track 5 Name',
		initial: 'Neon Canyon'
	},
	{
		type: 'section',
		label: 'Jukebox Settings'
	},
	{
		key: 'defaultVolume',
		type: 'switch',
		label: 'Default Volume',
		options: [
			{ label: 'Low', value: 0.3 },
			{ label: 'Medium', value: 0.6 },
			{ label: 'High', value: 1.0 }
		],
		initial: 0.6
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
		key: 'jukeboxColor',
		type: 'color',
		label: 'Jukebox Accent Color',
		initial: '#ff9d00'
	}
])

// Create our playlist from the configured tracks
const playlist = []
// Function to add tracks to playlist if they exist
function addTrackToPlaylist(track, name, index) {
	if (track && track.url) {
		playlist.push({
			id: index,
			url: track.url,
			name: name || `Track ${index}`,
			duration: 0 // Will be updated when track plays
		})
	}
}

// Add all configured tracks to the playlist
addTrackToPlaylist(app.props.track1, app.props.track1Name, 1)
addTrackToPlaylist(app.props.track2, app.props.track2Name, 2)
addTrackToPlaylist(app.props.track3, app.props.track3Name, 3)
addTrackToPlaylist(app.props.track4, app.props.track4Name, 4)
addTrackToPlaylist(app.props.track5, app.props.track5Name, 5)

// Set up jukebox state
const jukebox = {
	currentTrackIndex: 0,
	isPlaying: false,
	isLooping: false,
	isShuffling: false,
	volume: app.props.defaultVolume || 0.6,
	elapsedTime: 0,
	trackDuration: 0,
	isSelected: false
}

// Create the audio element
const audio = app.create('audio', {
	src: playlist.length > 0 ? playlist[0].url : null,
	volume: jukebox.volume,
	spatial: app.props.isSpatial !== false, // Default to spatial if not specified
	group: 'music'
})

// Function to play the current track
function playCurrentTrack() {
	if (playlist.length === 0) {
		console.warn('No tracks in playlist')
		return
	}
	
	const currentTrack = playlist[jukebox.currentTrackIndex]
	audio.src = currentTrack.url
	audio.play()
	jukebox.isPlaying = true
	
	// Update UI display
	if (trackNameText) {
		trackNameText.value = currentTrack.name
	}
	if (statusText) {
		statusText.value = 'Playing'
	}
}

// Functions to navigate the playlist
function nextTrack() {
	if (playlist.length === 0) return
	
	if (jukebox.isShuffling) {
		// Pick a random track that's not the current one
		const oldIndex = jukebox.currentTrackIndex
		do {
			jukebox.currentTrackIndex = Math.floor(Math.random() * playlist.length)
		} while (jukebox.currentTrackIndex === oldIndex && playlist.length > 1)
	} else {
		// Normal sequential next
		jukebox.currentTrackIndex = (jukebox.currentTrackIndex + 1) % playlist.length
	}
	
	audio.stop()
	playCurrentTrack()
}

function prevTrack() {
	if (playlist.length === 0) return
	
	if (jukebox.isShuffling) {
		// Pick a random track that's not the current one
		const oldIndex = jukebox.currentTrackIndex
		do {
			jukebox.currentTrackIndex = Math.floor(Math.random() * playlist.length)
		} while (jukebox.currentTrackIndex === oldIndex && playlist.length > 1)
	} else {
		// Normal sequential previous
		jukebox.currentTrackIndex = (jukebox.currentTrackIndex - 1 + playlist.length) % playlist.length
	}
	
	audio.stop()
	playCurrentTrack()
}

// Function to toggle shuffle mode
function toggleShuffle() {
	jukebox.isShuffling = !jukebox.isShuffling
	if (shuffleBtn) {
		shuffleBtn.backgroundColor = jukebox.isShuffling 
			? app.props.jukeboxColor || '#ff9d00' 
			: 'transparent'
	}
}

// Function to toggle loop mode
function toggleLoop() {
	jukebox.isLooping = !jukebox.isLooping
	audio.loop = jukebox.isLooping
	if (loopBtn) {
		loopBtn.backgroundColor = jukebox.isLooping 
			? app.props.jukeboxColor || '#ff9d00' 
			: 'transparent'
	}
}

// Helper function to format time in MM:SS format
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Create jukebox UI
const ui = app.create('ui', {
	lit: true,
	doubleside: false,
	width: 250,
	height: 260, // Reduced height since we're removing controls
	backgroundColor: 'rgba(0, 0, 0, 0.92)',
	borderRadius: 10,
	padding: 10,
	display: 'flex'  // Always visible
})
ui.position.set(0, 3, 0.2) // Keep the main UI where it is
app.add(ui)
app.add(audio)

// Title bar
const titleBar = app.create('uiview', {
	display: 'flex',
	padding: 6,
	flexDirection: 'row',
	justifyContent: 'center',
	alignItems: 'center',
	width: 230,
	height: 40,
	backgroundColor: app.props.jukeboxColor || '#ff9d00',
	borderRadius: 5,
})

const titleText = app.create('uitext', {
	value: app.props.title || 'Wasteland Jukebox 3000',
	color: 'black',
	fontSize: 18,
	fontWeight: 'bold'
})

ui.add(titleBar)
titleBar.add(titleText)

// Track info display
const trackInfoView = app.create('uiview', {
	display: 'flex',
	padding: 8,
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'center',
	width: 230,
	height: 60,
	backgroundColor: 'rgba(20, 20, 20, 0.8)',
	borderRadius: 5,
	marginTop: 8
})

const nowPlayingText = app.create('uitext', {
	value: 'NOW PLAYING',
	color: 'rgba(255, 255, 255, 0.7)',
	fontSize: 12
})

const trackNameText = app.create('uitext', {
	value: playlist.length > 0 ? playlist[0].name : 'No Track',
	color: 'white',
	fontSize: 14,
	fontWeight: 'bold',
	marginTop: 3
})

// Time display
const timeView = app.create('uiview', {
	display: 'flex',
	padding: 3,
	flexDirection: 'row',
	justifyContent: 'center',
	alignItems: 'center',
	width: 230,
	height: 24
})

const timeText = app.create('uitext', {
	value: '00:00 / 00:00',
	color: 'rgba(255, 255, 255, 0.7)',
	fontSize: 12
})

ui.add(trackInfoView)
trackInfoView.add(nowPlayingText)
trackInfoView.add(trackNameText)
ui.add(timeView)
timeView.add(timeText)

// Remove all the playback controls and advanced controls from main UI

// Status bar
const statusView = app.create('uiview', {
	display: 'flex',
	padding: 3,
	flexDirection: 'row',
	justifyContent: 'center',
	alignItems: 'center',
	width: 230,
	height: 24,
	backgroundColor: 'transparent',
	borderRadius: 5,
	marginTop: 8
})

const statusText = app.create('uitext', {
	value: 'Ready',
	color: 'rgba(255, 255, 255, 0.7)',
	fontSize: 12
})

ui.add(statusView)
statusView.add(statusText)

// Jukebox image with visualizer
const jukeboxImage = app.create('uiview', {
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'center',
	width: 230,
	height: 100,
	marginTop: 8
})

// Playlist label
const playlistLabel = app.create('uitext', {
	value: 'VISUALIZER',
	color: 'rgba(255, 255, 255, 0.7)',
	fontSize: 12,
	marginBottom: 3
})

jukeboxImage.add(playlistLabel)

// Create visualizer container
const visualizerContainer = app.create('uiview', {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 230,
    height: 60,
    backgroundColor: 'transparent',
    borderRadius: 4
})

// Create visualizer bars
const numBars = 15
const visualizerBars = []
const barColors = [
    app.props.jukeboxColor || '#ff9d00',
    '#ff7700',
    '#ff5500',
    '#ff3300'
]

for (let i = 0; i < numBars; i++) {
    const bar = app.create('uiview', {
        width: 10,
        height: 5,
        marginLeft: 1,
        marginRight: 1,
        backgroundColor: barColors[0]
    })
    visualizerBars.push(bar)
    visualizerContainer.add(bar)
}

jukeboxImage.add(visualizerContainer)
ui.add(jukeboxImage)

// Simplified playlist view - just show current track + controls
const playlistControls = app.create('uiview', {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'center',
	alignItems: 'center',
	width: 230,
	height: 30,
	marginTop: 4
})

// Track selector text (shows current track/total)
const trackSelector = app.create('uitext', {
	value: playlist.length > 0 ? `Track: ${jukebox.currentTrackIndex + 1}/${playlist.length}` : 'No Tracks',
	color: 'white',
	fontSize: 12
})

playlistControls.add(trackSelector)
ui.add(playlistControls)

// Update the track selector when changing tracks
function updateTrackSelector() {
    if (playlist.length > 0) {
        trackSelector.value = `Track: ${jukebox.currentTrackIndex + 1}/${playlist.length}`;
    }
}

// Update our track navigation functions to update the selector
const originalNextTrack = nextTrack;
nextTrack = function() {
    originalNextTrack();
    updateTrackSelector();
};

const originalPrevTrack = prevTrack;
prevTrack = function() {
    originalPrevTrack();
    updateTrackSelector();
};

// Track completion handler
app.on('track:ended', () => {
	if (jukebox.isLooping) {
		// Single track is looping, it will auto-restart
		return
	}
	
	// Auto-advance to next track when current one ends
	nextTrack()
})

// Update loop - add visualizer animation
app.on('update', (dt) => {
    try {
        // Update time display if audio is playing
        if (jukebox.isPlaying) {
            // Update elapsed time (rough approximation, we don't have actual elapsed time API)
            jukebox.elapsedTime += dt
            // Cap elapsed time to track duration if we know it
            if (playlist[jukebox.currentTrackIndex]?.duration > 0) {
                jukebox.elapsedTime = Math.min(jukebox.elapsedTime, playlist[jukebox.currentTrackIndex].duration)
            }
            
            // Update time display
            const elapsed = formatTime(jukebox.elapsedTime)
            const duration = playlist[jukebox.currentTrackIndex]?.duration > 0 
                ? formatTime(playlist[jukebox.currentTrackIndex].duration)
                : '--:--'
            timeText.value = `${elapsed} / ${duration}`
            
            // Update visualizer with random heights when playing
            for (let i = 0; i < visualizerBars.length; i++) {
                // Generate random heights for each bar
                const heightMultiplier = jukebox.isPlaying ? (0.2 + Math.random() * 0.8) : 0.1
                const maxHeight = 40 * heightMultiplier * jukebox.volume
                // Some bars are taller based on position (like a real equalizer)
                const positionFactor = (i === 0 || i === visualizerBars.length - 1) ? 0.5 :
                                      (i === 1 || i === visualizerBars.length - 2) ? 0.7 :
                                      (i >= Math.floor(visualizerBars.length / 2) - 1 && i <= Math.floor(visualizerBars.length / 2) + 1) ? 1.0 : 0.85
                
                const newHeight = Math.max(5, Math.floor(maxHeight * positionFactor))
                visualizerBars[i].height = newHeight
                
                // Color based on height
                const colorIndex = Math.min(3, Math.floor(newHeight / 12))
                visualizerBars[i].backgroundColor = barColors[colorIndex]
            }
        } else {
            // When not playing, set visualizer to minimal height
            for (let i = 0; i < visualizerBars.length; i++) {
                visualizerBars[i].height = 5
                visualizerBars[i].backgroundColor = barColors[0]
            }
        }
    } catch (err) {
        console.error('Error in update loop:', err)
    }
})

// If we have at least one track, initialize with it
if (playlist.length > 0) {
    statusText.value = 'Ready to Play'
    
    // Set up initial track
    audio.src = playlist[0].url
}

// Make the UI interactable
ui.onPointerDown = () => {
    console.log('Jukebox clicked')
    // Set a flag to remember the jukebox is selected
    jukebox.isSelected = true
}

// Create a floating mini control panel for bottom right corner
if (world.isClient) {
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
        prevTrack()
        console.log('Mini controls: Previous track')
    });
    
    // Play button
    const miniPlayBtn = createMiniButton('▶️', () => {
        if (!jukebox.isPlaying) {
            playCurrentTrack()
        } else {
            audio.play()
        }
        jukebox.isPlaying = true
        statusText.value = 'Playing'
        console.log('Mini controls: Play')
    });
    
    // Pause button
    const miniPauseBtn = createMiniButton('⏸️', () => {
        audio.pause()
        jukebox.isPlaying = false
        statusText.value = 'Paused'
        console.log('Mini controls: Pause')
    });
    
    // Next track button
    const miniNextBtn = createMiniButton('⏭️', () => {
        nextTrack()
        console.log('Mini controls: Next track')
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
        miniShuffleBtn.color = jukebox.isShuffling ? '#ff9d00' : '#fcba03';
        console.log('Mini controls: Toggle shuffle');
    });
    
    // Loop button for mini controls
    const miniLoopBtn = createMiniButton('🔁', () => {
        toggleLoop();
        miniLoopBtn.color = jukebox.isLooping ? '#ff9d00' : '#fcba03';
        console.log('Mini controls: Toggle loop');
    });
    
    // Volume down button for mini controls
    const miniVolumeDown = createMiniButton('🔉', () => {
        jukebox.volume = Math.max(0, jukebox.volume - 0.1);
        audio.volume = jukebox.volume;
        miniVolumeText.value = `${Math.round(jukebox.volume * 100)}%`;
        console.log('Mini controls: Volume down');
    });
    
    // Volume text for mini controls
    const miniVolumeText = app.create('uitext', {
        value: `${Math.round(jukebox.volume * 100)}%`,
        color: '#fcba03',
        fontSize: 12,
        padding: 2
    });
    
    // Volume up button for mini controls
    const miniVolumeUp = createMiniButton('🔊', () => {
        jukebox.volume = Math.min(1, jukebox.volume + 0.1);
        audio.volume = jukebox.volume;
        miniVolumeText.value = `${Math.round(jukebox.volume * 100)}%`;
        console.log('Mini controls: Volume up');
    });
    
    // Add advanced buttons to container
    miniAdvancedContainer.add(miniShuffleBtn);
    miniAdvancedContainer.add(miniLoopBtn);
    miniAdvancedContainer.add(miniVolumeDown);
    miniAdvancedContainer.add(miniVolumeText);
    miniAdvancedContainer.add(miniVolumeUp);
    
    // Track name display
    const miniTrackName = app.create('uitext', {
        value: playlist.length > 0 ? playlist[jukebox.currentTrackIndex].name : 'No Track',
        color: app.props.jukeboxColor || '#ff9d00',
        fontSize: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 4,
        padding: 4,
        width: 200,
        textAlign: 'center'
    });
    
    // Update track name when changing tracks
    const originalNextTrack = nextTrack;
    nextTrack = function() {
        originalNextTrack();
        updateTrackSelector();
        if (miniTrackName) {
            miniTrackName.value = playlist.length > 0 ? playlist[jukebox.currentTrackIndex].name : 'No Track';
        }
    };
    
    const originalPrevTrack = prevTrack;
    prevTrack = function() {
        originalPrevTrack();
        updateTrackSelector();
        if (miniTrackName) {
            miniTrackName.value = playlist.length > 0 ? playlist[jukebox.currentTrackIndex].name : 'No Track';
        }
    };
    
    // Modify toggleShuffle to update mini controls
    const originalToggleShuffle = toggleShuffle;
    toggleShuffle = function() {
        originalToggleShuffle();
        if (miniShuffleBtn) {
            miniShuffleBtn.color = jukebox.isShuffling ? '#ff9d00' : '#fcba03';
        }
    };
    
    // Modify toggleLoop to update mini controls
    const originalToggleLoop = toggleLoop;
    toggleLoop = function() {
        originalToggleLoop();
        if (miniLoopBtn) {
            miniLoopBtn.color = jukebox.isLooping ? '#ff9d00' : '#fcba03';
        }
    };
    
    // Add elements to mini panel
    miniControlPanel.add(miniTrackName);
    miniControlPanel.add(miniPlaybackContainer);
    miniControlPanel.add(miniAdvancedContainer);
    
    // Add mini control panel to world
    app.add(miniControlPanel);
}
}
