# Launchpad.hyp

## Metadata
- **Author**: Dhin
- **Channel**: #🧊│3d-design
- **Date**: 2025-10-14
- **Size**: 33,589 bytes

## Discord Context
> if yes, there's this. not sure who made it

## Blueprint
- **Name**: Launchpad
- **Version**: 41
- **Model**: `asset://05064b7aee2b67a30ce663bec12c9a7fe50fd706c2a0adbaccd2147a5705accc.glb`
- **Script**: `asset://4ba8991e628f06d346217f72e1861e4b18c20bad27f074a32dd622aa935df8d5.js`

## Assets
- `[model]` 05064b7aee2b67a30ce663bec12c9a7fe50fd706c2a0adbaccd2147a5705accc.glb (32,688 bytes)
- `[script]` 4ba8991e628f06d346217f72e1861e4b18c20bad27f074a32dd622aa935df8d5.js (227 bytes)

## Script Analysis
**App Methods**: `app.get()`
**World Methods**: `world.getPlayer()`

## Keywords (for Discord search)
body, console, getPlayer, isClient, onTriggerEnter, playerId, push, world

## Script Source
```javascript
if (world.isClient) {
  const body = app.get('Launchpad')
  body.onTriggerEnter = (e) => {
    if (e.playerId) {
      console.log('onTriggerEnter push')
      world.getPlayer(e.playerId).push(new Vector3(0, 10, 0))
    }
  }
}
```

---
*Extracted from Launchpad.hyp. Attachment ID: 1427685964792205332*