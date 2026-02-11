# Explosion_Sprites.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-04-16
- **Size**: 924,768 bytes

## Blueprint
- **Name**: Explosion Sprites
- **Version**: 737
- **Model**: `asset://061441245bc357746fed83fb2942a938cdc55514aedd5ea0abf8d0698fe6bfaf.glb`
- **Script**: `asset://9dde7b833e22ddd9540402e3dd1eb32166549e28d59c487eb3c42ece6c5066c5.js`

## Props
- `image`: texture → `asset://25046d6725700eaaeef5dea604439bf73b0b17c9926ce94e5ce25c7927b47b2d.png`

## Assets
- `[model]` 061441245bc357746fed83fb2942a938cdc55514aedd5ea0abf8d0698fe6bfaf.glb (7,352 bytes)
- `[script]` 9dde7b833e22ddd9540402e3dd1eb32166549e28d59c487eb3c42ece6c5066c5.js (1,703 bytes)
- `[texture]` 25046d6725700eaaeef5dea604439bf73b0b17c9926ce94e5ce25c7927b47b2d.png (914,762 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.on()`
**World Methods**: `world.add()`, `world.remove()`
**Events Listened**: `update`
**Nodes Created**: `particles`

## Keywords (for Discord search)
alpha, blending, blue, bursts, color, configure, console, count, create, delta, direction, duration, elapsed, emissive, file, hemisphere, image, kind, label, life

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
  shape: ['hemisphere', 2, 0, true],
  direction: 0,
  rate: 10,
  // bursts: [
  //   { time: 0, count: 100 },
  //   { time: 0.5, count: 500 },
  //   { time: 1, count: 10000 },
  // ],
  spritesheet: [2,4,16,false],
  duration: 5,
  // loop: false,
  // timescale: 0.1,
  max: 10000,
  space: 'world',
  life: '0.5',
  speed: '0.1',
  size: '1',
  // rotate: '0~360',
  // color: 'blue',
  alpha: '1',
  // emissive: '10',
  lit: false,
  blending: 'normal',
  // onEnd: () => { 
  //   console.log('END')
  //   world.remove(particles)
  // }
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
*Extracted from Explosion_Sprites.hyp. Attachment ID: 1361904724118606025*