import React from 'react'
import { useEditing } from 'hyperfy'

export default function Spawn() {
  const editing = useEditing()
  return (
    <app>
      <spawn priority={2} />
      {editing && <model src="spawn-block.glb" />}
    </app>
  )
}
