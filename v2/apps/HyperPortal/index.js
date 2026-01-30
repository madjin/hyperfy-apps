export default function main(world, app, fetch, props, setTimeout) {
app.configure([
	{
		key: 'zone1',
		type: 'text',
		label: 'X,Y,Z',
		initial: '0,5,0'
	}
])

// Get the body component which will have our trigger collider
const body = app.get('Portal')

// Helper function to convert string coordinates to Vector3
const parseCoords = (coordString) => {
	try {
		const [x, y, z] = coordString.split(',').map(num => parseFloat(num.trim()))
		return new Vector3(x, y, z)
	} catch (err) {
		// console.log('Error parsing coordinates:', coordString)
		return new Vector3(0, 0, 0)
	}
}

// Handle trigger events
body.onTriggerEnter = e => {
	// console.log('Trigger entered by:', e)
	if (e.playerId) {
		const destination = parseCoords(props.zone1)
		// console.log('Teleporting to:', destination)
		const player = world.getPlayer(e.playerId)
		player.teleport(destination)
	}
}

}
