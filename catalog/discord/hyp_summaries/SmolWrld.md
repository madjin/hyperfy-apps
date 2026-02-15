# SmolWrld.hyp

## Metadata
- **Author**: .hyp shaman
- **Channel**: #💻│developers
- **Date**: 2025-03-31
- **Size**: 58,283,751 bytes

## Blueprint
- **Name**: SmolWrld
- **Version**: 248
- **Model**: `asset://4aacaa6629d406f88131fade5ef59ff60a0107bd904a24212cf80ac8c4e968c7.glb`
- **Script**: `asset://9520077c56dc934e0926f01ab30ce8bb3ac5128abaee7c84b36a8e91641a92ff.js`

## Props
- `volume`: float = `7.6`
- `audioType`: str = `music`
- `loop`: bool = `True`
- `spatial`: bool = `True`
- `distanceModel`: str = `exponential`
- `refDistance`: int = `1`
- `maxDistance`: int = `100`
- `rolloffFactor`: int = `10`
- `coneInnerAngle`: int = `360`
- `coneOuterAngle`: int = `360`
- `coneOuterGain`: int = `1`
- `vol1`: int = `1`
- `vol2`: int = `1`
- `loop1`: bool = `True`
- `loop2`: bool = `True`
- `distanceModel1`: str = `exponential`
- `refDistance1`: int = `1`
- `maxDistance1`: int = `40`
- `rolloffFactor1`: int = `3`
- `coneInnerAngle1`: int = `360`
- `coneOuterAngle1`: int = `360`
- `coneOuterGain1`: int = `1`
- `distanceModel2`: str = `exponential`
- `refDistance2`: int = `1`
- `maxDistance2`: int = `40`
- `rolloffFactor2`: int = `3`
- `coneInnerAngle2`: int = `360`
- `coneOuterAngle2`: int = `360`
- `coneOuterGain2`: int = `0`
- `world`: NoneType = `None`
- `water`: audio → `asset://af8dc84b93f03d5643015de2d4e177c7b70b629ab00d3711e222321757d5e987.mp3`
- `worldAudio`: audio → `asset://068bf3bd3c4a97b5846167240135433fe8cac2ee22cfb2fd84e0da5f8c33e298.mp3`
- `worldVolume`: int = `1`
- `worldDistance`: str = `inverse`
- `worldRefDistance`: int = `1`
- `worldMaxDistance`: int = `40`
- `worldRolloff`: int = `3`
- `worldConeInner`: int = `360`
- `worldConeOuter`: int = `360`
- `worldAudioType`: str = `music`
- `worldConeOuterGain`: int = `0`
- `audio`: audio → `asset://068bf3bd3c4a97b5846167240135433fe8cac2ee22cfb2fd84e0da5f8c33e298.mp3`
- `volume2`: float = `24.4`
- `audioType2`: str = `music`
- `audio2`: audio → `asset://af8dc84b93f03d5643015de2d4e177c7b70b629ab00d3711e222321757d5e987.mp3`

