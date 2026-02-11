# QuestItemUI.hyp

## Metadata
- **Author**: 0mka
- **Channel**: #🎨│showcase
- **Date**: 2025-07-20
- **Size**: 23,879 bytes

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
- **Name**: QuestItemUI
- **Version**: 317
- **Model**: `asset://97fc7289a38b5b49357e6fbd74e7e77fc78493dbb1c0dbc850cb8e9db9fd2530.glb`
- **Script**: `asset://168c8eb09e1081bced61c7527717f176b1cbcd087248593115d3821b60782eb7.js`

## Props
- `collision`: bool = `True`
- `position`: str = `top-center`
- `borderWeight`: str = `medium`
- `borderColor`: str = `gold`
- `uiScale`: float = `0.8`
- `collectionText`: str = `Quest Item`
- `eventName`: str = `itemCollected`
- `displayMode`: str = `always`
- `enableStorage`: bool = `True`
- `storageKey`: str = `itemsCollected`
- `messageFontSize`: int = `25`
- `counterFontSize`: int = `16`
- `textSpacing`: int = `7`

## Assets
- `[model]` 97fc7289a38b5b49357e6fbd74e7e77fc78493dbb1c0dbc850cb8e9db9fd2530.glb (3,380 bytes)
- `[script]` 168c8eb09e1081bced61c7527717f176b1cbcd087248593115d3821b60782eb7.js (11,288 bytes)
- `[texture]` 2602f96653eb87d857799af39dd7999c387439124ee92dc1a6974157e326905f.webp (7,822 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.create()`, `app.on()`, `app.send()`
**World Methods**: `world.add()`, `world.get()`, `world.getPlayer()`, `world.on()`, `world.set()`
**Events Listened**: `itemCountResponse`, `itemCountUpdated`, `requestItemCount`, `saveItemCount`
**Nodes Created**: `ui`, `uitext`

## Keywords (for Discord search)
across, active, after, alignItems, always, appears, backgroundColor, based, between, blue, bold, border, borderColor, borderColors, borderRadius, borderWeight, borderWeights, borderWidth, bottom, button

## Script Source
```javascript
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
  itemsC

// ... truncated ...
```

---
*Extracted from QuestItemUI.hyp. Attachment ID: 1396392921539936296*