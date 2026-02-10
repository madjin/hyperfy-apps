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



}
