import React, { useEffect, useRef } from 'react'
import {
  useSyncState,
  useWorld,
  // useEditing,
  useCondition,
  useEntityUid,
  useSignal,
  useFields,
  useFile,
} from 'hyperfy'

export default function App() {
  const fields = useFields()
  const active = useCondition(fields.active)
  if (!active) return <app />
  return <Video />
}

function Video() {
  const world = useWorld()
  // const editing = useEditing()
  const ref = useRef()
  const fields = useFields()
  const fileSrc = useFile(fields.src)
  const modelSrc = useFile(fields.modelSrc)
  const src = fields.kind === 'url' ? fields.url : fileSrc
  const model = fields.display === 'model' ? modelSrc : null
  const modelUV = fields.modelUV
  const [state, dispatch] = useSyncState(s => s)

  const sourceId = useEntityUid()
  const sourceLabel = fields.label || fields.src?.name || fields.url
  const sourceReady = !!sourceLabel

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

  useEffect(() => {
    if (!world.isClient) return
    const video = ref.current
    const { time, action, offset } = state
    return video.ready(() => {
      // console.log('ready', state.time, state.action, state.offset)
      if (action === 'play') {
        const now = world.getServerTime()
        let finalOffset = now - time + offset
        // the first bit of a short video can get cut off
        // when syncing with the other clients due to latency.
        // to combat this, if the offset is near zero we just assume
        // latency and start right from the beginning!
        if (finalOffset <= 1) {
          finalOffset = 0
        }

        // console.log('play', finalOffset)
        // console.log({ now, time, offset })
        // console.log(finalOffset)
        if (finalOffset > 0) {
          video.setOffset(finalOffset)
        }
        video.play()
      }
      if (action === 'pause') {
        // console.log('pause')
        video.pause()
      }
      if (action === 'stop') {
        // console.log('stop')
        video.stop()
      }
    })
  }, [state.time, state.action, state.offset])

  useEffect(() => {
    if (!world.isServer) return
    if (fields.autoplay) {
      dispatch('play', world.getServerTime())
    } else {
      dispatch('stop', world.getServerTime())
    }
  }, [fields.autoplay, src])

  useSignal('Play', () => {
    dispatch('play', world.getServerTime())
  })

  // useSignal('Pause', () => {
  //   const video = ref.current
  //   dispatch('pause', world.getServerTime(), video.getOffset())
  // })

  useSignal('Stop', () => {
    dispatch('stop', world.getServerTime())
  })

  useSignal('Toggle', () => {
    if (state.action === 'play') {
      const video = ref.current
      dispatch('pause', world.getServerTime(), video.getOffset())
    } else {
      dispatch('play', world.getServerTime())
    }
  })
  // console.log('render', state.time, state.action, state.offset)

  return (
    <app>
      <video
        ref={ref}
        src={src}
        modelSrc={model}
        modelUV={modelUV}
        height={fields.height}
        lit={fields.lit}
        loop={fields.loop}
        volume={fields.volume}
        audioSpatial={fields.spatial}
        audioDistance={fields.distance}
        audioRolloff={fields.rolloff}
        audioCone={fields.cone}
        sourceId={sourceId}
        frameWidth={frameWidth}
        frameDepth={frameDepth}
        frameColor={frameColor}
        onPointerDown={onPointerDown}
        onPointerDownHint={fields.hint}
      />
      {sourceReady && (
        <>
          <link kind="hyp/audioSource" label={sourceLabel} value={sourceId} />
          <link kind="hyp/videoSource" label={sourceLabel} value={sourceId} />
        </>
      )}
    </app>
  )
}

const initialState = {
  time: 0,
  action: 'idle',
  offset: 0,
}

export function getStore(state = initialState) {
  return {
    state,
    actions: {
      play(state, time) {
        // if (state.action === 'play') return
        state.time = time
        state.action = 'play'
      },
      pause(state, time, offset) {
        if (state.action !== 'play') return
        state.time = time
        state.action = 'pause'
        state.offset = offset
      },
      stop(state, time) {
        if (state.action !== 'play') return
        state.time = time
        state.action = 'stop'
        state.offset = 0
      },
    },
    fields: [
      {
        key: 'nft',
        type: 'boolean',
        hidden: true,
        initial: false,
      },
      {
        key: 'label',
        label: 'Label',
        type: 'text',
        instant: false,
        descriptor: true,
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
        accept: '.mp4',
        placeholder: 'mp4',
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
        placeholder: 'mp4, m3u8',
        conditions: [
          { field: 'nft', op: 'ne', value: true },
          { field: 'kind', op: 'eq', value: 'url' },
        ],
        descriptor: true,
        instant: false,
      },
      {
        key: 'loop',
        label: 'Loop',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        key: 'autoplay',
        label: 'Autoplay',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        key: 'active',
        label: 'Active',
        type: 'condition',
      },
      {
        type: 'section',
        label: 'Display',
      },
      {
        key: 'display',
        label: 'Type',
        type: 'switch',
        options: [
          { label: 'Plane', value: 'plane' },
          { label: 'Model', value: 'model' },
        ],
        initial: 'plane',
      },
      {
        key: 'modelSrc',
        label: 'File',
        type: 'file',
        accept: '.glb',
        placeholder: 'glb',
        conditions: [{ field: 'display', op: 'eq', value: 'model' }],
      },
      {
        key: 'modelUV',
        label: 'UVs',
        type: 'switch',
        options: [
          { label: 'Cover', value: 'cover' },
          { label: 'Inherit', value: 'inherit' },
        ],
        initial: 'cover',
        conditions: [{ field: 'display', op: 'eq', value: 'model' }],
      },
      {
        key: 'height',
        label: 'Height',
        type: 'float',
        initial: 2,
        placeholder: '1',
        conditions: [{ field: 'display', op: 'eq', value: 'plane' }],
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
        conditions: [{ field: 'display', op: 'eq', value: 'plane' }],
      },
      {
        key: 'frame',
        label: 'Frame',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
        conditions: [{ field: 'display', op: 'eq', value: 'plane' }],
      },
      {
        key: 'frameWidth',
        label: 'Width',
        type: 'float',
        initial: 0.1,
        placeholder: '0.1',
        conditions: [
          { field: 'frame', op: 'eq', value: true },
          { field: 'display', op: 'eq', value: 'plane' },
        ],
      },
      {
        key: 'frameDepth',
        label: 'Depth',
        type: 'float',
        initial: 0.1,
        placeholder: '0.1',
        conditions: [
          { field: 'frame', op: 'eq', value: true },
          { field: 'display', op: 'eq', value: 'plane' },
        ],
      },
      {
        key: 'frameColor',
        label: 'Color',
        type: 'color',
        initial: '#333333',
        conditions: [
          { field: 'frame', op: 'eq', value: true },
          { field: 'display', op: 'eq', value: 'plane' },
        ],
      },
      {
        type: 'section',
        label: 'Audio',
      },
      {
        key: 'volume',
        label: 'Volume',
        type: 'float',
        initial: 1,
      },
      {
        key: 'spatial',
        label: 'Spatial',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        key: 'distance',
        label: 'Distance',
        type: 'float',
        placeholder: '10',
        conditions: [{ field: 'spatial', op: 'eq', value: true }],
      },
      {
        key: 'rolloff',
        label: 'Rolloff',
        type: 'float',
        placeholder: '3',
        conditions: [{ field: 'spatial', op: 'eq', value: true }],
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
    ],
  }
}
