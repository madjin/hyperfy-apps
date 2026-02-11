# MoonJump.hyp

## Metadata
- **Author**: 0mka
- **Channel**: #🎨│showcase
- **Date**: 2025-08-17
- **Size**: 5,866 bytes

## Blueprint
- **Name**: MoonJump
- **Version**: 4
- **Model**: `asset://97fc7289a38b5b49357e6fbd74e7e77fc78493dbb1c0dbc850cb8e9db9fd2530.glb`
- **Script**: `asset://e8964eef551673e68d3fdd05b1d53a17d807fa1dbfec68af638d29c7fe14637f.js`

## Props
- `collision`: bool = `True`

## Assets
- `[model]` 97fc7289a38b5b49357e6fbd74e7e77fc78493dbb1c0dbc850cb8e9db9fd2530.glb (3,380 bytes)
- `[script]` e8964eef551673e68d3fdd05b1d53a17d807fa1dbfec68af638d29c7fe14637f.js (1,794 bytes)

## Script Analysis
**App Methods**: `app.on()`
**World Methods**: `world.getPlayers()`, `world.on()`, `world.raycast()`
**Events Listened**: `playerenter`, `playerleave`, `update`

## Keywords (for Discord search)
after, airborne, apply, canDoubleJump, delay, delta, detected, distance, double, doubleJumpUsed, entering, existing, first, forEach, force, getPlayers, grounded, initPlayerState, isGrounded, isPlayerGrounded

## Script Source
```javascript
// Track player jump states  
const playerStates = new Map()  
  
// Initialize player state tracking  
function initPlayerState(player) {  
  playerStates.set(player.id, {  
    wasGrounded: true,  
    canDoubleJump: false,  
    doubleJumpUsed: false  
  })  
}  
  
// Initialize for existing players  
world.getPlayers().forEach(player => {  
  initPlayerState(player)  
})  
  
// Listen for players entering/leaving  
world.on('playerenter', initPlayerState)  
world.on('playerleave', (player) => {  
  playerStates.delete(player.id)  
})  
  
app.on('update', (delta) => {  
  world.getPlayers().forEach(player => {  
    const state = playerStates.get(player.id)  
    if (!state) return  
      
    const isGrounded = isPlayerGrounded(player)  
      
    // Reset when grounded  
    if (isGrounded && !state.wasGrounded) {  
      state.canDoubleJump = false  
      state.doubleJumpUsed = false  
    }  
      
    // Enable double jump when airborne (first jump detected)  
    if (!isGrounded && state.wasGrounded && !state.doubleJumpUsed) {  
      state.canDoubleJump = true  
    }  
      
    // Auto-apply double jump after a short delay when airborne  
    if (!isGrounded && state.canDoubleJump && !state.doubleJumpUsed) {  
      // Apply double jump force  
      player.push(new Vector3(0, 15, 0))  
      state.doubleJumpUsed = true  
      state.canDoubleJump = false  
    }  
      
    state.wasGrounded = isGrounded  
  })  
})  
  
function isPlayerGrounded(player) {  
  const playerPos = player.position  
  const rayStart = new Vector3(playerPos.x, playerPos.y + 0.1, playerPos.z)  
  const rayDir = new Vector3(0, -1, 0)  
  const rayDistance = 0.3  
    
  const hit = world.raycast(rayStart, rayDir, rayDistance)  
  return hit && hit.distance < 0.3  
}
```

---
*Extracted from MoonJump.hyp. Attachment ID: 1406524288546373642*