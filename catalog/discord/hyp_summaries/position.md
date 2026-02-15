# position.hyp

## Metadata
- **Author**: 0mka
- **Channel**: #🐞│issues
- **Date**: 2025-07-25
- **Size**: 514,734 bytes

## Discord Context
> super basic but go to that position on dev with meadow <@179546010303856640>

## Blueprint
- **Name**: position
- **Version**: 11
- **Model**: `asset://63f4d4b9a77a227b5f5f530ab81327d213f083ebd042700e44b555de4f72a7c8.glb`
- **Script**: `asset://64175abb13ad03cefb3891cdab4f629c45d5dc8c39b45b91de0dee53e3030fc1.js`

## Props
- `collision`: bool = `True`

## Assets
- `[model]` 63f4d4b9a77a227b5f5f530ab81327d213f083ebd042700e44b555de4f72a7c8.glb (513,096 bytes)
- `[script]` 64175abb13ad03cefb3891cdab4f629c45d5dc8c39b45b91de0dee53e3030fc1.js (935 bytes)

## Script Analysis
**App Methods**: `app.create()`, `app.on()`
**World Methods**: `world.add()`, `world.getPlayer()`
**Events Listened**: `update`
**Nodes Created**: `ui`, `uitext`

## Keywords (for Discord search)
backgroundColor, borderRadius, center, color, create, display, element, every, fontSize, frame, getPlayer, height, hierarchy, local, padding, pivot, player, position, positionText, positioned

## Script Source
```javascript
// Get the local player  
const player = world.getPlayer()  
  
// Create a screen-space UI positioned in the center  
const ui = app.create('ui', {  
  space: 'screen',  
  position: [0.5, 0.5, 0], // Center of screen (50% x, 50% y)  
  pivot: 'center',  
  width: 300,  
  height: 100,  
  backgroundColor: 'rgba(0, 0, 0, 0.7)',  
  borderRadius: 10,  
  padding: 10  
})  
  
// Create text element to display position  
const positionText = app.create('uitext', {  
  value: 'Position: Loading...',  
  fontSize: 16,  
  color: 'white',  
  textAlign: 'center'  
})  
  
// Add text to UI  
ui.add(positionText)  
  
// Add UI to world space (not app hierarchy)  
world.add(ui)  
  
// Update position display every frame  
app.on('update', () => {  
  if (player && player.position) {  
    const pos = player.position  
    positionText.value = `Position: ${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}`  
  }  
})
```

---
*Extracted from position.hyp. Attachment ID: 1398154515848495214*