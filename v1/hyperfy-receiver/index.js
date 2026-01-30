import React, { useState } from 'react'
import { useCondition, useWorld, useFields, useEditing } from 'hyperfy'

export default function App() {
  const world = useWorld()
  const fields = useFields()
  const editing = useEditing()
  const [near, setNear] = useState(false)

  let { contract, type, tokenId, distance } = fields

  contract = contract?.toLowerCase() || null

  const active = useCondition(fields.active)

  const enabled = active && (!distance || near)

  return (
    <app>
      {editing && <model src="block.glb" />}
      {distance > 0 && (
        <trigger
          size={distance * 2}
          onEnter={() => setNear(true)}
          onLeave={() => setNear(false)}
        />
      )}
      <receiver
        contract={contract}
        tokenId={tokenId}
        onUse={() => world.trigger('Use')}
        disabled={!enabled}
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
        key: 'contract',
        label: 'Contract',
        type: 'text',
        placeholder: '0x...',
        instant: false,
      },
      {
        key: 'tokenId',
        label: 'Token ID',
        type: 'text',
        placeholder: 'Any',
        instant: false,
      },
      {
        key: 'distance',
        label: 'Distance',
        type: 'float',
        placeholder: 'Infinity',
        instant: false,
      },
      {
        key: 'active',
        label: 'Active',
        type: 'condition',
      },
      { type: 'trigger', name: 'Use' },
    ],
  }
}
