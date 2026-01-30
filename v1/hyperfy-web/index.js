import React, { useLayoutEffect, useState, useMemo } from 'react'
import { useWorld, useFields, useFile } from 'hyperfy'

const DEFAULT_IMAGE = 'thumbnail.png'

const BASE_ZOOM = 1280 // across any width

export default function App() {
  const world = useWorld()
  const fields = useFields()
  const image = useFile(fields.image)
  const [visible, setVisible] = useState(false)

  const width = fields.width || 1
  const height = fields.height || 1
  const zoom = fields.zoom || 1

  const factor = BASE_ZOOM / (zoom * width)

  const url = useMemo(() => {
    return resolveUrl(fields.url)
  }, [fields.url])

  useLayoutEffect(() => {
    setVisible(fields.mode === 'always')
  }, [fields.mode])

  let onPointerDown
  if (fields.mode === 'click') {
    onPointerDown = () => {
      world.unlockPointer()
      setVisible(true)
    }
  }

  return (
    <app>
      {visible && (
        <MaybeBillboard billboard={fields.billboard}>
          <webview
            src={url}
            width={width}
            height={height}
            factor={factor}
            onPointerDown={e => {
              if (fields.mode === 'click') {
                e.preventDefault()
                setVisible(false)
              }
            }}
          />
        </MaybeBillboard>
      )}
      {!visible && (
        <image
          src={image || DEFAULT_IMAGE}
          width={width}
          height={height}
          lit={false}
          hitDistance={Infinity}
          onPointerDownHint={onPointerDown ? fields.hint : undefined}
          onPointerDown={onPointerDown}
        />
      )}
      {fields.mode === 'proximity' && (
        <trigger
          size={fields.distance}
          onEnter={() => setVisible(true)}
          onLeave={() => setVisible(false)}
        />
      )}
    </app>
  )
}

function MaybeBillboard({ billboard, children }) {
  if (!billboard) return children
  return <billboard axis="y">{children}</billboard>
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
        key: 'url',
        label: 'URL',
        type: 'text',
        instant: false,
      },
      {
        key: 'width',
        label: 'Width',
        type: 'float',
        initial: 4,
      },
      {
        key: 'height',
        label: 'Height',
        type: 'float',
        initial: 2.25,
      },
      {
        key: 'zoom',
        label: 'Zoom',
        type: 'float',
        initial: 1,
      },
      // {
      //   key: 'factor',
      //   label: 'Factor',
      //   type: 'float',
      //   initial: 250,
      // },
      {
        key: 'mode',
        label: 'Visibile',
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
        key: 'image',
        label: 'Image',
        type: 'file',
        accept: '.png,.jpg,.jpeg',
        conditions: [{ field: 'mode', op: 'ne', value: 'always' }],
      },
      {
        key: 'billboard',
        label: 'Billboard',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
    ],
  }
}

/**
 * Converts non-embed links into embed links with good defaults.
 * Intentionally allows people to still use custom embed links for greater control.
 */

const REGEX_YOUTUBE_NON_EMBED_ID = /(?:youtube.com|youtu.be)(?:.)+(?:(?:[?&])v=)([^&]+)/i // prettier-ignore
const REGEX_TWITCH_NON_EMBED_ID = /^https*:\/\/(?:www\.)?twitch\.tv\/([^\/\?\&]+)(?!(?:\/embed|\/videos))/i // prettier-ignore

function resolveUrl(url) {
  if (!url) return url
  const youtubeId = url.match(REGEX_YOUTUBE_NON_EMBED_ID)?.[1]
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}?controls=1&autoplay=1&autohide=1&showinfo=0`
  }
  const twitchId = url.match(REGEX_TWITCH_NON_EMBED_ID)?.[1]
  if (twitchId) {
    return `https://player.twitch.tv/?channel=${twitchId}&parent=hyperfy.io&autoplay=true&muted=false`
  }
  return url
}
