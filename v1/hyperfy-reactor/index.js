import React, { useEffect, useRef } from 'react'
import { useWorld, useEditing, useFields, useCondition } from 'hyperfy'

export default function App() {
  const world = useWorld()
  const fields = useFields()
  const editing = useEditing()
  const initRef = useRef()

  const active = useCondition(fields.condition) && fields.condition?.length > 0

  useEffect(() => {
    // do nothing initially
    if (!initRef.current) {
      initRef.current = true
      return
    }
    // otherwise trigger active/inactive
    world.trigger(active ? 'active' : 'inactive')
  }, [active])

  return <app>{editing && <model src="block.glb" />}</app>
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
        key: 'condition',
        label: 'Condition',
        type: 'condition',
        zero: 'None',
      },
      {
        type: 'trigger',
        name: 'active',
        label: 'On Active',
      },
      {
        type: 'trigger',
        name: 'inactive',
        label: 'On Inactive',
      },
    ],
  }
}
