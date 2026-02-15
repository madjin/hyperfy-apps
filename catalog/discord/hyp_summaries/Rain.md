# Rain.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-04-16
- **Size**: 10,843 bytes

## Blueprint
- **Name**: Rain
- **Version**: 24
- **Model**: `asset://061441245bc357746fed83fb2942a938cdc55514aedd5ea0abf8d0698fe6bfaf.glb`
- **Script**: `asset://dd3fe633f2c3d2536776ea440e479ea4543aa7c0b0a76484a1d1de94b597912f.js`

## Props
- `image`: texture → `asset://107d27267c03b22e41a16ceae354f944f43ece213fee97bc37ca0b6c662ca638.png`

## Assets
- `[model]` 061441245bc357746fed83fb2942a938cdc55514aedd5ea0abf8d0698fe6bfaf.glb (7,352 bytes)
- `[script]` dd3fe633f2c3d2536776ea440e479ea4543aa7c0b0a76484a1d1de94b597912f.js (1,453 bytes)
- `[texture]` 107d27267c03b22e41a16ceae354f944f43ece213fee97bc37ca0b6c662ca638.png (1,115 bytes)

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
  shape: ['rectangle', 20, 20, 1],
  // direction: 1,
  speed: '20',
  size: '1',
  rate: 200,
  blending: 'additive',
  alpha: '0.8',
  // emissive: '100',
  // alpha: '0.01~0.03',
  // size: '5',
  // rotate: '0~360',
  alphaOverLife: '0,0|0.1,1|0.9,1|1,0'
})
particles.rotation.x = 180 * DEG2RAD
particles.position.y = 10
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
*Extracted from Rain.hyp. Attachment ID: 1361904723086807211*