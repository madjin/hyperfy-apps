# HyperBeacon_v2.hyp

## Metadata
- **Author**: maximus
- **Channel**: #🎨│showcase
- **Date**: 2025-02-07
- **Size**: 104,549 bytes

## Discord Context
> Sharing a sample implementation by <@297290503181959169> 

<@749326744238030929>  feel free to suggest changes to this showcase, thanks!

## Blueprint
- **Name**: HyperBeacon
- **Version**: 6
- **Model**: `asset://890216369d38c1e650b68eed0b175f5f3e10826b9cf98db2d103279286d40fd2.glb`
- **Script**: `asset://179030a263489d85dd54f242b94a2ae788ec598c7c360b9ac9ddf5e4f189f279.js`

## Props
- `url`: str = ``
- `description`: str = ``
- `name`: str = ``
- `tags`: str = ``
- `relay`: str = ``
- `image`: str = ``

## Assets
- `[model]` 890216369d38c1e650b68eed0b175f5f3e10826b9cf98db2d103279286d40fd2.glb (100,736 bytes)
- `[script]` 179030a263489d85dd54f242b94a2ae788ec598c7c360b9ac9ddf5e4f189f279.js (2,917 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.get()`, `app.on()`
**Events Listened**: `update`

## Keywords (for Discord search)
active, adult, animate, application, beacon, body, comma, communicate, configure, configured, console, delta, description, error, fetch, file, header1, header2, headers, heartbeat

## Script Source
```javascript
app.configure(() => {
	return [
		{
			type: 'section',
			key: 'header1',
			label: 'Relay Settings',
		},
		{
			type: 'text',
			key: 'relay',
			label: 'Relay URL',
			placeholder: 'The URL of your target relay.'
		},
		{
			type: 'section',
			key: 'header2',
			label: 'Beacon Settings',
		},
		{
			type: 'text',
			key: 'url',
			label: 'URL',
			placeholder: 'The main URL of your world.',
			initial: '',
		},
		{
			type: 'text',
			key: 'name',
			label: 'Name',
			placeholder: 'The name of your world.',
			initial: '',
		},
		{
			type: 'textarea',
			key: 'description',
			label: 'Description',
			placeholder: 'The description of your world.',
			initial: '',
		},
		{
			type: 'textarea',
			key: 'image',
			label: 'Preview Image',
			placeholder: 'A preview image for your world.',
			initial: '',
		},
		// {
		// 	type: 'file',
		// 	key: 'image',
		// 	label: 'Preview Image',
		// 	kind: 'texture',
		// },
		{
			type: 'text',
			key: 'tags',
			label: 'Tags',
			placeholder: 'comma,separated,tags',
			initial: 'social',
		}
	]
})

const configured = () => {
	return !!props.relay &&
		!!props.url &&
		!!props.name &&
		!!props.description &&
		!!props.image &&
		!!props.tags;
}


// Get the mesh to animate
const hyper = app.get('$HYPER');
const ring = app.get('Ring');
let rotationSpeed = 1; // Rotation speed in radians per second

hyper.position.set(0, 50, 0)
hyper.scale.set(10, 10, 10)

// Relay-specific vars
const sessionId = uuid();
let sendHeartbeats = false;

// Initial signal
(async function () {
	if (!configured()) return;

	try {
		await fetch(`${props.relay}/beacon`, {
			method: 'PUT',
			body: JSON.stringify({
				url: props.url,
				name: props.name,
				description: props.description,
				active: true,
				image: props.image,
				adult: false,
				tags: props.tags,
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		sendHeartbeats = true;
	} catch {
		console.error("Failed to communicate with relay server!");
	}
})()

// Session Heartbeats
let time = 0;
app.on('update', delta => {
	if (!sendHeartbeats || world.isServer) return;

	time += delta;
	// Rotate the mesh
	hyper.rotation.y += rotationSpeed * delta;
	ring.rotation.x += rotationSpeed * delta;
	ring.rotation.y += rotationSpeed * delta;
	ring.rotation.z += rotationSpeed * delta;
	if (time > 4.5) {
		try {
			(async function () {
				await fetch(`${props.relay}/session`, {
					method: 'POST',
					body: JSON.stringify({
						session_id: sessionId,
						url: props.url,
						timestamp: Date.now(),
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				});
			})();
			time = 0;
		} catch (e) {
			console.log(e);
			console.error("Failed to send heartbeat signal! Relay server is not reachable.")
		}
	}
})
```

---
*Extracted from HyperBeacon_v2.hyp. Attachment ID: 1337234426043826208*