export default function main(world, app, fetch, props, setTimeout) {
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
}
