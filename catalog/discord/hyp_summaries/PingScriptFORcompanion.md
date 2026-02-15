# PingScriptFORcompanion.hyp

## Metadata
- **Author**: ~/drdoge.eth
- **Channel**: #💻│developers
- **Date**: 2025-03-25
- **Size**: 5,068,371 bytes

## Blueprint
- **Name**: PingScriptFORcompanion
- **Version**: 1
- **Model**: `asset://cdcb56423fabbc0f36e8329622c987f12a4bd94e007aa95fce9129ec666e59c2.glb`
- **Script**: `asset://9d3e9562bf3f50d27bf3293ab866150954450f7fb6fea816637035b8fcf97005.js`

## Props
- `name`: str = `Train`
- `type`: str = `Train`
- `description`: str = `A scannable object in the world`
- `tags`: str = `Landmark`
- `displayName`: str = `Train`
- `objectType`: str = `LandMark`

## Assets
- `[model]` cdcb56423fabbc0f36e8329622c987f12a4bd94e007aa95fce9129ec666e59c2.glb (5,066,612 bytes)
- `[script]` 9d3e9562bf3f50d27bf3293ab866150954450f7fb6fea816637035b8fcf97005.js (831 bytes)

## Script Analysis
**App Methods**: `app.configure()`
**World Methods**: `world.emit()`, `world.on()`
**Events Listened**: `ping`
**Events Emitted**: `pong`

## Keywords (for Discord search)
config, configure, controls, displayName, emit, entityId, hypot, instanceId, label, name, objectType, panel, ping, pings, pong, position, radius, scannable, storage, text

## Script Source
```javascript
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
```

---
*Extracted from PingScriptFORcompanion.hyp. Attachment ID: 1354172080849162445*