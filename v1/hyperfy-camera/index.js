import React, { useRef } from 'react'
import { useFields, useEditing, useSignal } from 'hyperfy'

export default function App() {
  const ref = useRef()
  const fields = useFields()
  const editing = useEditing()

  useSignal('Activate', () => {
    ref.current.activate()
  })

  useSignal('Deactivate', () => {
    ref.current.deactivate()
  })

  return (
    <app>
      {editing && <model src="block.glb" />}
      <group position={[0, 0, -0.34]}>
        <camera
          ref={ref}
          number={fields.number}
          distortion={fields.distortion}
        />
      </group>
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
        key: 'label',
        label: 'Label',
        type: 'text',
        descriptor: true,
      },
      {
        key: 'number',
        label: 'Keybind',
        type: 'dropdown',
        options: [
          { label: 'None', value: null },
          { label: 'Shift + 1', value: 1 },
          { label: 'Shift + 2', value: 2 },
          { label: 'Shift + 3', value: 3 },
          { label: 'Shift + 4', value: 4 },
          { label: 'Shift + 5', value: 5 },
          { label: 'Shift + 6', value: 6 },
          { label: 'Shift + 7', value: 7 },
          { label: 'Shift + 8', value: 8 },
          { label: 'Shift + 9', value: 9 },
        ],
        initial: null,
      },
      {
        key: 'distortion',
        label: 'Distortion',
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
