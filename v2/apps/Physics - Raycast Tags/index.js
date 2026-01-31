export default function main(world, app, fetch, props, setTimeout) {
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
}
