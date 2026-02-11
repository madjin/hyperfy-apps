# Glow_Dust.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-04-16
- **Size**: 75,030 bytes

## Blueprint
- **Name**: Glow Dust
- **Version**: 24
- **Model**: `asset://061441245bc357746fed83fb2942a938cdc55514aedd5ea0abf8d0698fe6bfaf.glb`
- **Script**: `asset://91f7911ad75707e0c6cb2018abf840f48e2336ad062450aedb36504aef43b5e6.js`

## Props
- `image`: texture → `asset://925b8ac284436f74f9cadf0ecd058da1c08fba65c098e4e34fd220603022f02e.png`

## Assets
- `[model]` 061441245bc357746fed83fb2942a938cdc55514aedd5ea0abf8d0698fe6bfaf.glb (7,352 bytes)
- `[script]` 91f7911ad75707e0c6cb2018abf840f48e2336ad062450aedb36504aef43b5e6.js (1,409 bytes)
- `[texture]` 925b8ac284436f74f9cadf0ecd058da1c08fba65c098e4e34fd220603022f02e.png (65,336 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.on()`
**World Methods**: `world.add()`, `world.remove()`
**Events Listened**: `update`
**Nodes Created**: `particles`

## Keywords (for Discord search)
additive, alpha, alphaOverLife, blending, blue, bursts, color, configure, count, create, delta, direction, duration, elapsed, emissive, file, image, kind, label, life

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
  image: props.image?.url,
  shape: ['box', 20, 10, 20, 1, 'volume', true],
  direction: 1,
  speed: '0.1~0.3',
  size: '0.03',
  rate: 200,
  blending: 'additive',
  // alpha: '0.1',
  emissive: '100',
  // alpha: '0.01~0.03',
  // size: '5',
  // rotate: '0~360',
  alphaOverLife: '0,0|0.1,1|0.9,1|1,0'
})
app.add(particles)





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
*Extracted from Glow_Dust.hyp. Attachment ID: 1361904723472551976*