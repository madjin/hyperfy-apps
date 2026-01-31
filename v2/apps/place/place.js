/**
 * Place - Named teleport destination (V2 equivalent of hyperfy-place)
 *
 * Creates a named location that other scripts can teleport players to.
 *
 * To teleport a player here from another script:
 *   world.emit(`place:${placeName}`, playerId)
 *
 * Example:
 *   world.emit('place:Lobby', player.id)
 */

app.configure([
  {
    key: 'name',
    type: 'text',
    label: 'Place Name',
    initial: 'Place'
  }
])

console.log('[Place] Registered:', props.name)

if (world.isServer) {
  // Listen for teleport requests to this place
  world.on(`place:${props.name}`, (playerId) => {
    console.log('[Place] Teleporting player to:', props.name)
    const player = world.getPlayer(playerId)
    if (player) {
      player.teleport(app.position, app.rotation.y)
    }
  })
}

// Show marker in build mode only (client-side)
if (world.isClient) {
  let marker = null

  function createMarker() {
    if (marker) return

    // Create a simple marker ring
    const ring = app.create('prim', {
      type: 'cylinder',
      size: [1, 0.05, 1],
      color: '#00aaff',
      emissive: '#00aaff',
      emissiveIntensity: 2,
      opacity: 0.7,
      position: [0, 0.025, 0]
    })
    app.add(ring)

    // Create vertical beacon
    const beacon = app.create('prim', {
      type: 'cylinder',
      size: [0.08, 1.5, 0.08],
      color: '#00aaff',
      emissive: '#00aaff',
      emissiveIntensity: 3,
      opacity: 0.5,
      position: [0, 0.75, 0]
    })
    app.add(beacon)

    marker = { ring, beacon }
  }

  function destroyMarker() {
    if (!marker) return
    app.remove(marker.ring)
    app.remove(marker.beacon)
    marker = null
  }

  // Listen for build mode changes
  world.on('build-mode', (enabled) => {
    if (enabled) {
      createMarker()
    } else {
      destroyMarker()
    }
  })
}
