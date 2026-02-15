# Loot.hyp

## Metadata
- **Author**: maximus
- **Channel**: #🎨│showcase
- **Date**: 2025-02-12
- **Size**: 48,942 bytes

## Discord Context
> Remixed Metamike's Rover+Loot apps and hacked them to mock up a space trading sim.

Will keep iterating over concept over the next months grabbing what I can from folks to hobble together a trading sim <:pepestonks:999875339390029894> 

Used assets from poly pizza, void runners with music by Dvir Silver from Pixabay.

## Blueprint
- **Name**: Loot
- **Version**: 32
- **Model**: `asset://0be8556559267c8a6dbd07a5525ba0c82827cbd6ea912339ea0f501f4a028371.glb`
- **Script**: `asset://c69916a3dc651ee07f263ce13fab0a766f35dee90e4d0656fcf0ff7b3334c2b9.js`

## Props
- `lootValue`: int = `25`
- `name`: str = `Loot Pack`
- `healthValue`: int = `50`

## Assets
- `[model]` 0be8556559267c8a6dbd07a5525ba0c82827cbd6ea912339ea0f501f4a028371.glb (45,664 bytes)
- `[script]` c69916a3dc651ee07f263ce13fab0a766f35dee90e4d0656fcf0ff7b3334c2b9.js (2,584 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.on()`
**World Methods**: `world.emit()`, `world.on()`
**Events Listened**: `ping`, `proximity-check`, `update`
**Events Emitted**: `item-cleanup`, `item-detected`, `pong`

## Keywords (for Discord search)
accept, animation, attempt, away, check, checks, cleanup, close, collect, collection, collectorId, collectron, config, configure, console, delta, description, detected, detection, displayName

## Script Source
```javascript
app.configure(() => [
  {
    key: 'model',
    type: 'file',
    label: 'Model',
    description: 'Upload a GLB model for this item',
    accept: '.glb',
    required: true
  },
  {
    key: 'lootValue',
    type: 'number',
    label: 'Loot Value',
    description: 'How much loot this pack provides',
    initial: 25,
    required: true
  },
  {
    key: 'name',
    type: 'text',
    label: 'Display Name',
    description: 'Custom name for this loot pack',
    initial: 'Loot Pack',
    required: true
  }
]);

const state = {
    displayName: app.config.name || "Loot Pack",
    type: "loot",
    value: app.config.lootValue || 25,
    isCollected: false
};

// Add rotation animation
app.on('update', (delta) => {
    if (!state.isCollected) {
        app.rotation.y += delta;
    }
});

// Handle proximity checks for collection
world.on('proximity-check', (info) => {
    if (state.isCollected) return;
    
    const distance = Math.sqrt(
        Math.pow(info.position.x - app.position.x, 2) +
        Math.pow(info.position.z - app.position.z, 2)
    );
    
    // Only collect when the collectron is very close
    if (distance <= 0.5 && (info.type === 'collectron' || info.metadata?.type === 'collectron')) {
        console.log('Collection attempt by:', info.type, 'at distance:', distance);
        state.isCollected = true;
        
        // First emit cleanup event so collectron can update its state
        world.emit('item-cleanup', app.instanceId);
        
        // Emit detection event for collectron to process
        world.emit('item-detected', {
            itemId: app.instanceId,
            collectorId: info.instanceId,
            item: {
                name: state.displayName,
                type: state.type,
                value: state.value
            }
        });

        // Hide the mesh and remove the entity
        app.visible = false;
        app.position.y = -1000; // Move it far away
    }
});

// Handle ping events for detection
world.on('ping', ([position, radius, entityId]) => {
    if (state.isCollected) return;
    
    const distance = Math.sqrt(
        Math.pow(position.x - app.position.x, 2) +
        Math.pow(position.z - app.position.z, 2)
    );
    
    if (distance <= radius) {
        world.emit('pong', [entityId, {
            entityId: app.instanceId,
            name: state.displayName,
            type: state.type,
            value: state.value,
            position: app.position
        }]);
    }
});

```

---
*Extracted from Loot.hyp. Attachment ID: 1339121965117476945*