# Screen.hyp

## Metadata
- **Author**: ash
- **Channel**: #🎨│showcase
- **Date**: 2025-04-14
- **Size**: 26,683 bytes

## Discord Context
> TV with screensharing:

## Blueprint
- **Name**: Screen
- **Version**: 138
- **Model**: `asset://05443bbb62fa7eb3312ac127f6eb4b773868666eb9f74be73ae2ea143f40ee3f.glb`
- **Script**: `asset://e51c1d923fed94633238f6997639ed773bf5d3cc399db12af4464cf50be25c5c.js`

## Props
- `restricted`: bool = `False`

## Assets
- `[model]` 05443bbb62fa7eb3312ac127f6eb4b773868666eb9f74be73ae2ea143f40ee3f.glb (24,928 bytes)
- `[script]` e51c1d923fed94633238f6997639ed773bf5d3cc399db12af4464cf50be25c5c.js (1,075 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.get()`
**World Methods**: `world.getPlayer()`
**Nodes Created**: `action`, `video`

## Keywords (for Discord search)
action, admin, aspect, black, button, canUse, color, configure, contain, copy, create, display, distance, falseLabel, geometry, getPlayer, initial, instanceId, isClient, label

## Script Source
```javascript
app.configure([
  {
    key: 'restricted',
    type: 'toggle',
    label: 'Permission',
    trueLabel: 'Admin',
    falseLabel: 'Everyone',
    initial: false,
  }
])

const screenId = app.instanceId
const restricted = props.restricted

if (world.isClient) {
  const display = app.get('Display')
  const button = app.get('Button')
  const screen = app.get('Screen')
  const video = app.create('video', {
    screenId: app.instanceId,
    linked: true,
    aspect: 16 / 9, // geometry is 16:9
    geometry: screen.geometry,
    fit: 'contain',
    color: 'black',
  })
  // move video to same place as screen
  video.position.copy(screen.position)
  video.quaternion.copy(screen.quaternion)
  video.scale.copy(screen.scale)
  screen.parent.remove(screen)
  app.add(video)

  const player = world.getPlayer()
  const canUse = restricted ? player.admin : true
  if (canUse) {
    const action = app.create('action', {
      label: 'Share Screen',
      distance: 5,
      position: [0, 1, 0],
      onTrigger: () => player.screenshare(screenId),
    })
    app.add(action)
  }
}
```

---
*Extracted from Screen.hyp. Attachment ID: 1361324085199503401*