# Water_Fountain.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-04-16
- **Size**: 30,810 bytes

## Blueprint
- **Name**: Water Fountain
- **Version**: 106
- **Model**: `asset://061441245bc357746fed83fb2942a938cdc55514aedd5ea0abf8d0698fe6bfaf.glb`
- **Script**: `asset://88956e3ae8ef70b4848e7ba0a8695225204fc1cdb09f8267def65fe3e59399a4.js`

## Props
- `image`: texture → `asset://e8fd9dabdfe07e2978da030cd07f81bfb69cfe7ea02bf68885112053008879b8.png`

## Assets
- `[model]` 061441245bc357746fed83fb2942a938cdc55514aedd5ea0abf8d0698fe6bfaf.glb (7,352 bytes)
- `[script]` 88956e3ae8ef70b4848e7ba0a8695225204fc1cdb09f8267def65fe3e59399a4.js (2,789 bytes)
- `[texture]` e8fd9dabdfe07e2978da030cd07f81bfb69cfe7ea02bf68885112053008879b8.png (19,731 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.on()`
**World Methods**: `world.add()`, `world.remove()`
**Events Listened**: `update`
**Nodes Created**: `particles`

## Keywords (for Discord search)
additive, alpha, between, blending, blue, bursts, color, colorOverLife, cone, configure, count, create, cyan, delta, direction, duration, elapsed, emissive, file, force

## Script Source
```javascript
app.configure([
  {
    key: 'image',
    type: 'file',
    kind: 'texture',
    label: 'Image'
  }
])

const particles = app.create('particles', {
  shape: ['cone', 0.2, 1, 0],
  direction: 0.1,         // Some randomization in initial direction
  rate: 100,               // 50 particles per second
  duration: 10,           // Emit for 10 seconds
  loop: true,
  
  // Initial particle properties
  life: '3',            // Random lifetime between 2-3 seconds
  speed: '6',         // Random initial speed
  size: '0.4~1',          // Random size
  color: '#228ce6~#47abff',     // Color gradient from blue to cyan
  alpha: '1',
  lit: false,
  
  // Apply gravity
  force: new Vector3(0, -9.81, 0),         // Downward force

  // speedOverLife: '0,10|1,1',
  // colorOverLife: '0,blue|1,cyan',
  
  // Rendering settings
  blending: 'normal',
  image: '/particle.png',
  image: props.image?.url,
  space: 'world',
})
app.add(particles)
particles.rotation.x = 0.5
particles.position.y =1 


// const particles = app.create('particles', {
//   shape: ['point'],
//   direction: 0.2,         // Some randomization in initial direction
//   rate: 50,               // 50 particles per second
//   duration: 10,           // Emit for 10 seconds
//   loop: true,
  
//   // Initial particle properties
//   life: '2~3',            // Random lifetime between 2-3 seconds
//   speed: '10~15',         // Random initial speed
//   size: '0.5~1',          // Random size
//   color: 'blue-cyan',     // Color gradient from blue to cyan
  
//   // Apply gravity
//   force: new Vector3(0, -9.81, 0),         // Downward force

//   // speedOverLife: '0,10|1,1',
//   colorOverLife: '0,blue|1,cyan',
  
//   // Rendering settings
//   blending: 'additive',
//   image: '/particle.png',
//   space: 'world',
// })
// app.add(particles)
// particles.position.y =1 





// function spawn() {
//   const particles = app.create('particles', {
//     shape: ['box', 1, 50, 1, 1, 'volume', true],
//     direction: 0,
//     rate: 1000,
//     // bursts: [
//     //   { time: 0, count: 100 },
//     //   { time: 0.5, count: 500 },
//     //   { time: 1, count: 10000 },
//     // ],
//     duration: 5,
//     // loop: false,
//     max: 10000,
//     space: 'world',
//     life: '5',
//     speed: '0.1',
//     size: '1',
//     rotate: '0~360',
//     // color: 'blue',
//     alpha: '1',
//     // emissive: '10',
//     lit: false,
//     blending: 'normal'
//   })
//   particles.position.set(num(-100, 100, 2), 0, num(-100, 100, 2))
//   world.add(particles)
//   setTimeout(()=> {
//     world.remove(particles)
//   }, 3000)
// }

// let elapsed = 0
// app.on('update', delta => {
//   elapsed += delta
//   if (elapsed > 0.1) {
//     elapsed = 0
//     spawn()
//     spawn()
//   }
// })
```

---
*Extracted from Water_Fountain.hyp. Attachment ID: 1361904720754643115*