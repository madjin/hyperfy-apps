import React, { useEffect, useRef } from 'react'
import { useEditing, useWorld, useFields, useSignal } from 'hyperfy'

export default function App() {
  const world = useWorld()
  const fields = useFields()
  const editing = useEditing()
  const activeRef = useRef()

  const instant = fields.instant
  const add = fields.add
  const amount = fields.add ? fields.amount : -fields.amount
  const tickDelay = fields.tickDelay
  const tickCount = fields.tickCount ? parseInt(fields.tickCount) : Infinity

  useEffect(() => {
    activeRef.current = false
  }, [instant, add, amount, tickDelay, tickCount])

  useSignal(
    'Apply',
    () => {
      const playerId = world.getAvatar()?.uid
      world.emit('hfy-combat-heal', { playerId, amount })
    },
    !fields.instant
  )

  useSignal(
    'Start',
    async () => {
      if (activeRef.current) return // already started
      activeRef.current = true
      const playerId = world.getAvatar()?.uid
      let ticks = 0
      while (ticks < tickCount) {
        ticks++
        world.emit('hfy-combat-heal', { playerId, amount })
        await delay(tickDelay * 1000)
        if (!activeRef.current) return
      }
      activeRef.current = false
    },
    fields.instant
  )

  useSignal(
    'Stop',
    () => {
      activeRef.current = false
    },
    fields.instant
  )

  return (
    <app>
      {editing && (
        <model src="block.glb" castShadow={false} receiveShadow={false} />
      )}
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
        instant: false,
        descriptor: true,
      },
      {
        key: 'add',
        label: 'Type',
        type: 'switch',
        options: [
          { label: 'Heal', value: true },
          { label: 'Damage', value: false },
        ],
        initial: true,
      },
      {
        key: 'amount',
        label: 'Amount',
        type: 'float',
        initial: 10,
      },
      {
        key: 'instant',
        label: 'Timing',
        type: 'switch',
        options: [
          { label: 'Instant', value: true },
          { label: 'Tick Based', value: false },
        ],
        initial: true,
      },
      {
        key: 'tickDelay',
        label: 'Tick Delay',
        type: 'float',
        initial: 5,
        conditions: [{ field: 'instant', op: 'eq', value: false }],
      },
      {
        key: 'tickCount',
        label: 'Num Ticks',
        type: 'text',
        allowed: '0123456789',
        placeholder: 'Infinite',
        conditions: [{ field: 'instant', op: 'eq', value: false }],
      },
    ],
  }
}

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
