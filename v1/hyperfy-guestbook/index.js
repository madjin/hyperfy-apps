import React, { useEffect, useRef } from 'react'
import { useWorld, useEditing, useFields, useSignal } from 'hyperfy'

const API_URL = 'https://api.hyperfy.io'
// const API_URL = 'http://localhost:4000/api'

export default function App() {
  const world = useWorld()
  const fields = useFields()
  const signedRef = useRef()
  const editing = useEditing()

  const event = fields.id

  useEffect(() => {
    signedRef.current = false
  }, [event])

  useSignal('Sign', async () => {
    if (!event) {
      return world.chat('Guestbook not configured.', true)
    }
    if (signedRef.current) {
      return world.trigger('Already Signed')
    }
    const avatar = world.getAvatar()
    if (!avatar.address) {
      return world.trigger('No Wallet')
    }
    try {
      signedRef.current = true
      await world.http({
        method: 'POST',
        url: `${API_URL}/guestbook/${event}`,
        data: {
          event,
          name: avatar.name,
          address: avatar.address,
        },
      })
      world.trigger('Sign')
    } catch (err) {
      signedRef.current = false
      console.log('Error signing guestbook')
      console.error(err)
    }
  })

  useSignal('Download', () => {
    if (!event) return world.chat('Guestbook not configured.', true)
    world.open(`${API_URL}/guestbook/${event}/list`, true)
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
        key: 'id',
        label: 'Event ID',
        type: 'text',
        lowercase: true,
        allowed: '0123456789abcdefghijklmnopqrstuvwxyz_-',
        descriptor: true,
      },
      { type: 'trigger', name: 'Sign' },
      { type: 'trigger', name: 'No Wallet' },
      { type: 'trigger', name: 'Already Signed' },
    ],
  }
}
