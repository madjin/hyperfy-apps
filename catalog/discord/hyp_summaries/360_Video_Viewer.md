# 360_Video_Viewer.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-04-12
- **Size**: 43,681 bytes

## Discord Context
> If anyone wants to try out 360 videos on dev here's the app i used.
It has a little platform right in the middle you can stand on.
You can find 360 videos on youtube and download them with https://www.socialplug.io/free-tools/youtube-video-downloader
Note that worlds by default limit upload filesizes so you may need to increase that for them to save properly.
You can also set the src to an m3u8 stream if you find any.

## Blueprint
- **Name**: 360 Video Viewer
- **Version**: 35
- **Model**: `asset://21b5c6bf4f88ed7fcbff64a6c3f5bf4c4e1ab843c22a6a1eb1347de04f25744c.glb`
- **Script**: `asset://4b128df5847da86d40528515536cedcfcbd1aee47ebf458c7b3a4babce208036.js`

## Props
- `video`: NoneType = `None`

## Assets
- `[model]` 21b5c6bf4f88ed7fcbff64a6c3f5bf4c4e1ab843c22a6a1eb1347de04f25744c.glb (42,324 bytes)
- `[script]` 4b128df5847da86d40528515536cedcfcbd1aee47ebf458c7b3a4babce208036.js (677 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.get()`
**Nodes Created**: `video`

## Keywords (for Discord search)
active, aspect, configure, copy, cover, create, disable, file, generally, geometry, inside, isClient, kind, label, linked, loop, mesh, multiplyScalar, original, place

## Script Source
```javascript
app.configure([
  {
    key: 'video',
    type: 'file',
    kind: 'video',
    label: 'Video',
  }
])

const src = props.video?.url

if (world.isClient) {
  const mesh = app.get('Sphere')
  const video = app.create('video', {
    src,
    linked: true,
    loop: true,
    aspect: 2 / 1, // 360 videos are generally 2:1
    geometry: mesh.geometry,
    cover: true,
  })
  // position at same place as mesh
  // slightly smaller so its "inside"
  video.position.copy(mesh.position)
  video.quaternion.copy(mesh.quaternion)
  video.scale.copy(mesh.scale).multiplyScalar(0.99)
  
  // disable original mesh
  // mesh.active = false

  // play!
  app.add(video)  
  video.play()
}
```

---
*Extracted from 360_Video_Viewer.hyp. Attachment ID: 1360629006348583082*