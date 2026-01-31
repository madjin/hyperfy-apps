export default function main(world, app, fetch, props, setTimeout) {
app.configure([    
  // === POSITION SETTINGS ===    
  {    
    type: 'section',    
    label: 'Position Settings'    
  },    
  {    
    key: 'position',    
    type: 'switch',    
    label: 'UI Position',    
    options: [    
      { label: 'Top Center', value: 'top-center' },    
      { label: 'Top Right', value: 'top-right' },    
      { label: 'Bottom Right Center', value: 'bottom-right-center' },    
      { label: 'Bottom Right', value: 'bottom-right' }    
    ],    
    initial: 'top-right',    
    hint: 'Choose where the collection notification appears on screen'    
  },    
      
  // === DISPLAY SETTINGS ===    
  {    
    type: 'section',    
    label: 'Display Settings'    
  },    
  {    
    key: 'displayMode',    
    type: 'switch',    
    label: 'Display Mode',    
    options: [    
      { label: 'Always Show', value: 'always' },    
      { label: 'Show on Collect', value: 'timeout' }    
    ],    
    initial: 'timeout',    
    hint: 'Choose whether UI is always visible or only shows when collecting items'    
  },    
      
  // === STORAGE SETTINGS ===    
  {    
    type: 'section',    
    label: 'Storage Settings'    
  },    
  {    
    key: 'enableStorage',    
    type: 'toggle',    
    label: 'Enable Persistent Storage',    
    initial: true,    
    hint: 'Save collection progress across sessions using server storage'    
  },    
  {    
    key: 'storageKey',    
    type: 'text',    
    label: 'Storage Key Prefix',    
    initial: 'itemsCollected',    
    hint: 'Prefix for storage keys (will be combined with player ID)'    
  },  
  {  
    type: 'button',  
    key: 'resetButton',  
    label: 'Reset Counter',  
    hint: 'Reset collected items count to 0',  
    onClick: () => {  
      resetItemCount()  
    }  
  },  
      
  // === STYLING SETTINGS ===    
  {    
    type: 'section',    
    label: 'Styling Settings'    
  },    
  {    
    key: 'borderWeight',    
    type: 'switch',    
    label: 'Border Weight',    
    options: [    
      { label: 'Thin', value: 'thin' },    
      { label: 'Medium', value: 'medium' },    
      { label: 'Thick', value: 'thick' }    
    ],    
    initial: 'medium',    
    hint: 'Thickness of the UI border (thin=1px, medium=2px, thick=4px)'    
  },    
  {    
    key: 'borderColor',    
    type: 'switch',    
    label: 'Border Color',    
    options: [    
      { label: 'White', value: 'white' },    
      { label: 'Gold', value: 'gold' },    
      { label: 'Green', value: 'green' },    
      { label: 'Blue', value: 'blue' },    
      { label: 'Red', value: 'red' }    
    ],    
    initial: 'gold',    
    hint: 'Color of the UI border'    
  },    
  {    
    key: 'uiScale',    
    type: 'range',    
    label: 'UI Scale',    
    min: 0.5,    
    max: 2.0,    
    step: 0.1,    
    initial: 1.0,    
    hint: 'Scale factor for the entire UI (0.5 = small, 2.0 = large)'    
  },    
      
  // === TEXT SETTINGS ===    
  {    
    type: 'section',    
    label: 'Text Settings'    
  },    
  {    
    key: 'collectionText',    
    type: 'text',    
    label: 'Collection Message',    
    initial: 'Item Collected!',    
    hint: 'Text to display when an item is collected'    
  },    
  {    
    key: 'messageFontSize',    
    type: 'range',    
    label: 'Message Font Size',    
    min: 8,    
    max: 32,    
    step: 1,    
    initial: 14,    
    hint: 'Font size for the collection message text'    
  },    
  {    
    key: 'counterFontSize',    
    type: 'range',    
    label: 'Counter Font Size',    
    min: 8,    
    max: 24,    
    step: 1,    
    initial: 12,    
    hint: 'Font size for the items collected counter text'    
  },  
  {  
    key: 'textSpacing',  
    type: 'range',  
    label: 'Text Spacing',  
    min: 0,  
    max: 20,  
    step: 1,  
    initial: 5,  
    hint: 'Spacing between collection message and counter (in pixels)'  
  },  
      
  // === EVENT SETTINGS ===    
  {    
    type: 'section',    
    label: 'Event Settings'    
  },    
  {    
    key: 'eventName',    
    type: 'text',    
    label: 'Listen Event Name',    
    initial: 'itemCollected',    
    hint: 'Name of the event to listen for from collectible items'    
  }    
])    
    
const position = props.position    
const displayMode = props.displayMode    
const enableStorage = props.enableStorage    
const storageKey = props.storageKey    
const borderWeight = props.borderWeight    
const borderColor = props.borderColor    
const uiScale = props.uiScale    
const collectionText = props.collectionText    
const messageFontSize = props.messageFontSize    
const counterFontSize = props.counterFontSize    
const textSpacing = props.textSpacing  
const eventName = props.eventName    
    
// Collection counter    
let itemsCollected = 0    
    
// Border weight mapping    
const borderWeights = {    
  'thin': 1,    
  'medium': 2,    
  'thick': 4    
}    
    
// Border color mapping    
const borderColors = {    
  'white': '#ffffff',    
  'gold': '#ffd700',    
  'green': '#00ff00',    
  'blue': '#0080ff',    
  'red': '#ff0000'    
}    
    
// Position configurations with pivot and offset    
const positionConfigs = {    
  'top-center': {    
    position: [0.5, 0, 0],    
    pivot: 'top-center',    
    offset: [0, 20, 0]    
  },    
  'top-right': {    
    position: [1, 0, 0],    
    pivot: 'top-right',    
    offset: [-30, 60, 0]    
  },    
  'bottom-right-center': {    
    position: [0.55, 1, 0],    
    pivot: 'bottom-center',    
    offset: [0, -20, 0]    
  },    
  'bottom-right': {    
    position: [1, 1, 0],    
    pivot: 'bottom-right',    
    offset: [-30, -30, 0]    
  }    
}    
    
// Get position config    
const posConfig = positionConfigs[position]    
    
// Create the main UI container    
const ui = app.create('ui', {    
  space: 'screen',    
  position: posConfig.position,    
  pivot: posConfig.pivot,    
  offset: posConfig.offset,    
  width: 200 * uiScale,    
  height: 80 * uiScale,    
  backgroundColor: 'rgba(0, 0, 0, 0.8)',    
  borderWidth: borderWeights[borderWeight],    
  borderColor: borderColors[borderColor],    
  borderRadius: 8,    
  padding: 10,    
  flexDirection: 'column',    
  justifyContent: 'center',    
  alignItems: 'center',    
  pointerEvents: false    
})    
    
// Collection message text    
const messageText = app.create('uitext', {    
  value: collectionText,    
  fontSize: messageFontSize * uiScale,    
  color: '#ffffff',    
  textAlign: 'center',    
  fontWeight: 'bold',    
  margin: [0, 0, textSpacing, 0]  // Use configurable spacing  
})    
    
// Items collected counter text    
const counterText = app.create('uitext', {    
  value: `Items: ${itemsCollected}`,    
  fontSize: counterFontSize * uiScale,    
  color: '#cccccc',    
  textAlign: 'center'    
})    
    
// Add text elements to UI    
ui.add(messageText)    
ui.add(counterText)    
    
// Add UI to world    
world.add(ui)    
    
// Set initial visibility based on display mode    
ui.active = displayMode === 'always'    
    
// Animation variables    
let showTimer = null    
    
// Storage functions    
function getStorageKey(playerId) {    
  return `${storageKey}_${playerId}`    
}    
    
function saveItemCount(playerId, count) {    
  if (!enableStorage || !world.isServer) return    
      
  const key = getStorageKey(playerId)    
  world.set(key, count)    
}    
    
function loadItemCount(playerId) {    
  if (!enableStorage) return 0    
      
  if (world.isServer) {    
    const key = getStorageKey(playerId)    
    return world.get(key) || 0    
  } else {    
    // On client, request from server    
    app.send('requestItemCount', { playerId })    
    return itemsCollected // Return current value while waiting    
  }    
}    
    
// Function to update counter display    
function updateCounter(count) {    
  itemsCollected = count    
  counterText.value = `Items: ${itemsCollected}`    
}    
  
// Reset function for the button  
function resetItemCount() {  
  const localPlayer = world.getPlayer()  
  if (!localPlayer) return  
    
  // Reset local counter  
  updateCounter(0)  
    
  // Clear storage if enabled  
  if (enableStorage) {  
    if (world.isServer) {  
      saveItemCount(localPlayer.id, 0)  
      // Broadcast reset to all clients  
      app.send('itemCountUpdated', { playerId: localPlayer.id, count: 0 })  
    } else {  
      // Send reset request to server  
      app.send('saveItemCount', { playerId: localPlayer.id, count: 0 })  
    }  
  }  
}  
    
// Function to show collection notification    
function showCollectionNotification(playerId) {    
  // Update counter    
  const newCount = itemsCollected + 1    
  updateCounter(newCount)    
      
  // Save to storage if enabled    
  if (enableStorage && playerId) {    
    if (world.isServer) {    
      saveItemCount(playerId, newCount)    
      // Broadcast updated count to all clients    
      app.send('itemCountUpdated', { playerId, count: newCount })    
    } else {    
      // Send to server to save    
      app.send('saveItemCount', { playerId, count: newCount })    
    }    
  }    
      
  if (displayMode === 'timeout') {    
    // Show the UI temporarily    
    ui.active = true    
        
    // Hide after 2 seconds    
    showTimer = setTimeout(() => {    
      ui.active = false    
    }, 2000)    
  }    
  // If displayMode is 'always', UI stays visible and just updates the counter    
}    
    
// Server-side storage handling    
if (world.isServer) {    
  app.on('requestItemCount', (data) => {    
    const count = loadItemCount(data.playerId)    
    app.send('itemCountResponse', { playerId: data.playerId, count })    
  })    
      
  app.on('saveItemCount', (data) => {    
    saveItemCount(data.playerId, data.count)    
    // Broadcast to all clients    
    app.send('itemCountUpdated', { playerId: data.playerId, count: data.count })    
  })    
}    
    
// Client-side storage handling    
if (world.isClient) {    
  app.on('itemCountResponse', (data) => {    
    const localPlayer = world.getPlayer()    
    if (localPlayer && data.playerId === localPlayer.id) {    
      updateCounter(data.count)    
    }    
  })    
      
  app.on('itemCountUpdated', (data) => {    
    const localPlayer = world.getPlayer()    
    if (localPlayer && data.playerId === localPlayer.id) {    
      updateCounter(data.count)    
    }    
  })    
}    
    
// Listen for collection events    
if (eventName) {    
  world.on(eventName, (data) => {    
    // Only show notification on client side    
    if (!world.isClient) return    
        
    // Check if this is for the local player    
    if (data.playerId) {    
      const localPlayer = world.getPlayer()    
      if (localPlayer && data.playerId === localPlayer.id) {    
        showCollectionNotification(data.playerId)    
      }    
    }    
  })    
}    
    
// Initialize counter from storage when app starts    
if (world.isClient) {    
  const localPlayer = world.getPlayer()    
  if (localPlayer && enableStorage) {    
    loadItemCount(localPlayer.id)    
  }    
}
}
