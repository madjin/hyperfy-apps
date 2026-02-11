# JUKEBOX_UI.hyp

## Metadata
- **Author**: ~/drdoge.eth
- **Channel**: #💻│developers
- **Date**: 2025-03-26
- **Size**: 10,919,593 bytes

## Blueprint
- **Name**: JUKEBOX_UI
- **Version**: 16
- **Model**: `asset://963676df4c80f7e186147fee1eddf212c61dc9c21abbba18601515caf5bc95b7.glb`
- **Script**: `asset://beff08ec1982a9695efd5cdc2eeb7064722df14c6183b637fa8855dc07a4a5a4.js`

## Props
- `volume`: float = `0.5`
- `title`: str = `Wasteland Jukebox 3000`
- `track1Name`: str = `Chopper Style`
- `track2Name`: str = `Nuclear Swing`
- `track3Name`: str = `Atomic Road`
- `track4Name`: str = `Desert Mirage`
- `track5Name`: str = `Neon Canyon`
- `defaultVolume`: int = `1`
- `isSpatial`: bool = `True`
- `jukeboxColor`: str = `#ff9d00`
- `track1`: audio → `asset://fa33f6b07294a9e6df72f8d2d0a640b4f9eebfc386a0e606555454c1a3dd7e54.mp3`
- `track2`: NoneType = `None`
- `track3`: NoneType = `None`
- `track4`: NoneType = `None`
- `track5`: NoneType = `None`

## Assets
- `[model]` 963676df4c80f7e186147fee1eddf212c61dc9c21abbba18601515caf5bc95b7.glb (5,035,840 bytes)
- `[script]` beff08ec1982a9695efd5cdc2eeb7064722df14c6183b637fa8855dc07a4a5a4.js (19,987 bytes)
- `[audio]` fa33f6b07294a9e6df72f8d2d0a640b4f9eebfc386a0e606555454c1a3dd7e54.mp3 (5,862,521 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.on()`
**Events Listened**: `track:ended`, `update`
**Nodes Created**: `audio`, `ui`, `uitext`, `uiview`

## Keywords (for Discord search)
action, actual, addTrackToPlaylist, advance, advanced, alignItems, amber, animation, approximation, audio, auto, backgroundColor, barColors, bars, based, black, bold, borderRadius, bottom, button

## Script Source
```javascript
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

// ... truncated ...
```

---
*Extracted from JUKEBOX_UI.hyp. Attachment ID: 1354513817542856807*