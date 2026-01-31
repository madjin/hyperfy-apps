export default function main(world, app, fetch, props, setTimeout) {
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
}
