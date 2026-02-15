export default function main(world, app, fetch, props, setTimeout) {
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
}
