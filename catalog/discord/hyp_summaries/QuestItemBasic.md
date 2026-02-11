# QuestItemBasic.hyp

## Metadata
- **Author**: 0mka
- **Channel**: #🎨│showcase
- **Date**: 2025-07-20
- **Size**: 172,901 bytes

## Discord Context
> Here ya go <@722481129449586739> 

QuestItems with QuestItemUI with some basic configures.  

- Match the emit signals.  
- Can turn on and off persistant storage, if you want the count to carry over on world visits. Click Reset Count to clear storage key
-  Can just change the model in quest item and should work. 
-  Can turn on and off rotation and bobbing and change speed and height.
- Can click 'Reset Meshes' to bring back into world
-  Can check pixabay to find a different collection sound or just delete it if you don't want sound

-  Can rename Quest UI, switch for positioning on screen.  And scale the ui.  Change border width/color.  And text size/spacing.
- Can set ui to appear for a moment then go away until another collect, or always be on screen. 
- You can use the emit signal from the quest item to trigger anything in another hyp with world.on and the emit signal. 


This  should get you going.

## Blueprint
- **Name**: QuestItemBasic
- **Version**: 17
- **Model**: `asset://1ce614597c0aaa0557c6de76b058ed5e0f7fa952b501c32d4e728507ccd534e9.glb`
- **Script**: `asset://fe45d9d5fb5f3be07917c0e09bdb07d88bb95051c677c2c2ed99c833e6617d3d.js`

## Props
- `collision`: bool = `True`
- `enableRotation`: bool = `True`
- `enableBobbing`: bool = `True`
- `collectSound`: audio → `asset://323e429face2f675ecf59d7ad1ed808ff3c187db823d666a605aa93326bbb39e.mp3`
- `rotationSpeed`: float = `0.6000000000000001`
- `bobbingHeight`: float = `0.03`
- `enableEmit`: bool = `True`
- `eventName`: str = `itemCollected`

## Assets
- `[model]` 1ce614597c0aaa0557c6de76b058ed5e0f7fa952b501c32d4e728507ccd534e9.glb (104,068 bytes)
- `[script]` fe45d9d5fb5f3be07917c0e09bdb07d88bb95051c677c2c2ed99c833e6617d3d.js (9,506 bytes)
- `[texture]` ee2aa2dadc06fba21d69fc35a2bd360bb2696820f77ae5f77fb3f5b69fe5cfee.webp (7,000 bytes)
- `[audio]` 323e429face2f675ecf59d7ad1ed808ff3c187db823d666a605aa93326bbb39e.mp3 (50,880 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.create()`, `app.emit()`, `app.on()`, `app.traverse()`
**World Methods**: `world.add()`, `world.getPlayer()`, `world.getTime()`, `world.remove()`
**Events Listened**: `update`
**Nodes Created**: `audio`, `collider`, `rigidbody`

## Keywords (for Discord search)
activate, active, after, already, animation, appInverseMatrix, around, audio, axis, bobHeight, bobbing, bobbingHeight, bobs, body, button, client, clone, collect, collectSound, collected

## Script Source
```javascript
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
            
        // Make al

// ... truncated ...
```

---
*Extracted from QuestItemBasic.hyp. Attachment ID: 1396392921221038231*