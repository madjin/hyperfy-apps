# Grass_V1.hyp

## Metadata
- **Author**: Gert-Jan Akerboom
- **Channel**: #⚡│general
- **Date**: 2025-04-08
- **Size**: 54,857 bytes

## Discord Context
> <@309735511461724171>  i made a simple grass particle system today, it has the wind animation so it looks like there is a little breeze.
It definitely needs some more work on the code and on the meshes but it looks pretty cool already. Play around with the settings and let me know what you think. I especially like the cluster settings as it can make it look a bit more realistic when the grass is growing in little groups. I added up to 10000 grass particles and the fps stayed at 60 so i think it performs pretty well : )

## Blueprint
- **Name**: Grass_V1
- **Version**: 46
- **Model**: `asset://0a377f840efd6f7a8a37f617056227efc92344cf4048285f591ac73db326d758.glb`
- **Script**: `asset://34c4f9228d046ede9daff98e7a9242806ab8e8480b016c0a192d6665c0964d8c.js`

## Props
- `clone_count`: int = `1000`
- `area_size_x`: int = `50`
- `area_size_z`: int = `50`
- `min_size`: float = `0.8`
- `max_size`: float = `1.3`
- `grass_count`: int = `20`
- `cluster_percentage`: int = `80`
- `cluster_density`: int = `20`
- `cluster_size`: int = `1`

## Assets
- `[model]` 0a377f840efd6f7a8a37f617056227efc92344cf4048285f591ac73db326d758.glb (49,624 bytes)
- `[script]` 34c4f9228d046ede9daff98e7a9242806ab8e8480b016c0a192d6665c0964d8c.js (4,362 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.get()`

## Keywords (for Discord search)
angle, area, axis, between, center, centerX, centerZ, clone, cluster, clusters, config, configuration, configure, console, error, every, exist, find, floor, generate

## Script Source
```javascript
// Configure UI inputs for the grass parameters
app.configure(() => {
  return [
    {
      key: "clone_count",
      label: "Clone Count",
      type: "number",
      initial: 20,
      min: 1,
      max: 10000,
      step: 1,
    },
    {
      key: "area_size_x",
      label: "Area Width (X meters)",
      type: "number",
      initial: 10,
      min: 1,
      max: 100,
      step: 1,
    },
    {
      key: "area_size_z",
      label: "Area Depth (Z meters)",
      type: "number",
      initial: 10,
      min: 1,
      max: 100,
      step: 1,
    },
    {
      key: "min_size",
      label: "Minimum Clone Size",
      type: "number",
      dp: 2,
      initial: 0.2,
      min: 0.01,
      max: 5,
      step: 0.1,
    },
    {
      key: "max_size",
      label: "Maximum Clone Size",
      type: "number",
      dp: 2,
      initial: 2,
      min: 0.1,
      max: 5,
      step: 0.1,
    },
    {
      key: "cluster_percentage",
      label: "Percentage of Grass in Clusters",
      type: "number",
      initial: 30,
      min: 0,
      max: 100,
      step: 1,
    },
    {
      key: "cluster_size",
      label: "Cluster Size (radius in meters)",
      type: "number",
      initial: 1,
      min: 0.1,
      max: 10,
      step: 0.1,
    },
    {
      key: "cluster_density",
      label: "Cluster Density (grass per m²)",
      type: "number",
      initial: 5,
      min: 1,
      max: 20,
      step: 1,
    }
  ];
});

// Get configuration values
const CLONE_COUNT = app.config.clone_count;
const AREA_SIZE_X = app.config.area_size_x;
const AREA_SIZE_Z = app.config.area_size_z;
const MIN_SIZE = app.config.min_size;
const MAX_SIZE = app.config.max_size;
const CLUSTER_PERCENTAGE = app.config.cluster_percentage;
const CLUSTER_SIZE = app.config.cluster_size;
const CLUSTER_DENSITY = app.config.cluster_density;

// Helper function to generate random numbers
function num(min, max, dp = 2) {
  return Number((Math.random() * (max - min) + min).toFixed(dp));
}

// Get all grass models
const grassModels = [
  app.get('windy'),
  app.get('windy2'),
  app.get('windy3')
];

// Check if all models exist
if (!grassModels.every(model => model)) {
  console.error('Could not find all grass models');
  return;
}

// Helper function to get a random grass model
function getRandomGrassModel() {
  return grassModels[Math.floor(Math.random() * grassModels.length)];
}

// Calculate number of clusters and grass per cluster
const totalClusteredGrass = Math.floor(CLONE_COUNT * (CLUSTER_PERCENTAGE / 100));
const numberOfClusters = Math.floor(totalClusteredGrass / CLUSTER_DENSITY);
const remainingGrass = CLONE_COUNT - totalClusteredGrass;

// Create clusters
for (let i = 0; i < numberOfClusters; i++) {
  // Random cluster center position
  const centerX = num(-AREA_SIZE_X, AREA_SIZE_X, 2);
  const centerZ = num(-AREA_SIZE_Z, AREA_SIZE_Z, 2);
  
  // Create grass within the cluster
  const grassInCluster = Math.min(CLUSTER_DENSITY, totalClusteredGrass - (i * CLUSTER_DENSITY));
  
  for (let j = 0; j < grassInCluster; j++) {
    const clone = getRandomGrassModel().clone(true);
    
    // Position within cluster radius
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * CLUSTER_SIZE;
    clone.position.x = centerX + Math.cos(angle) * radius;
    clone.position.z = centerZ + Math.sin(angle) * radius;
    clone.position.y = 0;
    
    // Random rotation on Y axis
    clone.rotation.y = num(0, 360, 2);
    
    // Random uniform scale between min and max size
    const scale = num(MIN_SIZE, MAX_SIZE, 2);
    clone.scale.set(scale, scale, scale);
    
    app.add(clone);
  }
}

// Create remaining individual grass pieces
for (let i = 0; i < remainingGrass; i++) {
  const clone = getRandomGrassModel().clone(true);
  
  // Generate random positions within our area
  clone.position.x = num(-AREA_SIZE_X, AREA_SIZE_X, 2);
  clone.position.z = num(-AREA_SIZE_Z, AREA_SIZE_Z, 2);
  clone.position.y = 0;
  
  // Random rotation on Y axis
  clone.rotation.y = num(0, 360, 2);
  
  // Random uniform scale between min and max size
  const scale = num(MIN_SIZE, MAX_SIZE, 2);
  clone.scale.set(scale, scale, scale);
  
  app.add(clone);
} 
```

---
*Extracted from Grass_V1.hyp. Attachment ID: 1359167521424408616*