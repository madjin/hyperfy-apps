import React, { useMemo } from 'react'
import { useFields, useFile } from 'hyperfy'

export default function App() {
  const fields = useFields()
  const avatar1 = useFile(fields.avatar1)
  const avatar2 = useFile(fields.avatar2)
  const avatar3 = useFile(fields.avatar3)

  const srcs = useMemo(() => {
    return [avatar1, avatar2, avatar3].filter(url => !!url)
  }, [avatar1, avatar2, avatar3])

  return (
    <app>
      <avatars srcs={srcs} />
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
        key: 'avatar1',
        label: 'Avatar #1',
        type: 'file',
        accept: '.vrm',
      },
      {
        key: 'avatar2',
        label: 'Avatar #2',
        type: 'file',
        accept: '.vrm',
      },
      {
        key: 'avatar3',
        label: 'Avatar #3',
        type: 'file',
        accept: '.vrm',
      },
    ],
  }
}
