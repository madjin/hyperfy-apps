export default function main(world, app, fetch, props, setTimeout) {
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
    const addTextGlow = (element, glowColor, glowStrength) => {
      if (!element) return
      
      try {
        // Make sure the element has a style object
        if (!element.style) element.style = {}
        
        // Get the original color to preserve it for animation
        const originalColor = element.color || '#ffffff'
        
        // Convert original color to usable format if it's a preset
        const originalHexColor = getColor(originalColor, '#ffffff')
        
        // For emissive glow, we'll make the text itself brighter
        const strength = Math.max(glowStrength || 5, 3) // Ensure minimum strength
        
        // Calculate a brightened version of the text color
        let r = parseInt(originalHexColor.substring(1, 3), 16)
        let g = parseInt(originalHexColor.substring(3, 5), 16)
        let b = parseInt(originalHexColor.substring(5, 7), 16)
        
        // Boost each color channel toward 255 (white) based on strength
        // But also boost the dominant color channels more to preserve/intensify hue
        const boost = Math.min(strength * 20, 200) // Cap at reasonable amount
        
        // Find the dominant color channel (highest value)
        const max = Math.max(r, g, b)
        
        // Boost each channel, but boost dominant channels more to intensify the hue
        r = Math.min(255, r + boost * (r / max))
        g = Math.min(255, g + boost * (g / max))
        b = Math.min(255, b + boost * (b / max))
        
        // Convert back to hex
        const brightColor = `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`
        
        // Set the text to the brighter color
        element.color = brightColor
        
        // Also add a shadow glow that enhances the hue even more
        const glowHexColor = getColor(glowColor, originalHexColor)
        element.style.textShadow = `0 0 ${strength * 2}px ${glowHexColor}`
        
        // Add to tracked glow elements if not already present
        if (app.props.animateGlow && !animations.glowElements.includes(element)) {
          animations.glowElements.push({
            element: element,
            originalColor: originalHexColor,
            brightColor: brightColor,
            glowColor: glowHexColor, 
            baseStrength: strength
          })
        }
      } catch (e) {
        console.log('Failed to add glow effect:', e)
      }
    }
    
    // Create badges if enabled
    if (app.props.showBadges) {
        // Create a simple row for badges using fixed positions
        const badgeRow = []
        
        // Badge 1
        if (app.props.badge1Enabled && app.props.badge1Icon) {
            const badge1 = app.create('uitext')
            badge1.value = app.props.badge1Icon
            badge1.fontSize = app.props.badgeSize || 16
            setElementColor(badge1, app.props.badge1Color, null, '#ffaa00')
            
            // Apply glow if enabled
            if (app.props.badgeGlowEnabled) {
              addTextGlow(badge1, app.props.badge1Color, app.props.glowStrength)
            }
            
            badgeRow.push(badge1)
            elements.push(badge1)
        }
        
        // Badge 2
        if (app.props.badge2Enabled && app.props.badge2Icon) {
            const badge2 = app.create('uitext')
            badge2.value = app.props.badge2Icon
            badge2.fontSize = app.props.badgeSize || 16
            setElementColor(badge2, app.props.badge2Color, null, '#00aaff')
            
            // Apply glow if enabled
            if (app.props.badgeGlowEnabled) {
              addTextGlow(badge2, app.props.badge2Color, app.props.glowStrength)
            }
            
            badgeRow.push(badge2)
            elements.push(badge2)
        }
        
        // Badge 3
        if (app.props.badge3Enabled && app.props.badge3Icon) {
            const badge3 = app.create('uitext')
            badge3.value = app.props.badge3Icon
            badge3.fontSize = app.props.badgeSize || 16
            setElementColor(badge3, app.props.badge3Color, null, '#ff00aa')
            
            // Apply glow if enabled
            if (app.props.badgeGlowEnabled) {
              addTextGlow(badge3, app.props.badge3Color, app.props.glowStrength)
            }
            
            badgeRow.push(badge3)
            elements.push(badge3)
        }
        
        // Position badges horizontally
        if (badgeRow.length > 0) {
            const totalWidth = badgeRow.length * 20
            const startX = -totalWidth / 2 + 10
            
            badgeRow.forEach((badge, index) => {
                badge.position.set(startX + (index * 20), 12, 0)
                playerUI.add(badge)
            })
        }
    }
    
    // Player name display
    const nameText = app.create('uitext')
    nameText.value = 'WASTELANDER'
    nameText.fontSize = app.props.nameSize || 18
    setElementColor(nameText, app.props.nameColor, app.props.customNameColor, '#ffffff')
    nameText.fontWeight = 'bold'
    nameText.position.set(0, 0, 0)
    playerUI.add(nameText)
    elements.push(nameText)
    
    // Apply name glow if enabled
    if (app.props.nameGlowEnabled) {
      // Use specific glow color if set, otherwise use name color
      const glowColor = (app.props.nameGlowColor && app.props.nameGlowColor.trim() !== '')
        ? app.props.nameGlowColor
        : app.props.nameColor;
      
      addTextGlow(nameText, glowColor, app.props.glowStrength)
    }
    
    // Add name to animated elements if enabled
    if (app.props.animateNameText) {
      animations.textAnimElements.push({
        element: nameText,
        baseSize: app.props.nameSize || 18,
        animType: app.props.nameAnimationType || 'pulse'
      })
    }
    
    // Custom text field 1 (if enabled)
    let customText1 = null
    if (app.props.showCustomText1) {
        customText1 = app.create('uitext')
        customText1.value = app.props.customText1 || 'VAULT DWELLER'
        customText1.fontSize = app.props.customTextSize || 14
        setElementColor(customText1, app.props.customText1Color, null, '#aaaaaa')
        customText1.position.set(0, -20, 0)
        playerUI.add(customText1)
        elements.push(customText1)
        
        // Apply glow if enabled
        if (app.props.customTextGlowEnabled) {
          addTextGlow(customText1, app.props.customText1Color, app.props.glowStrength)
        }
    }
    
    // Health text (if enabled)
    let healthText = null
    if (app.props.showHealth) {
        healthText = app.create('uitext')
        healthText.value = '♥ 100'
        healthText.fontSize = app.props.healthSize || 16
        setElementColor(healthText, app.props.healthColorHigh, null, '#00ffaa')
        healthText.position.set(0, customText1 ? -40 : -20, 0)
        playerUI.add(healthText)
        elements.push(healthText)
        
        // Apply glow if enabled
        if (app.props.healthGlowEnabled) {
          addTextGlow(healthText, app.props.healthColorHigh, app.props.glowStrength)
        }
        
        // Add to animated elements if enabled and not using critical pulse
        if (app.props.animateHealthText && app.props.criticalPulse === false) {
          animations.textAnimElements.push({
            element: healthText,
            baseSize: app.props.healthSize || 16,
            animType: app.props.healthAnimationType || 'pulse'
          })
        }
    }
    
    // Custom text field 2 (if enabled)
    let customText2 = null
    if (app.props.showCustomText2) {
        customText2 = app.create('uitext')
        customText2.value = app.props.customText2 || 'LEVEL 50'
        customText2.fontSize = app.props.customTextSize || 14
        setElementColor(customText2, app.props.customText2Color, null, '#aaaaaa')
        
        // Position based on what's already present
        let yPos = -20
        if (customText1) yPos -= 20
        if (healthText) yPos -= 20
        
        customText2.position.set(0, yPos, 0)
        playerUI.add(customText2)
        elements.push(customText2)
        
        // Apply glow if enabled
        if (app.props.customTextGlowEnabled) {
          addTextGlow(customText2, app.props.customText2Color, app.props.glowStrength)
        }
    }
    
    // Create anchor to follow player
    const uiAnchor = app.create('anchor')
    // Use .add() directly instead of nesting UI elements
    uiAnchor.add(playerUI)
    
    // Position the UI above the player's head
    const localPlayer = world.getPlayer()
    if (localPlayer) {
      uiAnchor.position.copy(localPlayer.position)
      uiAnchor.position.y += app.props.heightOffset || 2.0
      
      // Update player name based on actual player name if not using custom name
      if (!app.props.useCustomName) {
        nameText.value = localPlayer.name || 'WASTELANDER'
      } else {
        nameText.value = app.props.customName || 'WASTELANDER'
      }
    }
    
    // Add to world so it follows player
    world.add(uiAnchor)
    
    // Set initial visibility based on config
    uiAnchor.active = app.props.showUIByDefault !== false
    uiVisible = app.props.showUIByDefault !== false
    
    // Handle toggling UI visibility with keypress if enabled
    if (app.props.enableUIToggle) {
      // Track key state to prevent multiple toggles
      const keyState = {
        zPressed: false
      };
      
      // Key press handler for toggling UI
      app.on('input', (input) => {
        // Check for Z key specifically with improved detection
        const isZDown = input.current['z'] || input.current['Z'] || false;
        const wasZDown = keyState.zPressed;
        
        // Only toggle on the initial press (not while holding)
        if (isZDown && !wasZDown) {
          console.log('Z key pressed - toggling UI visibility');
          
          // Toggle UI visibility
          uiVisible = !uiVisible;
          uiAnchor.active = uiVisible;
          
          // Optional sound effect or notification
          if (app.props.playToggleSound) {
            // Play a "pip" sound like in Fallout when toggling UI
            const sound = app.create('audio');
            sound.spatial = false;
            sound.volume = 0.3;
            sound.src = app.props.toggleSoundUrl || 'https://cdn.glitch.global/0a376764-1bab-4dcd-8cb3-d7378a02d458/ui_pip.mp3';
            app.add(sound);
            sound.play();
            
            // Clean up sound after playing
            setTimeout(() => {
              app.remove(sound);
            }, 1000);
          }
          
          // Display toggle message if enabled
          if (app.props.showToggleMessage) {
            // Create temporary message
            const msgContainer = app.create('ui');
            msgContainer.width = 200;
            msgContainer.height = 40;
            msgContainer.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            msgContainer.borderRadius = 4;
            msgContainer.padding = 10;
            msgContainer.justifyContent = 'center';
            msgContainer.alignItems = 'center';
            msgContainer.position.set(0, -150, 0); // Position at bottom of screen
            
            const msgText = app.create('uitext');
            msgText.value = uiVisible ? 'PLAYER TAG: ON' : 'PLAYER TAG: OFF';
            msgText.color = uiVisible ? '#1ED760' : '#FF3030'; // Green if on, red if off
            msgText.fontSize = 16;
            
            msgContainer.add(msgText);
            app.add(msgContainer);
            
            // Remove after a short delay
            setTimeout(() => {
              app.remove(msgContainer);
            }, 2000);
          }
        }
        
        // Update key state
        keyState.zPressed = isZDown;
      });
      
      // Alternative detection method using world events
      world.on('keydown', (event) => {
        if ((event.key === 'z' || event.key === 'Z') && app.props.enableUIToggle) {
          console.log('Z key detected via keydown event');
          
          // Toggle UI visibility
          uiVisible = !uiVisible;
          uiAnchor.active = uiVisible;
          
          // We don't duplicate the sound/message here as the input handler should catch it
        }
      });
    }
    
    // Animation helper functions
    const animatePulse = (element, baseSize, time, intensity = 1) => {
      const pulseAmount = Math.sin(time * 3) * 0.15 * intensity
      element.fontSize = baseSize * (1 + pulseAmount)
    }
    
    const animateWave = (element, baseSize, time, index, intensity = 1) => {
      const waveOffset = index * 0.5
      const waveAmount = Math.sin(time * 2 + waveOffset) * 0.2 * intensity
      element.position.y += waveAmount * 3
    }
    
    const animateFlicker = (element, baseSize, time, intensity = 1) => {
      // Random flicker effect - less frequent with lower intensity
      if (Math.random() < 0.03 * intensity) {
        const flickerAmount = (Math.random() * 0.15 + 0.92) * intensity
        element.opacity = flickerAmount
      } else {
        element.opacity = 1.0
      }
    }
    
    // Update player UI position and data
    app.on('update', (dt) => {
      const player = world.getPlayer()
      if (player && uiAnchor) {
        // Only update position if the UI is visible
        if (uiVisible) {
          // Copy player position
          uiAnchor.position.copy(player.position)
          
          // Add height offset above player head
          uiAnchor.position.y += app.props.heightOffset || 2.0
          
          // Update animation time
          animations.time += dt
          
          // Apply animated glow if enabled
          if (app.props.animateGlow && animations.glowElements.length > 0) {
            // Calculate pulsing glow strength
            const time = animations.time
            const pulseValue = (Math.sin(time * 3) * 0.5 + 0.5) // 0 to 1 pulse value
            
            animations.glowElements.forEach(item => {
              if (!item.element) return
              
              // Get the base values
              const element = item.element
              const originalColor = item.originalColor
              const brightColor = item.brightColor
              const glowColor = item.glowColor
              const baseStrength = item.baseStrength
              
              // For emissive effect, we'll interpolate between original and bright color
              try {
                // Parse colors
                const origR = parseInt(originalColor.substring(1, 3), 16)
                const origG = parseInt(originalColor.substring(3, 5), 16)
                const origB = parseInt(originalColor.substring(5, 7), 16)
                
                const brightR = parseInt(brightColor.substring(1, 3), 16)
                const brightG = parseInt(brightColor.substring(3, 5), 16)
                const brightB = parseInt(brightColor.substring(5, 7), 16)
                
                // Interpolate between original and bright color based on pulse
                const r = Math.floor(origR + pulseValue * (brightR - origR))
                const g = Math.floor(origG + pulseValue * (brightG - origG))
                const b = Math.floor(origB + pulseValue * (brightB - origB))
                
                // Convert back to hex
                const pulseColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
                
                // Apply to text
                element.color = pulseColor
                
                // Adjust shadow glow as well
                if (element.style) {
                  const shadowStrength = baseStrength + (pulseValue * baseStrength)
                  element.style.textShadow = `0 0 ${shadowStrength * 2}px ${glowColor}`
                }
              } catch (e) {
                console.log('Animation error', e)
              }
            })
          }
          
          // Apply text animations
          if (animations.textAnimElements.length > 0) {
            animations.textAnimElements.forEach((item, index) => {
              const { element, baseSize, animType } = item
              if (!element) return
              
              // Apply the selected animation type
              switch (animType) {
                case 'pulse':
                  animatePulse(element, baseSize, animations.time, app.props.animationIntensity || 1)
                  break
                case 'wave':
                  animateWave(element, baseSize, animations.time, index, app.props.animationIntensity || 1)
                  break
                case 'flicker':
                  animateFlicker(element, baseSize, animations.time, app.props.animationIntensity || 1)
                  break
              }
            })
          }
          
          // Update health display if enabled
          if (healthText) {
            // Get current health (default to 100 if not available)
            const health = player.health || 100
            
            // Change color based on health level
            if (health > 70) {
              setElementColor(healthText, app.props.healthColorHigh, null, '#00ffaa')
              // Update glow color too if enabled
              if (app.props.healthGlowEnabled) {
                addTextGlow(healthText, app.props.healthColorHigh, app.props.glowStrength)
              }
            } else if (health > 30) {
              setElementColor(healthText, app.props.healthColorMedium, null, '#ffaa00')
              // Update glow color too if enabled
              if (app.props.healthGlowEnabled) {
                addTextGlow(healthText, app.props.healthColorMedium, app.props.glowStrength)
              }
            } else {
              setElementColor(healthText, app.props.healthColorLow, null, '#ff3300')
              // Update glow color too if enabled
              if (app.props.healthGlowEnabled) {
                addTextGlow(healthText, app.props.healthColorLow, app.props.glowStrength)
              }
              
              // Make text pulse when critical (if enabled)
              if (app.props.criticalPulse !== false) {
                const pulse = Math.sin(animations.time * 5) * 0.2 + 0.8
                healthText.fontSize = (app.props.healthSize || 16) + (pulse * 4)
              }
            }
            
            // Update the health text
            healthText.value = app.props.healthPrefix ? `${app.props.healthPrefix} ${Math.floor(health)}` : `♥ ${Math.floor(health)}`
          }
          
          // Optionally show/hide based on distance to camera (if configured)
          if (app.props.maxVisibleDistance && uiVisible) {
            const camera = world.camera
            if (camera) {
              const distance = camera.position.distanceTo(player.position)
              playerUI.active = distance <= app.props.maxVisibleDistance
            }
          }
        }
      }
    })
    
    // Store references for cleanup
    app._playerUIAnchor = uiAnchor
    app._playerUIElements = elements
}

