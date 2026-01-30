import React, { useEffect, useState, useMemo } from 'react'
import { useWorld, useFields, useSignal, useScreen } from 'hyperfy'

const BACKSPACE_ICON = 'backspace.png'

export default function App() {
  const [visible, setVisible] = useState(false)

  useSignal('Show', () => {
    setVisible(true)
  })

  useSignal('Hide', () => {
    setVisible(false)
  })

  return <app>{visible && <Keypad onClose={() => setVisible(false)} />}</app>
}

function Keypad({ onClose }) {
  const world = useWorld()
  const fields = useFields()
  const screen = useScreen()
  const [value, setValue] = useState('')

  const codes = useMemo(() => {
    const codes = []
    for (let n = 1; n <= 4; n++) {
      const enabled = fields[`enabled${n}`]
      const value = fields[`code${n}`]
      const trigger = `success${n}`
      if (enabled) {
        codes.push({ value, trigger })
      }
    }
    return codes
  }, [fields])

  let width = 200
  let height = 310
  let top
  let left
  if (screen.width > 880) {
    top = screen.height / 2 - height / 2
    left = screen.width - (screen.width / 2 - width / 2)
  } else {
    top = screen.height / 2 - height / 2
    left = screen.width / 2 - width / 2
  }

  useEffect(() => {
    world.blur()
    return world.on('focus', () => {
      onClose()
    })
  }, [])

  const enter = num => {
    if (value.length === 4) return
    const newValue = value + num
    setValue(newValue)
    if (newValue.length === 4) {
      setTimeout(() => {
        const code = codes.find(code => code.value === newValue)
        if (code) {
          world.trigger(code.trigger)
          onClose()
        }
        setValue('')
      }, 300)
    }
  }

  const backspace = () => {
    if (!value.length) return
    const newValue = value.slice(0, -1)
    setValue(newValue)
  }

  return (
    <gui
      style={{
        top: top + 'px',
        left: left + 'px',
        width: width + 'px',
        height: height + 'px',
        backgroundColor: '#16161c',
        borderRadius: '22px',
      }}
    >
      <guiview style={{ padding: '30px' }}>
        <guiview
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            background: 'rgba(255,255,255,.05)',
            height: '40px',
            borderRadius: '10px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <guitext
            style={{
              fontSize: '24px',
              fontWeight: '500',
              textAlign: 'center',
            }}
          >
            {value}
          </guitext>
        </guiview>
        <guiview style={{ flexDirection: 'row', marginBottom: '10px' }}>
          <Button label="1" onPointerDown={() => enter('1')} />
          <guiview style={{ width: '10px' }} />
          <Button label="2" onPointerDown={() => enter('2')} />
          <guiview style={{ width: '10px' }} />
          <Button label="3" onPointerDown={() => enter('3')} />
        </guiview>
        <guiview style={{ flexDirection: 'row', marginBottom: '10px' }}>
          <Button label="4" onPointerDown={() => enter('4')} />
          <guiview style={{ width: '10px' }} />
          <Button label="5" onPointerDown={() => enter('5')} />
          <guiview style={{ width: '10px' }} />
          <Button label="6" onPointerDown={() => enter('6')} />
        </guiview>
        <guiview style={{ flexDirection: 'row', marginBottom: '10px' }}>
          <Button label="7" onPointerDown={() => enter('7')} />
          <guiview style={{ width: '10px' }} />
          <Button label="8" onPointerDown={() => enter('8')} />
          <guiview style={{ width: '10px' }} />
          <Button label="9" onPointerDown={() => enter('9')} />
        </guiview>
        <guiview style={{ flexDirection: 'row', marginBottom: '10px' }}>
          <Button></Button>
          <guiview style={{ width: '10px' }} />
          <Button label="0" onPointerDown={() => enter('0')} />
          <guiview style={{ width: '10px' }} />
          <Button onPointerDown={() => backspace()}>
            <guiimage
              src={BACKSPACE_ICON}
              style={{ width: '20px', height: '20px', opacity: '0.5' }}
            />
          </Button>
        </guiview>
      </guiview>
    </gui>
  )
}

function Button({ label, onPointerDown, children }) {
  return (
    <guiview
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        background: 'rgba(255,255,255,.07)',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      onPointerDown={onPointerDown}
    >
      {label && (
        <guitext
          style={{
            fontSize: '20px',
            fontWeight: '400',
          }}
        >
          {label}
        </guitext>
      )}
      {children}
    </guiview>
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
      ...makeCodeFields(1, true),
      ...makeCodeFields(2),
      ...makeCodeFields(3),
      ...makeCodeFields(4),
    ],
  }
}

function makeCodeFields(num, enabled = false) {
  return [
    {
      label: `Code #${num}`,
      type: 'section',
    },
    {
      key: `enabled${num}`,
      label: 'Enabled',
      type: 'switch',
      options: [
        { label: 'No', value: false },
        { label: 'Yes', value: true },
      ],
      initial: enabled,
    },
    {
      key: `code${num}`,
      label: 'Code',
      type: 'text',
      allowed: '0123456789',
      placeholder: '4 Digits',
      initial: '1234',
      instant: true,
      conditions: [{ field: `enabled${num}`, op: 'eq', value: true }],
    },
    {
      type: 'trigger',
      label: 'On Success',
      name: `success${num}`,
      conditions: [{ field: `enabled${num}`, op: 'eq', value: true }],
    },
  ]
}
