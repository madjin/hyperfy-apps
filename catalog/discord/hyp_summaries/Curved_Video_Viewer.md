# Curved_Video_Viewer.hyp

## Metadata
- **Author**: ash
- **Channel**: #🧊│3d-design
- **Date**: 2025-04-20
- **Size**: 5,486 bytes

## Discord Context
> <@415262868217266177> give this a crack

## Blueprint
- **Name**: Curved Video Viewer
- **Version**: 36
- **Model**: `asset://5e68ee6bd1db8b495bbf5478a697f17206f45351124c9de74a5528eb8c05b03b.glb`
- **Script**: `asset://17834869ad98da8b83e3583247a29ef4f4c34c2ed7f9b123a9c004fe93ac8429.js`

## Props
- `video`: NoneType = `None`
- `target`: str = `Screen`
- `loop`: bool = `True`
- `aspect`: str = `16:9`
- `fit`: str = `contain`
- `videoFile`: NoneType = `None`

## Assets
- `[model]` 5e68ee6bd1db8b495bbf5478a697f17206f45351124c9de74a5528eb8c05b03b.glb (2,544 bytes)
- `[script]` 17834869ad98da8b83e3583247a29ef4f4c34c2ed7f9b123a9c004fe93ac8429.js (2,178 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.get()`
**Nodes Created**: `video`

## Keywords (for Discord search)
aHeight, aWidth, active, actual, again, also, always, aspect, based, below, castShadow, configure, contain, control, copy, cover, create, display, doubleside, entire

## Script Source
```javascript
app.configure([
  {
    key: 'videoFile',
    type: 'file',
    kind: 'video',
    label: 'Video File',
    hint: 'An mp4 video file to be played.'
  },
  {
    key: 'videoUrl',
    type: 'text',
    label: 'Video URL',
    placeholder: '.m3u8',
    hint: 'The URL to an HLS (m3u8) video manifest.'
  },
  {
    key: 'target',
    type: 'text',
    label: 'Target',
    hint: 'The name of the object/mesh to display the video on.',
  },
  
  {
    key: 'aspect',
    type: 'text',
    label: 'Aspect Ratio',
    hint: `The physical/visual aspect ratio of your target mesh. The UVs of your target mesh should generally always cover the entire UV space, and then use the 'Fit' property below to control how videos fit onto it.` ,
  },
  {
    key: 'fit',
    type: 'switch',
    label: 'Fit',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Cover', value: 'cover' },
      { label: 'Contain', value: 'contain' },
    ],
    hint: `The strategy used to fit the video onto the target mesh, based on the videos actual aspect ratio vs the target mesh. 'None' will stretch to fit the target mesh UVs. 'Cover' will scale the video up to cover the entire UV space while maintaining its aspect ratio. 'Contain' will scale the video so that it all fits inside the UV space, also while maintaining its aspect ratio.`
  },
  {
    key: 'loop',
    type: 'toggle',
    label: 'Loop',
    hint: 'Whether the video should start again once it reaches the end.'
  },
])

const src =  props.videoFile?.url || props.videoUrl
const target = props.target
const [aWidth, aHeight] = props.aspect.split(':')
const aspect = aWidth / aHeight 
const fit = props.fit
const loop = props.loop

if (world.isClient) {
  const mesh = app.get(target)
  const video = app.create('video', {
    src,
    geometry: mesh.geometry,
    linked: true,
    loop,
    aspect,
    fit,
    doubleside: true,
    castShadow: true,
    receiveShadow: true,
  })
  // move video to same place as target
  video.position.copy(mesh.position)
  video.quaternion.copy(mesh.quaternion)
  video.scale.copy(mesh.scale)
  // remove original mesh
  mesh.active = false
  // play
  app.add(video)
  video.play()
}
```

---
*Extracted from Curved_Video_Viewer.hyp. Attachment ID: 1363490690033516774*