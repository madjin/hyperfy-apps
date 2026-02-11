import React, { useMemo } from 'react'
import { useWorld, useFields, useFile, useCondition } from 'hyperfy'

/**
 * TODO:
 *
 * - VR might be better with 4k as 2k would look SUPER pixellated
 *
 */

export default function App() {
  const world = useWorld()
  const fields = useFields()
  const bg = fields.bg
  const hdr = fields.hdr
  const bgCustomSrc = useFile(fields.bgFile)
  const hdrCustomSrc = useFile(fields.hdrFile)
  const radius = fields.radius
  const fog = fields.fog
  const active = useCondition(fields.active)

  const { bgSrc, hdrSrc } = useMemo(() => {
    const size = world.isDesktop ? '4k' : '2k'
    const data = {}
    if (bg === 'none') {
      data.bgSrc = null
    } else if (bg === 'custom') {
      data.bgSrc = bgCustomSrc
    } else {
      data.bgSrc = bg ? `${bg}-${size}.jpg` : null
    }
    if (hdr === 'none') {
      data.hdrSrc = null
    } else if (hdr === 'custom') {
      data.hdrSrc = hdrCustomSrc
    } else {
      data.hdrSrc = hdr ? `${hdr}.hdr` : null
    }
    return data
  }, [bg, hdr, hdrCustomSrc, bgCustomSrc])

  if (!active) return <app />

  return (
    <app>
      {hdrSrc && <hdr src={hdrSrc} />}
      {bgSrc && (
        <skysphere src={bgSrc} radius={radius} encoding="srgb" fog={fog} />
      )}
    </app>
  )
}

const initialState = {
  // ...
}

export function getStore(state = initialState) {
  return {
    state,
    actions: {},
    fields: [
      {
        key: 'bg',
        label: 'BG',
        type: 'dropdown',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Custom', value: 'custom' },
          { label: 'Day 1', value: 'day1' },
          { label: 'Day 2', value: 'day2' },
          { label: 'Night', value: 'night' },
          { label: 'Cloudy', value: 'cloudy' },
          { label: 'Dusk 1', value: 'dusk1' },
          { label: 'Dusk 2', value: 'dusk2' },
          { label: 'Dusk 3', value: 'dusk3' },
          { label: 'SunDown 1', value: 'sundown1' },
          { label: 'SunDown 2', value: 'sundown2' },
          { label: 'SunDown 3', value: 'sundown3' },
        ],
        initial: 'day1',
      },
      {
        key: 'bgFile',
        label: 'BG',
        type: 'file',
        accept: '.jpeg,.jpg,.png',
        placeholder: 'png, jpg',
        conditions: [{ field: 'bg', op: 'eq', value: 'custom' }],
      },
      {
        key: 'hdr',
        label: 'HDR',
        type: 'dropdown',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Custom', value: 'custom' },
          { label: 'Day 1', value: 'day1' },
          { label: 'Day 2', value: 'day2' },
          { label: 'Night', value: 'night' },
          { label: 'Cloudy', value: 'cloudy' },
          { label: 'Dusk 1', value: 'dusk1' },
          { label: 'Dusk 2', value: 'dusk2' },
          { label: 'Dusk 3', value: 'dusk3' },
          { label: 'SunDown 1', value: 'sundown1' },
          { label: 'SunDown 2', value: 'sundown2' },
          { label: 'SunDown 3', value: 'sundown3' },
        ],
        initial: 'day1',
      },
      {
        key: 'hdrFile',
        label: 'HDR',
        type: 'file',
        accept: '.hdr',
        placeholder: 'hdr',
        conditions: [{ field: 'hdr', op: 'eq', value: 'custom' }],
      },
      {
        key: 'radius',
        label: 'Radius',
        type: 'float',
        initial: 1000,
      },
      {
        key: 'fog',
        label: 'Fog',
        type: 'switch',
        options: [
          { label: 'Cover', value: 'cover' },
          { label: 'Reveal', value: 'reveal' },
        ],
        initial: 'cover',
      },
      {
        key: `active`,
        label: 'Active',
        type: 'condition',
      },
    ],
  }
}
