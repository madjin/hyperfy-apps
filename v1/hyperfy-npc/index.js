import React, { useEffect, useState, useRef, useMemo } from 'react'
import {
  useWorld,
  useFields,
  useQuests,
  useCondition,
  useFile,
  useEntityUid,
} from 'hyperfy'
import { Vector3 } from 'hyperfy'

import { Dialog } from './Dialog'
import { useQuestPoint } from './useQuestPoint'
import { Icon } from './Icon'

const v1 = new Vector3()

export default function App() {
  const id = useEntityUid()
  const world = useWorld()
  const fields = useFields()

  const [v, setV] = useState(0)
  const [dialog, setDialog] = useState(false)

  const vrmRef = useRef()
  const vrmUrl = useFile(fields.vrm)

  const name = fields.name || null

  const floatRef = useRef()
  const floatVisible = vrmUrl && vrmRef.current

  const emoteSrc = useFile(fields.emote)

  const visible = useCondition(fields.visible)

  const messages = useMemo(() => {
    const messages = []
    for (let n = 1; n <= fields.messages; n++) {
      const message = {}
      message.id = `${id}/${n}`
      message.prompt = fields[`message${n}Prompt`]
      message.response = fields[`message${n}Response`]
      message.condition = fields[`message${n}Condition`]
      messages.push(message)
    }
    return messages
  }, [fields])

  const point = useQuestPoint(id, messages)

  useEffect(() => {
    const vrm = vrmRef.current
    const float = floatRef.current
    if (!float || !vrm) return
    // position name above vrm head
    return world.onUpdate(() => {
      vrm.getBonePosition('head', v1)
      v1.y += vrm.getHeadToFullHeight() + 0.2
      float.setPosition(v1)
    })
  }, [v])

  useEffect(() => {
    if (!dialog) return
    return world.on('hyp/dialog/open', _id => {
      if (_id === id) return
      setDialog(false)
    })
  }, [dialog])

  if (!visible) return <app />

  return (
    <app>
      <global>
        {floatVisible && (
          <billboard ref={floatRef} axis="y">
            {name && <text value={name} color="white" />}
            <Icon position={[0, 0.2, 0]} icon={point.icon} />
          </billboard>
        )}
      </global>
      {vrmUrl && (
        <vrm
          ref={vrmRef}
          src={vrmUrl}
          emote={emoteSrc}
          onLoad={() => setV(v => v + 1)}
          onPointerDown={() => {
            world.emit('hyp/dialog/open', id)
            setDialog(v => !v)
          }}
          onPointerDownHint={dialog ? undefined : 'Talk'}
        />
      )}
      {dialog && (
        <>
          <Dialog
            title={name}
            greeting={fields.greeting}
            quests={point.quests}
            messages={messages}
            onClose={() => setDialog(false)}
          />
          <trigger size={8} onLeave={() => setDialog(false)} />
        </>
      )}
      <link
        kind="hyp/questPoint"
        label={`NPC: ${fields.name || 'No name'}`}
        value={id}
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
        key: 'name',
        label: 'Name',
        type: 'text',
        descriptor: true,
      },
      {
        key: 'vrm',
        label: 'Model',
        type: 'file',
        accept: '.vrm',
        placeholder: 'vrm',
      },
      {
        key: 'emote',
        label: 'Emote',
        type: 'file',
        accept: '.glb',
        placeholder: 'glb',
      },
      {
        key: 'greeting',
        label: 'Greeting',
        type: 'textarea',
        instant: false,
      },
      {
        key: 'visible',
        label: 'Visible',
        type: 'condition',
      },
      {
        key: 'messages',
        label: 'Messages',
        type: 'switch',
        options: [
          { label: '0', value: 0 },
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '4', value: 4 },
        ],
        initial: 0,
      },
      ...makeMessageFields(1),
      ...makeMessageFields(2),
      ...makeMessageFields(3),
      ...makeMessageFields(4),
    ],
  }
}

function makeMessageFields(n) {
  return [
    {
      type: 'section',
      label: `Message #${n}`,
      conditions: [{ field: 'messages', op: 'gte', value: n }],
    },
    {
      key: `message${n}Prompt`,
      label: 'Prompt',
      type: 'text',
      conditions: [{ field: 'messages', op: 'gte', value: n }],
    },
    {
      key: `message${n}Response`,
      label: 'Response',
      type: 'textarea',
      conditions: [{ field: 'messages', op: 'gte', value: n }],
    },
    {
      type: 'trigger',
      name: `message${n}Trigger`,
      label: 'On Click',
      conditions: [{ field: 'messages', op: 'gte', value: n }],
    },
    {
      key: `message${n}Condition`,
      label: 'Visible',
      type: 'condition',
      conditions: [{ field: 'messages', op: 'gte', value: n }],
    },
  ]
}
