import React, { useEffect, useMemo } from 'react'
import { useWorld, useFile, useSignal, useFields } from 'hyperfy'

export default function App() {
  const world = useWorld()
  const fields = useFields()

  const src = useFile(fields.emote)
  const loop = fields.loop
  const cmd = fields.cmd

  const url = useMemo(() => {
    return world.makeEmote(src, { loop, fadeIn: 0.2, fadeOut: 0.2 }, true)
  }, [src, loop])

  useSignal('Play', () => {
    world.setEmote(url)
  })

  useEffect(() => {
    if (!cmd) return
    const command = cmd.startsWith('/') ? cmd.slice(1) : cmd
    return world.command(command, () => {
      world.setEmote(url)
    })
  }, [cmd, url])

  return <app />
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
        key: `name`,
        label: 'Name',
        type: 'text',
        descriptor: true,
      },
      {
        key: `emote`,
        label: 'Emote',
        type: 'file',
        accept: '.glb',
        placeholder: 'glb',
      },
      {
        key: `loop`,
        label: 'Loop',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: true,
      },
      {
        key: `cmd`,
        label: 'Chat Command',
        type: 'text',
        prefix: '/',
      },
    ],
  }
}
