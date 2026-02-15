export default function main(world, app, fetch, props, setTimeout) {
const rig = app.get('rig')

rig.position.y = 2

// Configure particle image upload
app.configure([
  {
    key: 'particleImage',
    type: 'file',
    kind: 'texture',
    label: 'Particle Texture'
  }
])

rig.play({ name: 'flow' })

// Create glow-dust particles
const particles = app.create('particles', {
  shape: ['point'],
  direction: 0.2,
  speed: '0.1~0.3',
  size: '0.03',
  rate: 200,
  blending: 'additive',
  emissive: '1',
  alphaOverLife: '0,0|0.1,1|0.9,1|1,0',
  space: 'world',
  image: props.particleImage?.url
})
world.add(particles)

function update(delta) {
    // Get the bone transform
    const matrix = rig.getBoneTransform('Bone008')
    if (matrix) {
      particles.position.setFromMatrixPosition(matrix)
    }
}

app.on('update', update) 
}
