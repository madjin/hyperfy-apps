# Fire.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-04-16
- **Size**: 69,851 bytes

## Blueprint
- **Name**: Fire
- **Version**: 12
- **Model**: `asset://061441245bc357746fed83fb2942a938cdc55514aedd5ea0abf8d0698fe6bfaf.glb`
- **Script**: `asset://a1d810747f19e3c8a5ab9194b1ac19b81ff99bdbcc0d424ff3e23543ccca0fa8.js`

## Props
- `image`: texture → `asset://dadb0aa0893ebb47aafd08b511de0530b1fe40a138b853ab3f4176461ad0c78b.png`

## Assets
- `[model]` 061441245bc357746fed83fb2942a938cdc55514aedd5ea0abf8d0698fe6bfaf.glb (7,352 bytes)
- `[script]` a1d810747f19e3c8a5ab9194b1ac19b81ff99bdbcc0d424ff3e23543ccca0fa8.js (1,552 bytes)
- `[texture]` dadb0aa0893ebb47aafd08b511de0530b1fe40a138b853ab3f4176461ad0c78b.png (60,024 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.on()`
**World Methods**: `world.add()`, `world.remove()`
**Events Listened**: `update`
**Nodes Created**: `particles`

## Keywords (for Discord search)
additive, alpha, alphaOverLife, black, blending, blue, bursts, color, colorOverLife, cone, configure, count, create, delta, direction, duration, elapsed, emissive, file, image

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
  shape: ['cone', 0.2, 1, 0],
  direction: 0.2,
  life: '2',
  // speed: '2',
  rate: 50,
  alpha: '0.5',
  color: 'red',
  blending: 'additive',
  size: '1',
  rotate: '0~360',
  // alphaOverLife: '0,0|0.1,1|0.9,1|1,0',
  // velocityOrbital: new Vector3(0, 0.1, 0),
  // velocityLinear: new Vector3(0, 1, 0),
  sizeOverLife: '0,0.5|0.3,1|1,0',
  rotateOverLife: '0,0|1,45',
  colorOverLife: '0,red|0.4,orange|0.8,black'
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
*Extracted from Fire.hyp. Attachment ID: 1361904721685909757*