import React, { useRef, useEffect, useState } from 'react'
import { useSignal, useFields, useScreen } from 'hyperfy'

export default function App() {
  const uiRef = useRef()
  const fields = useFields()
  const screen = useScreen()
  const [visible, setVisible] = useState(false)

  const text = fields.text || 'Enter text'
  const size = fields.size || '50'
  const color = fields.color || 'white'
  const duration = fields.duration || '1'

  let width = 340
  let height = 400
  let top
  let left
  if (screen.width > 880) {
    top = screen.height / 2 - height / 2
    left = screen.width - (screen.width / 2 - width / 2)
  } else {
    top = screen.height - height - 20
    left = screen.width / 2 - width / 2
  }

  useSignal('Show', () => {
    setVisible(true)
  })

  // useSignal('Hide', () => {
  //   setVisible(false)
  // })

  useEffect(() => {
    if (!visible) return
    const ui = uiRef.current
    ui.style('opacity', '1')
    ui.style('transform', 'scale(1)')
    setTimeout(() => {
      setVisible(false)
    }, duration * 1000)
  }, [visible])

  return (
    <app>
      {visible && (
        <gui
          ref={uiRef}
          style={{
            inset: '0',
            bottom: '40%',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            transform: 'scale(0.8)',
            opacity: '0',
            transition: 'all 0.15s ease-out',
          }}
        >
          <guiview style={{ padding: '30px' }}>
            <guitext
              style={{
                color: color,
                fontSize: `${size}px`,
                fontWeight: '600',
                textAlign: 'center',
                textShadow: '0px 0px 10px rgba(0, 0, 0, 0.4)',
                margin: '0 0 20px',
              }}
            >
              {text}
            </guitext>
          </guiview>
        </gui>
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
        key: 'text',
        type: 'text',
        label: 'Text',
        placeholder: 'Enter text',
        descriptor: true,
      },
      {
        key: 'size',
        type: 'text',
        allowed: '0123456789',
        placeholder: '50',
        label: 'Size',
      },
      {
        key: 'color',
        label: 'Color',
        type: 'color',
        placeholder: '#fff',
        initial: '#fff',
      },
      {
        key: 'duration',
        label: 'Duration',
        type: 'text',
        allowed: '0123456789.',
        initial: '1',
        placeholder: '1',
      },
    ],
  }
}
