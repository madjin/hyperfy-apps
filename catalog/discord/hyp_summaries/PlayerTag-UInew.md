# PlayerTag-UInew.hyp

## Metadata
- **Author**: ~/drdoge.eth
- **Channel**: #💻│developers
- **Date**: 2025-03-30
- **Size**: 1,037,235 bytes

## Blueprint
- **Name**: PlayerTag-UInew
- **Version**: 558
- **Model**: `asset://b619d3860e27516dc6945757467ad18b32e6f10517e8fd90a10695e20b590b3f.glb`
- **Script**: `asset://07922de886e08707003474987d15365b670dbdd1ebc94bce8ca34d7977dc397b.js`

## Props
- `uiWidth`: int = `150`
- `uiHeight`: int = `0`
- `heightOffset`: int = `0`
- `subText`: str = `Legen`
- `buttonColor`: str = `#FF0000`
- `showOverheadUI`: bool = `True`
- `dynamicDisplay`: bool = `True`
- `displayText`: str = `WASTELANDER`
- `textColor`: str = `#00ffaa`
- `uiBgColor`: str = `rgba(0, 0, 0, 0.4)`
- `showBadge`: bool = `False`
- `badgeIcon`: str = `★`
- `badgeColor`: str = `#ffaa00`
- `showSubtext`: bool = `False`
- `subtextColor`: str = `#ffffff`
- `healthSize`: int = `5`
- `customText1`: str = `LVL 100  `
- `showCustomText1`: bool = `True`
- `customText2`: str = `LURKER`
- `showCustomText2`: bool = `True`
- `showBadges`: bool = `True`
- `badge1Icon`: str = `⚔️`
- `badge1Enabled`: bool = `False`
- `nameSize`: int = `6`
- `customTextSize`: int = `8`
- `tagWidth`: int = `100`
- `tagHeight`: int = `75`
- `badge1Color`: str = `raiders`
- `nameColor`: str = `legendary`
- `customText1Color`: str = `railroad`
- `customText2Color`: str = `legendary`
- `borderGlowColor`: str = `radiated`
- `borderGlowEnabled`: bool = `False`
- `nameGlowEnabled`: bool = `False`
- `nameGlowColor`: str = ``
- `glowStrength`: int = `30`
- `animateNameText`: bool = `True`
- `animateGlow`: bool = `False`
- `badgeGlowEnabled`: bool = `True`
- `badge2Enabled`: bool = `False`
- `tagBorderRadius`: int = `0`
- `customTextGlowEnabled`: bool = `False`
- `animationIntensity`: int = `0`
- `tagBackground`: str = `rgba(0, 0, 0, 0.5)`
- `customOpacityEnabled`: bool = `True`
- `backgroundOpacity`: int = `0`
- `badge2Icon`: str = `🛡️`
- `badge2Color`: str = `enclave`
- `badge3Enabled`: bool = `True`
- `badge3Icon`: str = `⚜️`
- `badge3Color`: str = `raiders`
- `enableUIToggle`: bool = `True`
- `toggleKey`: str = `z`
- `showUIByDefault`: bool = `True`
- `showToggleMessage`: bool = `True`

