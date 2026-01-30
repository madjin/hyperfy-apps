import React from 'react'
import {
  useSignal,
  useWorld,
  useFields,
  useEditing,
  useEntityUid,
  useFile,
} from 'hyperfy'
import { Vector3, Euler } from 'hyperfy'

const v1 = new Vector3()

const DEFAULT_EMOTE = 'Sitting Idle.glb'

export default function App() {
  const id = useEntityUid()
  const world = useWorld()
  const editing = useEditing()
  const fields = useFields()

  const click = fields.click
  const hint = fields.hint

  const emoteSrc = useFile(fields.emote) || DEFAULT_EMOTE

  const sit = () => {
    const avatar = world.getAvatar()
    // const endPosition = avatar.getPosition(v1).toArray()
    world.setAnchor({ id, endOnMove: true, endPosition: null })
    world.emote(emoteSrc)
  }

  useSignal('Sit', sit)

  return (
    <app>
      <anchor id={id} />
      <emote key={emoteSrc} id={emoteSrc} src={emoteSrc} loop />
      {editing && <model src="block.glb" />}
      {click && !editing && (
        <model
          src="block-invisible.glb"
          layer="HITBOX"
          onPointerDown={sit}
          onPointerDownHint={hint}
        />
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
        descriptor: true,
      },
      {
        key: 'emote',
        label: 'Emote',
        type: 'file',
        accept: '.glb',
        placeholder: 'glb',
      },
      {
        key: 'click',
        label: 'Clickable',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: true,
      },
      {
        key: 'hint',
        label: 'Hint',
        type: 'text',
        initial: 'Sit',
        conditions: [{ field: 'click', op: 'eq', value: true }],
      },
    ],
  }
}
