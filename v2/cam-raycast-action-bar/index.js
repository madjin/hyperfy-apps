export default function main(world, app, fetch, props, setTimeout) {
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
}
