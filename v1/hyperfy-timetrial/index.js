import React, { useState, useRef, useMemo } from 'react'
import { useWorld, useFields, useSignal, useEditing } from 'hyperfy'

const defaults = {
  message: 'Congrats!',
  color: '#ffffff',
  broadcast: '{name} finished in {time}!',
}

export default function App() {
  const world = useWorld()
  const fields = useFields()
  const editing = useEditing()

  const startTimeRef = useRef()
  const [status, setStatus] = useState('idle')

  const time = useMemo(() => {
    if (status !== 'complete') return null
    return (world.getServerTime() - startTimeRef.current).toFixed(2)
  }, [status, startTimeRef.current])

  useSignal('Begin', () => {
    startTimeRef.current = world.getServerTime()
    setStatus('active')
  })

  useSignal('End', () => {
    // signal only works if it began
    if (status === 'active') {
      setStatus('complete')
      if (fields.broadcast) {
        let text = fields.broadcast
        const { name } = world.getAvatar()
        const time =
          (world.getServerTime() - startTimeRef.current).toFixed(2) + 's'
        text = text.replace('{name}', name)
        text = text.replace('{time}', time)
        world.chat(text)
      }
    }
  })

  useSignal('Clear', () => {
    setStatus('idle')
  })

  const preview = status !== 'complete' && editing
  const visible = status === 'complete' || preview

  return (
    <app>
      {visible && (
        <MaybeBillboard enabled={fields.billboard}>
          <group scale={fields.size || 1}>
            <text
              position={[0, 0.4, 0]}
              anchorY="middle"
              value={`Time: ${preview ? '00.00' : time}s`}
              color={fields.color || defaults.color}
              fontSize={0.5}
              opacity={preview ? 0.4 : 1}
            />
            <text
              position={[0, -0.1, 0]}
              anchorY="middle"
              value={fields.message || defaults.message}
              color={fields.color || defaults.color}
              fontSize={0.3}
              opacity={preview ? 0.4 : 1}
            />
          </group>
        </MaybeBillboard>
      )}
    </app>
  )
}

function MaybeBillboard({ enabled, children }) {
  if (!enabled) return children
  return <billboard axis="y">{children}</billboard>
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
        placeholder: 'Optional',
        descriptor: true,
      },
      {
        key: 'message',
        label: 'Message',
        type: 'text',
        placeholder: defaults.message,
      },
      {
        key: 'color',
        label: 'Color',
        type: 'color',
        placeholder: defaults.color,
        instant: false,
      },
      {
        key: 'size',
        label: 'Size',
        type: 'float',
        placeholder: '1',
        initial: 1,
      },
      {
        key: 'billboard',
        label: 'Billboard',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: true,
      },
      {
        key: 'broadcast',
        label: 'Broadcast',
        type: 'text',
        initial: defaults.broadcast,
        instant: false,
      },
    ],
  }
}
