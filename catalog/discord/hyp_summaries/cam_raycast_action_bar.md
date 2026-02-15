# cam_raycast_action_bar.hyp

## Metadata
- **Author**: Saori
- **Channel**: #🎨│showcase
- **Date**: 2025-03-10
- **Size**: 192,165 bytes

## Blueprint
- **Name**: cam raycast action bar
- **Version**: 5
- **Model**: `asset://0649f80ad28a9f7204fe37096f25bbc7e818356723b8652f2ced4c761f713456.glb`
- **Script**: `asset://3a0b9112c90e41a310cacd91ecfe58b61d8f52613fee807ad865c90ad1b19945.js`

## Props
- `attack`: emote → `asset://9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb`
- `attack1`: emote → `asset://9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb`
- `attack2`: emote → `asset://9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb`
- `screen`: bool = `True`
- `screen1`: bool = `False`
- `screen2`: bool = `True`
- `screen3`: bool = `True`
- `screen4`: bool = `True`
- `screen5`: bool = `True`
- `text1`: str = `Hello 1`
- `text2`: str = `Hello 2`
- `text3`: str = `Hello 3`
- `text4`: str = `Hello 4`
- `text5`: str = `Hello 5`
- `message`: str = `T`
- `message2`: str = `=`
- `message3`: str = `<`
- `message4`: str = `d`
- `emoji`: str = `T`
- `emoji2`: str = `=`
- `emoji3`: str = `=`
- `emoji4`: str = `d`
- `emoji5`: str = `<T`
- `emoji6`: str = `<`
- `emoji7`: str = ``
- `emoji8`: str = `=`
- `emojiTLa`: str = `P`
- `emoji1-1`: str = `P`
- `emojia1`: str = ``
- `emojib2`: str = `<`
- `emojib1`: str = `<P`
- `emojibl1`: str = `<`
- `emojibc`: str = ``
- `emojibc1`: str = ``
- `emojibc2`: str = ``
- `emojiTL`: str = `>`
- `emojiTLb`: str = `<P`
- `emojiTL1`: str = `P`
- `emojiTL2`: str = `<`
- `emojiBL0`: str = `=`
- `emojiBL1`: str = `<`
- `emojiBR0`: str = `=`
- `emojiTR0`: str = `d`
- `emojiTC0`: str = `<T`
- `emojiBC0`: str = ``
- `emojiBC1`: str = `=`
- `emojiBC2`: str = `=`
- `emojiL`: str = ``
- `emojiR`: str = `=`
- `emojiTCL`: str = `=%`
- `emojiTCR`: str = `=%`
- `emojiTRL`: str = `d`
- `emojiTRD`: str = `d`
- `emojiRD`: str = `=`
- `emojiRU`: str = `=`
- `emojiBRT`: str = `=`
- `emojiBRL`: str = `=`
- `emojiLT`: str = ``
- `emojiLB`: str = ``
- `emojiTCL2`: str = `=%`
- `emojiTCR2`: str = `=%`
- `emojiTRL1`: str = `d`
- `emojiTRL2`: str = `d`
- `emojiBRL2`: str = `=`
- `emojiBRT2`: str = `=`
- `emojiTL3`: str = `<`
- `emojiBL2`: str = `<`
- `emojiBL3`: str = `<`
- `emojiBC3`: str = `=`
- `emojiTRL3`: str = `d`
- `emojiTRL4`: str = `d`
- `emojiRUp`: str = `=`
- `emojiRUp2`: str = `=`
- `emojiRUp3`: str = `=`
- `b1`: str = `🤍`
- `b2`: str = `❤️`
- `b3`: str = `❤️`
- `b4`: str = `❤️`
- `b5`: str = `❤️`
- `b6`: str = `❤️`
- `br2`: str = `❤️`
- `br1`: str = `❤️`
- `br3`: str = `❤️`
- `br4`: str = `❤️`
- `br5`: str = `❤️`
- `b7`: str = `❤️`

