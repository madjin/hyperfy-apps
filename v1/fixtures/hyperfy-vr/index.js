import React from 'react'
import { useFields } from 'hyperfy'

export default function App() {
  const fields = useFields()
  return (
    <app>
      {fields.climb && <effect name="climb" />}
      {fields.glide && <effect name="glide" />}
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
        key: 'climb',
        label: 'Climbing',
        type: 'switch',
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
        initial: false,
      },
      {
        key: 'glide',
        label: 'Gliding',
        type: 'switch',
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
        initial: false,
      },
    ],
  }
}
