# HyperPortal_with_Set.hyp

## Metadata
- **Author**: 0mka
- **Channel**: #🎨│showcase
- **Date**: 2025-03-13
- **Size**: 85,732 bytes

## Discord Context
> Thanks <@179546010303856640> for adding the set to this similar to the elementals store setup.

## Blueprint
- **Name**: HyperPortal with Set
- **Version**: 9
- **Model**: `asset://f361b150f4d5ef44b6840e7c35264b863eb6982c5f74ed9b9736f61adab41d34.glb`
- **Script**: `asset://f621e25b9eed75d7dc000b5a0d7872369b76c0d51e0c681938c578ea4973bb6f.js`

## Props
- `zone1`: str = `1,0,0`

## Assets
- `[model]` f361b150f4d5ef44b6840e7c35264b863eb6982c5f74ed9b9736f61adab41d34.glb (9,672 bytes)
- `[script]` f621e25b9eed75d7dc000b5a0d7872369b76c0d51e0c681938c578ea4973bb6f.js (1,075 bytes)
- `[texture]` d60648b9091c00e460545dce3cef7b88c0d643d0a864424f715a878c2ad3661a.png (73,989 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.get()`, `app.on()`, `app.send()`
**World Methods**: `world.get()`, `world.getPlayer()`, `world.set()`
**Events Listened**: `position`

## Keywords (for Discord search)
attempt, body, btns, buttons, configure, enter, fromArray, getPlayer, instanceId, isAdmin, isClient, isServer, label, listen, onClick, onTriggerEnter, player, playerId, position, send

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
					const position = world.getPlayer().position.toArray()
					app.send('position', position)
				}
			}
		]
	}
])

if (world.isServer) {
	const key = `${app.instanceId}:position`
	let position = world.get(key)
	app.on('position', (arr, playerId) => {
		const player = world.getPlayer(playerId)
		if (!player.isAdmin) return
		position = arr
		world.set(key, arr)
		app.send('position', arr)
	})
}

if (world.isClient) {
	let position = null
	// attempt to get position from state
	if (app.state.position) {
		position = new Vector3().fromArray(app.state.position)
	}
	// listen to server position updates
	app.on('position', arr => {
		position = new Vector3().fromArray(arr)
	})
	// teleport on trigger enter
	const body = app.get('Portal')
	body.onTriggerEnter = e => {
		if (e.playerId && position) {
			const player = world.getPlayer(e.playerId)
			player.teleport(position)
		}
	}
}



```

---
*Extracted from HyperPortal_with_Set.hyp. Attachment ID: 1349789439764856963*