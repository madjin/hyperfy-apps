# Grass_V3.hyp

## Metadata
- **Author**: Gert-Jan Akerboom
- **Channel**: #🎨│showcase
- **Date**: 2025-04-11
- **Size**: 77,105 bytes

## Blueprint
- **Name**: Grass_V3
- **Version**: 17
- **Model**: `asset://f7bc20c45680fa35bdbc589a68f62d393859e2f16e1ef1daee2e076af20aaa15.glb`
- **Script**: `asset://8df7222199fe584243f58e7091c18951a75de42838f9bc8c8d37740259267c5f.js`

## Props
- `clone_count`: int = `10000`
- `area_size_x`: int = `40`
- `area_size_z`: int = `40`
- `min_size`: float = `0.8`
- `max_size`: float = `1.3`
- `grass_count`: int = `20`
- `cluster_percentage`: int = `80`
- `cluster_density`: int = `20`
- `cluster_size`: int = `1`

## Assets
- `[model]` f7bc20c45680fa35bdbc589a68f62d393859e2f16e1ef1daee2e076af20aaa15.glb (71,760 bytes)
- `[script]` 8df7222199fe584243f58e7091c18951a75de42838f9bc8c8d37740259267c5f.js (4,461 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.get()`

## Keywords (for Discord search)
active, angle, area, axis, between, center, centerX, centerZ, clone, cluster, clusters, config, configuration, configure, console, error, every, exist, find, floor

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
  app.get('windy3'),
  app.get('flower1'),
  app.get('flower2'),
  app.get('flower3')
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

grassModels.active = false
```

---
*Extracted from Grass_V3.hyp. Attachment ID: 1360243980234784839*