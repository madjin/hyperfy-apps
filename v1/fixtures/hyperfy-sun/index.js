import React from 'react'
import { DEG2RAD, useFields, useEditing } from 'hyperfy'

export default function App() {
  const fields = useFields()
  const editing = useEditing()
  const y = (fields.direction || 0) * DEG2RAD
  const z = (360 / 24) * ((fields.time || 12) - 12) * DEG2RAD
  return (
    <app>
      <sun
        rotation={[0, y, z]}
        intensity={fields.intensity}
        color={fields.color}
        debug={editing && fields.debug}
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
        key: 'time',
        label: 'Time',
        type: 'float',
        initial: 14,
      },
      {
        key: 'direction',
        label: 'Direction',
        type: 'float',
        initial: 0,
      },
      {
        key: 'intensity',
        label: 'Intensity',
        type: 'float',
        initial: 1,
      },
      {
        key: 'color',
        label: 'Color',
        type: 'color',
        initial: '#fff',
      },
      {
        key: 'debug',
        label: 'Guide',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
    ],
  }
}
