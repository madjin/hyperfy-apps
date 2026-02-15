import React, { useRef, useLayoutEffect, useState } from 'react'
import { useFields, useFile, useWorld, useEntityUid } from 'hyperfy'

/**
 * There are various online test stream urls, here's one:
 * http://d3rlna7iyyu8wu.cloudfront.net/skip_armstrong/skip_armstrong_stereo_subs.m3u8
 *
 * You can also stream Twitch/YouTube live locally by getting the m3u8 urls:
 * https://github.com/dudik/twitch-m3u8
 * https://www.npmjs.com/package/yt-live-url
 *
 * In order to stream Twitch/YouTube in production the streams need to go through a proxy.
 * This is something we'll look into providing for users maybe.
 *
 * You can also point your OBS streams to VRCDN which will provide you a m3u8 url!
 */

export default function App() {
  const world = useWorld()
  const videoRef = useRef()
  const fields = useFields()
  const [visible, setVisible] = useState(false)

  const online = fields.online
  const thumbnailUrl = useFile(fields.thumbnail) || 'offline.png'
  const streamUrl = fields.streamUrl || null

  const showImage = !online || !visible
  const showStream = online && visible && streamUrl

  const sourceId = useEntityUid()
  const sourceLabel = fields.label || fields.streamUrl
  const sourceReady = !!sourceLabel

  useLayoutEffect(() => {
    setVisible(fields.mode === 'always')
  }, [fields.mode])

  let onPointerDown
  if (fields.mode === 'click' && online) {
    onPointerDown = () => {
      // world.unlockPointer()
      setVisible(true)
    }
  }

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
      {showImage && (
        <image
          src={thumbnailUrl}
          height={fields.height}
          lit={false}
          frameWidth={frameWidth}
          frameDepth={frameDepth}
          frameColor={frameColor}
          onPointerDown={onPointerDown}
          onPointerDownHint={onPointerDown ? fields.hint : undefined}
        />
      )}
      {showStream && (
        <video
          ref={videoRef}
          src={streamUrl}
          height={fields.height}
          volume={fields.volume}
          audioDistance={fields.audioDistance}
          audioRolloff={fields.audioRolloff}
          audioSourceId={fields.audioSourceId}
          sourceId={sourceId}
          frameWidth={frameWidth}
          frameDepth={frameDepth}
          frameColor={frameColor}
          autoplay
          onPointerDown={e => {
            if (fields.mode === 'click') {
              e.preventDefault()
              setVisible(false)
            }
          }}
        />
      )}
      {fields.mode === 'proximity' && (
        <trigger
          size={fields.distance}
          onEnter={() => setVisible(true)}
          onLeave={() => setVisible(false)}
        />
      )}
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
  // ...
}

export function getStore(state = initialState) {
  return {
    state,
    actions: {},
    fields: [
      {
        key: 'online',
        label: 'Offline',
        type: 'switch',
        options: [
          { label: 'No', value: true },
          { label: 'Yes', value: false },
        ],
        initial: true,
      },
      {
        key: 'streamUrl',
        label: 'Stream URL',
        type: 'text',
        instant: false,
        placeholder: 'm3u8',
        descriptor: true,
      },
      {
        key: 'thumbnail',
        label: 'Thumbnail',
        type: 'file',
        accept: '.png,.jpg,.jpeg',
        placeholder: 'png, jpg',
      },
      {
        key: 'height',
        label: 'Height',
        type: 'float',
        initial: 2,
      },
      {
        key: 'mode',
        label: 'Active',
        type: 'dropdown',
        options: [
          { label: 'Always', value: 'always' },
          { label: 'On Click', value: 'click' },
          { label: 'On Proximity', value: 'proximity' },
        ],
        initial: 'always',
      },
      {
        key: 'hint',
        label: 'Hint',
        type: 'text',
        conditions: [{ field: 'mode', op: 'eq', value: 'click' }],
      },
      {
        key: 'distance',
        label: 'Distance',
        type: 'float',
        initial: 10,
        conditions: [{ field: 'mode', op: 'eq', value: 'proximity' }],
      },
      {
        label: 'Audio',
        type: 'section',
      },
      {
        key: 'volume',
        label: 'Volume',
        type: 'float',
        initial: 1,
      },
      {
        key: 'audioDistance',
        label: 'Distance',
        type: 'float',
        initial: 10,
      },
      {
        key: 'audioRolloff',
        label: 'Rolloff',
        type: 'float',
        initial: 3,
      },
      {
        key: 'audioSourceId',
        label: 'ID',
        type: 'text',
        instant: false,
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
    ],
  }
}
