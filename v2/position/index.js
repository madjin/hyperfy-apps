export default function main(world, app, fetch, props, setTimeout) {
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
}
