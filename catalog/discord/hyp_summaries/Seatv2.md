# Seatv2.hyp

## Metadata
- **Author**: 0mka
- **Channel**: #🎨│showcase
- **Date**: 2025-07-08
- **Size**: 1,925,056 bytes

## Blueprint
- **Name**: Seat🪑v2
- **Version**: 2
- **Model**: `asset://bc106fe8e4158546ce8a5b3565105659b2d8c3b6fc96e7835ac3d8c373a6978c.glb`
- **Script**: `asset://1ed8d82ea47a094b2c18b89def6df56edf2e0aa34f99b8ea937c7984c9ce7cdd.js`

## Props
- `emote`: emote → `asset://6bbb2ac54cdd0f79dea89db778307a0bd8a48801afeedabc8d1ef0409d626efb.glb`
- `visibleType`: str = `visible`
- `hoverImage`: texture → `asset://35dd29d57ec361560fa42fccbe3d59754f34b3dca0e9ff4b9ab5f20029a1f211.webp`
- `interactionType`: str = `action`
- `actionLabel`: str = `Sit`
- `actionDistance`: int = `3`
- `actionDuration`: float = `0.5`
- `enableHoverUI`: str = `enabled`
- `actionYPosition`: int = `0`
- `activeEmote`: str = `emote1`
- `emote1`: emote → `asset://6bbb2ac54cdd0f79dea89db778307a0bd8a48801afeedabc8d1ef0409d626efb.glb`
- `emote2`: emote → `asset://1540572f58c6d2e5ad1a9bec6d645ca4afed7ba243ee085712fd386a1a2706cc.glb`
- `emote3`: emote → `asset://7c8a0708598c65c93aa5adf21dcb82658b8eef873e2aacab73698cd0a3d12ba5.glb`
- `emote4`: emote → `asset://49c94f236219b474e1354c73cfdcd4599f17dc32e0248c673b87e2f114ded1df.glb`
- `anchorXPosition`: int = `0`
- `anchorYPosition`: float = `0.09`

