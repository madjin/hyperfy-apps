export default function main(world, app, fetch, props, setTimeout) {
app.configure([
  {
    key: 'name',
    type: 'text',
    label: 'Name'
  },
  {
    key: 'avatar',
    type: 'file',
    kind: 'avatar',
    label: 'Avatar'
  },
  {
    key: 'emote',
    type: 'file',
    kind: 'emote',
    label: 'Emote',
  },
  {
    key: 'hover',
    type: 'switch',
    label: 'Hover',
    options: [
      { label: 'No', value: false },
      { label: 'Yes', value: true },
    ],
    initial: false,
  },
  {
    key: 'rotate',
    type: 'switch',
    label: 'Rotate',
    options: [
      { label: 'No', value: false },
      { label: 'Yes', value: true },
    ],
    initial: false,
  }
])

const name = props.name
const src = props.avatar?.url || 'asset://avatar.vrm'
const emote = props.emote?.url
const hover = props.hover
const rotate = props.rotate

const nametag = app.create('nametag')
nametag.label = name

const avatar = app.create('avatar')
avatar.src = src
avatar.position.y = 0.5
avatar.setEmote(emote)
avatar.onLoad = () => {
  nametag.position.y = avatar.getHeight() + 0.15
  avatar.add(nametag)
}
app.add(avatar)

if (rotate || hover) {
  const hoverHeight = 0.05
  const hoverSpeed = 2
  const initialY = avatar.position.y
  let time = 0
  app.on('update', delta => {
    if (rotate) {
      avatar.rotation.y -= 0.5 * delta
    }
    if (hover) {
      time += delta
      avatar.position.y = initialY + Math.sin(time * hoverSpeed) * hoverHeight
    }
  })
}

const action = app.create('action')
action.position.y += 0.7
action.label = 'Equip'
action.onTrigger = e => {
  if (!e.playerId) return
  const player = world.getPlayer(e.playerId)
  player.setSessionAvatar(src)
}
app.add(action)
}
