export default function main(world, app, fetch, props, setTimeout) {
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

}
