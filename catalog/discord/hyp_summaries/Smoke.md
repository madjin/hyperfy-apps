# Smoke.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-04-16
- **Size**: 71,868 bytes

## Blueprint
- **Name**: Smoke
- **Version**: 9
- **Model**: `asset://061441245bc357746fed83fb2942a938cdc55514aedd5ea0abf8d0698fe6bfaf.glb`
- **Script**: `asset://ee377574d89cabd1f2d16da0465b5d57137c4f7ec4b528bd0324e527c8d9f45b.js`

## Props
- `image`: texture → `asset://d988b03bb46797be913333f06b26ff2aad55ec082cfb7d3d18ce86ccb71559b5.png`

## Assets
- `[model]` 061441245bc357746fed83fb2942a938cdc55514aedd5ea0abf8d0698fe6bfaf.glb (7,352 bytes)
- `[script]` ee377574d89cabd1f2d16da0465b5d57137c4f7ec4b528bd0324e527c8d9f45b.js (1,433 bytes)
- `[texture]` d988b03bb46797be913333f06b26ff2aad55ec082cfb7d3d18ce86ccb71559b5.png (62,156 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.on()`
**World Methods**: `world.add()`, `world.remove()`
**Events Listened**: `update`
**Nodes Created**: `particles`

## Keywords (for Discord search)
alpha, alphaOverLife, blending, blue, bursts, color, cone, configure, count, create, delta, direction, duration, elapsed, emissive, file, image, kind, label, life

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
  shape: ['cone', 0.1, 1, 30],
  direction: 0.2,
  speed: '1',
  rate: 100,
  alpha: '0.01~0.03',
  size: '1',
  life: '10',
  rotate: '0~360',
  velocityOrbital: new Vector3(0, 0.01, 0),
  velocityLinear: new Vector3(0, 1, 0),
  rotateOverLife: '0,0|1,360',
  // alphaOverLife: '0,0|0.1,1|0.9,1|1,0',
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
*Extracted from Smoke.hyp. Attachment ID: 1361904722155409581*