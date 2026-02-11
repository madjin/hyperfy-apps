# anybox.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-03-27
- **Size**: 1,965,872 bytes

## Discord Context
> i've been using my "anybox" for logic-based apps. helps me keep things organised

## Blueprint
- **Name**: anybox
- **Version**: 0
- **Model**: `asset://061441245bc357746fed83fb2942a938cdc55514aedd5ea0abf8d0698fe6bfaf.glb`
- **Script**: `asset://d2dc1493bfd96133e0000c605b9360736b44d5a44735aa5dffb1beb948db2df4.js`

## Props
- `audio`: audio → `asset://e031a5df84dfd44d2f12eea01d7728930658a5024407fe2171dbba327634dd9b.mp3`

## Assets
- `[model]` 061441245bc357746fed83fb2942a938cdc55514aedd5ea0abf8d0698fe6bfaf.glb (7,352 bytes)
- `[script]` d2dc1493bfd96133e0000c605b9360736b44d5a44735aa5dffb1beb948db2df4.js (713 bytes)
- `[audio]` e031a5df84dfd44d2f12eea01d7728930658a5024407fe2171dbba327634dd9b.mp3 (1,956,875 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`
**World Methods**: `world.add()`
**Nodes Created**: `audio`, `ui`, `uitext`

## Keywords (for Discord search)
alignItems, audio, center, color, configure, create, file, group, height, justifyContent, kind, label, loop, music, play, position, props, spatial, text, textAlign

## Script Source
```javascript
app.configure([
  {
    key: 'audio',
    type: 'file',
    kind: 'audio',
    label: 'Audio',
  }
])

const src = props.audio?.url

if (src) {
  const audio = app.create('audio', {
    src,
    loop: true,
    group: 'music',
    spatial: false,
    volume: 0.1
  })
  world.add(audio)
  audio.play()
}


// =======================================
// Box & Label
const LABEL = 'Background Audio'
const $ui = app.create('ui', {
  height: 50,
  alignItems: 'center',
  justifyContent: 'center',
})
$ui.position.y = 1.3
const $text = app.create('uitext', {
  value: LABEL || 'No Label',
  textAlign: 'center',
  color: 'white'
})
$ui.add($text)
app.add($ui)
// =======================================















```

---
*Extracted from anybox.hyp. Attachment ID: 1354967081073905674*