# Physics_-_Raycast_Tags.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-03-26
- **Size**: 7,131 bytes

## Discord Context
> two instances so this also shows cross-app raycasting works the same way.
the lasers also double as stripper poles.

## Blueprint
- **Name**: Physics - Raycast Tags
- **Version**: 42
- **Model**: `asset://d5575810524423949e81ca8aab7fb8e17a8899860e20d85148681a8536b8b77f.glb`
- **Script**: `asset://57f6c900876f01261bc1bdb73ec619076f9109006f717b0c78281a2ad0ec50d6.js`

## Assets
- `[model]` d5575810524423949e81ca8aab7fb8e17a8899860e20d85148681a8536b8b77f.glb (5,384 bytes)
- `[script]` 57f6c900876f01261bc1bdb73ec619076f9109006f717b0c78281a2ad0ec50d6.js (1,040 bytes)

## Script Analysis
**App Methods**: `app.create()`, `app.get()`, `app.on()`
**World Methods**: `world.attach()`, `world.raycast()`
**Events Listened**: `update`
**Nodes Created**: `ui`, `uitext`

## Keywords (for Discord search)
above, alignItems, attach, billboard, blueBody, blueCollider, center, color, convex, create, createText, delta, distance, doesnt, dynamic, fromArray, full, ground, height, justifyContent

## Script Source
```javascript
const blueBody = app.get('BlueBody')
const blueCollider = app.get('BlueCollider')

blueBody.type = 'dynamic'
blueBody.tag = 'BLUE'
blueCollider.convex = true

world.attach(blueBody)

const laser = app.get('Laser')

world.attach(laser)

// slightly above ground so it doesnt hit it
laser.position.y += 0.1

const laserText = createText('No Hit')
laserText.attach(app, [0.5, 1.5, 0])

const UP = new Vector3()
const distance = 3

app.on('update', delta => {
  const hit = world.raycast(laser.position, UP, distance)
  laserText.set(hit?.tag || 'No Hit')
})

function createText(value) {
  const $ui = app.create('ui', {
    width: 100,
    height: 50,
    billboard: 'full',
    position: [0, 2, 0],
    alignItems: 'center',
    justifyContent: 'center',
  })
  const $text = app.create('uitext', {
    value,
    textAlign: 'center',
    color: 'white',
  })
  $ui.add($text)
  
  return {
    attach(node, position) {
      node.add($ui)
      $ui.position.fromArray(position)
    },
    set(value) {
      $text.value = value
    },
  }
}
```

---
*Extracted from Physics_-_Raycast_Tags.hyp. Attachment ID: 1354315973523542096*