export default function main(world, app, fetch, props, setTimeout) {
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

}
