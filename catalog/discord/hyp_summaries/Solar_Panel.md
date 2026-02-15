# Solar_Panel.hyp

## Metadata
- **Author**: ~/drdoge.eth
- **Channel**: #🎨│showcase
- **Date**: 2025-04-21
- **Size**: 632,835 bytes

## Blueprint
- **Name**: Solar Panel
- **Version**: 909
- **Model**: `asset://d7e74c6afd6bad54bd503971015d04713633afcf2bc536fd6533e639cbed2657.glb`
- **Script**: `asset://620cd9175c1631be208b160f0f7203f2ec94bc3160cbf5e52560c25a9c2c0297.js`

## Props
- `sky`: texture → `asset://d219a062b4b72ccbe15d4653a07e698e4b7e504d9cdc54e05bcd83a4e290d7cf.jpg`
- `hdr`: hdr → `asset://3bd5de5a2bf09b581b4be89763bf3261bf65a9c6aee8a3ba99d960c405857b7e.hdr`
- `hour`: int = `3`
- `period`: str = `pm`
- `hour2`: int = `9`
- `intensity`: int = `1`

## Assets
- `[model]` d7e74c6afd6bad54bd503971015d04713633afcf2bc536fd6533e639cbed2657.glb (23,556 bytes)
- `[script]` 620cd9175c1631be208b160f0f7203f2ec94bc3160cbf5e52560c25a9c2c0297.js (1,619 bytes)
- `[texture]` d219a062b4b72ccbe15d4653a07e698e4b7e504d9cdc54e05bcd83a4e290d7cf.jpg (321,701 bytes)
- `[hdr]` 3bd5de5a2bf09b581b4be89763bf3261bf65a9c6aee8a3ba99d960c405857b7e.hdr (284,529 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`
**Nodes Created**: `sky`

## Keywords (for Discord search)
around, axis, back, calculateSunDirection, config, configure, create, file, hour, hour24, initial, intensity, kind, label, midday, number, options, period, rotate, rotation

## Script Source
```javascript
app.configure(() => {
  return [
    {
      key: 'sky',
      label: 'Sky',
      type: 'file',
      kind: 'texture',
    },
    {
      key: 'hdr',
      label: 'HDR',
      type: 'file',
      kind: 'hdr',
    },
    {
      key: 'hour',
      label: 'Hour',
      type: 'number',
      min: 1,
      max: 12,
      step: 1,
      initial: 12,
      dp: 0,
    },
    {
      key: 'period',
      label: '',
      type: 'switch',
      options: [
        { value: 'am', label: 'AM' },
        { value: 'pm', label: 'PM' }
      ],
      initial: 'pm'
    },
    {
      key: 'intensity',
      label: 'Intensity',
      type: 'number',
      min: 0,
      max: 10,
      step: 0.1,
      initial: 1,
      dp: 1,
    },
  ]
})

const sky = app.create('sky')

sky.bg = app.config.sky?.url
sky.hdr = app.config.hdr?.url

const sunDirection = calculateSunDirection(
  app.config.hour || 12,
  app.config.period || 'pm'
)
sky.sunDirection = sunDirection

sky.sunIntensity = app.config.intensity

app.add(sky)


function calculateSunDirection(hour, period) {
  // Convert to 24 hour time
  let hour24 = hour
  if (period === 'pm' && hour !== 12) hour24 += 12
  if (period === 'am' && hour === 12) hour24 = 0
  // Assuming Vector3(0, -1, 0) is midday (12 PM)
  // We rotate around the X axis, from -1 up through 1 and back
  const rotation = ((hour24 - 12) * Math.PI) / 12
  // At 12 PM: sin = 0, cos = 1 -> (0, -1, 0)
  // At 6 PM: sin = 1, cos = 0 -> (0, 0, 1)
  // At 12 AM: sin = 0, cos = -1 -> (0, 1, 0)
  // At 6 AM: sin = -1, cos = 0 -> (0, 0, -1)
  return new Vector3(0, -Math.cos(rotation), Math.sin(rotation))
}
```

---
*Extracted from Solar_Panel.hyp. Attachment ID: 1364018549689159761*