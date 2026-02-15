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