## Assets
- `[model]` 0649f80ad28a9f7204fe37096f25bbc7e818356723b8652f2ced4c761f713456.glb (2,008 bytes)
- `[script]` 3a0b9112c90e41a310cacd91ecfe58b61d8f52613fee807ad865c90ad1b19945.js (4,659 bytes)
- `[emote]` 9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb (60,912 bytes)
- `[emote]` 9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb (60,912 bytes)
- `[emote]` 9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb (60,912 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.control()`, `app.create()`, `app.emit()`, `app.on()`, `app.send()`
**World Methods**: `world.getPlayer()`
**Events Listened**: `raybeam`
**Events Emitted**: `raybeam`
**Nodes Created**: `ui`, `uiimage`, `uitext`, `uiview`

## Keywords (for Discord search)
actionBar, activeColor, applyQuaternion, backgroundColor, bold, bonePosition, borderColor, borderRadius, borderWidth, bottom, camDirection, camPos, camQuat, camera, center, chest, color, control, controls, copy

## Script Source
```javascript
if (world.isClient) {
  const CONFIG = {
    actionBar: {
      width: 440,
      height: 56,
      backgroundColor: 'rgba(15, 15, 15, 0.75)',
      borderRadius: 8,
      padding: 8,
      gap: 6
    },
    slot: {
      size: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 6,
      hoverColor: 'rgba(255, 255, 255, 0.25)',
      activeColor: 'rgba(255, 255, 255, 0.4)'
    },
    keybind: {
      fontSize: 12,
      fontWeight: 'bold',
      color: 'rgba(255, 255, 255, 0.9)'
    }
  };

  const slotIcons = [
    'https://wow.zamimg.com/images/wow/icons/large/spell_animarevendreth_beam.jpg',
    'https://wow.zamimg.com/images/wow/icons/large/ability_ardenweald_mage.jpg',
    'https://wow.zamimg.com/images/wow/icons/large/spell_nature_naturetouchgrow.jpg',
    'https://wow.zamimg.com/images/wow/icons/large/ability_bastion_warrior.jpg',
    'https://wow.zamimg.com/images/wow/icons/large/ability_maldraxxus_shaman.jpg',
    'https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg',
    'https://wow.zamimg.com/images/wow/icons/large/spell_shadow_shadowfury.jpg',
    'https://wow.zamimg.com/images/wow/icons/large/spell_fire_flamebolt.jpg',
    'https://wow.zamimg.com/images/wow/icons/large/spell_frost_frostbolt02.jpg',
    'https://wow.zamimg.com/images/wow/icons/large/spell_holy_holybolt.jpg'
  ];

  const keybinds = ['Q', 'E', 'F', 'G', 'C', 'R', 'V', 'X', 'Z', 'T'];
  const slots = [];

  const actionBar = app.create('ui', {
    width: CONFIG.actionBar.width,
    height: CONFIG.actionBar.height,
    position: [0.5, 1, 0],
    offset: [0, -20, 0],
    space: 'screen',
    pivot: 'bottom-center',
    backgroundColor: CONFIG.actionBar.backgroundColor,
    borderRadius: CONFIG.actionBar.borderRadius,
    padding: CONFIG.actionBar.padding,
    flexDirection: 'row',
    gap: CONFIG.actionBar.gap,
    justifyContent: 'center',
    pointerEvents: true,
  });

  for (let i = 0; i < 10; i++) {
    const slot = app.create('uiview', {
      width: CONFIG.slot.size,
      height: CONFIG.slot.size,
      backgroundColor: CONFIG.slot.backgroundColor,
      borderWidth: CONFIG.slot.borderWidth,
      borderColor: CONFIG.slot.borderColor,
      borderRadius: CONFIG.slot.borderRadius,
      pointerEvents: true,
    });

    const keybindText = app.create('uitext', {
      value: keybinds[i],
      color: CONFIG.keybind.color,
      fontSize: CONFIG.keybind.fontSize,
      fontWeight: CONFIG.keybind.fontWeight,
      position: [0.9, 0.1, 0],
      pivot: 'top-right',
      width: 16,
      height: 16
    });

    const icon = app.create('uiimage', {
      src: slotIcons[i],
      objectFit: 'cover',
      backgroundColor: '#666666',
      borderWidth: 1,
    })

    const iconOverlay = app.create('uiview', {
      
    })
    
    slot.onPointerEnter = () => {
      if (slot.backgroundColor !== CONFIG.slot.activeColor) {
        slot.backgroundColor = CONFIG.slot.hoverColor;
      }
    };
    
    slot.onPointerLeave = () => {
      if (slot.backgroundColor !== CONFIG.slot.activeColor) {
        slot.backgroundColor = CONFIG.slot.backgroundColor;
      }
    };
    
    slot.onPointerDown = () => {
      slot.backgroundColor = CONFIG.slot.activeColor;
    };
    
    slot.onPointerUp = () => {
      slot.backgroundColor = CONFIG.slot.hoverColor;
    };
    
    slot.add(icon)
    slot.add(keybindText);
    actionBar.add(slot);
    slots.push(slot);
  }

  app.add(actionBar);

  const controls = app.control();

  for (let i = 0; i < keybinds.length; i++) {
    const key = keybinds[i];
    const slot = slots[i];
    
    controls[`key${key}`].onPress = () => {
      slot.backgroundColor = CONFIG.slot.activeColor;
    };
    
    controls[`key${key}`].onRelease = () => {
      slot.backgroundColor = CONFIG.slot.backgroundColor;
      switch(key) {
        case 'Q':
        raybeam()
          break;
        case 'E':
          break;
      }
    };
  }

  const raybeam = () => {
    const {quaternion: camQuat, position: camPos} = controls.camera
    const forward = new Vector3(0, 0, -1)
    const camDirection = new Vector3().copy(forward).applyQuaternion(camQuat)
    const matrix = world.getPlayer().getBoneTransform('chest')
    // const bonePosition = new Vector3().setFromMatrixPosition(matrix)
    app.send('raybeam', {
      bonePosition: camPos.toArray(),
      camDirection: camDirection.toArray(),
    })
  }
}

if (world.isServer) {
  app.on('raybeam', ({camDirection, bonePosition}) => {
    app.emit('raybeam', {
      direction: camDirection,
      origin: bonePosition
    })
  })
}
```

---
*Extracted from cam_raycast_action_bar.hyp. Attachment ID: 1348748294326583316*