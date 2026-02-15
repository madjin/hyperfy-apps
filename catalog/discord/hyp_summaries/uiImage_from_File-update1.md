# uiImage_from_File-update1.hyp

## Metadata
- **Author**: 0mka
- **Channel**: #🎨│showcase
- **Date**: 2025-03-13
- **Size**: 70,692 bytes

## Discord Context
> slight update.  Larger range in ui width/height and image width/height. UI.position updated to 'number' field from 'text' to avoid accidental characters crashing the hyp.

More cleaning soon.

## Blueprint
- **Name**: uiImage from File
- **Version**: 115
- **Model**: `asset://801df4da3026c50ae757195f49244d7b1c68b4860d3b816f5b5ae2a54b5bcc69.glb`
- **Script**: `asset://c5258dc0329bcdbaeba99c7a0eba4ba542ecc32da55c24155c89137edd8f7858.js`

## Props
- `showLabel`: str = `open`
- `closeLabel`: str = `close`
- `displayText`: str = `hello there`
- `displayTextSize`: int = `29`
- `uiWidth`: int = `1742`
- `uiHeight`: int = `2003`
- `billboardMode`: str = `enabled`
- `bgAlpha`: int = `255`
- `textRed`: int = `0`
- `textGreen`: int = `255`
- `textBlue`: int = `255`
- `bgRed`: int = `53`
- `bgGreen`: int = `81`
- `bgBlue`: int = `128`
- `bgHex`: str = `#D90479`
- `textHex`: str = `#2975D9`
- `bgColorSwitch`: str = `#D90479`
- `bgViewColorSwitch`: str = `#0D0D0D`
- `textColorSwitch`: str = `#2975D9`
- `mainColorSwitch`: str = `#D90479`
- `innerColorSwitch`: str = `#8E37A6`
- `textColorDropdown`: str = `#8E75A6`
- `mainColorDropdown`: str = `#8E75A6`
- `innerColorDropdown`: str = `#0D0D0D`
- `imageSrc`: str = `https://plus.unsplash.com/premium_photo-1739198794291-4fdbeb386729?q=80&w=1635&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`
- `imageWidth`: int = `1813`
- `imageHeight`: int = `1809`
- `imageObjectFit`: str = `contain`
- `imageBackgroundColor`: str = `#FFFFFF`
- `imageFit`: str = `cover`
- `uiX`: str = `0`
- `uiY`: str = `1`
- `uiZ`: str = `0`
- `imageAlpha`: int = `100`
- `imageFile`: texture → `asset://2750547848e9f809bf4b6b3f6dc8010cc1673cca5ac49b5db8c95559ad81105d.webp`
- `uiX2`: int = `3`
- `uiY2`: int = `3`
- `uiZ2`: str = `1`
- `uiZ3`: float = `-0.5`
- `uiY3`: int = `3`
- `uiX3`: int = `9`

## Assets
- `[model]` 801df4da3026c50ae757195f49244d7b1c68b4860d3b816f5b5ae2a54b5bcc69.glb (30,328 bytes)
- `[script]` c5258dc0329bcdbaeba99c7a0eba4ba542ecc32da55c24155c89137edd8f7858.js (2,296 bytes)
- `[texture]` 2750547848e9f809bf4b6b3f6dc8010cc1673cca5ac49b5db8c95559ad81105d.webp (36,172 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`
**Nodes Created**: `ui`, `uiimage`, `uiview`

## Keywords (for Discord search)
asset, assets, borderRadius, bottom, center, configure, contain, cover, create, down, dropdown, file, fill, height, image, imageFile, imageFit, imageHeight, imageWidth, initial

## Script Source
```javascript
app.configure([
  {
    type: 'section',
    key: 'uiDimensionsSection',
    label: 'UI Dimensions'
  },
  {
    type: 'range',
    key: 'uiWidth',
    label: 'UI Width',
    min: 100,
    max: 4800,
    step: 1,
    initial: 200
  },
  {
    type: 'range',
    key: 'uiHeight',
    label: 'UIHeight',
    min: 100,
    max: 2700,
    step: 1,
    initial: 150
  },
  {
    type: 'section',
    key: 'uiPositionSection',
    label: 'UI Position'
  },
  {
    type: 'number',
    key: 'uiX3',
    label: 'X Position',
     min: -6,
    max: 50,
    dp: 2,
    initial: 0
  },
  {
    type: 'number',
    key: 'uiY3',
    label: 'Y Position',
    min: -6,
    max: 50,
    dp: 2,
    initial: 0
  },
  {
    type: 'number',
    key: 'uiZ3',
    label: 'Z Position',
    min: -6,
    max: 50,
    dp: 2,
    initial: 0
  },
  {
    type: 'section',
    key: 'uiImageSection',
    label: 'UIImage'
  },
  {
    type: 'file',
    key: 'imageFile',
    label: 'Image File',
    kind: 'texture'  
  },
  {
    type: 'range',
    key: 'imageWidth',
    label: 'ImageWidth',
    min: 50,
    max: 4800,
    step: 1,
    initial: 100
  },
  {
    type: 'range',
    key: 'imageHeight',
    label: 'ImageHeight',
    min: 50,
    max: 2700,
    step: 1,
    initial: 100
  },
  {
    type: 'dropdown',
    key: 'imageFit',
    label: 'ImageFit',
    options: [
      { label: 'Contain', value: 'contain' },
      { label: 'Cover', value: 'cover' },
      { label: 'Fill', value: 'fill' },
      { label: 'None', value: 'none' },
      { label: 'ScaleDown', value: 'scale-down' }
    ],
    initial: 'contain'
  },
]);

const ui = app.create('ui');
app.add(ui);

ui.width = props.uiWidth;
ui.height = props.uiHeight;
ui.pivot = 'bottom-center';
ui.lit = true;
ui.borderRadius = 10;
ui.padding = 20;

// Set the position
ui.position.set(props.uiX3, props.uiY3, props.uiZ3);

const view = app.create('uiview');
view.padding = 20;
view.borderRadius = 8;
ui.add(view);

const image = app.create('uiimage');
image.src = props.imageFile?.url.replace('asset://', '/assets/');
image.width = props.imageWidth;
image.height = props.imageHeight;
image.objectFit = props.imageFit;
view.add(image);
```

---
*Extracted from uiImage_from_File-update1.hyp. Attachment ID: 1349800653823938640*