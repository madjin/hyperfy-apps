# AlleySign.hyp

## Metadata
- **Author**: MetaRick
- **Channel**: #🐞│issues
- **Date**: 2025-02-19
- **Size**: 25,593 bytes

## Discord Context
> <@601886221072990251>  This will rotate it on y axis not triggering a glb animation but just rotate if it helps

## Blueprint
- **Name**: AlleySign
- **Version**: 8
- **Model**: `asset://c3fd2bb96f1811a621fa2cbdbca47ee46ce9c71645f1d368aebd103e47144156.glb`
- **Script**: `asset://c3e7135fa40f8caba92c5b709e237fa282dfce6116282f5f695b7738b2eaa4a7.js`

## Assets
- `[model]` c3fd2bb96f1811a621fa2cbdbca47ee46ce9c71645f1d368aebd103e47144156.glb (24,432 bytes)
- `[script]` c3e7135fa40f8caba92c5b709e237fa282dfce6116282f5f695b7738b2eaa4a7.js (493 bytes)

## Script Analysis
**App Methods**: `app.on()`
**Events Listened**: `update`

## Keywords (for Discord search)
adjust, around, axis, based, delta, elapsed, every, frame, loop, needed, object, radians, rotates, rotation, rotationSpeed, script, second, slowly, speed, time

## Script Source
```javascript
// =================================================================
// Slow Rotation Script
// This script rotates the object slowly around its Y-axis.
// =================================================================

// Rotation speed in radians per second (adjust as needed)
const rotationSpeed = 0.1;

// Update loop: Called every frame
app.on('update', delta => {
  // Increase the Y-axis rotation based on the elapsed time
  app.rotation.y += rotationSpeed * delta;
});

```

---
*Extracted from AlleySign.hyp. Attachment ID: 1341753324394774609*