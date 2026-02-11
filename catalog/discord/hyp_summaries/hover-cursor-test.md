# hover-cursor-test.hyp

## Metadata
- **Author**: Gert-Jan Akerboom
- **Channel**: #🎨│showcase
- **Date**: 2025-08-06
- **Size**: 2,035,013 bytes

## Discord Context
> cursor change when hover over mesh

## Blueprint
- **Name**: hover-cursor-test
- **Version**: 10
- **Model**: `asset://565023acc4c3c5854248d57d7ec1465e311e3f440086140af746d5f3dc99ad2a.glb`
- **Script**: `asset://c53fd2a3d0555d03b4d2899de8b5996c6359091da3da7eff5aa663b6d61de618.js`

## Assets
- `[model]` 565023acc4c3c5854248d57d7ec1465e311e3f440086140af746d5f3dc99ad2a.glb (2,033,620 bytes)
- `[script]` c53fd2a3d0555d03b4d2899de8b5996c6359091da3da7eff5aa663b6d61de618.js (605 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.create()`, `app.get()`
**Nodes Created**: `ui`

## Keywords (for Discord search)
active, backgroundColor, border, borderColor, borderRadius, borderWidth, center, circle, create, cube, cursor, fake, fakeCursor, ffffff, height, hidden, just, mesh, onPointerEnter, onPointerLeave

## Script Source
```javascript

// Create a white circle with just a border as a fake cursor
const fakeCursor = app.create('ui', {
  width: 20,
  height: 20,
  position: [0.5, 0.5, 0],
  space: 'screen',
  pivot: 'center',
  backgroundColor: 'transparent',
  borderWidth: 2,
  borderColor: '#ffffff',
  borderRadius: 10,
  pointerEvents: false,
  active: false // Start hidden
});

app.add(fakeCursor);

// Get the Cube mesh
const cube = app.get('Cube');
if (cube) {
  cube.onPointerEnter = () => {
    fakeCursor.active = true;
  };
  
  cube.onPointerLeave = () => {
    fakeCursor.active = false;
  };
}

```

---
*Extracted from hover-cursor-test.hyp. Attachment ID: 1402653678653014189*