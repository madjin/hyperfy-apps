import React from 'react'
import { useWorld, useFields, useFile } from 'hyperfy'

const DEFAULT_VRM = 'https://data.hyperfy.xyz/core/hyperbot-v2.vrm' // prettier-ignore
const DEFAULT_IMAGE = 'placeholder.png'

export default function App() {
  const world = useWorld()
  const fields = useFields()
  const vrm = useFile(fields.vrm) || DEFAULT_VRM
  const collectable = fields.collectable
  const display = fields.display
  const instant = fields.instant
  const image = useFile(fields.image) || DEFAULT_IMAGE
  const imageWidth = fields.imageWidth
  const imageHeight = fields.imageHeight
  const emote = useFile(fields.emote)

  let onPointerDown
  let onPointerDownHint
  // can only equip if vrm is fully uploaded
  if (fields.vrm && fields.vrm.url && !fields.vrm.onlyFor) {
    onPointerDown = () => {
      world.equipVRM(vrm, collectable, collectable ? false : instant)
      world.trigger('Click')
    }
    onPointerDownHint = 'Equip'
  }

  return (
    <app>
      {display === 'model' && (
        <vrm
          src={vrm}
          emote={emote}
          onPointerDown={onPointerDown}
          onPointerDownHint={onPointerDownHint}
        />
      )}
      {display === 'image' && (
        <image
          src={image}
          lit={false}
          width={imageWidth}
          height={imageHeight}
          onPointerDown={onPointerDown}
          onPointerDownHint={onPointerDownHint}
          doubleside
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
        key: 'vrm',
        label: 'Model',
        type: 'file',
        accept: '.vrm',
        placeholder: 'vrm',
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
        key: 'collectable',
        label: 'Collectable',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: true,
      },
      {
        key: 'instant',
        label: 'Instant Equip',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
        conditions: [{ field: 'collectable', op: 'eq', value: false }],
      },
      {
        key: 'display',
        label: 'Display',
        type: 'switch',
        options: [
          { label: 'Model', value: 'model' },
          { label: 'Image', value: 'image' },
        ],
        initial: 'model',
      },
      {
        key: 'image',
        label: 'Image',
        type: 'file',
        accept: '.png,.jpg,.jpeg',
        conditions: [{ field: 'display', op: 'eq', value: 'image' }],
      },
      {
        key: 'imageWidth',
        label: 'Width',
        type: 'float',
        placeholder: 'Auto',
        conditions: [{ field: 'display', op: 'eq', value: 'image' }],
      },
      {
        key: 'imageHeight',
        label: 'Height',
        type: 'float',
        initial: 1,
        placeholder: 'Auto',
        conditions: [{ field: 'display', op: 'eq', value: 'image' }],
      },
      { type: 'section', label: 'Triggers' },
      { type: 'trigger', name: 'Click' },
    ],
  }
}
