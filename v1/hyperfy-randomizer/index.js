import React from 'react'
import {
  randomInt,
  useSignal,
  useWorld,
  useEditing,
  useFields,
  useCondition,
} from 'hyperfy'

export default function App() {
  const world = useWorld()
  const fields = useFields()
  const editing = useEditing()

  const enabled = useCondition(fields.enabled)

  const actions = []
  let totalWeight = 0
  for (let n = 1; n <= fields.amount; n++) {
    const value = fields[`weight${n}`]
    const weight = value ? parseInt(value) : 0
    actions.push({ n, weight })
    totalWeight += weight
  }

  useSignal('Run', () => {
    if (!enabled) return
    const num = randomInt(0, totalWeight)
    let weightSum = 0
    let n
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i]
      const weight = action.weight
      weightSum += weight
      if (weight === 0) {
        // skip actions with zero weight
        continue
      }
      if (num <= weightSum) {
        n = action.n
        break
      }
    }
    console.log('Randomizer:', n)
    world.trigger(`trigger${n}`)
  })

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
        key: `enabled`,
        label: 'Active',
        type: 'condition',
      },
      {
        key: 'amount',
        label: 'Amount',
        type: 'switch',
        options: [
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '4', value: 4 },
          { label: '5', value: 5 },
        ],
        initial: 2,
      },
      ...makeActionFields(1),
      ...makeActionFields(2),
      ...makeActionFields(3),
      ...makeActionFields(4),
      ...makeActionFields(5),
    ],
  }
}

const makeActionFields = n => {
  return [
    {
      type: 'section',
      label: `Action #${n}`,
      conditions: [{ field: 'amount', op: 'gte', value: n }],
    },
    {
      key: `weight${n}`,
      label: 'Weight',
      type: 'text',
      allowed: '0123456789',
      initial: '1',
      placeholder: '0',
      conditions: [{ field: 'amount', op: 'gte', value: n }],
    },
    {
      type: 'trigger',
      name: `trigger${n}`,
      label: 'Action',
      conditions: [{ field: 'amount', op: 'gte', value: n }],
    },
  ]
}
