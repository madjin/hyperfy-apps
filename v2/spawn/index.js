export default function main(world, app, fetch, props, setTimeout) {
const propConfig = [{
  key: 'id',
  type: 'number',
  label: 'Spawn ID',
  min: 1,
  step: 1,
  initial: 1
}]

app.configure(propConfig);

console.log('id', props.id)

if (world.isServer) {
  world.on(`spawn:${props.id}`, (playerId) => {
    console.log('spawn', props.id)
    const player = world.getPlayer(playerId)
    player.teleport(app.position)
  })
}
}
