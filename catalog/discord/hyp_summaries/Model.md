# Model.hyp

## Metadata
- **Author**: ash
- **Channel**: #🧊│3d-design
- **Date**: 2025-03-24
- **Size**: 5,390 bytes

## Discord Context
> This app lets you auto-enable collisions for its model.
Drop it in the world, click "Model" to choose your glb, and toggle collision on etc

## Blueprint
- **Name**: Model
- **Version**: 132
- **Model**: `asset://751a6c48ed0e317c94ff3d4de247b33b661709f892f6a612e7e5a63117d05093.glb`
- **Script**: `asset://e91934c7d38d331144c855c7fffeb6f1d4342ac1a8488a95a7ad2d348932cecd.js`

## Props
- `collision`: bool = `True`
- `scale`: float = `0.3`

## Assets
- `[model]` 751a6c48ed0e317c94ff3d4de247b33b661709f892f6a612e7e5a63117d05093.glb (3,376 bytes)
- `[script]` e91934c7d38d331144c855c7fffeb6f1d4342ac1a8488a95a7ad2d348932cecd.js (1,327 bytes)

## Script Analysis
**App Methods**: `app.clean()`, `app.configure()`, `app.create()`, `app.traverse()`
**World Methods**: `world.add()`
**Nodes Created**: `collider`, `rigidbody`

## Keywords (for Discord search)
appInverseMatrix, body, clean, clone, collider, colliders, collision, configure, copy, create, decompose, each, enabled, entire, geometry, initial, inverse, invert, label, make

## Script Source
```javascript
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
```

---
*Extracted from Model.hyp. Attachment ID: 1353698908249002015*