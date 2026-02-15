# sit.hyp

## Metadata
- **Author**: Wilson
- **Channel**: #🎨│showcase
- **Date**: 2025-03-17
- **Size**: 1,419,743 bytes

## Discord Context
> This is a Seat, v1 inspired.

## Blueprint
- **Name**: SITING POSITION
- **Version**: 11
- **Model**: `asset://bc106fe8e4158546ce8a5b3565105659b2d8c3b6fc96e7835ac3d8c373a6978c.glb`
- **Script**: `asset://95f29a69627e4f79d88cad3d9d4440311669e859c95be0b68d747d616ce40378.js`

## Props
- `emote`: emote → `asset://ad0dc6273210096fa432edaddea494beaa855cc3f108f2e909c6d4242559a97a.glb`
- `visibleType`: str = `visible`

## Assets
- `[model]` bc106fe8e4158546ce8a5b3565105659b2d8c3b6fc96e7835ac3d8c373a6978c.glb (6,260 bytes)
- `[script]` 95f29a69627e4f79d88cad3d9d4440311669e859c95be0b68d747d616ce40378.js (2,156 bytes)
- `[emote]` ad0dc6273210096fa432edaddea494beaa855cc3f108f2e909c6d4242559a97a.glb (1,410,320 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.control()`, `app.create()`, `app.get()`, `app.on()`, `app.send()`
**World Methods**: `world.getPlayer()`, `world.on()`
**Events Listened**: `leave`, `playerId`, `props:visibleType`, `release`, `request`
**Nodes Created**: `action`, `anchor`

## Keywords (for Discord search)
action, active, anchor, applyEffect, button, cancellable, configure, control, create, emote, file, getPlayer, initial, invisible, isClient, isServer, kind, label, leave, networkId

## Script Source
```javascript
app.configure([
	{
		key: 'emote',
		type: 'file',
		kind: 'emote',
		label: 'Emote'
	},
	{
		key: 'visibleType',
		type: 'switch',
		label: 'Visbility Type',
		options: [
			{ value: 'visible', label: 'Visible' },
			{ value: 'invisible', label: 'Invisible' }
		],
		initial: 'visible'
	}
])

const DEG2RAD = Math.PI / 180
const state = app.state

if (world.isServer) {
	state.playerId = null
	app.on('request', playerId => {
		if (state.playerId) return
		state.playerId = playerId
		app.send('playerId', playerId)
	})
	app.on('release', playerId => {
		if (state.playerId === playerId) {
			state.playerId = null
			app.send('playerId', null)
		}
	})
	world.on('leave', e => {
		if (state.playerId === e.player.networkId) {
			state.playerId = null
			app.send('playerId', null)
		}
	})
}

if (world.isClient) {
	const player = world.getPlayer()
	const trigger = app.get('Trigger')

	// Handle trigger visibility
	if (trigger) {
		const updateVisibility = (value) => {
			trigger.active = value === 'visible'
		}
		app.on('props:visibleType', updateVisibility)
		updateVisibility(app.props.visibleType)
	}

	// Setup seat anchor
	const anchor = app.create('anchor', { id: 'seat' })
	anchor.position.set(0, 0.12, 0)
	anchor.rotation.y = 280 * DEG2RAD
	app.add(anchor)

	// Setup action button
	const action = app.create('action')
	action.position.y = 0.7
	action.label = 'Sit'
	action.onTrigger = () => {
		app.send('request', player.networkId)
	}
	app.add(action)

	if (state.playerId) {
		action.active = false
	}

	let control
	function sit() {
		if (control) return
		action.active = false
		control = app.control()
		player.applyEffect({
			anchor,
			emote: app.props.emote?.url,
			cancellable: true,
			onEnd: stand
		})
	}

	function stand() {
		if (!control) return
		control.release()
		control = null
		action.active = true
		app.send('release', player.networkId)
	}

	app.on('playerId', playerId => {
		state.playerId = playerId
		action.active = !playerId
		if (playerId === player.networkId) {
			sit()
		} else {
			stand()
		}
	})
}
```

---
*Extracted from sit.hyp. Attachment ID: 1351223743548231872*