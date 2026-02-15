export default function main(world, app, fetch, props, setTimeout) {
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
}
