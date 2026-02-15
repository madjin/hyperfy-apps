# Emote_Rom_1.hyp

## Metadata
- **Author**: ~/drdoge.eth
- **Channel**: #💻│developers
- **Date**: 2025-04-17
- **Size**: 1,172,441 bytes

## Discord Context
> <@722481129449586739>

## Blueprint
- **Name**: Emote_Rom
- **Version**: 15
- **Model**: `asset://9eefb29492dbcf914486487ead46db237a06ff10b645bd0d46b2fff8e8b0d289.glb`
- **Script**: `asset://1f0f32255183b88243bb7f1148887b57cc57830622bbacc128b3a3119e9d7a3a.js`

## Props
- `rName`: str = `Emotes`
- `color`: str = `0.0957`
- `emote1Emoji`: str = `😊`
- `emote2Emoji`: str = ``
- `emote3Emoji`: str = ``
- `emote4Emoji`: str = ``
- `emote5Emoji`: str = `🎵`
- `emote6Emoji`: str = ``
- `emote7Emoji`: str = ``
- `emote8Emoji`: str = ``
- `emote9Emoji`: str = ``
- `emote0Emoji`: str = ``
- `duration`: int = `6`
- `emote1File`: emote → `asset://794179bb27efd57e8f2043d0b54fec96232ec0443bacda527cd8e0052019e9c4.glb`
- `emote2File`: emote → `asset://501b55d3c45dd3132d38019c2383fb03b9a22a983ef64c68a0e7c1c3334664f3.glb`
- `emote3File`: emote → `asset://2595bcdc8c8b5be4847b4f43d424220dee04b3d8a68798e8d8eef73bf2f900f6.glb`
- `emote4File`: emote → `asset://98c5162baf5d090d63f3ed9e70d3a94a61420d8b60cc45f7ddce606e1ff43fb5.glb`

