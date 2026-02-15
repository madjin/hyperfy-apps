# Forest.hyp

## Metadata
- **Author**: Gert-Jan Akerboom
- **Channel**: #🎨│showcase
- **Date**: 2025-11-27
- **Size**: 4,086,512 bytes

## Discord Context
> a forest generator with trees from here https://quickmesh.dev/tree/

## Blueprint
- **Name**: Forest
- **Version**: 28
- **Model**: `asset://9108e7c78798bc37c4ef7d1e3900adf7f68793343a18183f7f1742557d0c75f8.glb`
- **Script**: `asset://6d1e93d05ed78b0a904f330a237f09bcbf8bffc5f4b1ffef3d484df3dbc430a3.js`

## Props
- `clone_count`: int = `3000`
- `area_size_x`: int = `100`
- `area_size_z`: int = `100`
- `min_size`: float = `1.3`
- `max_size`: int = `3`
- `cluster_percentage`: int = `30`
- `cluster_size`: int = `10`
- `cluster_density`: int = `20`
- `shape`: str = `circle`
- `circle_radius`: int = `250`
- `inner_radius`: int = `35`

## Assets
- `[model]` 9108e7c78798bc37c4ef7d1e3900adf7f68793343a18183f7f1742557d0c75f8.glb (4,076,120 bytes)
- `[script]` 6d1e93d05ed78b0a904f330a237f09bcbf8bffc5f4b1ffef3d484df3dbc430a3.js (9,446 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.get()`

## Keywords (for Discord search)
active, angle, angleToCenter, area, areaSizeX, areaSizeZ, around, array, atan2, author, avoid, axis, base, based, between, boundaries, bounds, center, centerPos, centerX

## Script Source
```javascript
/**
 * Forest Trees
 * Drag and Drop Trees into your Hyperfy V2 world.
 * 
 * @author Gert-Jan Akerboom
 * https://x.com/GertJanAkerboom
 * @license MIT
 * Copyright (c) 2025 Gert-Jan Akerboom
 */

// Configure UI inputs for the tree generation system
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
        type: "switch",
        key: "shape",
        label: "Distribution Shape",
        options: [
          {
            label: "Rectangle",
            value: "rectangle"
          },
          {
            label: "Circle",
            value: "circle"
          }
        ],
        initial: "rectangle",
      },
      {
        key: "area_size_x",
        label: "Area Width (X meters)",
        type: "number",
        initial: 10,
        min: 1,
        max: 100,
        step: 1,
        when: [{ op: "eq", key: "shape", value: "rectangle" }],
      },
      {
        key: "area_size_z",
        label: "Area Depth (Z meters)",
        type: "number",
        initial: 10,
        min: 1,
        max: 100,
        step: 1,
        when: [{ op: "eq", key: "shape", value: "rectangle" }],
      },
      {
        key: "circle_radius",
        label: "Circle Radius (meters)",
        type: "number",
        initial: 10,
        min: 1,
        max: 1000,
        step: 1,
        when: [{ op: "eq", key: "shape", value: "circle" }],
      },
      {
        key: "inner_radius",
        label: "Inner Radius (meters)",
        type: "number",
        initial: 0,
        min: 0,
        max: 99,
        step: 1,
        when: [{ op: "eq", key: "shape", value: "circle" }],
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
        label: "Percentage of Trees in Clusters",
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
        label: "Cluster Density (trees per m²)",
        type: "number",
        initial: 5,
        min: 1,
        max: 20,
        step: 1,
      }
    ];
  });
  
  // Get configuration values from UI inputs
  const cloneCount = app.config.clone_count;
  const shape = app.config.shape || "rectangle";
  const areaSizeX = app.config.area_size_x;
  const areaSizeZ = app.config.area_size_z;
  const circleRadius = app.config.circle_radius || 10;
  const innerRadius = app.config.inner_radius || 0;
  const minSize = app.config.min_size;
  const maxSize = app.config.max_size;
  const clusterPercentage = app.config.cluster_percentage;
  const clusterSize = app.config.cluster_size;
  const clusterDensity = app.config.cluster_density;
  
  // Helper function to generate random numbers with specified decimal places
  function num(min, max, dp = 2) {
    return Number((Math.random() * (max - min) + min).toFixed(dp));
  }
  
  // Helper function to get random position based on selected shape
  function getRandomPosition() {
    if (shape === "circle") {
      // Circle: use polar coordinates with random angle and radius between inner_radius and circle_radius
      const angle = Math.random() * Math.PI * 2;
      const radius = num(innerRadius, circleRadius, 2);
      return {
        x: radius * Math.cos(angle),
        z: radius * Math.sin(angle)
      };
    } else {
      // Rectangle: random position within the rectangular area
      return {
        x: num(-areaSizeX, areaSizeX, 2),
        z: num(-areaSizeZ, areaSizeZ, 2)
      };
    }
  }
  
  // Get all tree models from the GLB file
  const treeModels = [
    app.get('tree1'),
    app.get('tree2'),
    app.get('tree3'),
    app.get('tree4'),
    app.get('tree5'),
    app.get('tree6'),
    app.get('tree7'),
    app.get('tree8'),
    app.get('tree9'),
    app.get('tree10')
  ];
  
  // Check if all required models exist
  if (!treeModels.every(model => model)) {
    console.error('Could not find all tree models - make sure your GLB has meshes named "tree1" through "tree10"');
    return;
  }
  
  // Function to create an evenly-distributed array of tree models
  function createEvenlyDistributedTreeArray(count) {
    const treeArray = [];
    const treesPerType = Math.floor(count / 10);
    const remainder = count % 10;
    
    // Add each tree type the base number of times
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < treesPerType; j++) {
        treeArray.push(treeModels[i]);
      }
    }
    
    // Add remaining trees randomly from the 10 types
    for (let i = 0; i < remainder; i++) {
      const randomIndex = Math.floor(Math.random() * 10);
      treeArray.push(treeModels[randomIndex]);
    }
    
    // Shuffle the array to randomize placement order
    for (let i = treeArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [treeArray[i], treeArray[j]] = [treeArray[j], treeArray[i]];
    }
    
    return treeArray;
  }
  
  // Create evenly-distributed array of trees
  const distributedTrees = createEvenlyDistributedTreeArray(cloneCount);
  let treeIndex = 0;
  
  // Helper function to get the next tree from the evenly-distributed array
  function getNextTree() {
    const tree = distributedTrees[treeIndex];
    treeIndex = (treeIndex + 1) % distributedTrees.length;
    return tree;
  }
  
  // Calculate distribution of trees between clusters and scattered pieces
  const totalClusteredTrees = Math.floor(cloneCount * (clusterPercentage / 100));
  const numberOfClusters = Math.floor(totalClusteredTrees / clusterDensity);
  const remainingTrees = cloneCount - totalClusteredTrees;
  
  // Create clustered tree patches
  for (let i = 0; i < numberOfClusters; i++) {
    // Generate random cluster center position within the specified shape
    const centerPos = getRandomPosition();
    const centerX = centerPos.x;
    const centerZ = centerPos.z;
    
    // Calculate how many trees to place in this cluster
    const treesInCluster = Math.min(clusterDensity, totalClusteredTrees - (i * clusterDensity));
    
    // Create trees within this cluster
    for (let j = 0; j < treesInCluster; j++) {
      const clone = getNextTree().clone(true);
      
      // Position within cluster radius using polar coordinates
      const angle = Math.random() * Math.PI * 2; // Random angle around the center
      const radius = Math.random() * clusterSize; // Random distance from center
      let treeX = centerX + Math.cos(angle) * radius;
      let treeZ = centerZ + Math.sin(angle) * radius;
      
      // Ensure tree position is within shape boundaries
      if (shape === "circle") {
        const distanceFromCenter = Math.sqrt(treeX * treeX + treeZ * treeZ);
        if (distanceFromCenter > circleRadius || distanceFromCenter < innerRadius) {
          // If outside bounds, clamp to valid range
          const clampedRadius = Math.max(innerRadius, Math.min(circleRadius, distanceFromCenter));
          const angleToCenter = Math.atan2(treeZ, treeX);
          treeX = clampedRadius * Math.cos(angleToCenter);
          treeZ = clampedRadius * Math.sin(angleToCenter);
        }
   

// ... truncated ...
```

---
*Extracted from Forest.hyp. Attachment ID: 1443613865400074341*