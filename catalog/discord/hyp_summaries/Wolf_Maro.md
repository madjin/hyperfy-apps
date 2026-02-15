# Wolf_Maro.hyp

## Metadata
- **Author**: ash
- **Channel**: #💻│developers
- **Date**: 2025-04-01
- **Size**: 365,147 bytes

## Discord Context
> For those wanting to try skinned meshes on latest dev branch here's a quick app i whipped up that showcases animations:

## Blueprint
- **Name**: Wolf Maro
- **Version**: 69
- **Model**: `asset://7f1339ddc11949dd140438546ea1d6cecc416dfbb9aa79a71e352094aeb39e7c.glb`
- **Script**: `asset://b45ad49cbf3cb8a46f739bc5544ce10023117da4fd58c81b76bcabda0a50b1a0.js`

## Assets
- `[model]` 7f1339ddc11949dd140438546ea1d6cecc416dfbb9aa79a71e352094aeb39e7c.glb (364,192 bytes)
- `[script]` b45ad49cbf3cb8a46f739bc5544ce10023117da4fd58c81b76bcabda0a50b1a0.js (244 bytes)

## Script Analysis
**App Methods**: `app.get()`

## Keywords (for Discord search)
anims, fade, idle, length, name, onPointerDown, pickRandomAnim, play, speed

## Script Source
```javascript
const rig = app.get('Rig')

const anims = rig.anims

const pickRandomAnim = () => {
  return anims[num(0, anims.length)]
}

rig.play({ name: 'idle' })

app.onPointerDown = () => {
  rig.play({ name: pickRandomAnim(), speed: 1.2, fade: 0.2 })
}

```

---
*Extracted from Wolf_Maro.hyp. Attachment ID: 1356607621783617706*