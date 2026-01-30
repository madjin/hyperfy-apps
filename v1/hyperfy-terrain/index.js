import React from 'react'
import { useFields } from 'hyperfy'

const srcs = {
  field: 'field.glb',
  desert: 'desert.glb',
  island: 'island.glb',
  moon: 'moon.glb',
  grass: 'grass.glb',
  // tron: 'tron.glb',
}

export default function Terrain() {
  const fields = useFields()
  return (
    <app>
      <rigidbody>
        <model
          src={srcs[fields.type]}
          /*hidden={!fields.visible}*/ collision={
            fields.type === 'grass' ? 'auto' : 'trimesh'
          }
        />
      </rigidbody>
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
        key: 'type',
        label: 'Type',
        type: 'dropdown',
        options: [
          { label: 'Field', value: 'field' },
          { label: 'Desert', value: 'desert' },
          { label: 'Island', value: 'island' },
          { label: 'Moon', value: 'moon' },
          { label: 'Grass', value: 'grass' },
          // { label: 'Tron', value: 'tron' },
        ],
        initial: 'field',
      },
    ],
  }
}
