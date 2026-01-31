export default function main(world, app, fetch, props, setTimeout) {
// Camera Laser Shooter
// Shoot lasers from the camera that stay in world position and disappear after a few seconds

// Configuration
const LASER_LIFETIME = 3.0 // How long lasers stay visible (seconds)
const LASER_LENGTH = 50.0 // Maximum length of laser beam
const LASER_COLOR = '#FF0000' // Red laser color

// Reference the laser template from the GLB
const laserTemplate = app.get('Laser')
if (laserTemplate) {
    laserTemplate.active = false
}

// Animated torus
const torus = app.create('prim', {
  type: 'torus',
  scale: [1, 1, 1],
  position: [app.position.x, app.position.y + 1.5, app.position.z],
  color: '#ffff00'
})
world.add(torus)

// Client-Side Logic
if (world.isClient) {
    const lasers = [] // Track active lasers
    let control
    let equipped = false

    // Create interaction trigger for equipping laser
    const action = app.create('action')
    action.label = 'Equip Laser Gun'
    action.position.y = 1.5
    app.add(action)

    // Handle equip action
    action.onTrigger = () => {
        action.active = false
        control = app.control()
        equipped = true

        // Capture mouse controls
        control.mouseLeft.onPress = shootLaser
    }

    // Shoot laser from camera
    function shootLaser() {
        if (!equipped || !control?.pointer.locked) return

        // Get camera position and forward direction
        const cameraPos = control.camera.position.toArray()
        const forward = new Vector3(0, 0, -1).applyQuaternion(control.camera.quaternion)

        // Send laser fire event to server
        app.send('laser:fire', [cameraPos, forward.toArray()])
    }

    // Handle laser spawn from server
    app.on('laser:spawn', (data) => {
        const [id, posArray, dirArray] = data
        if (!laserTemplate) {
            console.error('[CameraLaser] Laser template not found')
            return
        }

        // Create laser instance
        const laser = laserTemplate.clone(true)

        // Position laser at origin point
        laser.position.set(posArray[0], posArray[1], posArray[2])

        // Calculate rotation to point in the direction
        const direction = new Vector3(dirArray[0], dirArray[1], dirArray[2])

        // Create quaternion for rotation
        const up = new Vector3(0, 1, 0)
        const rotationMatrix = new Matrix4()
        const zAxis = direction.clone().normalize()
        const xAxis = new Vector3().crossVectors(up, zAxis).normalize()
        const yAxis = new Vector3().crossVectors(zAxis, xAxis)

        // Handle edge case where direction is straight up/down
        if (xAxis.lengthSq() === 0) {
            if (zAxis.y > 0) {
                xAxis.set(1, 0, 0)
                yAxis.set(0, 0, -1)
            } else {
                xAxis.set(1, 0, 0)
                yAxis.set(0, 0, 1)
            }
        }

        rotationMatrix.set(
            xAxis.x, yAxis.x, zAxis.x, 0,
            xAxis.y, yAxis.y, zAxis.y, 0,
            xAxis.z, yAxis.z, zAxis.z, 0,
            0, 0, 0, 1
        )

        const quaternion = new Quaternion()
        quaternion.setFromRotationMatrix(rotationMatrix)

        // Apply model correction (if laser model points in +Y direction)
        const modelCorrection = new Quaternion()
        modelCorrection.setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2)
        quaternion.multiply(modelCorrection)

        laser.quaternion.copy(quaternion)

        world.add(laser)
        laser.active = true
        laser.visible = true

        // Track laser with lifetime
        const laserData = {
            id,
            object: laser,
            lifetime: 0
        }
        lasers.push(laserData)
    })

    // Handle laser cleanup
    app.on('laser:cleanup', (id) => {
        const index = lasers.findIndex(l => l.id === id)
        if (index !== -1) {
            const laser = lasers[index]
            world.remove(laser.object)
            lasers.splice(index, 1)
        }
    })

    // Update laser lifetimes
    app.on('update', (delta) => {
        for (let i = lasers.length - 1; i >= 0; i--) {
            const laser = lasers[i]
            laser.lifetime += delta

            // Fade out laser near end of lifetime
            if (laser.lifetime >= LASER_LIFETIME * 0.8) {
                const fadeProgress = (laser.lifetime - LASER_LIFETIME * 0.8) / (LASER_LIFETIME * 0.2)
                if (laser.object.material) {
                    laser.object.opacity = 1 - fadeProgress
                }
            }
        }
    })
}

// Server-Side Logic
if (world.isServer) {
    let nextLaserId = 0
    const activeLasers = new Map()

    // Handle laser fire from client
    app.on('laser:fire', (data, sender) => {
        const [posArray, dirArray] = data
        const id = nextLaserId++

        // Send spawn event to all clients
        app.send('laser:spawn', [id, posArray, dirArray])

        // Track laser for cleanup
        activeLasers.set(id, {
            id,
            timeAlive: 0
        })
    })

    // Update laser lifetimes and cleanup
    app.on('update', (delta) => {
        for (const [id, laser] of activeLasers.entries()) {
            laser.timeAlive += delta

            if (laser.timeAlive >= LASER_LIFETIME) {
                app.send('laser:cleanup', id)
                activeLasers.delete(id)
            }
        }
    })
}

}
