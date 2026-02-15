# Physics_-_Contacts__Tags.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-03-26
- **Size**: 5,883 bytes

## Blueprint
- **Name**: Physics - Contacts & Tags
- **Version**: 47
- **Model**: `asset://7ebf59ba7d9aa22aef6f23a4128290bcd1bcefc1a31ae8cadfbbc658abfa338f.glb`
- **Script**: `asset://2ee9e991f03aa978b62f3bc2c3e773af9cb5912d3558f21bca9db7c73f12f883.js`

## Assets
- `[model]` 7ebf59ba7d9aa22aef6f23a4128290bcd1bcefc1a31ae8cadfbbc658abfa338f.glb (3,788 bytes)
- `[script]` 2ee9e991f03aa978b62f3bc2c3e773af9cb5912d3558f21bca9db7c73f12f883.js (1,380 bytes)

## Script Analysis
**App Methods**: `app.create()`, `app.get()`
**World Methods**: `world.attach()`
**Nodes Created**: `ui`, `uitext`

## Keywords (for Discord search)
alignItems, around, attach, billboard, blue, blueText, center, color, console, create, createText, full, good, height, into, justifyContent, move, node, onContactEnd, onContactStart

## Script Source
```javascript
const blue = app.get('Blue')
blue.tag = 'BLUE'

const red = app.get('Red')
red.tag = 'RED'

// optional but its good practice to move things
// that move around in world space, into world space ;)
world.attach(blue)
world.attach(red)

const blueText = createText('Touching: None')
blueText.attach(blue, [0, 1.5, 0])

const redText = createText('Touching: None')
redText.attach(red, [0, 1.5, 0])


blue.onContactStart = e => {
  if (e.tag) {
    console.log('blue started touching:', e.tag)
    blueText.set(`Touching: ${e.tag}`)
  }
}

blue.onContactEnd = e => {
  if (e.tag) {
    console.log('blue stopped touching:', e.tag)
    blueText.set(`Touching: None`)
  }
}

red.onContactStart = e => {
  if (e.tag) {
    console.log('red started touching:', e.tag)
    redText.set(`Touching: ${e.tag}`)
  }
}

red.onContactEnd = e => {
  if (e.tag) {
    console.log('red stopped touching:', e.tag)
    redText.set(`Touching: None`)
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
*Extracted from Physics_-_Contacts__Tags.hyp. Attachment ID: 1354299207254802462*