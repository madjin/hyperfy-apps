import React from 'react'
import { useWorld, useFields, useFile } from 'hyperfy'

const DEFAULT_MODEL = 'block-model.glb'

export default function Model() {
  const world = useWorld()
  const fields = useFields()
  const fileSrc = useFile(fields.src)
  const url = fields.type === 'url' ? fields.url : fileSrc
  const scale = fields.__lockedScale?.map(n => n * fields.scale) || fields.scale
  const onPointerDown = fields.$onClick?.length
    ? () => world.trigger('Click')
    : undefined
  return (
    <app>
      <rigidbody type="kinematic">
        <model
          scale={scale}
          src={url || DEFAULT_MODEL}
          animate={fields.anim?.name}
          animateSlot="anim"
          collision={fields.collision}
          onPointerDown={onPointerDown}
          onPointerDownHint={fields.hint}
        />
      </rigidbody>
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
        key: 'nft',
        type: 'boolean',
        hidden: true,
        initial: false,
      },
      {
        key: 'type',
        label: 'Type',
        type: 'switch',
        options: [
          { label: 'File', value: 'file' },
          { label: 'URL', value: 'url' },
        ],
        initial: 'file',
        conditions: [{ field: 'nft', op: 'ne', value: true }],
      },
      {
        key: 'src',
        label: 'File',
        type: 'file',
        accept: '.glb',
        placeholder: 'glb',
        conditions: [
          { field: 'nft', op: 'ne', value: true },
          { field: 'type', op: 'eq', value: 'file' },
        ],
        descriptor: true,
      },
      {
        key: 'url',
        label: 'URL',
        type: 'text',
        placeholder: 'glb',
        conditions: [
          { field: 'nft', op: 'ne', value: true },
          { field: 'type', op: 'eq', value: 'url' },
        ],
        descriptor: true,
        instant: false,
      },
      {
        key: 'scale',
        label: 'Scale',
        type: 'float',
        initial: 1,
      },
      {
        key: 'collision',
        label: 'Collision',
        type: 'switch',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Inherit', value: 'auto' },
          { label: 'All', value: 'trimesh' },
        ],
        initial: 'none',
      },
      {
        key: 'anim',
        label: 'Animation',
        type: 'anim',
        slot: 'anim',
        hideLoopOption: true,
        hideBlendOption: true,
      },
      {
        type: 'section',
        label: 'Interaction',
      },
      {
        type: 'trigger',
        name: 'Click',
      },
      {
        key: 'hint',
        label: 'Hint',
        type: 'text',
        placeholder: 'None',
      },
      // legacy non-uniform scale
      {
        key: '__lockedScale',
        type: 'vec3',
        hidden: true,
      },
    ],
  }
}
