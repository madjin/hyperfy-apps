# Raycaster.hyp

## Metadata
- **Author**: Saori
- **Channel**: #🎨│showcase
- **Date**: 2025-03-10
- **Size**: 6,494 bytes

## Discord Context
> just boilerplate server raycast stuff and places an object where it hit

## Blueprint
- **Name**: Raycaster
- **Version**: 50
- **Model**: `asset://1e53c9e7a18dfe47743e81a3006b7cd3c1d047e2f710c477c61e2113a1469cc4.glb`
- **Script**: `asset://986d2603e1c183d41f985b76b104db71be92dee02915fc49a26d56a62b82ddce.js`

## Assets
- `[model]` 1e53c9e7a18dfe47743e81a3006b7cd3c1d047e2f710c477c61e2113a1469cc4.glb (4,872 bytes)
- `[script]` 986d2603e1c183d41f985b76b104db71be92dee02915fc49a26d56a62b82ddce.js (959 bytes)

## Script Analysis
**App Methods**: `app.get()`, `app.on()`, `app.send()`
**World Methods**: `world.add()`, `world.on()`, `world.raycast()`, `world.remove()`
**Events Listened**: `hit`, `raybeam`

## Keywords (for Discord search)
addScaledVector, beam, clone, console, copy, direction, directionVec3, distance, isClient, isServer, normalize, offsetDistance, offsetOrigin, origin, originVec3, point, position, raybeam, raycast, remove

## Script Source
```javascript
if (world.isServer) {
  world.on('raybeam', ({ origin, direction }) => {
    const originVec3 = new Vector3(origin[0], origin[1], origin[2])
    const directionVec3 = new Vector3(direction[0], direction[1], direction[2])
    
    directionVec3.normalize()
    
    const offsetDistance = 0.5
    const offsetOrigin = new Vector3()
    offsetOrigin.copy(originVec3)
    offsetOrigin.addScaledVector(directionVec3, offsetDistance)
    
    const hit = world.raycast(offsetOrigin, directionVec3, Infinity)
    if (!hit) return
    
    app.send('hit', {
      point: hit.point.toArray(),
      distance: hit.distance
    })
    
  })
}

if(world.isClient) {
  let clone = null

  app.on('hit', ({point, distance}) => {
    console.log(distance)
    if (clone !== null) world.remove(clone)
    const beam = app.get('Beam')
    clone = beam.clone()
    clone.position.set(point[0], point[1], point[2])
    clone.scale.set(0.1, 0.1, 0.1)
    world.add(clone)
  })
}
```

---
*Extracted from Raycaster.hyp. Attachment ID: 1348748102810603610*