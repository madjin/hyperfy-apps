export default function main(world, app, fetch, props, setTimeout) {
// Discord Trigger Zone App
// Sends Discord messages when players enter a trigger zone

// Remove default block
app.remove(app.get('Block'))

app.configure([
  {
    key: 'broadcastChat',
    type: 'switch',
    label: 'Broadcast',
    options: [
      { label: 'on', value: true },
      { label: 'off', value: false },
    ],
    initial: true,
  },
  {
    key: 'webhook',
    type: 'text',
    label: 'Webhook URL',
    placeholder: 'Enter Discord webhook URL',
  },
  {
    key: 'excludedNames',
    type: 'text',
    label: 'Excluded Names (comma-separated)',
    placeholder: 'Enter names to exclude from trigger',
  },
  {
    key: 'triggerName',
    type: 'text',
    label: 'Trigger Name',
    placeholder: 'e.g., Main Entrance',
    initial: 'Trigger Zone',
  },
  {
    key: 'showTrigger',
    type: 'switch',
    label: 'Show Trigger Cube',
    options: [
      { label: 'on', value: true },
      { label: 'off', value: false },
    ],
    initial: true,
  },
  {
    key: 'triggerColor',
    type: 'color',
    label: 'Trigger Color',
    initial: '#00FF00',
  },
  {
    key: 'triggerOpacity',
    type: 'range',
    label: 'Trigger Opacity',
    min: 0,
    max: 1,
    step: 0.01,
    initial: 0.5,
  },
])


// Helper function to get color value (handles both color picker and text input)
function getColorValue() {
  const color = app.config.triggerColor
  // If color picker returns an object, extract the hex value
  // Otherwise, use the string directly
  if (typeof color === 'object' && color !== null) {
    return color.hex || color.value || '#00FF00'
  }
  return color || '#00FF00'
}

// Helper function to check if trigger should be visible
function shouldShowTrigger() {
  // Handle switch value - could be true, false, or undefined
  if (app.config.showTrigger === false) {
    return false
  }
  // Default to true if undefined or true
  return true
}

// ===== TRIGGER ZONE SETUP =====
// Helper function to get trigger size from app.scale (for collider in world space)
function getTriggerSize() {
  // For collider in world space, use app.scale directly
  // Default to [2, 2, 2] if scale is not available
  if (app.scale) {
    return [app.scale.x || 2, app.scale.y || 2, app.scale.z || 2]
  }
  return [2, 2, 2]
}

// Track last known size to avoid unnecessary updates
let lastKnownSize = null

// Helper function to update trigger zone position, rotation and size (uses app.position, app.quaternion and app.scale directly)
function updateTriggerZonePosition() {
  if (triggerZone && app.position) {
    triggerZone.position.copy(app.position)
  }
  // Update rotation to match app rotation
  if (triggerZone) {
    if (app.quaternion) {
      triggerZone.quaternion.copy(app.quaternion)
    } else {
      // Reset to no rotation if app has no rotation
      triggerZone.quaternion.set(0, 0, 0, 1)
    }
  }
  // Update trigger zone size from app.scale (collider is in world space, needs explicit size)
  // Only update if size actually changed to avoid unnecessary rebuilds
  if (triggerZone && triggerCollider && app.scale) {
    const newSize = getTriggerSize()
    const sizeKey = `${newSize[0]},${newSize[1]},${newSize[2]}`
    
    // Only update if size changed
    if (lastKnownSize !== sizeKey) {
      lastKnownSize = sizeKey
      // Map: width = scale.x (X-axis), height = scale.y (Y-axis), depth = scale.z (Z-axis)
      triggerCollider.setSize(newSize[0], newSize[1], newSize[2])
    }
  }
  // Visual doesn't need size update - it's a child of app, so app.scale handles it automatically
}

// Visual indicator for the trigger (semi-transparent glowing box)
// Created at top level so it's visible to all clients
// Position [0, 0, 0] is relative to app since it's added with app.add()
// Size is [1, 1, 1] because app.scale will automatically scale it (no double-scaling)
const triggerVisual = app.create('prim', {
  type: 'box',
  size: [1, 1, 1],  // Base size - app.scale will handle the actual scaling
  color: getColorValue(),
  emissive: getColorValue(),
  emissiveIntensity: 0.5,
  opacity: app.config.triggerOpacity !== undefined ? app.config.triggerOpacity : 0.5,
  position: [0, 0, 0]  // Relative to app position
})

// Set initial visibility
triggerVisual.active = shouldShowTrigger()

app.add(triggerVisual)

// Trigger zone and handler - server-side only (triggers need to be on server)
let triggerZone = null
let triggerCollider = null

if (world.isServer) {
  // Create a trigger zone in world space at app position and rotation
  const appPos = app.position ? [app.position.x, app.position.y, app.position.z] : [0, 1, 0]
  triggerZone = app.create('rigidbody', {
    type: 'static',
    position: appPos
  })
  
  // Apply app rotation to trigger zone
  if (app.quaternion) {
    triggerZone.quaternion.copy(app.quaternion)
  }

  const triggerSize = getTriggerSize()
  lastKnownSize = `${triggerSize[0]},${triggerSize[1]},${triggerSize[2]}`
  
  // Create collider - use explicit width/height/depth to ensure proper sizing
  // Map: width = scale.x (X-axis), height = scale.y (Y-axis), depth = scale.z (Z-axis)
  triggerCollider = app.create('collider', {
    type: 'box',
    width: triggerSize[0],   // x -> width (X-axis)
    height: triggerSize[1],  // y -> height (Y-axis)
    depth: triggerSize[2],   // z -> depth (Z-axis)
    trigger: true
  })
  
  // Verify size was set correctly and fix if needed
  const expectedWidth = triggerSize[0]  // x -> width
  const expectedHeight = triggerSize[1] // y -> height
  const expectedDepth = triggerSize[2]  // z -> depth
  if (triggerCollider.width !== expectedWidth || triggerCollider.height !== expectedHeight || triggerCollider.depth !== expectedDepth) {
    // If size wasn't set correctly, use setSize to fix it
    triggerCollider.setSize(expectedWidth, expectedHeight, expectedDepth)
  }

  triggerZone.add(triggerCollider)
  // Add to world (not app) so physics triggers work correctly
  world.add(triggerZone)
  
  // Wait a frame and check if scale was applied correctly, then update if needed
  setTimeout(() => {
    const currentSize = getTriggerSize()
    const currentColliderSize = { width: triggerCollider.width, height: triggerCollider.height, depth: triggerCollider.depth }
    
    // Check if collider size matches expected size
    const expectedWidth = currentSize[0]  // x -> width
    const expectedHeight = currentSize[1] // y -> height
    const expectedDepth = currentSize[2]  // z -> depth
    if (currentColliderSize.width !== expectedWidth || 
        currentColliderSize.height !== expectedHeight || 
        currentColliderSize.depth !== expectedDepth) {
      triggerCollider.setSize(expectedWidth, expectedHeight, expectedDepth)
      lastKnownSize = `${currentSize[0]},${currentSize[1]},${currentSize[2]}`
    }
  }, 100) // Wait 100ms for app.scale to be set
  
  // Update trigger zone position when app moves
  app.on('update', () => {
    updateTriggerZonePosition()
  })

  // Function to check if a player name should be excluded
  const isPlayerExcluded = (playerName, playerId) => {
    if (!app.config.excludedNames || !app.config.excludedNames.trim()) {
      return false
    }
    
    const excludedNames = app.config.excludedNames
      .split(',')
      .map(name => name.trim().toLowerCase())
      .filter(name => name.length > 0)
    
    const nameToCheck = playerName && playerName !== 'Anonymous' ? 
      playerName.toLowerCase() : playerId.toLowerCase()
    
    return excludedNames.includes(nameToCheck)
  }

  // Function to send message to Discord webhook
  const hitDiscordWebhook = async (message) => {
    if (!app.config.webhook) {
      return false
    }

    try {
      const response = await fetch(app.config.webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message
        }),
      })

      if (!response.ok) {
        throw new Error(`Discord webhook error: ${response.status}`)
      }

      return true
    } catch (error) {
      return false
    }
  }

  // Trigger logic - fires every time a player enters
  triggerZone.onTriggerEnter = async (otherBody) => {
    // Only process if broadcast is enabled
    if (!app.config.broadcastChat) {
      return
    }

    // Get player ID from the trigger event
    const playerId = otherBody?.playerId || null
    if (!playerId) {
      return
    }

    // Get player info
    const player = world.getPlayer(playerId)
    if (!player) {
      return
    }

    // Check if player is excluded - if so, prevent trigger entirely
    if (isPlayerExcluded(player.name, playerId)) {
      return
    }

    // Get player name
    const playerName = player.name && player.name !== 'Anonymous' ? player.name : playerId
    const triggerName = app.config.triggerName || 'Trigger Zone'

    // Send Discord message
    const message = `**${playerName}** triggered **${triggerName}**`
    await hitDiscordWebhook(message)
  }
}

// Handle config changes
app.on('config', () => {
  // Update visual cube color
  if (app.config.triggerColor) {
    const colorValue = getColorValue()
    triggerVisual.color = colorValue
    triggerVisual.emissive = colorValue
  }

  // Update visual cube opacity
  if (app.config.triggerOpacity !== undefined) {
    triggerVisual.opacity = app.config.triggerOpacity
  }

  // Update trigger collider size from app.scale (server-side only)
  // Visual doesn't need size update - it's a child of app, so app.scale handles it automatically
  // Map: width = scale.x (X-axis), height = scale.y (Y-axis), depth = scale.z (Z-axis)
  if (world.isServer && triggerZone && triggerCollider && app.scale) {
    const newSize = getTriggerSize()
    triggerCollider.setSize(newSize[0], newSize[1], newSize[2])
  }

  // Update visual cube visibility
  triggerVisual.active = shouldShowTrigger()
  
  // Update positions when config changes (in case app moved)
  updateTriggerZonePosition()
})


}
