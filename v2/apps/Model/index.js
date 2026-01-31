export default function main(world, app, fetch, props, setTimeout) {
app.configure([
  {
    key: 'scale',
    type: 'number',
    label: 'Scale',
    min: 0,
    dp: 2,
    step: 0.1,
    initial: 1,
  },
  {
    key: 'collision',
    type: 'switch',
    label: 'Collision',
    options: [
      { label: 'No', value: false },
      { label: 'Yes', value: true },
    ],
    initial: false
  },
])

const v1 = new Vector3()
const v2 = new Vector3()
const q1 = new Quaternion()
const m1 = new Matrix4()

// scale entire app
app.scale.setScalar(props.scale)

// if collision enabled, make a rigidbody with colliders for each mesh
if (props.collision) {
  // clean to get updated transforms
  app.clean()
  // get app world inverse matrix
  const appInverseMatrix = app.matrixWorld.clone().invert()
  // create rigidbody
  const body = app.create('rigidbody')
  body.position.copy(app.position)
  body.quaternion.copy(app.quaternion)
  body.scale.copy(app.scale)
  // create colliders
  app.traverse(node => {
    if (node.name === 'mesh') {
      m1.copy(node.matrixWorld).premultiply(appInverseMatrix).decompose(v1, q1, v2)
      const collider = app.create('collider')
      collider.position.copy(v1)
      collider.quaternion.copy(q1)
      collider.scale.copy(v2)
      collider.type = 'geometry'
      collider.geometry = node.geometry
      body.add(collider)
    }
  })
  world.add(body)
}
}
