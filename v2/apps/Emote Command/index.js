export default function main(world, app, fetch, props, setTimeout) {
app.configure([
  {
    key: 'cmd',
    type: 'text',
    label: 'Command',
    hint: `The command that triggers the emote, without the slash, eg 'dance'.`
  },
  {
    key: 'emote',
    type: 'file',
    kind: 'emote',
    label: 'Emote',
  }
])

const cmd = props.cmd
const emote = props.emote?.url

if (cmd && emote) {
  world.on('command', e => {
    if (e.args[0] !== cmd) return
    const player = world.getPlayer()
    player.applyEffect({ emote, cancellable: true })
  })
}
}
