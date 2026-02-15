# EmotesR.hyp

## Metadata
- **Author**: 𝕽𝖔𝖚𝖘𝖙𝖆𝖓
- **Channel**: #⚡│general
- **Date**: 2025-11-18
- **Size**: 960,882 bytes

## Discord Context
> Yo yo. turn on custom avatars in the admin menu under that world icon. And add this hyp.

## Blueprint
- **Name**: Emotes
- **Version**: 29
- **Model**: `asset://c863a979871364ed16f93ce0b0bc86d6f127512f1792b53e56c62dcb1fb09ece.glb`
- **Script**: `asset://c4612c05a54beb92b7a7b576317a5ece571d5bbce937d04e588663c7a303aed4.js`

## Props
- `collision`: bool = `True`
- `emote0`: emote → `asset://083cee7ffd60b49774a01d1805e0264ff3901116952baee0d0528ef6fcee06de.glb`
- `label0`: str = `ThaRoof`
- `emote1`: emote → `asset://74efa7754335339bb34009e1e2913b26863bcfb9070aaa0a494fdb85f93d0a84.glb`
- `label1`: str = `Snake`
- `label2`: str = `Belly`
- `emote2`: emote → `asset://c4456436adb223a4642b565c42ba5bf2f5571a2ef9ec8d75d9a60258227c9f0f.glb`
- `label3`: str = `Headbob`
- `emote3`: emote → `asset://bee0c7a079ef5095c94927e98bd0ec758d884c401db2d65dd6d898f37e399e0e.glb`
- `emote4`: emote → `asset://e2e8fd9c8a1f848fcb905bbcdd38eda2e1ee5fe24819de61d7999562c0796e94.glb`
- `label4`: str = `Hip Hop`
- `emote5`: emote → `asset://6ca7ea3661361d0eb8fe26cf2ec6981bb019c80b9dd7bee1b3f7efab273f84b5.glb`
- `label5`: str = `Gagnam`
- `icon0`: NoneType = `None`
- `icon`: image → `asset://6dbc2b4f46bc0c5ae96a2e9548fa27f8b5c700ec02b7b961135c88727da78bba.png`
- `gaze0`: bool = `True`
- `gaze2`: bool = `False`
- `gaze3`: bool = `True`
- `gaze4`: bool = `True`
- `gaze5`: bool = `False`
- `hide`: bool = `False`

