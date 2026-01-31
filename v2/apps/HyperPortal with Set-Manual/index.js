export default function main(world, app, fetch, props, setTimeout) {
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
}
