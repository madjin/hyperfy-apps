import React, { useEffect, useRef } from 'react'
import {
  useSyncState,
  useWorld,
  useCondition,
  useFields,
  useEditing,
} from 'hyperfy'

const DEFAULT_COLOR = '#1633dc'

export default function Zone() {
  const ref = useRef([])
  const world = useWorld()
  const fields = useFields()
  const editing = useEditing()
  const [occupants, dispatch] = useSyncState(s => s.occupants)

  useEffect(() => {
    if (!world.isServer) return
    const prev = ref.current
    ref.current = occupants
    if (occupants.length === 1 && !prev.length) {
      world.trigger('Active')
    }
    if (occupants.length === 0 && prev.length > 0) {
      world.trigger('Inactive')
    }
    return world.on('leave', avatar => {
      if (occupants.includes(avatar.uid)) {
        dispatch('untrack', avatar.uid)
      }
    })
  }, [occupants])

  const enabled = useCondition(fields.enabled)

  if (!enabled) return <app />

  return (
    <app>
      <trigger
        size={fields.size}
        onEnter={() => {
          const avatarUid = world.getAvatar()?.uid
          if (!avatarUid) return
          world.trigger('Enter')
          dispatch('track', avatarUid)
        }}
        onLeave={() => {
          const avatarUid = world.getAvatar()?.uid
          if (!avatarUid) return
          world.trigger('Leave')
          dispatch('untrack', avatarUid)
        }}
      />
      {editing && (
        <box
          size={fields.size}
          color={fields.color || DEFAULT_COLOR}
          opacity={0.3}
          layer="GUI"
        />
      )}
    </app>
  )
}

const initialState = {
  occupants: [],
}

export function getStore(state = initialState) {
  return {
    state,
    actions: {
      track(state, uid) {
        state.occupants.push(uid)
      },
      untrack(state, uid) {
        state.occupants = state.occupants.filter(i => i !== uid)
      },
    },
    fields: [
      {
        key: 'label',
        label: 'Label',
        type: 'text',
        descriptor: true,
      },
      {
        key: 'size',
        label: 'Size',
        type: 'vec3',
        initial: [2, 2, 2],
      },
      {
        key: 'color',
        type: 'color',
        label: 'Color',
        initial: DEFAULT_COLOR,
      },
      {
        key: 'enabled',
        label: 'Active',
        type: 'condition',
      },
      {
        type: 'section',
        label: 'Triggers',
      },
      {
        type: 'trigger',
        name: 'Enter',
      },
      {
        type: 'trigger',
        name: 'Leave',
      },
      {
        type: 'trigger',
        name: 'Active',
      },
      {
        type: 'trigger',
        name: 'Inactive',
      },
    ],
  }
}
