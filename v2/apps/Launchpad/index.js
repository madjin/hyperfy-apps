export default function main(world, app, fetch, props, setTimeout) {
if (world.isClient) {
  const body = app.get('Launchpad')
  body.onTriggerEnter = (e) => {
    if (e.playerId) {
      console.log('onTriggerEnter push')
      world.getPlayer(e.playerId).push(new Vector3(0, 10, 0))
    }
  }
}
}
