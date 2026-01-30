import React from 'react'
import { useFields, useCondition } from 'hyperfy'

export default function Effects() {
  const fields = useFields()
  const enabled = useCondition(fields.enabled)
  return <app>{enabled && <effect name="freeCam" />}</app>
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
        key: 'enabled',
        label: 'Enabled',
        type: 'condition',
        placeholder: 'Always',
      },
    ],
  }
}
