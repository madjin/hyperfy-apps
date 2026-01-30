import React, { useEffect } from 'react'
import { useWorld, useFields, useCondition } from 'hyperfy'

export default function App() {
  const world = useWorld()
  const fields = useFields()

  const cmd = fields.cmd
  const active = useCondition(fields.active)

  useEffect(() => {
    if (!cmd) return
    if (!active) return
    const command = cmd.startsWith('/') ? cmd.slice(1) : cmd // prettier-ignore
    return world.command(command, () => {
      world.trigger('use')
    })
  }, [cmd, active])

  return <app />
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
        key: 'cmd',
        label: 'Name',
        type: 'text',
        descriptor: true,
      },
      {
        type: 'trigger',
        label: 'On Use',
        name: 'use',
      },
      {
        key: `active`,
        label: 'Active',
        type: 'condition',
      },
    ],
  }
}
