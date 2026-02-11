import React, { useEffect } from 'react'
import { useWorld, useEditing, useFields } from 'hyperfy'

const DEBUG = false
const BLOCK_MODEL = 'block.glb'

export default function Discord() {
  const world = useWorld()
  const editing = useEditing()
  const fields = useFields()

  useEffect(() => {
    if (!world.isServer) return
    if (!fields.url) return
    if (!fields.onChat && !fields.onEvents) return
    async function send(content) {
      if (DEBUG) {
        console.log(`[discord] -> ${content}`)
      }
      try {
        await world.http({
          method: 'POST',
          url: fields.url,
          data: { content },
        })
      } catch (err) {
        console.error(err)
        console.log('[discord] invalid webhook url')
      }
    }
    return world.on('chat', msg => {
      if (msg.from) {
        if (fields.onChat) {
          send(`**${msg.from}**: ${msg.text}`)
        }
      } else {
        if (fields.onEvents) {
          send(msg.text)
        }
      }
    })
  }, [fields.url, fields.onChat, fields.onEvents])

  return <app>{editing && <model src={BLOCK_MODEL} />}</app>
}

const initialState = {}

export function getStore(state = initialState) {
  return {
    state,
    actions: {},
    fields: [
      {
        key: 'url',
        label: 'Webhook',
        type: 'text',
        instant: false,
        placeholder: 'https://discord.com/api/...',
      },

      {
        key: 'onChat',
        label: 'Chat',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: true,
      },
      {
        key: 'onEvents',
        label: 'Events',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: true,
      },
    ],
  }
}