// Cleanup function to remove UI when app is destroyed
app.cleanup = function() {
  if (world.isClient && app._playerUIAnchor) {
    // Remove anchor from world
    world.remove(app._playerUIAnchor)
    app._playerUIAnchor = null
    
    // Clear element references
    if (app._playerUIElements) {
      app._playerUIElements.length = 0
    }
  }
}

// Configuration options for the player tag
app.configure([
    {
        type: 'section',
        label: 'VAULT-TEC NAMEPLATE SYSTEM'
    },
    {
        type: 'section',
        label: 'UI Controls'
    },
    {
        key: 'showUIByDefault',
        type: 'switch',
        label: 'Show UI by Default',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: true
    },
    {
        key: 'enableUIToggle',
        type: 'switch',
        label: 'Enable Toggle Hotkey',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: true
    },
    {
        key: 'toggleKey',
        type: 'switch',
        label: 'Toggle Key',
        options: [
            { value: 'z', label: 'Z Key (matches Hyperfy UI)' },
            { value: 'h', label: 'H Key' },
            { value: 'n', label: 'N Key' },
            { value: 'p', label: 'P Key' }
        ],
        value: 'z'
    },
    {
        key: 'showToggleMessage',
        type: 'switch',
        label: 'Show Toggle Message',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: true
    },
    {
        key: 'playToggleSound',
        type: 'switch',
        label: 'Play Toggle Sound',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: true
    },
    {
        type: 'section',
        label: 'Tag Appearance'
    },
    {
        key: 'tagWidth',
        type: 'number',
        label: 'Tag Width',
        value: 150
    },
    {
        key: 'tagHeight',
        type: 'number',
        label: 'Tag Height',
        value: 80
    },
    {
        key: 'tagBackground',
        type: 'switch',
        label: 'Tag Background Color',
        options: [
            { value: 'rgba(0, 0, 0, 0.5)', label: 'Default' },
            { value: 'vaultTecBlue', label: 'Vault-Tec Blue' },
            { value: 'pipBoyGreen', label: 'Pip-Boy Green' },
            { value: 'powerArmor', label: 'Power Armor' },
            { value: 'brotherhood', label: 'Brotherhood' },
            { value: 'enclave', label: 'Enclave' },
            { value: 'institute', label: 'Institute' }
        ],
        value: 'rgba(0, 0, 0, 0.5)'
    },
    {
        key: 'customTagColor',
        type: 'text',
        label: 'Custom Background (hex/rgba)',
        value: ''
    },
    {
        key: 'customOpacityEnabled',
        type: 'switch',
        label: 'Custom Background Opacity',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: false
    },
    {
        key: 'backgroundOpacity',
        type: 'number',
        label: 'Background Opacity (0-1)',
        value: 0.5
    },
    {
        key: 'tagBorderRadius',
        type: 'number',
        label: 'Tag Border Radius',
        value: 4
    },
    {
        key: 'borderGlowEnabled',
        type: 'switch',
        label: 'Enable Border Glow',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: false
    },
    {
        key: 'borderGlowColor',
        type: 'switch',
        label: 'Border Glow Color',
        options: [
            { value: 'vaultTecBlue', label: 'Vault-Tec Blue' },
            { value: 'pipBoyGreen', label: 'Pip-Boy Green' },
            { value: 'radAway', label: 'RadAway Orange' },
            { value: 'nukaCola', label: 'Nuka-Cola Red' },
            { value: 'radiated', label: 'Radiated Green' },
            { value: 'legendary', label: 'Legendary Gold' }
        ],
        value: 'vaultTecBlue'
    },
    {
        type: 'section',
        label: 'Name Settings'
    },
    {
        key: 'useCustomName',
        type: 'switch',
        label: 'Use Custom Name',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: false
    },
    {
        key: 'customName',
        type: 'text',
        label: 'Custom Name Text',
        value: 'WASTELANDER'
    },
    {
        key: 'nameSize',
        type: 'number',
        label: 'Name Font Size',
        value: 18
    },
    {
        key: 'nameColor',
        type: 'switch',
        label: 'Name Color',
        options: [
            { value: '#ffffff', label: 'White' },
            { value: 'vaultTecBlue', label: 'Vault-Tec Blue' },
            { value: 'pipBoyGreen', label: 'Pip-Boy Green' },
            { value: 'radAway', label: 'RadAway Orange' },
            { value: 'nukaCola', label: 'Nuka-Cola Red' },
            { value: 'legendary', label: 'Legendary Gold' }
        ],
        value: '#ffffff'
    },
    {
        key: 'customNameColor',
        type: 'text',
        label: 'Custom Name Color (hex)',
        value: ''
    },
    {
        key: 'nameGlowEnabled',
        type: 'switch',
        label: 'Enable Name Glow',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: false
    },
    {
        key: 'nameGlowColor',
        type: 'switch',
        label: 'Name Glow Color',
        options: [
            { value: '', label: 'Match Name Color' },
            { value: 'vaultTecBlue', label: 'Vault-Tec Blue' },
            { value: 'pipBoyGreen', label: 'Pip-Boy Green' },
            { value: 'radAway', label: 'RadAway Orange' },
            { value: 'nukaCola', label: 'Nuka-Cola Red' },
            { value: 'radiated', label: 'Radiated Green' }
        ],
        value: ''
    },
    {
        key: 'animateNameText',
        type: 'switch',
        label: 'Animate Name',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: false
    },
    {
        key: 'nameAnimationType',
        type: 'switch',
        label: 'Name Animation Type',
        options: [
            { value: 'pulse', label: 'Pulse' },
            { value: 'wave', label: 'Wave' },
            { value: 'flicker', label: 'Flicker' }
        ],
        value: 'pulse'
    },
    {
        type: 'section',
        label: 'Health Display Settings'
    },
    {
        key: 'showHealth',
        type: 'switch',
        label: 'Show Health',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: true
    },
    {
        key: 'healthPrefix',
        type: 'text',
        label: 'Health Prefix (default: ♥)',
        value: '♥'
    },
    {
        key: 'healthSize',
        type: 'number',
        label: 'Health Font Size',
        value: 16
    },
    {
        key: 'healthColorHigh',
        type: 'switch',
        label: 'Healthy Color (>70%)',
        options: [
            { value: 'healthFull', label: 'Health Green' },
            { value: 'pipBoyGreen', label: 'Pip-Boy Green' },
            { value: '#00ffaa', label: 'Default Aqua' }
        ],
        value: 'healthFull'
    },
    {
        key: 'healthColorMedium',
        type: 'switch',
        label: 'Injured Color (30-70%)',
        options: [
            { value: 'healthMid', label: 'Health Orange' },
            { value: 'radAway', label: 'RadAway Orange' },
            { value: '#ffaa00', label: 'Default Gold' }
        ],
        value: 'healthMid'
    },
    {
        key: 'healthColorLow',
        type: 'switch',
        label: 'Critical Color (<30%)',
        options: [
            { value: 'healthLow', label: 'Health Red' },
            { value: 'nukaCola', label: 'Nuka-Cola Red' },
            { value: 'raiders', label: 'Raider Red' },
            { value: '#ff3300', label: 'Default Orange-Red' }
        ],
        value: 'healthLow'
    },
    {
        key: 'criticalPulse',
        type: 'switch',
        label: 'Pulse When Critical',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: true
    },
    {
        key: 'healthGlowEnabled',
        type: 'switch',
        label: 'Enable Health Glow',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: false
    },
    {
        key: 'animateHealthText',
        type: 'switch',
        label: 'Animate Health (non-critical)',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: false
    },
    {
        key: 'healthAnimationType',
        type: 'switch',
        label: 'Health Animation Type',
        options: [
            { value: 'pulse', label: 'Pulse' },
            { value: 'wave', label: 'Wave' },
            { value: 'flicker', label: 'Flicker' }
        ],
        value: 'pulse'
    },
    {
        type: 'section',
        label: 'Custom Text Fields'
    },
    {
        key: 'showCustomText1',
        type: 'switch',
        label: 'Show Custom Text 1',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: false
    },
    {
        key: 'customText1',
        type: 'text',
        label: 'Custom Text 1',
        value: 'VAULT DWELLER'
    },
    {
        key: 'customText1Color',
        type: 'switch',
        label: 'Custom Text 1 Color',
        options: [
            { value: '#aaaaaa', label: 'Grey' },
            { value: 'vaultTecBlue', label: 'Vault-Tec Blue' },
            { value: 'pipBoyGreen', label: 'Pip-Boy Green' },
            { value: 'radiated', label: 'Radiated Green' },
            { value: 'brotherhood', label: 'Brotherhood' },
            { value: 'railroad', label: 'Railroad' }
        ],
        value: '#aaaaaa'
    },
    {
        key: 'showCustomText2',
        type: 'switch',
        label: 'Show Custom Text 2',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: false
    },
    {
        key: 'customText2',
        type: 'text',
        label: 'Custom Text 2',
        value: 'LEVEL 50'
    },
    {
        key: 'customText2Color',
        type: 'switch',
        label: 'Custom Text 2 Color',
        options: [
            { value: '#aaaaaa', label: 'Grey' },
            { value: 'legendary', label: 'Legendary Gold' },
            { value: 'action', label: 'Action Points Blue' },
            { value: 'rads', label: 'Radiation Purple' },
            { value: 'minutemen', label: 'Minutemen Blue' }
        ],
        value: '#aaaaaa'
    },
    {
        key: 'customTextSize',
        type: 'number',
        label: 'Custom Text Font Size',
        value: 14
    },
    {
        key: 'customTextGlowEnabled',
        type: 'switch',
        label: 'Enable Custom Text Glow',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: false
    },
    {
        type: 'section',
        label: 'Badge Display'
    },
    {
        key: 'showBadges',
        type: 'switch',
        label: 'Show Badges',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: false
    },
    {
        key: 'badgeSize',
        type: 'number',
        label: 'Badge Size',
        value: 16
    },
    {
        key: 'badgeGlowEnabled',
        type: 'switch',
        label: 'Enable Badge Glow',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: false
    },
    {
        key: 'badge1Enabled',
        type: 'switch',
        label: 'Badge 1 Enabled',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: true
    },
    {
        key: 'badge1Icon',
        type: 'switch',
        label: 'Badge 1 Icon',
        options: [
            { value: '★', label: 'Legendary Star ★' },
            { value: '⚙️', label: 'Vault-Tec ⚙️' },
            { value: '☢️', label: 'Radiation ☢️' },
            { value: '⚔️', label: 'Brotherhood ⚔️' },
            { value: '💰', label: 'Caps 💰' },
            { value: '⚛️', label: 'Atom ⚛️' },
            { value: '❗', label: 'Quest ❗' },
            { value: '🌟', label: 'Perk 🌟' }
        ],
        value: '★'
    },
    {
        key: 'badge1Color',
        type: 'switch',
        label: 'Badge 1 Color',
        options: [
            { value: 'legendary', label: 'Legendary Gold' },
            { value: 'brotherhood', label: 'Brotherhood' },
            { value: 'enclave', label: 'Enclave' },
            { value: 'minutemen', label: 'Minutemen' },
            { value: 'institute', label: 'Institute' },
            { value: 'railroad', label: 'Railroad' },
            { value: 'raiders', label: 'Raiders' }
        ],
        value: 'legendary'
    },
    {
        key: 'badge2Enabled',
        type: 'switch',
        label: 'Badge 2 Enabled',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: false
    },
    {
        key: 'badge2Icon',
        type: 'switch',
        label: 'Badge 2 Icon',
        options: [
            { value: '❤️', label: 'Health ❤️' },
            { value: '🛡️', label: 'Armor 🛡️' },
            { value: '⚡', label: 'Energy ⚡' },
            { value: '⚔️', label: 'Brotherhood ⚔️' },
            { value: '🔬', label: 'Institute 🔬' },
            { value: '🔄', label: 'Railroad 🔄' },
            { value: '🎯', label: 'Minutemen 🎯' },
            { value: '💪', label: 'Strength 💪' }
        ],
        value: '❤️'
    },
    {
        key: 'badge2Color',
        type: 'switch',
        label: 'Badge 2 Color',
        options: [
            { value: 'action', label: 'Action Points Blue' },
            { value: 'brotherhood', label: 'Brotherhood' },
            { value: 'enclave', label: 'Enclave' },
            { value: 'minutemen', label: 'Minutemen' },
            { value: 'institute', label: 'Institute' },
            { value: 'railroad', label: 'Railroad' },
            { value: 'raiders', label: 'Raiders' }
        ],
        value: 'action'
    },
    {
        key: 'badge3Enabled',
        type: 'switch',
        label: 'Badge 3 Enabled',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: false
    },
    {
        key: 'badge3Icon',
        type: 'switch',
        label: 'Badge 3 Icon',
        options: [
            { value: '☢️', label: 'Radiation ☢️' },
            { value: '👤', label: 'Stealth 👤' },
            { value: '⚡', label: 'Power Armor ⚡' },
            { value: '✨', label: 'Critical ✨' },
            { value: '🧠', label: 'Intelligence 🧠' },
            { value: '🗣️', label: 'Charisma 🗣️' },
            { value: '🍀', label: 'Luck 🍀' },
            { value: '⚜️', label: 'Legion ⚜️' }
        ],
        value: '☢️'
    },
    {
        key: 'badge3Color',
        type: 'switch',
        label: 'Badge 3 Color',
        options: [
            { value: 'radiated', label: 'Radiated Green' },
            { value: 'rads', label: 'Radiation Purple' },
            { value: 'brotherhood', label: 'Brotherhood' },
            { value: 'enclave', label: 'Enclave' },
            { value: 'minutemen', label: 'Minutemen' },
            { value: 'institute', label: 'Institute' },
            { value: 'railroad', label: 'Railroad' },
            { value: 'raiders', label: 'Raiders' }
        ],
        value: 'radiated'
    },
    {
        type: 'section',
        label: 'Animation & Effects'
    },
    {
        key: 'glowStrength',
        type: 'number',
        label: 'Glow Strength',
        value: 5
    },
    {
        key: 'animateGlow',
        type: 'switch',
        label: 'Animated Glow Effect',
        options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' }
        ],
        value: false
    },
    {
        key: 'animationIntensity',
        type: 'number',
        label: 'Animation Intensity',
        value: 1.0
    },
    {
        type: 'section',
        label: 'Positioning'
    },
    {
        key: 'heightOffset',
        type: 'number',
        label: 'Height Above Player',
        value: 2.0
    },
    {
        key: 'maxVisibleDistance',
        type: 'number',
        label: 'Max Visible Distance (0 = always)',
        value: 0
    }
])

}
