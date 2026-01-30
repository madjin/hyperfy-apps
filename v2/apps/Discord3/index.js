export default function main(world, app, fetch, props, setTimeout) {
function parseTemplate(template, values) {
    return template.replace(/\${(\w+)}/g, (match, key) => {
      return values[key] !== undefined ? values[key] : match;
    });
  }
  
  app.configure([
    {
      key: 'broadcastChat',
      type: 'switch',
      label: 'broadcast',
      options: [
        { label: 'on', value: true },
        { label: 'off', value: false },
      ],
    },
    {
      key: 'webhook',
      type: 'text',
      label: "Webhook URL"
    },
    {
      key: 'excludedNames',
      type: 'text',
      label: "Excluded Names (comma-separated)",
      placeholder: "Enter names to exclude from join/leave messages"
    },
    {
      key: 'showLogo',
      type: 'switch',
      label: 'Show Discord Logo',
      options: [
        { label: 'on', value: true },
        { label: 'off', value: false },
      ],
    },
    {
      key: 'showNotifications',
      type: 'switch',
      label: 'Screen UI notification',
      options: [
        { label: 'yes', value: true },
        { label: 'no', value: false },
      ],
    },
  ])

  if (world.isServer) {
    
    // Track player session start times
    const playerSessions = new Map();
    
    // Function to format duration in human-readable format
    const formatDuration = (milliseconds) => {
      const seconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      } else {
        return `${seconds}s`;
      }
    };

    // Function to check if a player name should be excluded
    const isPlayerExcluded = (playerName, playerId) => {
      if (!app.config.excludedNames || !app.config.excludedNames.trim()) {
        return false;
      }
      
      const excludedNames = app.config.excludedNames
        .split(',')
        .map(name => name.trim().toLowerCase())
        .filter(name => name.length > 0);
      
      const nameToCheck = playerName && playerName !== 'Anonymous' ? 
        playerName.toLowerCase() : playerId.toLowerCase();
      
      return excludedNames.includes(nameToCheck);
    };

    // Function to send message to Discord webhook
    const hitDiscordWebhook = async (message) => {
      if (!app.config.webhook) {
        return false;
      }

      try {
        const response = await fetch(app.config.webhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: message
          }),
        });

        if (!response.ok) {
          throw new Error(`Discord webhook error: ${response.status}`);
        }

        return true;
      } catch (error) {
        return false;
      }
    };

    // Send a test message when the script starts
    hitDiscordWebhook('🤖 Discord integration is now active!');

    if (app.config.broadcastChat) {
      if (app.config.webhook) {
        // Chat handler
        world.on('chat', async msg => {
          try {
            const from = msg.from || 'Unknown';
            const body = msg.body || '';
            const fromId = msg.fromId || '';
    
            const template = msg.from === 'Anonymous' ?
              `[${msg.fromId}]: ${msg.body} ` :
              `[${from}]: ${body} `;
    
            const parsedMessage = parseTemplate(template, msg);
            await hitDiscordWebhook(parsedMessage);
          } catch (error) {
            // Silent error handling
          }
        });
  
        // Enter event handler
        world.on('enter', async ({ playerId }) => {
          try {
            const player = world.getPlayer(playerId);
            
            // Check if player should be excluded from join/leave messages
            if (isPlayerExcluded(player.name, playerId)) {
              return; // Skip sending message for excluded players
            }
            
            // Record the session start time
            playerSessions.set(playerId, Date.now());
            
            const message = `**${player.name != 'Anonymous' ? player.name : player.id}** has entered the world`;
            await hitDiscordWebhook(message);
          } catch (error) {
            // Silent error handling
          }
        });
  
        // Leave event handler
        world.on('leave', async ({ playerId }) => {
          try {
            const player = world.getPlayer(playerId);
            
            // Check if player should be excluded from join/leave messages
            if (isPlayerExcluded(player.name, playerId)) {
              // Still clean up session data for excluded players
              playerSessions.delete(playerId);
              return; // Skip sending message for excluded players
            }
            
            // Calculate session duration
            const sessionStart = playerSessions.get(playerId);
            let durationMessage = '';
            
            if (sessionStart) {
              const sessionDuration = Date.now() - sessionStart;
              const formattedDuration = formatDuration(sessionDuration);
              durationMessage = ` (Session duration: ${formattedDuration})`;
              
              // Clean up the session data
              playerSessions.delete(playerId);
            }
            
            const message = `**${player.name != 'Anonymous' ? player.name : player.id}** has left the world${durationMessage}`;
            await hitDiscordWebhook(message);
          } catch (error) {
            // Silent error handling
          }
        });
      }
    } else {
      // Send deactivation message when broadcast is off
      hitDiscordWebhook('🤖 Discord integration is now deactivated!');
    }
  
    // Custom discord event handler
    world.on('discord', msg => {
      try {
        if (app.config.webhook) hitDiscordWebhook(msg);
      } catch (error) {
        // Silent error handling
      }
    });
  }

  // Client-side visual notifications
  if (world.isClient) {
    // Initialize app state for notifications
    if (!app.state.notifications) {
      app.state.notifications = []
    }

    // Discord logo setup and rotation
    const discordLogo = app.get('Mesh_0001')
    if (discordLogo) {
      // Set initial visibility based on config (default true)
      const showLogo = app.config.showLogo !== false
      discordLogo.active = showLogo
      
      if (showLogo) {
        // Position the logo at y=0.5
        discordLogo.position.y = 0.5
        
        // Rotation animation variables
        let rotationSpeed = 0.1 // Adjust speed as needed
        
        // Use Hyperfy's update loop for animation
        app.on('update', (delta) => {
          if (discordLogo && discordLogo.parent && discordLogo.active) {
            // Rotate around Y axis
            discordLogo.rotation.y += rotationSpeed * delta
          }
        })
      }
      
      // Listen for config changes to show/hide logo
      app.on('config', () => {
        const showLogo = app.config.showLogo !== false
        discordLogo.active = showLogo
      })
    }

    // Track notification positions to stack them
    let notificationOffset = 70

    // Function to create and show a visual notification
    function showVisualNotification(message) {
      if (!world.isClient) return
      
      // Check if notifications are enabled
      if (app.config.showNotifications === false) return
      
      // Calculate position for stacking notifications
      const currentOffset = notificationOffset
      notificationOffset += 80 // Move next notification down by 80px
      
      // Create notification UI
      const notification = app.create('ui', {
        width: 300,
        height: 60,
        res: 2,
        position: [1, 0, 0], // Top right corner
        offset: [0, currentOffset - 20, 0], // Stack notifications vertically
        space: 'screen',
        pivot: 'top-right',
        backgroundColor: 'transparent',
        padding: 15,
        pointerEvents: false, // Don't block pointer events
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 5,
      })

      // Create the notification text (remove markdown formatting for display)
      const displayMessage = message.replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold** formatting
      const notificationText = app.create('uitext', {
        value: displayMessage,
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'center',
      })

      notification.add(notificationText)
      app.add(notification)

      // Store reference for cleanup
      app.state.notifications.push(notification)

      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (notification && notification.parent) {
          app.remove(notification)
          // Remove from state array
          const index = app.state.notifications.indexOf(notification)
          if (index > -1) {
            app.state.notifications.splice(index, 1)
          }
          // Reset offset when notification is removed
          notificationOffset = Math.max(70, notificationOffset - 80)
        }
      }, 5000) // 5 seconds
    }

    // Function to handle player enter events (client-side)
    function onPlayerEnter({ playerId }) {
      if (!world.isClient) return
      
      try {
        const player = world.getPlayer(playerId)
        if (!player) return
        
        const playerName = player.name != 'Anonymous' ? player.name : player.id
        const message = `${playerName} has entered the world`
        
        // Show visual notification
        showVisualNotification(message)
      } catch (error) {
        console.error('Error showing player enter notification:', error)
      }
    }

    // Function to handle player leave events (client-side)
    function onPlayerLeave({ playerId }) {
      if (!world.isClient) return
      
      try {
        const player = world.getPlayer(playerId)
        if (!player) return
        
        const playerName = player.name != 'Anonymous' ? player.name : player.id
        const message = `${playerName} has left the world`
        
        // Show visual notification
        showVisualNotification(message)
      } catch (error) {
        console.error('Error showing player leave notification:', error)
      }
    }

    // Set up event listeners for visual notifications
    world.on('enter', onPlayerEnter)
    world.on('leave', onPlayerLeave)

    // Cleanup function
    app.on('destroy', () => {
      if (world.isClient) {
        world.off('enter', onPlayerEnter)
        world.off('leave', onPlayerLeave)
        
        // Clean up any remaining notifications
        if (app.state.notifications && Array.isArray(app.state.notifications)) {
          app.state.notifications.forEach(notification => {
            if (notification && notification.parent) {
              app.remove(notification)
            }
          })
        }
        app.state.notifications = []
        notificationOffset = 70
      }
    })
  }
  
}