## Assets
- `[model]` b619d3860e27516dc6945757467ad18b32e6f10517e8fd90a10695e20b590b3f.glb (989,568 bytes)
- `[script]` 07922de886e08707003474987d15365b670dbdd1ebc94bce8ca34d7977dc397b.js (45,737 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.on()`, `app.remove()`
**World Methods**: `world.add()`, `world.getPlayer()`, `world.on()`, `world.remove()`
**Events Listened**: `input`, `keydown`, `update`
**Nodes Created**: `anchor`, `audio`, `ui`, `uitext`

## Keywords (for Discord search)
aaaaaa, above, action, active, actual, addTextGlow, addicted, after, agility, alignItems, ally, already, also, always, ammo, amount, anchor, animType, animateFlicker, animateGlow

## Script Source
```javascript
if (world.isClient) {
    // Track UI visibility state
    let uiVisible = true
    
    // Preset color palette with Fallout-themed colors
    const colorPresets = {
        // Core UI colors
        'vaultTecBlue': '#0078C1',
        'pipBoyGreen': '#1ED760',
        'radAway': '#FF9D00',
        'nukaCola': '#FF0000',
        'powerArmor': '#43464B',
        'radiated': '#BEFF00',
        'legendary': '#FFC107',
        
        // Faction colors
        'brotherhood': '#C1704D',
        'enclave': '#000080',
        'minutemen': '#3498DB',
        'institute': '#7CB9E8',
        'railroad': '#F34723',
        'raiders': '#BB2525',
        
        // Status colors
        'healthFull': '#00FF7F',
        'healthMid': '#FFA500',
        'healthLow': '#FF3030',
        'rads': '#DDA0DD',
        'action': '#00BFFF',
        'sneak': '#FFD700'
    }
    
    // Fallout-themed badge icons collection
    const badgeIcons = {
        // Fallout Symbols
        'vault': '⚙️',           // Vault-Tec gear
        'nuka': '☢️',            // Nuka-Cola/radiation
        'caps': '💰',            // Bottlecaps
        'star': '★',             // Legendary
        'atom': '⚛️',            // Atom/nuclear
        
        // Status Icons
        'rad': '☢️',             // Radiation
        'health': '❤️',          // Health
        'armor': '🛡️',          // Armor/defense
        'critical': '✨',        // Critical hit
        'stimpak': '💉',         // Stimpak
        'radaway': '💊',         // RadAway
        
        // Faction Icons
        'bos': '⚔️',             // Brotherhood of Steel
        'minutemen': '🎯',       // Minutemen
        'railroad': '🔄',        // Railroad
        'institute': '🔬',       // The Institute
        'enclave': '🦅',         // Enclave
        'ncr': '🐻',             // NCR
        'legion': '⚜️',          // Caesar's Legion
        
        // S.P.E.C.I.A.L Attributes
        'strength': '💪',        // Strength
        'perception': '👁️',      // Perception
        'endurance': '🏃',       // Endurance
        'charisma': '🗣️',        // Charisma
        'intelligence': '🧠',    // Intelligence
        'agility': '🏇',         // Agility
        'luck': '🍀',            // Luck
        
        // Weapon Types
        'melee': '🔪',           // Melee
        'unarmed': '👊',         // Unarmed
        'pistol': '🔫',          // Pistol
        'rifle': '🦾',           // Rifle
        'heavy': '💥',           // Heavy Weapons
        'energy': '⚡',          // Energy Weapons
        'explosive': '💣',       // Explosives
        
        // Misc Gameplay
        'quest': '❗',           // Quest
        'hidden': '👁️‍🗨️',        // Hidden/Sneak
        'danger': '⚠️',          // Danger
        'ally': '🤝',            // Ally/Companion
        'enemy': '⚔️',           // Enemy
        'neutral': '⚖️',         // Neutral
        
        // Items & Resources
        'junk': '🧰',            // Junk
        'ammo': '🎯',            // Ammunition
        'food': '🍖',            // Food
        'water': '💧',           // Water
        'chems': '💊',           // Chems
        'bobblehead': '🎭',      // Bobblehead
        
        // Character States
        'stealth': '👤',         // Stealth
        'detected': '👁️',        // Detected
        'power': '⚡',           // Power Armor
        'crippled': '🩹',        // Crippled Limb
        'addicted': '🧪',        // Addiction
        'mutations': '🧬',       // Mutations
        
        // Karma/Reputation
        'goodKarma': '😇',       // Good Karma
        'badKarma': '😈',        // Bad Karma
        'neutral': '😐',         // Neutral Karma
        
        // Text Symbols (Fallout-esque)
        'warning': '⚠️',         // Warning
        'danger': '☠️',          // Danger/Death
        'secure': '🔒',          // Secure/Locked
        'unlock': '🔓',          // Unlocked
        'level': '⬆️',           // Level Up
        'perk': '🌟'             // Perk
    }
    
    // Helper to convert a preset name to actual color
    const getColor = (colorValue, defaultColor) => {
        if (!colorValue) return defaultColor
        
        // If it's a preset name, get the actual color
        if (colorPresets[colorValue]) {
            return colorPresets[colorValue]
        }
        
        // Otherwise, return the value as is (assuming it's a hex code or rgba)
        return colorValue
    }

    // Apply opacity to a color (hex or rgba)
    const applyOpacity = (color, opacity) => {
        if (!color) return 'rgba(0, 0, 0, ' + opacity + ')'
        
        // If already rgba, extract and replace opacity
        if (color.startsWith('rgba(')) {
            return color.replace(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/, 
                (match, r, g, b) => `rgba(${r}, ${g}, ${b}, ${opacity})`)
        }
        
        // Convert hex to rgba
        let hex = color
        if (colorPresets[color]) {
            hex = colorPresets[color]
        }
        
        // Remove # if present
        if (hex.startsWith('#')) {
            hex = hex.substring(1)
        }
        
        // Convert hex to rgb
        let r = parseInt(hex.substring(0, 2), 16)
        let g = parseInt(hex.substring(2, 4), 16)
        let b = parseInt(hex.substring(4, 6), 16)
        
        // Return rgba
        return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }

    // Create player tag UI (will be attached to player)
    const playerUI = app.create('ui')
    playerUI.width = app.props.tagWidth || 150
    playerUI.height = app.props.tagHeight || 80
    
    // Remove border radius to eliminate all borders
    playerUI.borderRadius = 0
    
    // Use direct hex or rgba string for background with transparency control
    try {
      // Check for custom background color first
      let bgColor = app.props.customTagColor && app.props.customTagColor.trim() !== '' 
          ? app.props.customTagColor 
          : app.props.tagBackground;
      
      // Apply custom opacity if enabled
      if (app.props.customOpacityEnabled && typeof app.props.backgroundOpacity === 'number') {
        bgColor = applyOpacity(bgColor, app.props.backgroundOpacity)
      }
      
      // Set the background color
      playerUI.backgroundColor = bgColor
    } catch (e) {
      // Fallback if there's an issue with the color format
      console.log('Background color error, using default:', e)
      playerUI.backgroundColor = 'rgba(0, 0, 0, 0.5)'
    }
    
    // Set border properties directly to none to ensure no borders
    if (!playerUI.style) playerUI.style = {}
    playerUI.style.border = 'none'
    playerUI.style.outline = 'none'
    
    // Rest of the padding and positioning
    playerUI.padding = 8
    playerUI.pivot = 'bottom-center'
    playerUI.billboard = 'full'
    playerUI.justifyContent = 'center'
    playerUI.alignItems = 'center'
    playerUI.gap = 4
    
    // Track elements for cleanup
    const elements = []
    
    // Animation data storage
    const animations = {
      time: 0,
      glowElements: [],
      textAnimElements: []
    }
    
    // Helper function to safely set colors
    const setElementColor = (element, colorValue, customColor, defaultColor) => {
      if (!element) return
      
      try {
        // Check for custom color first
        const finalColor = customColor && customColor.trim() !== '' 
            ? customColor 
            : colorValue
            
        // Handle direct hex codes or color strings, or presets
        element.color = getColor(finalColor, defaultColor)
      } catch (e) {
        console.log('Color error, using default')
        element.color = defaultColor
      }
    }
    
    // Helper to add text shadow (glow effect)
    c

// ... truncated ...
```

---
*Extracted from PlayerTag-UInew.hyp. Attachment ID: 1355704775940771850*