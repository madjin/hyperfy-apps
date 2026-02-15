# szjanko-2-11-dice.hyp

## Metadata
- **Author**: 0mka
- **Channel**: #🎨│showcase
- **Date**: 2025-03-04
- **Size**: 260,261 bytes

## Blueprint
- **Name**: dice
- **Version**: 26
- **Model**: `asset://311af40e321ccade1f2a8722a99e410917af4e8bba79beeb36acf62b4467a1d6.glb`
- **Script**: `asset://926d8830c2716bb45ba302bc77f0efdbbcea2df79873faa747cafe7a2724a159.js`

## Assets
- `[model]` 311af40e321ccade1f2a8722a99e410917af4e8bba79beeb36acf62b4467a1d6.glb (258,836 bytes)
- `[script]` 926d8830c2716bb45ba302bc77f0efdbbcea2df79873faa747cafe7a2724a159.js (776 bytes)

## Script Analysis
**App Methods**: `app.get()`, `app.on()`
**Events Listened**: `update`

## Keywords (for Discord search)
cube, delta, easingFactor, elapsedTime, isRolling, onPointerDown, progress, randomRotation, rollDuration, root, rotation, update

## Script Source
```javascript
const cube = app.get("$root")

let isRolling = false;
let rollDuration = 2;
let elapsedTime = 0;
let randomRotation = { x: 0, y: 0, z: 0 };

cube.onPointerDown = () => {
  if (!isRolling) {
    isRolling = true;
    elapsedTime = 0;
    randomRotation = {
      x: 10,
      y: 2,
      z: 8,
    };
  }
};

app.on("update", (delta) => {
  if (isRolling) {
    elapsedTime += delta;
    let progress = elapsedTime / rollDuration;
    if (progress < 1) {
      let easingFactor = 1 - progress;
      cube.rotation.x += randomRotation.x * delta * easingFactor;
      cube.rotation.y += randomRotation.y * delta * easingFactor;
      cube.rotation.z += randomRotation.z * delta * easingFactor;
    } else {
      isRolling = false;
    }
  }
});

```

---
*Extracted from szjanko-2-11-dice.hyp. Attachment ID: 1346629938203332642*