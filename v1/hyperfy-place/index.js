import React from 'react'
import { useWorld, useFields, useEditing } from 'hyperfy'

export default function Place() {
  const editing = useEditing()
  const fields = useFields()

  return (
    <app>
      {/* rotationY=0 forces directional change on teleport */}
      <place label={fields.name} rotationY={0} />
      {editing && <model src="place.glb" />}
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
        key: 'name',
        label: 'Name',
        type: 'text',
        descriptor: true,
      },
    ],
  }
}
