# saori-2-5-trump-agent.hyp

## Metadata
- **Author**: 0mka
- **Channel**: #🎨│showcase
- **Date**: 2025-03-04
- **Size**: 15,535,931 bytes

## Blueprint
- **Name**: N/A
- **Version**: 1
- **Model**: `asset://e9bde28f0150f41f859af8ff09693f9b979a79718306554dc54df6aaada5b396.vrm`
- **Script**: `asset://2998e0a3c56caac66773362f073297e248fd4b0086083c7d17298157e8eaaf3c.js`

## Props
- `name`: str = `Trump`
- `context`: str = `You are standing in a large open grassy field in the middle of the day with a nice blue sky. There is almost nothing else around except the whitehouse which is behind you.
`
- `emote0`: object → `asset://a49fd36d62e15879a1a0aabc265904b68bfce32201f3a1d3098656e9c99daa0e.glb`
- `emote`: str = `4`
- `emote1Name`: str = `wave`
- `emote1`: object → `asset://2e7dbb54117a5dc83362ae7df4e2909607a62cd3abddd8abb9c8d873c5941a4b.glb`
- `emote2Name`: str = `think`
- `emote2`: object → `asset://f26ed53da54504fd2fc0b49871feb0db4714b0bed60dd69d5514a4ee75d94fcf.glb`
- `emote3Name`: str = `cheer`
- `emote3`: object → `asset://930040910cff7d172218a6251cb091f5be62c42b0b4c3cf9f051a1793101ce6f.glb`
- `emote4`: object → `asset://41e54bd466c366918d850312f8be6a9b27fb2683a661fa9e201387612cab8f22.glb`
- `emote4Name`: str = `explain`
- `url`: str = ``

## Assets
- `[avatar]` e9bde28f0150f41f859af8ff09693f9b979a79718306554dc54df6aaada5b396.vrm (15,090,720 bytes)
- `[script]` 2998e0a3c56caac66773362f073297e248fd4b0086083c7d17298157e8eaaf3c.js (6,865 bytes)
- `[?]` a49fd36d62e15879a1a0aabc265904b68bfce32201f3a1d3098656e9c99daa0e.glb (119,836 bytes)
- `[?]` 2e7dbb54117a5dc83362ae7df4e2909607a62cd3abddd8abb9c8d873c5941a4b.glb (69,760 bytes)
- `[?]` f26ed53da54504fd2fc0b49871feb0db4714b0bed60dd69d5514a4ee75d94fcf.glb (91,500 bytes)
- `[?]` 930040910cff7d172218a6251cb091f5be62c42b0b4c3cf9f051a1793101ce6f.glb (67,272 bytes)
- `[?]` 41e54bd466c366918d850312f8be6a9b27fb2683a661fa9e201387612cab8f22.glb (87,868 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.create()`, `app.get()`, `app.on()`, `app.send()`
**World Methods**: `world.add()`, `world.attach()`, `world.chat()`, `world.getPlayer()`, `world.getTimestamp()`, `world.on()`, `world.remove()`
**Events Listened**: `chat`, `emote`, `enter`, `fixedUpdate`, `leave`, `look`, `say`, `state`, `update`
**Nodes Created**: `controller`, `nametag`, `ui`, `uitext`, `uiview`

## Keywords (for Discord search)
active, agent, alignItems, angle, application, atan2, attach, avatar, backgroundColor, billboard, body, borderRadius, bottom, bubble, bubbleBox, bubbleText, center, changed, chat, color

## Script Source
```javascript
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

```

---
*Extracted from saori-2-5-trump-agent.hyp. Attachment ID: 1346629937737502720*