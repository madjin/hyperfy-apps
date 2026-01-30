import React, { useEffect, useState, useRef } from 'react'
import { useFields, useSignal } from 'hyperfy'

export default function App() {
  const fields = useFields()
  const timerRef = useRef()
  const [active, setActive] = useState(false)

  const apply = () => {
    clearTimeout(timerRef.current)
    setActive(true)
    const duration = (parseInt(fields.duration) || 0) * 1000
    timerRef.current = setTimeout(() => {
      setActive(false)
    }, duration)
  }

  const remove = () => {
    clearTimeout(timerRef.current)
    setActive(false)
  }

  useSignal('Apply', () => apply())
  useSignal('Remove', () => remove())

  useEffect(() => {
    remove()
  }, [fields])

  return (
    <app>
      {active && (
        <>
          {fields.move && (
            <effect
              name="moveMod"
              value={(parseInt(fields.moveValue) || 0) / 100}
              group={fields.group}
            />
          )}
          {fields.fly && (
            <effect
              name="flyMod"
              value={(parseInt(fields.flyValue) || 0) / 100}
              group={fields.group}
            />
          )}
          {fields.jump && (
            <effect
              name="jumpMod"
              value={(parseInt(fields.jumpValue) || 0) / 100}
              group={fields.group}
            />
          )}
        </>
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
        key: 'name',
        label: 'Name',
        type: 'text',
        descriptor: true,
      },
      {
        key: 'duration',
        label: 'Duration (s)',
        type: 'text',
        allowed: '0123456789',
        instant: true,
        initial: '5',
        placeholder: '0',
      },
      {
        key: 'group',
        label: 'Group',
        type: 'text',
        placeholder: 'None (Additive)',
      },
      {
        label: 'Move Speed',
        type: 'section',
      },
      {
        key: 'move',
        label: 'Modify',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        key: 'moveValue',
        label: 'Amount (%)',
        type: 'text',
        allowed: '0123456789',
        initial: '100',
        placeholder: '0',
        conditions: [{ field: 'move', op: 'eq', value: true }],
      },
      {
        label: 'Jump Force',
        type: 'section',
      },
      {
        key: 'jump',
        label: 'Modify',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        key: 'jumpValue',
        label: 'Amount (%)',
        type: 'text',
        allowed: '0123456789',
        placeholder: '0',
        initial: '100',
        conditions: [{ field: 'jump', op: 'eq', value: true }],
      },
      {
        label: 'Fly Speed',
        type: 'section',
      },
      {
        key: 'fly',
        label: 'Modify',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        key: 'flyValue',
        label: 'Amount (%)',
        type: 'text',
        allowed: '0123456789',
        placeholder: '0',
        initial: '100',
        conditions: [{ field: 'fly', op: 'eq', value: true }],
      },
    ],
  }
}
