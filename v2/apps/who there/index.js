export default function main(world, app, fetch, props, setTimeout) {
/**
 * Who's In World - Hyperfy App
 * Creates a screenspace UI that shows all players currently in the world
 * Updates in real-time when players enter or leave
 * 
 * @author Assistant
 * @license MIT
 */

// Add app configuration for cube visibility
app.configure(() => {
  return [
    {
      type: 'switch',
      key: 'visible',
      label: 'Cube Visible',
      options: [
        {
          label: 'Show',
          value: 'true',
        },
        {
          label: 'Hide',
          value: 'false',
        }
      ],
      initial: 'true',
    }
  ];
});

// Initialize app state
if (!app.state.players) {
  app.state.players = []
}

// Track UI state
let isExpanded = false
let playerEntryNodes = []

// Create the main UI container (compact mode)
const playerListUI = app.create('ui', {
  width: 120,
  height: 60,
  res: 2,
  position: [1, 0, 0], // Top right corner (same as elevator4.js)
  offset: [-20, 20, 0], // 140px from right edge, 20px from top
  space: 'screen',
  pivot: 'top-right', // Same as elevator4.js
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderRadius: 10,
  borderColor: '#ffffff',
  borderWidth: 2,
  padding: 10,
  pointerEvents: true, // Enable pointer events for toggle
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: 8,
})

// Create the "Online" text
const onlineText = app.create('uitext', {
  value: 'Online',
  fontSize: 16,
  fontWeight: 'bold',
  color: '#ffffff',
  textAlign: 'center',
})

// Create the player count text
const countText = app.create('uitext', {
  value: '0',
  fontSize: 18,
  fontWeight: 'bold',
  color: '#4a90e2',
  textAlign: 'center',
})

// Create toggle button
const toggleButton = app.create('uiview', {
  width: 20,
  height: 20,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: 4,
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
})

const toggleIcon = app.create('uitext', {
  value: '▼',
  fontSize: 12,
  color: '#ffffff',
  textAlign: 'center',
})

toggleButton.add(toggleIcon)
playerListUI.add(onlineText)
playerListUI.add(countText)
playerListUI.add(toggleButton)

// Create expandable player list container (separate UI element)
const playerListView = app.create('ui', {
  width: 200,
  height: 300,
  res: 2,
  position: [1, 0, 0], // Top right corner
  offset: [-20, 90, 0], // Positioned directly underneath the main UI (20 + 60 + 10 gap)
  space: 'screen',
  pivot: 'top-right',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderRadius: 10,
  borderColor: '#ffffff',
  borderWidth: 2,
  padding: 15,
  pointerEvents: false, // Don't block pointer events
  flexDirection: 'column',
  gap: 8,
  active: false, // Start hidden
})

// Add both UIs to the app
app.add(playerListUI)
app.add(playerListView)

// Toggle function
function togglePlayerList() {
  isExpanded = !isExpanded
  
  if (isExpanded) {
    // Show the expanded player list
    playerListView.active = true
    toggleIcon.value = '▲'
    
    // Update the player list immediately
    updatePlayerList()
  } else {
    // Hide the expanded player list
    playerListView.active = false
    toggleIcon.value = '▼'
    
    // Clear player entries
    playerEntryNodes.forEach(node => {
      playerListView.remove(node)
    })
    playerEntryNodes = []
  }
}

// Add click handler to toggle button
toggleButton.onPointerDown = togglePlayerList

// Function to update the player list display
function updatePlayerList() {
  if (!world.isClient) return
  
  const players = world.getPlayers()
  const playerCount = players.length
  
  // Update count text
  countText.value = `${playerCount}`
  
  // Only update player list if expanded
  if (isExpanded) {
    // Remove existing player entries
    playerEntryNodes.forEach(node => {
      playerListView.remove(node)
    })
    playerEntryNodes = []
    
    // Add player entries
    players.forEach(player => {
      const playerEntry = app.create('uiview', {
        backgroundColor: player.local ? 'rgba(74, 144, 226, 0.3)' : 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        padding: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      })
      
      // Create player indicator dot
      const indicator = app.create('uiview', {
        width: 6,
        height: 6,
        backgroundColor: player.local ? '#4a90e2' : '#ffffff',
        borderRadius: 3,
      })
      
      // Create player name text
      const playerName = app.create('uitext', {
        value: player.name || 'Anonymous',
        fontSize: 12,
        color: '#ffffff',
        fontWeight: player.local ? 'bold' : 'normal',
      })
      
      playerEntry.add(indicator)
      playerEntry.add(playerName)
      playerListView.add(playerEntry)
      
      // Store reference for cleanup
      playerEntryNodes.push(playerEntry)
    })
  }
  
  // Update app state
  app.state.players = players.map(p => ({
    id: p.id,
    name: p.name || 'Anonymous',
    local: p.local
  }))
}

// Function to handle player enter events
function onPlayerEnter({ playerId }) {
  updatePlayerList()
}

// Function to handle player leave events
function onPlayerLeave({ playerId }) {
  updatePlayerList()
}

// Initialize the app
if (world.isClient) {
  // Set up event listeners for player enter/leave
  world.on('enter', onPlayerEnter)
  world.on('leave', onPlayerLeave)
  
  // Initial player list update
  updatePlayerList()
  
  // Update periodically to catch any missed events
  let lastUpdateTime = 0
  const updateInterval = 2.0 // Update every 2 seconds as backup
  
  app.on('update', (delta) => {
    lastUpdateTime += delta
    if (lastUpdateTime >= updateInterval) {
      updatePlayerList()
      lastUpdateTime = 0
    }
  })
}

if (world.isServer) {
  // Server can also listen to player events for logging
  world.on('enter', ({ playerId }) => {
    const player = world.getPlayer(playerId)
  })
  
  world.on('leave', ({ playerId }) => {
  })
}

// Cleanup function
app.on('destroy', () => {
  if (world.isClient) {
    world.off('enter', onPlayerEnter)
    world.off('leave', onPlayerLeave)
  }
})

// Get the cube and set its visibility
const cube = app.get('Cube')
if (cube) {
  cube.active = app.config.visible === 'true'
}

}
