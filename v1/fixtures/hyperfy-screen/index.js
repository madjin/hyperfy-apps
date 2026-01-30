import React from 'react'
import { useFields, useFile, useEntityUid } from 'hyperfy'

export default function Screen() {
  const id = useEntityUid()
  const fields = useFields()
  const image = useFile(fields.image)
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
      <screen
        id={id}
        size={[null, fields.height]}
        label={fields.label}
        scale={fields.__lockedScale}
        image={image}
        audioVolume={fields.audioVolume}
        audioSpatial={fields.audioSpatial}
        audioDistance={fields.audioDistance}
        audioRolloff={fields.audioRolloff}
        frameWidth={frameWidth}
        frameDepth={frameDepth}
        frameColor={frameColor}
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
        key: 'label',
        label: 'Label',
        type: 'text',
      },
      {
        key: 'image',
        label: 'Thumbnail',
        type: 'file',
        accept: '.jpg,.jpeg,.png',
        placeholder: 'png, jpg',
      },
      {
        key: 'height',
        label: 'Height',
        type: 'float',
        initial: 2,
      },
      {
        type: 'section',
        label: 'Audio',
      },
      {
        key: 'audioVolume',
        label: 'Volume',
        type: 'float',
        initial: 1,
      },
      {
        key: 'audioSpatial',
        label: 'Spatial',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        key: 'audioDistance',
        label: 'Distance',
        type: 'float',
        placeholder: '10',
        conditions: [{ field: 'audioSpatial', op: 'eq', value: true }],
      },
      {
        key: 'audioRolloff',
        label: 'Rolloff',
        type: 'float',
        placeholder: '3',
        conditions: [{ field: 'audioSpatial', op: 'eq', value: true }],
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

      // legacy non-uniform scale
      {
        key: '__lockedScale',
        type: 'vec3',
        hidden: true,
      },
    ],
  }
}
