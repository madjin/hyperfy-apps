export default function main(world, app, fetch, props, setTimeout) {
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
}
