export default function main(world, app, fetch, props, setTimeout) {
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
}
