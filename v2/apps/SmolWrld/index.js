export default function main(world, app, fetch, props, setTimeout) {
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

}
