import React, { useEffect, useRef } from 'react'
import {
  useSyncState,
  useWorld,
  useEditing,
  useSignal,
  useFields,
  useFile,
  useEntityUid,
} from 'hyperfy'

export default function App() {
  const world = useWorld()
  const editing = useEditing()
  const ref = useRef()
  const fields = useFields()
  const fileSrc = useFile(fields.src)
  const src = fields.kind === 'url' ? fields.url : fileSrc
  const [state, dispatch] = useSyncState(s => s)

  const sourceId = fields.label || fields.src?.name || fields.url

  useEffect(() => {
    if (!world.isClient) return
    const audio = ref.current
    const { time, action, offset } = state
    return audio.ready(() => {
      if (action === 'play') {
        const now = world.getServerTime()
        // the first bit of a small sound effect can get cut off
        // when syncing with the other clients due to latency.
        // to combat this, if the offset is near zero we just assume
        // latency and start right from the beginning!
        let _offset = now - time + offset
        if (_offset <= 1) _offset = 0
        // either force the offset or force restart
        if (_offset) {
          audio.offset(_offset)
          // console.log('resume', _offset)
        } else {
          audio.stop()
          // console.log('play', _offset)
        }
        audio.play()
      }
      if (action === 'pause') {
        audio.pause()
        // console.log('pause')
      }
      if (action === 'stop') {
        audio.stop()
        // console.log('stop')
      }
    })
  }, [state])

  // console.log(state)

  useEffect(() => {
    if (!world.isServer) return
    if (fields.autoplay) {
      dispatch('play', world.getServerTime(), 0)
    } else {
      dispatch('stop', world.getServerTime())
    }
  }, [fields.autoplay, fields.src, fields.url])

  useSignal('Play', () => {
    const audio = ref.current
    if (audio.isPlaying()) return
    dispatch('play', world.getServerTime())
  })

  // BUG:
  // 1. add a sound effect >1s long, turn loop off
  // 2. play the sound
  // 3. pause the sound after at least 1s
  // 4. play the sound, it continues correctly all the way to the end
  // 4. play again, it resumes from where it paused instead of starting again
  // To keep things simple we just wont provide pause. I can't think of any viable uses for it anyway.
  //
  // useSignal('Pause', () => {
  //   const audio = ref.current
  //   dispatch('pause', world.getServerTime(), audio.offset())
  // })

  useSignal('Stop', () => {
    dispatch('stop', world.getServerTime())
  })

  useSignal('Toggle', () => {
    if (state.action === 'play') {
      dispatch('stop', world.getServerTime())
    } else {
      dispatch('play', world.getServerTime())
    }
  })

  return (
    <app>
      <audio
        ref={ref}
        src={src}
        preload={fields.preload}
        volume={fields.volume}
        loop={fields.loop}
        spatial={fields.spatial}
        distance={fields.distance}
        rolloff={fields.rolloff}
        cone={fields.cone}
        sourceId={sourceId}
      />
      {editing && <model src="block.glb" />}
      {sourceId && (
        <link kind="hyp/audioSource" label={sourceId} value={sourceId} />
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
      play(state, time, offset) {
        state.time = time
        state.action = 'play'
        if (offset !== undefined) {
          state.offset = offset // allow setting offset
        }
      },
      pause(state, time, offset) {
        if (state.action !== 'play') return
        state.time = time
        state.action = 'pause'
        state.offset = offset
      },
      stop(state, time) {
        state.time = time
        state.action = 'stop'
        state.offset = 0
      },
    },
    fields: [
      {
        key: 'label',
        label: 'Label',
        type: 'text',
        descriptor: true,
      },
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
        accept: '.mp3',
        conditions: [
          { field: 'nft', op: 'ne', value: true },
          { field: 'kind', op: 'eq', value: 'file' },
        ],
        placeholder: 'mp3',
        descriptor: true,
      },
      {
        key: 'url',
        label: 'URL',
        type: 'text',
        placeholder: 'mp3',
        conditions: [
          { field: 'nft', op: 'ne', value: true },
          { field: 'kind', op: 'eq', value: 'url' },
        ],
        descriptor: true,
        instant: false,
      },
      {
        key: 'volume',
        label: 'Volume',
        type: 'float',
        initial: 1,
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
        key: 'preload',
        label: 'Preload',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: true,
      },
      { type: 'section', label: 'Spatial' },
      {
        key: 'spatial',
        label: 'Enabled',
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
    ],
  }
}
