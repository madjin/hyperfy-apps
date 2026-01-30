import React from 'react'
import { useFields } from 'hyperfy'

export default function App() {
  const fields = useFields()
  const textureSize = resolutions[fields.resolution]
  return (
    <app>
      <water
        size={[fields.width, fields.depth]}
        distortion={fields.distortion}
        color={fields.color}
        speed={fields.speed}
        textureSize={textureSize}
      />
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
        key: 'width',
        label: 'Width',
        type: 'float',
        initial: 1000,
      },
      {
        key: 'depth',
        label: 'Depth',
        type: 'float',
        initial: 1000,
      },
      {
        key: 'distortion',
        label: 'Distortion',
        type: 'float',
        initial: 2,
      },
      {
        key: 'color',
        label: 'Color',
        type: 'color',
        initial: '#001e0f',
      },
      {
        key: 'speed',
        label: 'Speed',
        type: 'float',
        initial: 0.1,
      },
      {
        key: 'resolution',
        label: 'Quality',
        type: 'switch',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Med', value: 'med' },
          { label: 'High', value: 'high' },
        ],
        initial: 'low',
      },
    ],
  }
}

const resolutions = {
  low: 256,
  med: 512,
  high: 1024,
}
