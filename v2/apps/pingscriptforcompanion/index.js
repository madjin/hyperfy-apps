export default function main(world, app, fetch, props, setTimeout) {
// Configure UI controls in App panel
app.configure(() => [
    {
        key: 'displayName',
        type: 'text',
        label: 'Display Name',
        value: app.name || 'Unknown Object'
    },
    {
        key: 'objectType',
        type: 'text',
        label: 'Object Type', 
        value: app.type || 'scannable'
    }
]);

// Handle pings with no storage
world.on('ping', ([position, radius, entityId]) => {
    if (app.instanceId !== entityId && 
        Math.hypot(position.x - app.position.x, position.z - app.position.z) <= radius) {
        world.emit('pong', [entityId, {
            entityId: app.instanceId,
            name: app.config?.displayName || "Unknown Object",
            type: app.config?.objectType || "scannable",
            position: app.position
        }]);
    }
});
}
