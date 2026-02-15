import React, { useEffect, useRef } from 'react'
import { useFields, useEditing, useCondition, useWorld } from 'hyperfy'

const VIDEO_COLOR_RATE = 1 / 10 // 10 times per second

export default function App() {
  const world = useWorld()
  const lightRef = useRef()
  const editing = useEditing()
  const {
    type,
    source,
    color,
    videoId,
    intensity,
    distance,
    decay,
    width,
    depth,
    active,
  } = useFields()
  const visible = useCondition(active)
  useEffect(() => {
    if (world.isServer) return
    if (source !== 'video') return
    if (!videoId) return
    const light = lightRef.current
    let n = 0
    return world.onUpdate(delta => {
      n += delta
      if (n < VIDEO_COLOR_RATE) return
      n = 0
      // try {
      const color = world.getVideoColor(videoId)
      light.setColor(color)
      // } catch (err) {
      //   console.error(err)
      // }
    })
  }, [type, source, videoId])
  return (
    <app>
      {type === 'point' && (
        <>
          <pointlight
            ref={lightRef}
            color={color}
            intensity={visible ? intensity : 0}
            distance={distance}
            decay={decay}
          />
          {editing && (
            <model
              src="pointlight.glb"
              castShadow={false}
              receiveShadow={false}
              layer="GUI"
            />
          )}
        </>
      )}
      {type === 'area' && (
        <>
          <arealight
            ref={lightRef}
            color={color}
            intensity={visible ? intensity : 0}
            width={width}
            depth={depth}
          />
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
        key: 'source',
        label: 'Source',
        type: 'switch',
        options: [
          { label: 'Color', value: 'color' },
          { label: 'Video', value: 'video' },
        ],
        initial: 'color',
      },
      {
        key: 'color',
        label: 'Color',
        type: 'color',
        placeholder: '#fff',
        initial: '#fff',
        conditions: [{ field: 'source', op: 'eq', value: 'color' }],
      },
      {
        key: 'videoId',
        label: 'Video',
        type: 'link',
        kind: 'hyp/videoSource',
        conditions: [{ field: 'source', op: 'eq', value: 'video' }],
      },
      {
        key: 'intensity',
        label: 'Intensity',
        type: 'float',
        placeholder: 10.0,
        initial: 10,
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
        key: 'active',
        label: 'Active',
        type: 'condition',
      },
    ],
  }
}
