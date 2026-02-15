# Physics_-_Triggers__Tags.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-03-26
- **Size**: 5,819 bytes

## Blueprint
- **Name**: Physics - Triggers & Tags
- **Version**: 64
- **Model**: `asset://b3711d2cfe1a642636326eca08c9c67fc61ded960d7a139f1a8de78e9e3cb1d4.glb`
- **Script**: `asset://5570187e603afc9c194a7877927cd16c20cfa3af3d18e007ca23ee60da1b43d4.js`

## Assets
- `[model]` b3711d2cfe1a642636326eca08c9c67fc61ded960d7a139f1a8de78e9e3cb1d4.glb (3,848 bytes)
- `[script]` 5570187e603afc9c194a7877927cd16c20cfa3af3d18e007ca23ee60da1b43d4.js (1,256 bytes)

## Script Analysis
**App Methods**: `app.create()`, `app.get()`
**World Methods**: `world.attach()`
**Nodes Created**: `ui`, `uitext`

## Keywords (for Discord search)
alignItems, around, attach, billboard, blue, blueBody, blueCollider, blueText, center, color, console, convex, create, createText, dynamic, enter, full, good, height, into

## Script Source
```javascript
const blueBody = app.get('Blue')
blueBody.type = 'static'
blueBody.tag = 'BLUE'

const blueCollider = app.get('BlueCollider')
blueCollider.trigger = true

const redBody = app.get('Red')
redBody.type = 'dynamic'
redBody.tag = 'RED'

const redCollider = app.get('RedCollider')
redCollider.convex = true

// optional but its good practice to move things
// that move around in world space, into world space ;)
world.attach(blueBody)
world.attach(redBody)

const blueText = createText('Inside: None')
blueText.attach(blueBody, [0, 1.5, 0])

blueBody.onTriggerEnter = e => {
  console.log('blue trigger enter:', e, e.tag)
  if (e.tag) {
    blueText.set(`Inside: ${e.tag}`)
  }
}

blueBody.onTriggerLeave = e => {
  console.log('blue trigger leave:', e, e.tag)
  if (e.tag) {
    blueText.set(`Inside: None`)
  }
}

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
    },
    set(value) {
      $text.value = value
    },
  }
}
```

---
*Extracted from Physics_-_Triggers__Tags.hyp. Attachment ID: 1354303006170021999*