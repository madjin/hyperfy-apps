# CurvedVid_with_link_input.hyp

## Metadata
- **Author**: MetaRick
- **Channel**: #💻│developers
- **Date**: 2025-04-20
- **Size**: 15,317,156 bytes

## Discord Context
> Here you go <@742409123311779860>

## Blueprint
- **Name**: Curved Video Viewer
- **Version**: 0
- **Model**: `asset://5e68ee6bd1db8b495bbf5478a697f17206f45351124c9de74a5528eb8c05b03b.glb`
- **Script**: `asset://4d4198fa5fa10936b298eb9abea78d869d0a11a08f088062c47716c8b7adf639.js`

## Props
- `video`: video → `asset://27827da74c0e8c2b524260dcb95667573c55aaf4e104e4e23e957a3032d81b24.mp4`
- `videoLink`: str = `https://stream.vrcdn.live/live/uncannyalley.live.mp4`

## Assets
- `[model]` 5e68ee6bd1db8b495bbf5478a697f17206f45351124c9de74a5528eb8c05b03b.glb (2,544 bytes)
- `[script]` 4d4198fa5fa10936b298eb9abea78d869d0a11a08f088062c47716c8b7adf639.js (967 bytes)
- `[video]` 27827da74c0e8c2b524260dcb95667573c55aaf4e104e4e23e957a3032d81b24.mp4 (15,312,643 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.get()`
**Nodes Created**: `video`

## Keywords (for Discord search)
adjust, aspect, available, configure, console, copy, cover, create, error, file, geometry, here, isClient, kind, label, link, linked, loop, mesh, otherwise

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

// Use the uploaded video URL if available, otherwise use the pasted link.
const src = props.video?.url || props.videoLink;

if (!src) {
  console.error("No video source provided. Please upload a video or paste a video link.");
} else if (world.isClient) {
  const mesh = app.get('Screen');
  const video = app.create('video', {
    src,
    linked: true,
    loop: true,
    aspect: 16 / 9, // geometry is 16:9
    geometry: mesh.geometry,
    cover: true,
  });
  
  // Move video to the same place as mesh and adjust its position slightly
  video.position.copy(mesh.position);
  video.quaternion.copy(mesh.quaternion);
  video.scale.copy(mesh.scale);
  video.position.z += 0.01;
  
  // Add the video to the scene and play it
  app.add(video);
  video.play();
}

```

---
*Extracted from CurvedVid_with_link_input.hyp. Attachment ID: 1363573772858429580*