## Assets
- `[model]` bc106fe8e4158546ce8a5b3565105659b2d8c3b6fc96e7835ac3d8c373a6978c.glb (6,260 bytes)
- `[script]` 1ed8d82ea47a094b2c18b89def6df56edf2e0aa34f99b8ea937c7984c9ce7cdd.js (9,628 bytes)
- `[texture]` 35dd29d57ec361560fa42fccbe3d59754f34b3dca0e9ff4b9ab5f20029a1f211.webp (3,904 bytes)
- `[emote]` 6bbb2ac54cdd0f79dea89db778307a0bd8a48801afeedabc8d1ef0409d626efb.glb (185,384 bytes)
- `[texture]` 35dd29d57ec361560fa42fccbe3d59754f34b3dca0e9ff4b9ab5f20029a1f211.webp (3,904 bytes)
- `[emote]` 6bbb2ac54cdd0f79dea89db778307a0bd8a48801afeedabc8d1ef0409d626efb.glb (185,384 bytes)
- `[emote]` 1540572f58c6d2e5ad1a9bec6d645ca4afed7ba243ee085712fd386a1a2706cc.glb (1,243,356 bytes)
- `[emote]` 7c8a0708598c65c93aa5adf21dcb82658b8eef873e2aacab73698cd0a3d12ba5.glb (156,928 bytes)
- `[emote]` 49c94f236219b474e1354c73cfdcd4599f17dc32e0248c673b87e2f114ded1df.glb (127,332 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.control()`, `app.create()`, `app.get()`, `app.on()`, `app.remove()`, `app.send()`
**World Methods**: `world.getPlayer()`
**Events Listened**: `playerId`, `props:actionDistance`, `props:actionDuration`, `props:actionLabel`, `props:actionYPosition`, `props:anchorXPosition`, `props:anchorYPosition`, `props:enableHoverUI`, `props:interactionType`, `props:visibleType`, `release`, `request`, `update`
**Nodes Created**: `action`, `anchor`, `ui`, `uiimage`

## Keywords (for Discord search)
action, actionDistance, actionDuration, actionLabel, actionYPosition, active, activeEmote, activeEmoteUrl, anchor, anchorXPosition, anchorYPosition, animation, applyEffect, auto, away, backgroundColor, based, billboard, button, cancellable

## Script Source
```javascript
app.configure([
  {
    type: 'section',
    label: 'Animation'
  },
  {
    key: 'emote1',
    type: 'file',
    kind: 'emote',
    label: 'Emote 1',
    hint: 'First animation option'
  },
  {
    key: 'emote2',
    type: 'file',
    kind: 'emote',
    label: 'Emote 2',
    hint: 'Second animation option'
  },
  {
    key: 'emote3',
    type: 'file',
    kind: 'emote',
    label: 'Emote 3',
    hint: 'Third animation option'
  },
  {
    key: 'emote4',
    type: 'file',
    kind: 'emote',
    label: 'Emote 4',
    hint: 'Fourth animation option'
  },
  {
    key: 'activeEmote',
    type: 'switch',
    label: 'Active Emote',
    options: [
      { value: 'emote1', label: 'Emote 1' },
      { value: 'emote2', label: 'Emote 2' },
      { value: 'emote3', label: 'Emote 3' },
      { value: 'emote4', label: 'Emote 4' }
    ],
    initial: 'emote1',
    hint: 'Choose which emote to use when sitting'
  },
  {
    type: 'section',
    label: 'Visual'
  },
  {
    key: 'visibleType',
    type: 'switch',
    label: 'Visibility',
    options: [
      { value: 'visible', label: 'Visible' },
      { value: 'invisible', label: 'Invisible' }
    ],
    initial: 'visible',
    hint: 'Show or hide the trigger mesh'
  },
  {
    key: 'hoverImage',
    type: 'file',
    kind: 'texture',
    label: 'Hover Image',
    optional: true,
    hint: 'Image to display when hovering over the seat'
  },
  {
    key: 'enableHoverUI',
    type: 'switch',
    label: 'Enable Hover UI',
    options: [
      { value: 'enabled', label: 'Enabled' },
      { value: 'disabled', label: 'Disabled' }
    ],
    initial: 'enabled',
    hint: 'Show hover image when pointing at the seat'
  },
  {
    type: 'section',
    label: 'Interaction'
  },
  {
    key: 'interactionType',
    type: 'switch',
    label: 'Interaction',
    options: [
      { value: 'action', label: 'Action (Hold to interact)' },
      { value: 'pointer', label: 'Pointer (Click to interact)' }
    ],
    initial: 'action',
    hint: 'Hold to interact can be used in VR'
  },
  {
    key: 'actionLabel',
    type: 'text',
    label: 'Action Label',
    initial: 'Sit',
    optional: true,
    hint: 'Text shown for the interaction prompt'
  },
  {
    key: 'actionDistance',
    type: 'number',
    label: 'Action Distance',
    initial: 3,
    optional: true,
    hint: 'How far away players can see the action'
  },
  {
    key: 'actionDuration',
    type: 'number',
    label: 'Action Duration',
    initial: 0.5,
    dp: 2,
    optional: true,
    hint: 'How long to hold the button to trigger'
  },
  {
    key: 'actionYPosition',
    type: 'number',
    label: 'Action Y Position',
    initial: 0,
    dp: 2,
    optional: true,
    hint: 'Vertical position offset for the action prompt'
  },
  {
    type: 'section',
    label: 'Position'
  },
  {
    key: 'anchorXPosition',
    type: 'number',
    label: 'Anchor X Position',
    initial: 0,
    dp: 2,
    optional: true,
    hint: 'Horizontal position of the sitting anchor'
  },
  {
    key: 'anchorYPosition',
    type: 'number',
    label: 'Anchor Y Position',
    initial: 0.09,
    dp: 2,
    optional: true,
    hint: 'Vertical position of the sitting anchor'
  }
])

const DEG2RAD = Math.PI / 180
const state = app.state

if (world.isServer) {
  // Simplified server logic - no need for leave event
  state.playerId = null

  app.on('request', playerId => {
    if (state.playerId) return
    state.playerId = playerId
    app.send('playerId', playerId)
  })

  app.on('release', playerId => {
    if (state.playerId === playerId) {
      state.playerId = null
      app.send('playerId', null)
    }
  })
}

if (world.isClient) {
  const player = world.getPlayer()
  const trigger = app.get('Trigger')

  // Visibility control for trigger mesh
  if (trigger) {
    const updateVisibility = (value) => {
      trigger.visible = value === 'visible'
    }
    app.on('props:visibleType', updateVisibility)
    updateVisibility(app.props.visibleType)
  }

  // Setup seat anchor
  const anchor = app.create('anchor', { id: 'seat' })
  anchor.position.set(
    props.anchorXPosition || 0,
    props.anchorYPosition || 0.09,
    0
  )
  anchor.rotation.y = 280 * DEG2RAD // Fully configurable
  app.add(anchor)

  let control
  let isSitting = false
  let hoverUI = null
  let action = null

  // Create hover UI
  function createHoverUI() {
    if (!props.hoverImage?.url) return null

    const container = app.create('ui', {
      space: 'world',
      position: [0, 0.8, 0],
      display: 'none',
      width: 30,
      height: 20,
      billboard: 'full',
    })

    const image = app.create('uiimage', {
      src: props.hoverImage.url,
      width: 30,
      height: 20,
      objectFit: 'contain',
      backgroundColor: 'transparent'
    })

    container.add(image)
    app.add(container)

    return container
  }

  // Function to handle sitting request
  function requestSit() {
    if (!isSitting && !state.playerId) {
      app.send('request', player.id) // Request to sit
    }
  }

  // Function to setup interaction based on type
  function setupInteraction() {
    // Remove existing action if it exists
    if (action) {
      app.remove(action)
      action = null
    }

    // Clear pointer events
    app.onPointerDown = null
    app.cursor = null

    // Don't create action if someone is sitting
    if (state.playerId) return

    if (props.interactionType === 'action') {
      // Create action for sitting
      action = app.create('action', {
        label: props.actionLabel || 'Sit',
        distance: props.actionDistance || 3,
        duration: props.actionDuration || 0.5,
        onTrigger: requestSit
      })

      // Set Y position if specified
      if (props.actionYPosition !== undefined) {
        action.position.y = props.actionYPosition
      }

      app.add(action)
    } else {
      // Setup pointer interaction
      app.cursor = 'pointer'
      app.onPointerDown = requestSit
    }
  }

  // Initialize interaction
  setupInteraction()

  // Listen for interaction type changes
  app.on('props:interactionType', setupInteraction)
  app.on('props:actionLabel', setupInteraction)
  app.on('props:actionDistance', setupInteraction)
  app.on('props:actionDuration', setupInteraction)
  app.on('props:actionYPosition', setupInteraction)
  app.on('props:enableHoverUI', () => {
    // Remove hover UI if disabled
    if (props.enableHoverUI === 'disabled' && hoverUI) {
      removeHoverUI()
      isHovered = false
      hideTime = 0
    }
  })

  // Listen for anchor position changes
  app.on('props:anchorXPosition', (value) => {
    anchor.position.x = value || 0
  })
  app.on('props:anchorYPosition', (value) => {
    anchor.position.y = value || 0.09
  })

  let hideTime = 1
  let isHovered = false

  // Add hover feedback
  app.onPointerEnter = () => {
    if (!isSitting && !state.playerId && props.hoverImage?.url && props.enableHoverUI === 'enabled') {
      isHovered = true
      hideTime = 0 // Reset hide time

      // Create UI if it doesn't exist
      if (!hoverUI) {
        hoverUI = createHoverUI()
      } else {
        hoverUI.visible = 'true'
      }
    }
  }

  // Function to remove hover UI
  function removeHoverUI() {
    if (hoverUI) {
      app.remove(hoverUI)
      hoverUI = null
    }
  }

  // Update function to handle auto-hide
  app.on('update', (dt) => {
    if (isHovered && hoverUI) {
      if (hideTime > 0) {
        hideTime -= dt
        if (hideTime <= 0) {
          removeHoverUI()
          isHovered = false
        }
      } else if (hoverUI) {
        // Start the hide timer if UI exists
        hideTime = 2.0 // 2 seconds
      }


// ... truncated ...
```

---
*Extracted from Seatv2.hyp. Attachment ID: 1391991885396180992*