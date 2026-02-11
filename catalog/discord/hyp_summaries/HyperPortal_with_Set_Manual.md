# HyperPortal_with_Set_Manual.hyp

## Metadata
- **Author**: 0mka
- **Channel**: #🎨│showcase
- **Date**: 2025-03-21
- **Size**: 87,564 bytes

## Discord Context
> Added a switch to enter manual or set

## Blueprint
- **Name**: HyperPortal with Set/Manual
- **Version**: 19
- **Model**: `asset://f361b150f4d5ef44b6840e7c35264b863eb6982c5f74ed9b9736f61adab41d34.glb`
- **Script**: `asset://109975ff12e3da592ed0d6bf009400cd5259fb5fcff9ea1e2b0591c531f8d709.js`

## Props
- `zone1`: str = `1,0,0`
- `positionMode`: str = `set`
- `positionX`: int = `1`
- `positionY`: int = `1`
- `positionZ`: int = `1`

## Assets
- `[model]` f361b150f4d5ef44b6840e7c35264b863eb6982c5f74ed9b9736f61adab41d34.glb (9,672 bytes)
- `[script]` 109975ff12e3da592ed0d6bf009400cd5259fb5fcff9ea1e2b0591c531f8d709.js (2,830 bytes)
- `[texture]` d60648b9091c00e460545dce3cef7b88c0d643d0a864424f715a878c2ad3661a.png (73,989 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.get()`, `app.on()`, `app.send()`
**World Methods**: `world.get()`, `world.getPlayer()`, `world.set()`
**Events Listened**: `position`

## Keywords (for Discord search)
attempt, body, btns, button, buttons, configure, enter, fromArray, getPlayer, initial, instanceId, isAdmin, isClient, isServer, label, listen, manual, manualSetBtn, number, onClick

## Script Source
```javascript
app.configure([
    {
        key: 'btns',
        type: 'buttons',
        label: 'Position',
        buttons: [
            { 
                label: 'Set', 
                onClick: () => {
                    if (app.props.positionMode === 'set') {
                        const position = world.getPlayer().position.toArray();
                        app.send('position', position);
                    }
                }
            }
        ]
    },
    {
        type: 'switch',
        key: 'positionMode',
        label: 'Position Mode',
        options: [
            { label: 'Set', value: 'set' },
            { label: 'Manual', value: 'manual' }
        ],
        initial: 'set'
    },
    {
        type: 'number',
        key: 'positionX',
        label: 'X Coordinate',
        min: -Infinity,
        max: Infinity,
        step: 1,
        initial: 0,
        visible: () => app.props.positionMode === 'manual'
    },
    {
        type: 'number',
        key: 'positionY',
        label: 'Y Coordinate',
        min: -Infinity,
        max: Infinity,
        step: 1,
        initial: 0,
        visible: () => app.props.positionMode === 'manual'
    },
    {
        type: 'number',
        key: 'positionZ',
        label: 'Z Coordinate',
        min: -Infinity,
        max: Infinity,
        step: 1,
        initial: 0,
        visible: () => app.props.positionMode === 'manual'
    },
    {
        type: 'button',
        key: 'manualSetBtn',
        label: 'Set Position',
        onClick: () => {
            if (app.props.positionMode === 'manual') {
                const position = [app.props.positionX, app.props.positionY, app.props.positionZ];
                app.send('position', position);
            }
        },
        visible: () => app.props.positionMode === 'manual'
    }
]);

if (world.isServer) {
    const key = `${app.instanceId}:position`;
    let position = world.get(key);
    app.on('position', (arr, playerId) => {
        const player = world.getPlayer(playerId);
        if (!player.isAdmin) return;
        position = arr;
        world.set(key, arr);
        app.send('position', arr);
    });
}

if (world.isClient) {
    let position = null;
    // attempt to get position from state
    if (app.state.position) {
        position = new Vector3().fromArray(app.state.position);
    }
    // listen to server position updates
    app.on('position', arr => {
        position = new Vector3().fromArray(arr);
    });
    // teleport on trigger enter
    const body = app.get('Portal');
    body.onTriggerEnter = e => {
        if (e.playerId && position) {
            const player = world.getPlayer(e.playerId);
            player.teleport(position);
        }
    }
}
```

---
*Extracted from HyperPortal_with_Set_Manual.hyp. Attachment ID: 1352439457847967874*