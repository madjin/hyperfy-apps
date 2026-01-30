import React from 'react'
import { useWorld, useFields, useFile } from 'hyperfy'
// import { useSyncState } from 'hyperfy'

const DEFAULT_IMAGE = 'blank-image.png'

export default function Image() {
  const world = useWorld()
  const fields = useFields()
  const fileSrc = useFile(fields.src)
  const url = fields.kind === 'url' ? fields.url : fileSrc
  const onPointerDown = fields.$onClick?.length
    ? () => world.trigger('Click')
    : undefined

  let frameWidth
  let frameDepth
  let frameColor
  if (fields.frame) {
    frameWidth = fields.frameWidth || 0.1
    frameDepth = fields.frameDepth || 0.1
    frameColor = fields.frameColor || '#333333'
  }
  return (
    <app>
      <image
        src={url || DEFAULT_IMAGE}
        width={fields.width}
        height={fields.height}
        lit={fields.lit}
        doubleside={fields.doubleside}
        treatAsGif={fields.src?.isGif}
        frameWidth={frameWidth}
        frameDepth={frameDepth}
        frameColor={frameColor}
        scale={fields.__lockedScale}
        onPointerDown={onPointerDown}
        onPointerDownHint={fields.hint}
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
        key: 'nft',
        type: 'boolean',
        hidden: true,
        initial: false,
      },
      {
        key: 'kind',
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
        accept: '.png,.jpg,.jpeg,.gif',
        placeholder: 'png, jpg, gif',
        conditions: [
          { field: 'nft', op: 'ne', value: true },
          { field: 'kind', op: 'eq', value: 'file' },
        ],
        descriptor: true,
      },
      {
        key: 'url',
        label: 'URL',
        type: 'text',
        placeholder: 'png, jpg, gif',
        conditions: [
          { field: 'nft', op: 'ne', value: true },
          { field: 'kind', op: 'eq', value: 'url' },
        ],
        descriptor: true,
        instant: false,
      },
      {
        key: 'width',
        label: 'Width',
        type: 'float',
        placeholder: 'Auto',
      },
      {
        key: 'height',
        label: 'Height',
        type: 'float',
        initial: 1,
        placeholder: 'Auto',
      },
      {
        key: 'lit',
        label: 'Lit',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        key: 'doubleside',
        label: 'Doubleside',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        label: 'Frame',
        type: 'section',
      },
      {
        key: 'frame',
        label: 'Enabled',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        key: 'frameWidth',
        label: 'Width',
        type: 'float',
        initial: 0.1,
        placeholder: '0.1',
        conditions: [{ field: 'frame', op: 'eq', value: true }],
      },
      {
        key: 'frameDepth',
        label: 'Depth',
        type: 'float',
        initial: 0.1,
        placeholder: '0.1',
        conditions: [{ field: 'frame', op: 'eq', value: true }],
      },
      {
        key: 'frameColor',
        label: 'Color',
        type: 'color',
        initial: '#333333',
        conditions: [{ field: 'frame', op: 'eq', value: true }],
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
