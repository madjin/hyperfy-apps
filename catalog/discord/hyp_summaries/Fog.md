# Fog.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-04-16
- **Size**: 107,051 bytes

## Blueprint
- **Name**: Fog
- **Version**: 30
- **Model**: `asset://061441245bc357746fed83fb2942a938cdc55514aedd5ea0abf8d0698fe6bfaf.glb`
- **Script**: `asset://e398b7d0879c5bcf18ef8d8ef07cd0e48aae3360b463d3497d79d71ab628bd3b.js`

## Props
- `image`: texture → `asset://e8724c219e8d35859167fc0a7e207e13c72ccf0c29704909b9bb3d3dc71c6cf7.png`

## Assets
- `[model]` 061441245bc357746fed83fb2942a938cdc55514aedd5ea0abf8d0698fe6bfaf.glb (7,352 bytes)
- `[script]` e398b7d0879c5bcf18ef8d8ef07cd0e48aae3360b463d3497d79d71ab628bd3b.js (1,321 bytes)
- `[texture]` e8724c219e8d35859167fc0a7e207e13c72ccf0c29704909b9bb3d3dc71c6cf7.png (97,452 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.on()`
**World Methods**: `world.add()`, `world.remove()`
**Events Listened**: `update`
**Nodes Created**: `particles`

## Keywords (for Discord search)
alpha, alphaOverLife, blending, blue, bursts, color, configure, count, create, delta, direction, duration, elapsed, emissive, file, image, kind, label, life, loop

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
  shape: ['box', 20, 1, 20, 1, 'volume', true],
  direction: 1,
  speed: '0.1~0.3',
  rate: 200,
  alpha: '0.01~0.03',
  size: '5',
  rotate: '0~360',
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
*Extracted from Fog.hyp. Attachment ID: 1361904723841515580*