# 360Player_Mono.hyp

## Metadata
- **Author**: MetaRick
- **Channel**: #💻│developers
- **Date**: 2025-04-15
- **Size**: 27,325 bytes

## Discord Context
> Made some adjustments to the 360 video player... cpl changes:

1: made it so sun still works inside
2: made it bigger and removed floor
3: Fixed aspect ratio (mono 360s are genrally 16:9 not 2:1, so pervious one would not wrap correctly)
4: Added a public variable to paste a link (got an alley video skybox short test loop)

## Blueprint
- **Name**: 360Player_Mono
- **Version**: 16
- **Model**: `asset://3cd0050918413506993c2d16f1597957c924ae7aaac4457e3a1de9a28f080c25.glb`
- **Script**: `asset://6cdf9c708c797d579a41522f37f38954dc51943a657f6f27335ff57a4584afb9.js`

## Props
- `video`: NoneType = `None`
- `videoLink`: str = `https://player.vimeo.com/progressive_redirect/playback/1052335324/rendition/2160p/file.mp4?loc=external&signature=e861f9b2581b5f144533be80b360009c2b397f6e84362f1a7913f7cfefec850b`

## Assets
- `[model]` 3cd0050918413506993c2d16f1597957c924ae7aaac4457e3a1de9a28f080c25.glb (25,472 bytes)
- `[script]` 6cdf9c708c797d579a41522f37f38954dc51943a657f6f27335ff57a4584afb9.js (976 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.get()`
**Nodes Created**: `video`

## Keywords (for Discord search)
aspect, configure, console, copy, cover, create, error, file, generally, geometry, here, isClient, kind, label, link, linked, loop, mesh, multiplyScalar, orientation

## Script Source
```javascript
app.configure([
  {
    key: 'video',
    type: 'file',
    kind: 'video',
    label: 'Upload Video',
  },
  {
    key: 'videoLink',
    type: 'text',
    label: 'Video Link (paste URL here)',
  }
]);

// Use the uploaded file URL if provided; otherwise, use the pasted video link.
const src = props.video?.url || props.videoLink;

if (!src) {
  console.error("No video source provided. Please upload a video file or paste a video link.");
} else if (world.isClient) {
  const mesh = app.get('Sphere');
  const video = app.create('video', {
    src,
    linked: true,
    loop: true,
    aspect: 16 / 9, // 360 videos are generally 2:1
    geometry: mesh.geometry,
    cover: true,
  });
  
  // Match video position, orientation, and scale to the mesh
  video.position.copy(mesh.position);
  video.quaternion.copy(mesh.quaternion);
  video.scale.copy(mesh.scale).multiplyScalar(0.99);
  
  // Add the video to the scene and start playback
  app.add(video);
  video.play();
}

```

---
*Extracted from 360Player_Mono.hyp. Attachment ID: 1361648803786133574*