## Assets
- `[model]` 9eefb29492dbcf914486487ead46db237a06ff10b645bd0d46b2fff8e8b0d289.glb (31,856 bytes)
- `[script]` 1f0f32255183b88243bb7f1148887b57cc57830622bbacc128b3a3119e9d7a3a.js (8,355 bytes)
- `[emote]` 794179bb27efd57e8f2043d0b54fec96232ec0443bacda527cd8e0052019e9c4.glb (238,040 bytes)
- `[emote]` 501b55d3c45dd3132d38019c2383fb03b9a22a983ef64c68a0e7c1c3334664f3.glb (279,792 bytes)
- `[emote]` 2595bcdc8c8b5be4847b4f43d424220dee04b3d8a68798e8d8eef73bf2f900f6.glb (330,384 bytes)
- `[emote]` 98c5162baf5d090d63f3ed9e70d3a94a61420d8b60cc45f7ddce606e1ff43fb5.glb (281,856 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.broadcast()`, `app.configure()`, `app.control()`, `app.create()`, `app.get()`, `app.on()`, `app.send()`
**World Methods**: `world.add()`, `world.getPlayer()`, `world.remove()`
**Events Listened**: `emote:play`, `emote:show`, `update`
**Nodes Created**: `ui`, `uitext`

## Keywords (for Discord search)
above, active, activeEmoteUIs, after, again, alignItems, applyEffect, backgroundColor, below, billboard, borderRadius, broadcast, cases, center, clients, code, color, configure, control, copy

## Script Source
```javascript
// =================================================================
// Place your rom scrip below:
// =================================================================


app.configure([
  
])

// Server-side code to handle emote syncing
if (world.isServer) {
  app.on('emote:play', ({ playerId, emoteUrl, emoji }) => {
    // Broadcast to all clients
    app.broadcast('emote:show', { playerId, emoteUrl, emoji })
  })
}

if (world.isClient) {
  const player = world.getPlayer()
  const control = app.control()
  const activeEmoteUIs = new Map() // Track UIs for all players

  // Create UI for emote indicator
  function createEmoteUI(targetPlayer) {
    const ui = app.create('ui')
    ui.width = 50
    ui.height = 50
    ui.backgroundColor = 'rgba(0, 0, 0, 0)'
    ui.borderRadius = 25
    ui.padding = 5
    ui.billboard = 'full'
    ui.pivot = 'center'
    ui.justifyContent = 'center'
    ui.alignItems = 'center'
    
    const text = app.create('uitext')
    text.fontSize = 0
    text.color = '#ffffff'
    ui.add(text)
    
    // Position above target player
    ui.position.copy(targetPlayer.position)
    ui.position.y += 2.5
    
    return { ui, text }
  }

  function showEmoteIndicator(targetPlayer, emoji) {
    let emoteUI = activeEmoteUIs.get(targetPlayer.id)
    
    if (!emoteUI) {
      const { ui, text } = createEmoteUI(targetPlayer)
      emoteUI = { ui, text }
      activeEmoteUIs.set(targetPlayer.id, emoteUI)
      world.add(ui)
    }
    
    // Update position and emoji
    emoteUI.ui.position.copy(targetPlayer.position)
    emoteUI.ui.position.y += 2.5
    emoteUI.text.value = emoji
    
    // Hide after duration
    setTimeout(() => {
      const ui = activeEmoteUIs.get(targetPlayer.id)
      if (ui) {
        world.remove(ui.ui)
        activeEmoteUIs.delete(targetPlayer.id)
      }
    }, (app.props.duration || 1) * 1000)
  }

  function playEmote(num) {
    const emoteFile = app.props[`emote${num}File`]
    const emoji = app.props[`emote${num}Emoji`]
    
    if (!emoteFile?.url) return
    if (player.hasEffect()) return

    const emoteUrl = emoteFile.url + '?l=0'
    
    // Play locally first
    player.applyEffect({
      emote: emoteUrl,
      duration: app.props.duration || 1,
      move: false
    })

    // Show local indicator
    showEmoteIndicator(player, emoji || `${num}`)
    
    // Send to server to sync with others
    app.send('emote:play', {
      playerId: player.id,
      emoteUrl: emoteUrl,
      emoji: emoji || `${num}`
    })
  }

  // Listen for emote events from server
  app.on('emote:show', ({ playerId, emoteUrl, emoji }) => {
    // Don't play again for local player
    if (playerId === player.id) return
    
    const targetPlayer = world.getPlayer(playerId)
    if (!targetPlayer) return
    
    // Play emote on target player
    targetPlayer.applyEffect({
      emote: emoteUrl,
      duration: app.props.duration || 1,
      move: false
    })

    // Show emoji indicator
    showEmoteIndicator(targetPlayer, emoji)
  })

  app.on('update', () => {
    // Update all active UIs
    for (const [playerId, emoteUI] of activeEmoteUIs) {
      const targetPlayer = world.getPlayer(playerId)
      if (targetPlayer) {
        emoteUI.ui.position.copy(targetPlayer.position)
        emoteUI.ui.position.y += 2.5
      }
    }

    // Check numpad keys 0-9
    if (control.digit0?.pressed) playEmote(0)
    if (control.digit1?.pressed) playEmote(1)
    if (control.digit2?.pressed) playEmote(2)
    if (control.digit3?.pressed) playEmote(3)
    if (control.digit4?.pressed) playEmote(4)
    if (control.digit5?.pressed) playEmote(5)
    if (control.digit6?.pressed) playEmote(6)
    if (control.digit7?.pressed) playEmote(7)
    if (control.digit8?.pressed) playEmote(8)
    if (control.digit9?.pressed) playEmote(9)
  })
} 


// =================================================================
// Config
// =================================================================
app.configure([
  {
    key: 'rName',
    type: 'text',
    label: 'Rom Name',
  },
  {
    key:'color',
    type: 'dropdown',
    label: 'Color',
    options: [
        {
            label: 'Red',
            value: '0.0957',
        },
        {
            label: 'Orange',
            value: '0',
        },
                {
            label: 'Yellow',
            value: '0.4824',
        },
                {
            label: 'Green',
            value: '0.2633',
        },
                {
            label: 'Blue',
            value: '0.389',
        },
                {
            label: 'Indigo',
            value: '0.1777',
        },
        {
            label: 'Violet',
            value: '0.5098',
        },
    ],
    initial: '0',
  },
  {
    type: 'section',
    key: 'emote1',
    label: 'Numpad 1 Emote'
  },
  {
    key: 'emote1File',
    type: 'file',
    kind: 'emote',
    label: 'Animation'
  },
  {
    key: 'emote1Emoji',
    type: 'text',
    label: 'Emoji',
    initial: '😊'
  },
  {
    type: 'section',
    key: 'emote2',
    label: 'Numpad 2 Emote'
  },
  {
    key: 'emote2File',
    type: 'file',
    kind: 'emote',
    label: 'Animation'
  },
  {
    key: 'emote2Emoji',
    type: 'text',
    label: 'Emoji',
    initial: '🎉'
  },
  {
    type: 'section',
    key: 'emote3',
    label: 'Numpad 3 Emote'
  },
  {
    key: 'emote3File',
    type: 'file',
    kind: 'emote',
    label: 'Animation'
  },
  {
    key: 'emote3Emoji',
    type: 'text',
    label: 'Emoji',
    initial: '🌟'
  },
  {
    type: 'section',
    key: 'emote4',
    label: 'Numpad 4 Emote'
  },
  {
    key: 'emote4File',
    type: 'file',
    kind: 'emote',
    label: 'Animation'
  },
  {
    key: 'emote4Emoji',
    type: 'text',
    label: 'Emoji',
    initial: '💪'
  },
  {
    type: 'section',
    key: 'emote5',
    label: 'Numpad 5 Emote'
  },
  {
    key: 'emote5File',
    type: 'file',
    kind: 'emote',
    label: 'Animation'
  },
  {
    key: 'emote5Emoji',
    type: 'text',
    label: 'Emoji',
    initial: '🎵'
  },
  {
    type: 'section',
    key: 'emote6',
    label: 'Numpad 6 Emote'
  },
  {
    key: 'emote6File',
    type: 'file',
    kind: 'emote',
    label: 'Animation'
  },
  {
    key: 'emote6Emoji',
    type: 'text',
    label: 'Emoji',
    initial: '❤️'
  },
  {
    type: 'section',
    key: 'emote7',
    label: 'Numpad 7 Emote'
  },
  {
    key: 'emote7File',
    type: 'file',
    kind: 'emote',
    label: 'Animation'
  },
  {
    key: 'emote7Emoji',
    type: 'text',
    label: 'Emoji',
    initial: '🎮'
  },
  {
    type: 'section',
    key: 'emote8',
    label: 'Numpad 8 Emote'
  },
  {
    key: 'emote8File',
    type: 'file',
    kind: 'emote',
    label: 'Animation'
  },
  {
    key: 'emote8Emoji',
    type: 'text',
    label: 'Emoji',
    initial: '🌈'
  },
  {
    type: 'section',
    key: 'emote9',
    label: 'Numpad 9 Emote'
  },
  {
    key: 'emote9File',
    type: 'file',
    kind: 'emote',
    label: 'Animation'
  },
  {
    key: 'emote9Emoji',
    type: 'text',
    label: 'Emoji',
    initial: '✨'
  },
  {
    type: 'section',
    key: 'emote0',
    label: 'Numpad 0 Emote'
  },
  {
    key: 'emote0File',
    type: 'file',
    kind: 'emote',
    label: 'Animation'
  },
  {
    key: 'emote0Emoji',
    type: 'text',
    label: 'Emoji',
    initial: '🎭'
  },
  {
    key: 'duration',
    type: 'number',
    label: 'Animation Duration (seconds)',
    initial: 1,
    min: 0.1,
    max: 10,
    step: 0.1
  }
]);
// =================================================================
// UI
// =================================================================
const ui = app.create('ui')
ui.rotation.y = 180 * DEG2RAD
ui.position.z = -0.12
ui.position.y = -0.46
ui.width = 20
const romName = app.create('uitext')
romName.fontSize = 4
romName.textAlign = 'center'
romName.color = '#000000'
romName.value = props.rName
romName.backgroundColor = '#ffffff'
romName.fontFamily = 'Arial Black'
const mesh = app.get('hyper-rom-orange_mesh')
const mat = mesh.material


// ... truncated ...
```

---
*Extracted from Emote_Rom_1.hyp. Attachment ID: 1362219849807560896*