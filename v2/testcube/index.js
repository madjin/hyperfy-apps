export default function main(world, app, fetch, props, setTimeout) {
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
}