## Assets
- `[model]` 4aacaa6629d406f88131fade5ef59ff60a0107bd904a24212cf80ac8c4e968c7.glb (4,980,724 bytes)
- `[script]` 9520077c56dc934e0926f01ab30ce8bb3ac5128abaee7c84b36a8e91641a92ff.js (5,078 bytes)
- `[audio]` af8dc84b93f03d5643015de2d4e177c7b70b629ab00d3711e222321757d5e987.mp3 (1,831,680 bytes)
- `[audio]` 068bf3bd3c4a97b5846167240135433fe8cac2ee22cfb2fd84e0da5f8c33e298.mp3 (24,816,000 bytes)
- `[audio]` 068bf3bd3c4a97b5846167240135433fe8cac2ee22cfb2fd84e0da5f8c33e298.mp3 (24,816,000 bytes)
- `[audio]` af8dc84b93f03d5643015de2d4e177c7b70b629ab00d3711e222321757d5e987.mp3 (1,831,680 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.create()`, `app.get()`, `app.on()`
**Events Listened**: `update`
**Nodes Created**: `audio`

## Keywords (for Discord search)
audio, audio1, audio2, audio3, audio4, audio5, audioSection1, audioSection2, audioType, audioType2, bgaudio, coneInnerAngle, coneInnerAngle2, coneOuterAngle, coneOuterAngle2, coneOuterGain, coneOuterGain2, coneSection, coneSection2, configure

## Script Source
```javascript
const sky = app.get('Sky')
const water = app.get('Water')
const lake = app.get('Water2')

const wRef1 = app.get('WRef1')
const wRef2 = app.get('WRef2')
const wRef3 = app.get('WRef3')
const wRef4 = app.get('WRef4')
const wRef5 = app.get('WRef5')


app.configure([
  //#region bg audio
	{
		type: 'section',
		key: 'audioSection1',
		label: 'Audio Settings'
	},
	{
		type: 'file',
		key: 'audio',
		kind: 'audio',
		label: 'Audio File'
	},
	{
		type: 'range',
		key: 'volume',
		label: 'Volume',
		min: 0,
		max: 42,
		step: 0.1,
		initial: 0.6
	},
	{
		type: 'dropdown',
		key: 'audioType', 
		label: 'Audio Type',
		options: [
			{ label: 'Music', value: 'music' },
			{ label: 'Sound Effect', value: 'sfx' }
		],
		initial: 'music'
	},
	{
		type: 'section',
		key: 'spatialSection',
		label: 'Spatial Audio Settings'
	},
	{
		type: 'dropdown',
		key: 'distanceModel',
		label: 'Distance Model',
		options: [
			{ label: 'Linear', value: 'linear' },
			{ label: 'Inverse', value: 'inverse' },
			{ label: 'Exponential', value: 'exponential' }
		],
		initial: 'inverse'
	},
	{
		type: 'number',
		key: 'refDistance',
		label: 'Reference Distance',
		min: 0,
		max: 10,
		step: 0.1,
		initial: 1
	},
	{
		type: 'number',
		key: 'maxDistance',
		label: 'Maximum Distance',
		min: 1,
		max: 100,
		step: 1,
		initial: 40
	},
	{
		type: 'number',
		key: 'rolloffFactor',
		label: 'Rolloff Factor',
		min: 0,
		max: 10,
		step: 0.1,
		initial: 3
	},
	{
		type: 'section',
		key: 'coneSection',
		label: 'Sound Cone Settings'
	},
	{
		type: 'number',
		key: 'coneInnerAngle',
		label: 'Cone Inner Angle',
		min: 0,
		max: 360,
		step: 1,
		initial: 360
	},
	{
		type: 'number',
		key: 'coneOuterAngle',
		label: 'Cone Outer Angle',
		min: 0,
		max: 360,
		step: 1,
		initial: 360
	},
	{
		type: 'range',
		key: 'coneOuterGain',
		label: 'Cone Outer Gain',
		min: 0,
		max: 1,
		step: 0.1,
		initial: 0
	},
	//#endregion
	//#region fg audio
	{
		type: 'section',
		key: 'audioSection2',
		label: 'Audio2 Settings'
	},
	{
		type: 'file',
		key: 'audio2',
		kind: 'audio',
		label: 'Audio File'
	},
	{
		type: 'range',
		key: 'volume2',
		label: 'Volume',
		min: 0,
		max: 42,
		step: 0.1,
		initial: 0.6
	},
	{
		type: 'dropdown',
		key: 'audioType2', 
		label: 'Audio Type',
		options: [
			{ label: 'Music', value: 'music' },
			{ label: 'Sound Effect', value: 'sfx' }
		],
		initial: 'music'
	},
	{
		type: 'section',
		key: 'spatialSection2',
		label: 'Spatial Audio Settings'
	},
	{
		type: 'dropdown',
		key: 'distanceModel2',
		label: 'Distance Model',
		options: [
			{ label: 'Linear', value: 'linear' },
			{ label: 'Inverse', value: 'inverse' },
			{ label: 'Exponential', value: 'exponential' }
		],
		initial: 'inverse'
	},
	{
		type: 'number',
		key: 'refDistance2',
		label: 'Reference Distance',
		min: 0,
		max: 10,
		step: 0.1,
		initial: 1
	},
	{
		type: 'number',
		key: 'maxDistance2',
		label: 'Maximum Distance',
		min: 1,
		max: 100,
		step: 1,
		initial: 40
	},
	{
		type: 'number',
		key: 'rolloffFactor2',
		label: 'Rolloff Factor',
		min: 0,
		max: 10,
		step: 0.1,
		initial: 3
	},
	{
		type: 'section',
		key: 'coneSection2',
		label: 'Sound Cone Settings'
	},
	{
		type: 'number',
		key: 'coneInnerAngle2',
		label: 'Cone Inner Angle',
		min: 0,
		max: 360,
		step: 1,
		initial: 360
	},
	{
		type: 'number',
		key: 'coneOuterAngle2',
		label: 'Cone Outer Angle',
		min: 0,
		max: 360,
		step: 1,
		initial: 360
	},
	{
		type: 'range',
		key: 'coneOuterGain2',
		label: 'Cone Outer Gain',
		min: 0,
		max: 1,
		step: 0.1,
		initial: 0
	},
	//#endregion
	])
 


const bgaudio = app.create('audio', {
	src: props.audio?.url,
	volume: props.volume || 0,
	group: props.audioType || 'music',
	spatial: true
})

const audio1 = app.create('audio', {
	src: props.audio2?.url,
	volume: props.volume2 || 0,
	group: props.audioType2 || 'music',
	spatial: true
})
const audio2 = app.create('audio', {
	src: props.audio2?.url,
	volume: props.volume2 || 0,
	group: props.audioType2 || 'music',
	spatial: true
})
const audio3 = app.create('audio', {
	src: props.audio2?.url,
	volume: props.volume2 || 0,
	group: props.audioType2 || 'music',
	spatial: true
})
const audio4 = app.create('audio', {
	src: props.audio2?.url,
	volume: props.volume2 || 0,
	group: props.audioType2 || 'music',
	spatial: true
})
const audio5 = app.create('audio', {
	src: props.audio2?.url,
	volume: props.volume2 || 0,
	group: props.audioType2 || 'music',
	spatial: true
})

lake.add(bgaudio)
wRef1.add(audio1)
wRef2.add(audio2)
wRef3.add(audio3)
wRef4.add(audio4)
wRef5.add(audio5)

app.on('update', () => {
  bgaudio.play()
	audio1.play()
	audio2.play()
	audio3.play()
	audio4.play()
	audio5.play()
})

app.on('update', delta => {
	sky.rotation.y += 0.02 * delta
	water.material.textureY -= 1 * delta
})

```

---
*Extracted from SmolWrld.hyp. Attachment ID: 1356346677547634890*