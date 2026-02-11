# Tornado.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-04-16
- **Size**: 107,341 bytes

## Blueprint
- **Name**: Tornado
- **Version**: 49
- **Model**: `asset://061441245bc357746fed83fb2942a938cdc55514aedd5ea0abf8d0698fe6bfaf.glb`
- **Script**: `asset://680c39657b3cf638472cc100f7c9cedc281fe590e66471516ffdd27f81209852.js`

## Props
- `image`: texture → `asset://2db2f69874cdb1e5203f2f86803d5debde30402590cf50a810afaba882184616.png`

## Assets
- `[model]` 061441245bc357746fed83fb2942a938cdc55514aedd5ea0abf8d0698fe6bfaf.glb (7,352 bytes)
- `[script]` 680c39657b3cf638472cc100f7c9cedc281fe590e66471516ffdd27f81209852.js (1,491 bytes)
- `[texture]` 2db2f69874cdb1e5203f2f86803d5debde30402590cf50a810afaba882184616.png (97,568 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.on()`
**World Methods**: `world.add()`, `world.remove()`
**Events Listened**: `update`
**Nodes Created**: `particles`

## Keywords (for Discord search)
additive, alpha, alphaOverLife, blending, blue, bursts, circle, color, configure, count, create, delta, direction, duration, elapsed, emissive, file, image, kind, label

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
  shape: ['circle', 0.2, 0, true],
  direction: 0,
  rate: 100,
  duration: 5,
  max: 10000,
  space: 'world',
  life: '4',
  speed: '1',
  alpha: '1',
  size: '2',
  // blending: 'additive',
  velocityOrbital: new Vector3(0, 3, 0),
  velocityLinear: new Vector3(0, 2, 1),
  velocityRadial: 0.3,
  alphaOverLife: '0,0|0.2,1|0.5,1|1,0'
})
app.add(particles)
particles.position.y =1 





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
*Extracted from Tornado.hyp. Attachment ID: 1361904722575098179*