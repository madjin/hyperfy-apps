# TeleportTriggerBox.hyp

## Metadata
- **Author**: 𝕽𝖔𝖚𝖘𝖙𝖆𝖓
- **Channel**: #💻│developers
- **Date**: 2025-10-24
- **Size**: 9,414 bytes

## Discord Context
> I made a simple customizable teleport trigger box. my first .hyp file 😎

## Blueprint
- **Name**: Teleport Trigger Box
- **Version**: 52
- **Model**: `asset://c5f3b97a576710dc8d8a6c6f4498bb7ee4cf8305d8671d862aeeb4ef7a5a5247.glb`
- **Script**: `asset://9e54683151b5c6340021088c9cd444281db87c6c147259ca4588825163fa9b1b.js`

## Props
- `collision`: bool = `True`
- `destination`: str = `10,0,10`
- `visible`: bool = `True`
- `scaleX`: int = `1`
- `scaleY`: int = `1`
- `scaleZ`: int = `1`

## Assets
- `[model]` c5f3b97a576710dc8d8a6c6f4498bb7ee4cf8305d8671d862aeeb4ef7a5a5247.glb (2,020 bytes)
- `[script]` 9e54683151b5c6340021088c9cd444281db87c6c147259ca4588825163fa9b1b.js (3,522 bytes)
- `[texture]` 39ad1b405cbf41a90825dadf0b554f3c3baba634636bb94a1057dd8ec0784c86.png (2,777 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.create()`, `app.traverse()`
**World Methods**: `world.add()`, `world.getPlayer()`
**Nodes Created**: `collider`, `rigidbody`

## Keywords (for Discord search)
appInverseMatrix, black, body, clone, collider, collision, color, colored, configure, configured, configuring, console, coordString, coordinates, copy, create, creates, cube, decompose, default

## Script Source
```javascript
// Working Teleport Trigger - Based on Hyperfy patterns
console.log('🚪 Working Teleport Starting...');

app.configure([
  {
    key: 'destination',
    type: 'text',
    label: 'Teleport To (X,Y,Z)',
    initial: '0,0,10'
  },
  {
    key: 'visible',
    type: 'toggle',
    label: 'Visible',
    initial: true
  },
  {
    key: 'scaleX',
    type: 'number',
    label: 'Width',
    initial: 2
  },
  {
    key: 'scaleY',
    type: 'number',
    label: 'Height',
    initial: 2
  },
  {
    key: 'scaleZ',
    type: 'number',
    label: 'Depth',
    initial: 2
  }
]);

console.log('[TELEPORT] Destination:', props.destination);
console.log('[TELEPORT] Visible:', props.visible);
console.log('[TELEPORT] Scale:', props.scaleX, 'x', props.scaleY, 'x', props.scaleZ);

// Parse coordinates helper
const parseCoords = (coordString) => {
  try {
    const [x, y, z] = coordString.split(',').map(num => parseFloat(num.trim()));
    return new Vector3(x, y, z);
  } catch (err) {
    console.log('[TELEPORT] Error parsing coordinates:', coordString);
    return new Vector3(0, 0, 10);
  }
};

// Configure the default Hyperfy mesh (the black box)
app.traverse(node => {
  // Look for the default mesh that Hyperfy creates
  if (node.isMesh || (node.geometry && node.material)) {
    console.log('[TELEPORT] Found default mesh, configuring...');
    console.log('[TELEPORT] Mesh name:', node.name);
    console.log('[TELEPORT] Mesh type:', node.type);
    
    // Apply scale
    node.scale.set(props.scaleX, props.scaleY, props.scaleZ);
    console.log('[TELEPORT] Set mesh scale to:', props.scaleX, 'x', props.scaleY, 'x', props.scaleZ);
    
    // Make it visible and colored
    if (node.material) {
      node.material.color.set('#00ff00');
      node.material.transparent = true;
      node.material.opacity = props.visible ? 0.5 : 0;
    }
    
    // Actually hide/show the mesh
    node.visible = props.visible;
    console.log('[TELEPORT] Set mesh visible to:', props.visible);
    
    console.log('[TELEPORT] Default mesh configured');
  }
});

// Create collision detection
const m1 = new Matrix4();
const appInverseMatrix = app.matrixWorld.clone().invert();
const body = app.create('rigidbody');

app.traverse(node => {
  // Target the same default mesh for collision
  if (node.isMesh || (node.geometry && node.material)) {
    const collider = app.create('collider');
    collider.type = 'geometry';
    collider.geometry = node.geometry;
    collider.trigger = true; // Make it a trigger, not solid collision
    
    m1.copy(node.matrixWorld).premultiply(appInverseMatrix).decompose(
      collider.position,
      collider.quaternion,
      collider.scale
    );
    
    body.add(collider);
    console.log('[TELEPORT] Added trigger collider to default mesh');
  }
});

body.position.copy(app.position);
body.quaternion.copy(app.quaternion);
// Apply the scale to the rigidbody
body.scale.set(props.scaleX, props.scaleY, props.scaleZ);
console.log('[TELEPORT] Set rigidbody scale to:', props.scaleX, 'x', props.scaleY, 'x', props.scaleZ);
world.add(body);

// Handle trigger events
body.onTriggerEnter = (e) => {
  console.log('[TELEPORT] 🚶 Player entered trigger zone');
  const player = world.getPlayer(e.playerId);
  
  if (player) {
    const destination = parseCoords(props.destination);
    console.log('[TELEPORT] 🚀 Teleporting to:', destination);
    player.teleport(destination);
  }
};

console.log('[TELEPORT] ✅ Ready!');
console.log('[TELEPORT] Walk into the green cube to teleport');

```

---
*Extracted from TeleportTriggerBox.hyp. Attachment ID: 1431333007783886849*