export default function main(world, app, fetch, props, setTimeout) {
app.configure([    
  // === COLLISION SETTINGS ===    
  {    
    type: 'section',    
    label: 'Collision Settings'    
  },    
  {    
    key: 'collision',    
    type: 'toggle',    
    label: 'Collision',    
    initial: true,    
    hint: 'Forces all meshes to have collision. Disable this if your model already has embedded collision.'    
  },    
      
  // === ANIMATION SETTINGS ===    
  {    
    type: 'section',    
    label: 'Animation Settings'    
  },    
  {    
    key: 'enableRotation',    
    type: 'toggle',    
    label: 'Enable Rotation',    
    initial: true,    
    hint: 'Toggle rotation animation on/off - spins the collectible around its Y-axis'    
  },    
  {    
    key: 'rotationSpeed',    
    type: 'range',    
    label: 'Rotation Speed',    
    min: 0.5,    
    max: 1.0,    
    step: 0.1,    
    initial: 1.0,    
    hint: 'Controls how fast the collectible rotates (0.5 = slow, 1.0 = fast)'    
  },    
  {    
    key: 'enableBobbing',    
    type: 'toggle',    
    label: 'Enable Bobbing',    
    initial: true,    
    hint: 'Toggle bobbing animation on/off - creates vertical sine wave movement'    
  },    
  {    
    key: 'bobbingHeight',    
    type: 'range',    
    label: 'Bobbing Height',    
    min: 0.02,    
    max: 0.1,    
    step: 0.005,    
    initial: 0.05,    
    hint: 'Controls how high the collectible bobs up and down (0.02 = subtle, 0.1 = dramatic)'    
  },    
      
  // === AUDIO SETTINGS ===    
  {    
    type: 'section',    
    label: 'Audio Settings'    
  },    
  {    
    key: 'collectSound',    
    type: 'file',    
    label: 'Collection Sound',    
    kind: 'audio',    
    hint: 'Audio file to play when a player collects this item (.mp3 format)'    
  },    
      
  // === EVENT SETTINGS ===    
  {    
    type: 'section',    
    label: 'Event Settings'    
  },    
  {    
    key: 'enableEmit',    
    type: 'toggle',    
    label: 'Enable Event Emit',    
    initial: false,    
    hint: 'Toggle whether to emit a custom event when collected'    
  },    
  {    
    key: 'eventName',    
    type: 'text',    
    label: 'Event Name',    
    initial: 'itemCollected',    
    hint: 'Name of the event to emit when a player collects this item'    
  },    
      
  // === CONTROLS ===    
  {    
    type: 'section',    
    label: 'Controls'    
  },    
  {    
    key: 'resetMeshes',    
    type: 'button',    
    label: 'Reset Meshes',    
    hint: 'Re-activate all collected meshes and restore the trigger system',    
    onClick: () => {    
      // Reset collection flag  
      isCollected = false  
        
      // Re-activate all mesh nodes    
      app.traverse(node => {    
        if (node.name === 'mesh') {    
          node.active = true    
        }    
      })    
          
      // Rebuild the collision system if collision is enabled    
      if (collision && body) {    
        // Remove old body completely    
        if (body.parent) {    
          world.remove(body)    
        }    
            
        // Create new rigidbody and rebuild colliders    
        const m1 = new Matrix4()    
        const appInverseMatrix = app.matrixWorld.clone().invert()    
        body = app.create('rigidbody')    
            
        body.onTriggerEnter = (event) => {    
          // Only execute on client side    
          if (!world.isClient) return    
            
          // Prevent multiple collections  
          if (isCollected) return  
              
          // Check if the triggering player is the local player    
          if (event.playerId) {    
            const localPlayer = world.getPlayer() // Get local player (no ID = local)    
            const triggeringPlayer = world.getPlayer(event.playerId)    
                
            // Only collect if the local player is the one who triggered it    
            if (triggeringPlayer && localPlayer && triggeringPlayer.id === localPlayer.id) {    
              // Mark as collected immediately  
              isCollected = true  
                
              // Emit custom event if enabled    
              if (enableEmit && eventName) {    
                app.emit(eventName, {    
                  playerId: event.playerId,    
                  itemId: app.instanceId,    
                  timestamp: world.getTime()    
                })    
              }    
                  
              // Play collection sound (local client only)    
              if (audio) {    
                audio.play()    
              }    
                  
              // Make all meshes inactive when collected (local client only)    
              app.traverse(node => {    
                if (node.name === 'mesh') {    
                  node.active = false    
                }    
              })    
                  
              // Remove the trigger body after collection (local client only)    
              world.remove(body)    
            }    
          }    
        }    
            
        // Rebuild colliders for all mesh nodes    
        app.traverse(node => {    
          if (node.name === 'mesh') {    
            const collider = app.create('collider')    
            collider.type = 'geometry'    
            collider.geometry = node.geometry    
            collider.trigger = true  // Enable trigger mode for collection    
                
            m1.copy(node.matrixWorld).premultiply(appInverseMatrix).decompose(    
              collider.position,    
              collider.quaternion,    
              collider.scale    
            )    
            body.add(collider)    
          }    
        })    
            
        body.position.copy(app.position)    
        body.quaternion.copy(app.quaternion)    
        body.scale.copy(app.scale)    
        world.add(body)    
      }    
    }    
  }    
])    
    
const collision = props.collision    
const enableRotation = props.enableRotation    
const enableBobbing = props.enableBobbing    
const rotationSpeed = props.rotationSpeed    
const bobbingHeight = props.bobbingHeight    
const collectSound = props.collectSound    
const enableEmit = props.enableEmit    
const eventName = props.eventName    
    
// Store references globally    
let body = null    
let audio = null    
let isCollected = false  // Flag to prevent multiple collections  
    
// Create audio node if sound file is provided    
if (collectSound?.url) {    
  audio = app.create('audio', {    
    src: collectSound.url,    
    volume: 0.8,    
    loop: false,    
    spatial: true    
  })    
  world.add(audio)    
}    
    
if (collision) {    
  const m1 = new Matrix4()    
  const appInverseMatrix = app.matrixWorld.clone().invert()    
  body = app.create('rigidbody')    
      
  body.onTriggerEnter = (event) => {    
    // Only execute on client side    
    if (!world.isClient) return    
      
    // Prevent multiple collections  
    if (isCollected) return  
        
    // Check if the triggering player is the local player    
    if (event.playerId) {    
      const localPlayer = world.getPlayer() // Get local player (no ID = local)    
      const triggeringPlayer = world.getPlayer(event.playerId)    
          
      // Only collect if the local player is the one who triggered it    
      if (triggeringPlayer && localPlayer && triggeringPlayer.id === localPlayer.id) {    
        // Mark as collected immediately  
        isCollected = true  
          
        // Emit custom event if enabled    
        if (enableEmit && eventName) {    
          app.emit(eventName, {    
            playerId: event.playerId,    
            itemId: app.instanceId,    
            timestamp: world.getTime()    
          })    
        }    
            
        // Play collection sound (local client only)    
        if (audio) {    
          audio.play()    
        }    
            
        // Make all meshes inactive when collected (local client only)    
        app.traverse(node => {    
          if (node.name === 'mesh') {    
            node.active = false    
          }    
        })    
            
        // Remove the trigger body after collection (local client only)    
        world.remove(body)    
      }    
    }    
  }    
      
  app.traverse(node => {    
    if (node.name === 'mesh') {    
      const collider = app.create('collider')    
      collider.type = 'geometry'    
      collider.geometry = node.geometry    
      collider.trigger = true  // Enable trigger mode for collection    
          
      m1.copy(node.matrixWorld).premultiply(appInverseMatrix).decompose(    
        collider.position,    
        collider.quaternion,    
        collider.scale    
      )    
      body.add(collider)    
    }    
  })    
      
  body.position.copy(app.position)    
  body.quaternion.copy(app.quaternion)    
  body.scale.copy(app.scale)    
  world.add(body)    
}    
    
// Animation update loop using configurable parameters    
app.on('update', () => {    
  const time = world.getTime()    
      
  app.traverse(node => {    
    if (node.name === 'mesh' && node.active) {    
      if (enableBobbing) {    
        const bobHeight = Math.sin(time * 2) * bobbingHeight    
        node.position.y = bobHeight    
      }    
          
      if (enableRotation) {    
        node.rotation.y = time * rotationSpeed    
      }    
    }    
  })    
})
}
