import React, { useEffect, useState, useRef, useMemo } from 'react'
import {
  useWorld,
  useFields,
  useEditing,
  useEntityUid,
  useSignal,
} from 'hyperfy'

const DEFAULT_FORMAT = '{time}s'

export default function App() {
  const timerRef = useRef()
  const textRef = useRef()
  const id = useEntityUid()
  const world = useWorld()
  const fields = useFields()
  const editing = useEditing()
  const [active, setActive] = useState(false)

  const overlay = fields.overlay
  const format = fields.format || DEFAULT_FORMAT

  const visible = overlay && active

  useEffect(() => {
    const timer = new Timer()
    timerRef.current = timer
    return world.on('hyp:score:request', _id => {
      if (_id !== id) return
      world.emit('hyp:score:announce', timer.getTotal())
    })
  }, [])

  useEffect(() => {
    if (!visible) return
    const text = textRef.current
    const timer = timerRef.current
    let elapsed = 0
    return world.onUpdate(delta => {
      elapsed += delta
      if (elapsed < 0.1) return
      elapsed = 0
      const total = timer.getTotal().toFixed(2)
      const value = format.replace('{time}', total)
      text.setValue(value)
    })
  }, [visible, format])

  useSignal('Start', () => {
    const timer = timerRef.current
    timer.start()
    setActive(true)
  })

  useSignal('Pause', () => {
    const timer = timerRef.current
    timer.pause()
  })

  useSignal('Stop', () => {
    const timer = timerRef.current
    timer.stop()
    setActive(false)
  })

  return (
    <app>
      {visible && (
        <gui
          style={{
            top: '10%',
            left: '0',
            right: '0',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <guiview style={{ padding: '30px' }}>
            <guitext
              ref={textRef}
              style={{
                color: '#ffffff',
                fontSize: `40px`,
                fontWeight: '600',
                fontFamily: 'Roboto Mono',
                textAlign: 'center',
                textShadow: '0px 0px 10px rgba(0, 0, 0, 0.4)',
              }}
            />
          </guiview>
        </gui>
      )}
      <link
        kind="hyp/scoreboardSource"
        label={fields.label ? `Timer: ${fields.label}` : 'Timer'}
        value={id}
      />
      {editing && <model src="block.glb" />}
    </app>
  )
}

class Timer {
  constructor() {
    this.total = 0
    this.startAt = null
  }

  start() {
    if (this.startAt) return
    this.startAt = performance.now()
  }

  pause() {
    if (!this.startAt) return
    this.total += performance.now() - this.startAt
    this.startAt = null
  }

  stop() {
    this.total = 0
    this.startAt = null
  }

  getTotal() {
    let total = this.total
    if (this.startAt) {
      total += performance.now() - this.startAt
    }
    return total / 1000
  }
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
        key: 'overlay',
        label: 'Overlay',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        key: 'format',
        label: 'Format',
        type: 'text',
        initial: DEFAULT_FORMAT,
        conditions: [{ field: 'overlay', op: 'eq', value: true }],
      },
    ],
  }
}
