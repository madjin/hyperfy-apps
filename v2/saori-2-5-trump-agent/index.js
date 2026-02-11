export default function main(world, app, fetch, props, setTimeout) {
const BUBBLE_TIME = 5
const EMOTE_TIME = 2
const LOOK_TIME = 5

const UP = new Vector3(0, 1, 0)

const v1 = new Vector3()
const v2 = new Vector3()
const v3 = new Vector3()
const q1 = new Quaternion()
const q2 = new Quaternion()
const m1 = new Matrix4()

const vrm = app.get('avatar')

// SERVER

if (world.isServer) {
  // send initial state
  const state = {
    ready: true,
  }
  app.state = state
  app.send('state', state)
  // spawn controller
  const ctrl = app.create('controller')
  ctrl.position.copy(app.position)
  world.add(ctrl)
  ctrl.quaternion.copy(app.quaternion)
  ctrl.add(vrm)
  // read emotes
  const emoteUrls = {}
  if (config.emote1Name && config.emote1?.url) {
    emoteUrls[config.emote1Name] = config.emote1.url
  }
  if (config.emote2Name && config.emote2?.url) {
    emoteUrls[config.emote2Name] = config.emote2.url
  }
  if (config.emote3Name && config.emote3?.url) {
    emoteUrls[config.emote3Name] = config.emote3.url
  }
  if (config.emote4Name && config.emote4?.url) {
    emoteUrls[config.emote4Name] = config.emote4.url
  }
  // observe environment
  let changed = true
  let notifying = false
  const info = {
    world: {
      id: null, // todo
      name: null, // todo
      url: null, // todo
      context: config.context || 'You are in a virtual world powered by Hyperfy',
    },
    you: {
      id: app.instanceId,
      name: config.name,
    },
    emotes: Object.keys(emoteUrls),
    triggers: [],
    events: [],
  }
  world.on('enter', player => {
    info.events.push({
      type: 'player-enter',
      playerId: player.entityId,
    })
    changed = true
  })
  world.on('leave', player => {
    info.events.push({
      type: 'player-leave',
      playerId: player.entityId,
    })
    changed = true
  })
  world.on('chat', msg => {
    if (msg.fromId === app.instanceId) return
    info.events.push({
      type: 'chat',
      ...msg,
    })
    if (info.events.length > 16) {
      info.events.shift()
    }
    changed = true
  })
  // DEBUG
  // app.send('say', 'Test!')
  // app.send('emote', emoteUrls.wave)
  async function notify() {
    if (!config.url) return
    changed = false
    notifying = true
    console.log('notifying...', info)
    let data
    try {
      const resp = await fetch(config.url, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(info),
      })
      data = await resp.json()
    } catch (err) {
      console.error('notify failed')
    }
    notifying = false
    if (!data) return
    console.log(data)
    if (data.say) {
      app.send('say', data.say)
      const msg = {
        id: uuid(),
        from: config.name + ' (agent)',
        fromId: app.instanceId,
        body: data.say,
        createdAt: world.getTimestamp(),
      }
      world.chat(msg, true)
      info.events.push({
        type: 'chat',
        ...msg,
      })
    }
    if (data.emote) {
      const url = emoteUrls[data.emote]
      app.send('emote', url)
    }
    if (data.look) {
      app.send('look', data.look)
    }
  }
  app.on('fixedUpdate', delta => {
    if (changed && !notifying) {
      notify()
    }
    // const v1 = new Vector3(0,0,1)
    // app.on('fixedUpdate', delta => {
    //   ctrl.move(v1.set(0,0,1).multiplyScalar(1 * delta))
    // })
  })
}

// CLIENT

if (world.isClient) {
  const config = app.config
  const idleEmoteUrl = config.emote0?.url
  world.attach(vrm)
  let state = app.state
  if (state.ready) {
    init()
  } else {
    world.remove(vrm)
    app.on('state', _state => {
      state = _state
      init()
    })
  }
  // setup bubble
  const bubble = app.create('ui')
  bubble.width = 300
  bubble.height = 512
  bubble.size = 0.005
  bubble.pivot = 'bottom-center'
  bubble.billboard = 'full'
  bubble.justifyContent = 'flex-end'
  bubble.alignItems = 'center'
  bubble.position.y = 2
  bubble.active = false
  const bubbleBox = app.create('uiview')
  bubbleBox.backgroundColor = 'rgba(0, 0, 0, 0.95)'
  bubbleBox.borderRadius = 20
  bubbleBox.padding = 20
  bubble.add(bubbleBox)
  const bubbleText = app.create('uitext')
  bubbleText.color = 'white'
  bubbleText.fontWeight = 100
  bubbleText.lineHeight = 1.4
  bubbleText.fontSize = 16
  bubbleText.value = '...'
  bubbleBox.add(bubbleText)
  vrm.add(bubble)
  // setup nametag
  const nametag = app.create('nametag')
  nametag.label = config.name
  nametag.position.y = 2
  vrm.add(nametag)
  function init() {
    world.add(vrm)
    vrm.setEmote(idleEmoteUrl)
  }
  const data = {}
  app.on('say', value => {
    data.say = { timer: 0 }
    nametag.active = false
    bubbleText.value = value
    bubble.active = true
  })
  app.on('emote', url => {
    data.emote = { timer: 0 }
    vrm.setEmote(url)
  })
  app.on('look', playerId => {
    data.look = { playerId, timer: 0 }
  })
  app.on('update', delta => {
    if (data.say) {
      data.say.timer += delta
      if (data.say.timer > BUBBLE_TIME) {
        data.say = null
        bubble.active = false
        nametag.active = true
      }
    }
    if (data.emote) {
      data.emote.timer += delta
      if (data.emote.timer > EMOTE_TIME) {
        data.emote = null
        vrm.setEmote(idleEmoteUrl)
      }
    }
    if (data.look) {
      const player = world.getPlayer(data.look.playerId)
      if (player) {
        const direction = v1.copy(player.position).sub(vrm.position)
        direction.y = 0
        const angle = Math.atan2(direction.x, direction.z) + Math.PI
        vrm.quaternion.setFromAxisAngle(UP, angle)
      }
      data.look.timer += delta
      if (data.look.timer > LOOK_TIME) {
        data.look = null
      }
    }
  })
}

// CONFIG

app.configure(() => {
  return [
    {
      key: 'name',
      type: 'text',
      label: 'Name',
    },
    {
      key: 'context',
      type: 'textarea',
      label: 'Context',
    },
    {
      key: 'url',
      type: 'text',
      label: 'URL',
    },
    {
      key: 'emotes',
      type: 'section',
      label: 'Emotes',
    },
    {
      key: 'emote0',
      type: 'file',
      label: 'Idle',
      kind: 'emote',
    },
    {
      key: 'emote',
      type: 'switch',
      label: 'Custom',
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ],
    },
    ...customEmoteFields('1'),
    ...customEmoteFields('2'),
    ...customEmoteFields('3'),
    ...customEmoteFields('4'),
  ]
  function customEmoteFields(n) {
    return [
      {
        key: `emote${n}Name`,
        type: 'text',
        label: 'Name',
        when: [{ key: 'emote', op: 'eq', value: n }],
      },
      {
        key: `emote${n}`,
        type: 'file',
        label: 'Emote',
        kind: 'emote',
        when: [{ key: 'emote', op: 'eq', value: n }],
      },
    ]
  }
})

}
