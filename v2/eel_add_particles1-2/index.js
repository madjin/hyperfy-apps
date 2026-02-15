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
app.add(particles)

function update(delta) {
    // Get the bone transform
    const boneTransform = rig.getBoneTransform('Bone008')
    if (boneTransform && particles) {
        // Get the bone's world position
        const m = boneTransform.elements
        
        // Set position (matrix translation components)
        particles.position.set(
            m[12],  // x
            m[13] + 0.5,  // y + offset
            m[14]   // z
        )
        
        // Calculate rotation angles from matrix
        const x = Math.atan2(m[6], m[10])
        const y = Math.atan2(-m[2], Math.sqrt(m[0] * m[0] + m[1] * m[1]))
        const z = Math.atan2(m[1], m[0])
        
        // Set rotation (in radians)
        particles.rotation.set(x, y, z)
        
        // Debug position
        console.log('Bone position:', m[12], m[13], m[14])
        console.log('Particles position:', particles.position.x, particles.position.y, particles.position.z)
    }
}

app.on('update', update) 
}