## Assets
- `[model]` c863a979871364ed16f93ce0b0bc86d6f127512f1792b53e56c62dcb1fb09ece.glb (7,416 bytes)
- `[script]` c4612c05a54beb92b7a7b576317a5ece571d5bbce937d04e588663c7a303aed4.js (4,610 bytes)
- `[texture]` 39ad1b405cbf41a90825dadf0b554f3c3baba634636bb94a1057dd8ec0784c86.png (2,777 bytes)
- `[emote]` 083cee7ffd60b49774a01d1805e0264ff3901116952baee0d0528ef6fcee06de.glb (80,312 bytes)
- `[emote]` 74efa7754335339bb34009e1e2913b26863bcfb9070aaa0a494fdb85f93d0a84.glb (170,508 bytes)
- `[emote]` c4456436adb223a4642b565c42ba5bf2f5571a2ef9ec8d75d9a60258227c9f0f.glb (252,984 bytes)
- `[emote]` bee0c7a079ef5095c94927e98bd0ec758d884c401db2d65dd6d898f37e399e0e.glb (74,968 bytes)
- `[emote]` e2e8fd9c8a1f848fcb905bbcdd38eda2e1ee5fe24819de61d7999562c0796e94.glb (198,960 bytes)
- `[emote]` 6ca7ea3661361d0eb8fe26cf2ec6981bb019c80b9dd7bee1b3f7efab273f84b5.glb (162,848 bytes)
- `[image]` 6dbc2b4f46bc0c5ae96a2e9548fa27f8b5c700ec02b7b961135c88727da78bba.png (2,384 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.control()`, `app.create()`, `app.get()`, `app.off()`, `app.on()`, `app.remove()`
**World Methods**: `world.getPlayer()`
**Events Listened**: `update`
**Nodes Created**: `ui`, `uiimage`, `uitext`, `uiview`

## Keywords (for Discord search)
absolute, again, alignItems, angle, applyEffect, available, backgroundColor, bind, block, borderRadius, bottom, btnSize, btns, cancellable, center, centerX, centerY, circle, close, color

## Script Source
```javascript
const NUM_EMOTES = 6

const fields = [
  {
    key: 'icon',
    type: 'image',
    label: 'Button Icon',
    // hidden: true,
  },
  {
    key: 'hide',
    type: 'toggle',
    label: 'Hide',
  }
]

for (let i = 0; i < NUM_EMOTES; i++) {
  fields.push({
    key: `section${i}`,
    type: 'section',
    label: `Emote`
  })
  fields.push({
    key: `emote${i}`,
    type: 'emote',
    label: `File`
  })
  fields.push({
    key: `label${i}`,
    type: 'text',
    label: `Label`
  })
  fields.push({
    key: `icon${i}`,
    type: 'image',
    label: `Icon`
  })
  fields.push({
    key: `gaze${i}`,
    type: 'toggle',
    label: `Gaze`
  })
}

app.configure(fields)

if (config.hide) {
  const block = app.get('Block')
  app.remove(block)
}

const btn = app.create('ui', {
  space: 'screen',
  width: 50,
  height: 50,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  borderRadius: 25,
  pivot: 'bottom-right',
  position: [1, 1],
  offset: [-30, -120],
  cursor: 'pointer',
  onPointerDown: toggle,
  alignItems: 'center',
  justifyContent: 'center',
})
const icon = app.create('uiimage', {
  width: 20,
  height: 20,
  src: config.icon?.url,
})
btn.add(icon)
const hotkey = app.create('uitext', {
  value: 'B', // CHANGED from 'G'
  absolute: true,
  bottom: 10,
  right: 10,
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: 10,
  fontWeight: 500,
})
// todo: only add if not touch device
// btn.add(hotkey)
app.add(btn)

let close
let control

if (world.isClient) {
  control = app.control()
  control.keyB.onPress = toggle // CHANGED from keyG
}

function toggle() {
  close ? close() : open()
}

function open() {
  const player = world.getPlayer()
  const uiSize = 330
  const btnSize = 70
  const radius = (uiSize / 2) - (btnSize / 2)
  const centerX = uiSize / 2
  const centerY = uiSize / 2
  // create container
  const ui = app.create('ui', {
    space: 'screen',
    width: uiSize,
    height: uiSize,
    pivot: 'center',
    position: [0.5, 0.5],
    // backgroundColor: 'red',
  })
  app.add(ui)
  // gather available (configured) emotes
  const btns = []
  for (let i = 0; i < NUM_EMOTES; i++) {
    const num = i + 1
    const labelStr = config[`label${i}`] || ''
    const iconUrl = config[`icon${i}`]?.url
    let emoteUrl = config[`emote${i}`]?.url
    const gaze = config[`gaze${i}`]
    if (gaze) emoteUrl += `?g=1`
    if (emoteUrl) {
      const exec = () => {
        player.applyEffect({ emote: emoteUrl, cancellable: true })
        close(true)
      }
      const btn = app.create('uiview', {
        width: btnSize,
        height: btnSize,
        backgroundColor: 'rgba(11, 10, 21, 0.9)',
        borderRadius: 15,
        absolute: true,
        top: 0,
        left: 0,
        cursor: 'pointer',
        onPointerDown: exec,
        flexDirection: 'column',
        alignItems: 'stretch',
      })
      if (iconUrl) {
        const icon = app.create('uiimage', {
          src: iconUrl,
          width: btnSize,
          height: btnSize,
        })
        btn.add(icon)
      } else {
        const outer = app.create('uiview', {
          height: btnSize,
          width: btnSize,
          justifyContent: 'center'
        })
        btn.add(outer)
        const label = app.create('uitext', {
          value: labelStr || 'Unknown',
          color: 'white',
          fontSize: 14,
          fontWeight: 500,
          lineHeight: 1.6,
          textAlign: 'center',
        })
        outer.add(label)
      }
      const hotkey = app.create('uitext', {
        absolute: true,
        top: 8,
        left: 8,
        value: num,
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 10,
        fontWeight: 500,
      })
      btn.add(hotkey)
      btns.push(btn)
      // bind key
      control[`digit${num}`].onPress = exec
    }
  }
  // distribute btns in a perfect circle
  for (let i = 0; i < btns.length; i++) {
    const btn = btns[i]
    const angle = (i / btns.length) * 2 * Math.PI - Math.PI / 2
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    btn.left = x - (btnSize / 2)
    btn.top = y - (btnSize / 2)
    ui.add(btn)
  }
  // unlock pointer
  control.pointer.unlock()
  // when pointer locks again, close
  const update = () => {
    if (control.pointer.locked) {
      close()
    }
  }
  app.on('update', update)
  // bind close
  close = (lockPointer) => {
    app.off('update', update)
    app.remove(ui)
    for (let i = 0; i < btns.length; i++) {
      const num = i + 1
      control[`digit${num}`].onPress = null
    }
    if (lockPointer) control.pointer.lock()
    close = null
  }
}

```

---
*Extracted from EmotesR.hyp. Attachment ID: 1440465428228079616*