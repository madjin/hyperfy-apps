import React from 'react'
import { useWorld, useFields } from 'hyperfy'

export default function Text() {
  const world = useWorld()
  const fields = useFields()
  const onPointerDown = fields.$onClick?.length
    ? () => world.trigger('Click')
    : undefined
  return (
    <app>
      <text
        value={fields.value}
        fontSize={fields.fontSize}
        color={fields.color}
        align={fields.align}
        lineHeight={fields.lineHeight}
        anchorX={fields.anchorX}
        anchorY={fields.anchorY}
        maxWidth={fields.maxWidth || undefined}
        bgColor={fields.bgColor || undefined}
        bgRadius={fields.bgRadius}
        padding={fields.padding}
        scale={fields.__lockedScale}
        onPointerDown={onPointerDown}
        onPointerDownHint={fields.hint}
      />
    </app>
  )
}

const initialState = {
  // color: 'white',
}

export function getStore(state = initialState) {
  return {
    state,
    actions: {
      // setColor(state, color) {
      //   state.color = color
      // },
    },
    fields: [
      {
        key: 'value',
        label: 'Text',
        type: 'textarea',
        initial: 'Enter text...',
        descriptor: true,
      },
      {
        key: 'fontSize',
        label: 'Size',
        type: 'float',
        initial: 0.2,
      },
      {
        key: 'color',
        label: 'Color',
        type: 'color',
        initial: '#000',
      },
      {
        key: 'align',
        label: 'Align',
        type: 'switch',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
        initial: 'left',
      },
      {
        key: 'lineHeight',
        label: 'Line Height',
        type: 'float',
        initial: 1.4,
      },
      {
        label: 'Layout',
        type: 'section',
      },
      {
        key: 'anchorX',
        label: 'AnchorX',
        type: 'dropdown',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
        initial: 'center',
      },
      {
        key: 'anchorY',
        label: 'AnchorY',
        type: 'dropdown',
        options: [
          { label: 'Top', value: 'top' },
          { label: 'Top Baseline', value: 'top-baseline' },
          { label: 'Middle', value: 'middle' },
          { label: 'Bottom Baseline', value: 'bottom-baseline' },
          { label: 'Bottom', value: 'bottom' },
        ],
        initial: 'middle',
      },
      {
        key: 'maxWidth',
        label: 'Max Width',
        type: 'float',
        initial: null,
      },
      {
        label: 'Background',
        type: 'section',
      },
      {
        key: 'bgColor',
        label: 'Color',
        type: 'color',
        initial: null,
      },
      {
        key: 'padding',
        label: 'Padding',
        type: 'float',
        initial: 0,
      },
      {
        key: 'bgRadius',
        label: 'Radius',
        type: 'float',
        initial: 0,
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
