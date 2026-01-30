import React from 'react'
import { useFields } from 'hyperfy'

export default function Fog() {
  const fields = useFields()
  return (
    <app>
      <fog
        color={fields.color}
        type={fields.type}
        density={fields.density}
        near={fields.near}
        far={fields.far}
      />
    </app>
  )
}

const initialState = {}

export function getStore(state = initialState) {
  return {
    state,
    actions: {},
    fields: [
      {
        key: 'color',
        label: 'Color',
        type: 'color',
        initial: '#d0cfd3',
      },
      {
        key: 'type',
        label: 'Type',
        type: 'switch',
        options: [
          { label: 'Exponential', value: 'exponential' },
          { label: 'Linear', value: 'linear' },
        ],
        initial: 'exponential',
      },
      {
        key: 'density',
        label: 'Density',
        type: 'float',
        dp: null,
        initial: 0.005,
        conditions: [{ field: 'type', op: 'eq', value: 'exponential' }],
      },
      {
        key: 'near',
        label: 'Near',
        type: 'float',
        initial: 20,
        conditions: [{ field: 'type', op: 'eq', value: 'linear' }],
      },
      {
        key: 'far',
        label: 'Far',
        type: 'float',
        initial: 400,
        conditions: [{ field: 'type', op: 'eq', value: 'linear' }],
      },
    ],
  }
}
