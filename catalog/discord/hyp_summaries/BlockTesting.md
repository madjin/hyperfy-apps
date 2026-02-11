# BlockTesting.hyp

## Metadata
- **Author**: Shiffty
- **Channel**: #🐞│issues
- **Date**: 2025-03-09
- **Size**: 2,406,581 bytes

## Discord Context
> <@179546010303856640> Is applyEffect(null) still the way to clear effects? Maybe have a bug if so. In attached hyp, press right mouse to block, and release to unblock. The player gets stuck in the block.

## Blueprint
- **Name**: testcube
- **Version**: 2
- **Model**: `asset://4bd5e491a03f3c6e19e593cc8151320a70edefef9377ddff9dccd50157ec8939.glb`
- **Script**: `asset://8df1869b1979d55db6a466d6fd0d8db2c142273e604922ede8ec79a5e7a2fc2a.js`

## Props
- `block`: emote → `asset://82762c76d32ccfb43b56f15f048ead5399e2cef452bcab625d52897e9bcf50f7.glb`

## Assets
- `[model]` 4bd5e491a03f3c6e19e593cc8151320a70edefef9377ddff9dccd50157ec8939.glb (2,279,968 bytes)
- `[script]` 8df1869b1979d55db6a466d6fd0d8db2c142273e604922ede8ec79a5e7a2fc2a.js (1,462 bytes)
- `[emote]` 82762c76d32ccfb43b56f15f048ead5399e2cef452bcab625d52897e9bcf50f7.glb (124,196 bytes)

## Script Analysis
**App Methods**: `app.configure()`, `app.control()`
**World Methods**: `world.getPlayer()`

## Keywords (for Discord search)
animation, applyEffect, block, button, cancel, cancellable, capture, configure, configured, console, control, duration, emote, file, getPlayer, handle, input, isBlocking, isClient, kind

## Script Source
```javascript
app.configure([
    {
        key: 'block',
        type: 'file',
        kind: 'emote',
        label: 'Block'
    }
])

if (world.isClient) {
    const localPlayer = world.getPlayer()
    let isBlocking = false

    // Create a simple control to handle mouse input
    const control = app.control()
    control.mouseRight.capture = true

    // Handle right mouse button press
    control.mouseRight.onPress = () => {
        if (!isBlocking) {
            console.log('[BLOCK] Starting block')
            isBlocking = true
            
            // Apply block animation
            if (props.block?.url) {
                console.log('[BLOCK] Applying block emote:', props.block.url)
                localPlayer.applyEffect({
                    snare: 0.5,
                    emote: props.block.url,
                    turn: true,
                    duration: 999999, // Long duration since we'll cancel it manually
                    cancellable: true
                })
            } else {
                console.log('[BLOCK] Warning: No block emote URL configured')
            }
        }
    }

    // Handle right mouse button release
    control.mouseRight.onRelease = () => {
        if (isBlocking) {
            console.log('[BLOCK] Ending block')
            isBlocking = false
            
            // Clear block animation
            localPlayer.applyEffect(null)
        }
    }
} 
```

---
*Extracted from BlockTesting.hyp. Attachment ID: 1348127460646060052*