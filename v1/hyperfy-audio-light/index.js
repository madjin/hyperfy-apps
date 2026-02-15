import React, { useEffect, useRef } from 'react'
import { useWorld, useFields, useEditing, useCondition } from 'hyperfy'

export default function App() {
  const world = useWorld()
  const lightRef = useRef()
  const editing = useEditing()
  const fields = useFields()

  const { active, bridgeId, band, factor } = fields // reactor config
  const { type, color, distance, decay, width, depth } = fields // light config

  const enabled = useCondition(active)

  useEffect(() => {
    if (!world.isClient) return
    const light = lightRef.current
    light.setIntensity(0)
    if (!bridgeId) return
    if (!enabled) return
    return world.on('audio-bridge-output', output => {
      if (output.id !== bridgeId) return
      const value = output.values[band]
      // console.log(value)
      light.setIntensity(value * factor)
    })
  }, [enabled, bridgeId, band, factor, type])

  return (
    <app>
      {type === 'point' && (
        <>
          <pointlight
            ref={lightRef}
            color={color}
            distance={distance}
            decay={decay}
          />
          {editing && (
            <model
              src="pointlight.glb"
              castShadow={false}
              receiveShadow={false}
            />
          )}
        </>
      )}
      {type === 'area' && (
        <>
          <arealight ref={lightRef} color={color} width={width} depth={depth} />
          {editing && (
            <box
              color={0x242424}
              position={[0, 0.01, 0]}
              size={[width, 0.005, depth]}
              castShadow={false}
              receiveShadow={false}
            />
          )}
        </>
      )}
    </app>
  )
}

const initialState = {}

export function getStore(state = initialState) {
  return {
    state,
    actions: {},
    fields: [
      {
        key: 'label',
        label: 'Label',
        type: 'text',
        instant: false,
        descriptor: true,
      },
      {
        key: 'type',
        label: 'Type',
        type: 'switch',
        options: [
          { label: 'Point', value: 'point' },
          { label: 'Area', value: 'area' },
        ],
        initial: 'point',
      },
      {
        key: 'color',
        label: 'Color',
        type: 'color',
        placeholder: '#fff',
        initial: '#fff',
      },
      {
        key: 'distance',
        label: 'Distance',
        type: 'float',
        placeholder: 'Infinite',
        conditions: [{ field: 'type', op: 'eq', value: 'point' }],
      },
      {
        key: 'decay',
        label: 'Decay',
        type: 'float',
        placeholder: 2.0,
        initial: 2,
        conditions: [{ field: 'type', op: 'eq', value: 'point' }],
      },
      {
        key: 'width',
        label: 'Width',
        type: 'float',
        placeholder: 2,
        initial: 2,
        conditions: [{ field: 'type', op: 'eq', value: 'area' }],
      },
      {
        key: 'depth',
        label: 'Depth',
        type: 'float',
        placeholder: 2,
        initial: 2,
        conditions: [{ field: 'type', op: 'eq', value: 'area' }],
      },
      {
        type: 'section',
        label: 'Audio',
      },
      {
        key: 'bridgeId',
        label: 'Bridge',
        type: 'link',
        kind: 'hyp/audioBridge',
      },
      {
        key: 'band',
        label: 'Band',
        type: 'switch',
        options: [
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '4', value: 4 },
        ],
        initial: 1,
      },
      {
        key: 'factor',
        label: 'Factor',
        type: 'float',
        initial: 1,
      },
      {
        key: 'active',
        label: 'Active',
        type: 'condition',
      },
    ],
  }
}
