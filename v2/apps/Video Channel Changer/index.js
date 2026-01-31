export default function main(world, app, fetch, props, setTimeout) {
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
  // change channel
  let channel = -1
  const channelUVs = [
    // ordered like a book from top left to bottom right
    [0, 0.75],
    [0.25, 0.75],
    [0.5, 0.75],
    [0.75, 0.75],

    [0, 0.5],
    [0.25, 0.5],
    [0.5, 0.5],
    [0.75, 0.5],

    [0, 0.25],
    [0.25, 0.25],
    [0.5, 0.25],
    [0.75, 0.25],

    [0, 0],
    [0.25, 0],
    [0.5, 0],
    [0.75, 0],
  ]
  app.onPointerDown = () => {
    channel++
    if (channel > channelUVs.length - 1) channel = 0
    video.material.textureX = channelUVs[channel][0]
    video.material.textureY = channelUVs[channel][1]
  }
}

}
