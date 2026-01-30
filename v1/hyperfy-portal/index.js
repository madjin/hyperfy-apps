import React, { useRef, useEffect, useState } from 'react'
import { useWorld, useFields, useEditing } from 'hyperfy'

const HEIGHT = 2.8
const WIDTH = 1.5
const RADIUS = [WIDTH / 2, WIDTH / 2, WIDTH / 8, WIDTH / 8]
const DEFAULT_IMAGE = 'black.png'
const DEFAULT_COLOR = '#ffffff'
const NAME_POSITION = [0, HEIGHT / 2, 0.03]
const NAME_MAX_CHARS = 18
const HYPERFY_SUFFIX = ' | Hyperfy'

// const API_URL = 'http://localhost:4000/api'
// const ORIGIN = 'http://localhost:4000'

const API_URL = 'https://api.hyperfy.io'
const ORIGIN = 'https://hyperfy.io'

export default function Portal() {
  const ref = useRef()
  const world = useWorld()
  const fields = useFields()
  const editing = useEditing()

  const [info, setInfo] = useState(null)
  const [near, setNear] = useState(false)

  const color = fields.color || DEFAULT_COLOR
  const isClick = fields.action === 'click'
  const isEnter = !isClick

  useEffect(() => {
    if (world.isServer) return
    let dead = false
    async function check() {
      const info = {
        name: fields.name,
        image: fields.image?.url,
        url: urlToAbsolute(fields.url),
        newTab: fields.tab === 'new',
      }
      // if we have a url and weren't provided a name/image we need to unfurl
      if (info.url && (!info.name || !info.image)) {
        let resp
        // when changing different fields like 'name' we shouldn't unfurl
        // again, just use the cached version
        if (ref.current?.url === info.url) {
          resp = ref.current.resp
        } else {
          ref.current = null
          try {
            resp = await world.http({
              method: 'POST',
              url: `${API_URL}/unfurl`,
              data: { url: info.url },
            })
            ref.current = {
              url: info.url,
              resp,
            }
          } catch (err) {
            // ...
          }
        }
        if (dead) return
        if (resp) {
          if (!info.name) {
            info.name = resp.open_graph.title
            // remove hyperfy suffix from our own titles
            if (info.name.endsWith(HYPERFY_SUFFIX)) {
              info.name = info.name.replace(HYPERFY_SUFFIX, '')
            }
            // add ellipsis if its too long
            if (info.name.length > NAME_MAX_CHARS) {
              info.name = info.name.slice(0, NAME_MAX_CHARS) + '…'
            }
          }
          if (!info.image) {
            info.image = resp.open_graph.images[0]?.url
          }
        }
      }
      setInfo(info)
    }
    check()
    return () => {
      dead = true
    }
  }, [fields.url, fields.name, fields.image, fields.tab])

  function open() {
    if (!info?.url) return
    world.open(info.url, info.newTab)
  }

  return (
    <app>
      {/* <rigidbody>
        <model src="portal2.glb" />
      </rigidbody> */}
      <image
        src={info?.image || DEFAULT_IMAGE}
        position={[0, HEIGHT / 2, 0]}
        width={WIDTH}
        height={HEIGHT}
        // radius={[WIDTH / 2, WIDTH / 2, 0, 0]}
        radius={RADIUS}
        opacity={0.95}
        lit={false}
        doubleside
        onPointerDown={open}
        onPointerDownHint={isClick ? 'Visit' : undefined}
      />
      {near && !!info?.name && (
        <text
          position={NAME_POSITION}
          value={info.name}
          align={'center'}
          anchorY="middle"
          maxWidth={WIDTH - 0.1}
          fontSize={0.15}
          lineHeight={1.2}
          color={color}
          // bgColor="black"
          // bgRadius={0.1}
          // padding={0.08}
          onPointerDown={open}
          onPointerDownHint={isClick ? 'Visit' : undefined}
        />
      )}
      <trigger
        size={12}
        onEnter={() => setNear(true)}
        onLeave={() => setNear(false)}
      />
      {!editing && isEnter && (
        <trigger
          position={[0, 0.95, 0.5]}
          size={[1.2, 1.9, 0.6]}
          onEnter={open}
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
        key: 'url',
        label: 'URL',
        type: 'text',
        instant: false,
      },
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        placeholder: '[Auto]',
      },
      {
        key: 'image',
        label: 'Image',
        type: 'file',
        accept: '.png,.jpg,.jpeg',
        placeholder: '[Auto]',
      },
      {
        key: 'color',
        label: 'Text Color',
        type: 'color',
        initial: '#ffffff',
      },
      {
        key: 'tab',
        label: 'Tab',
        type: 'switch',
        options: [
          { label: 'Current', value: 'current' },
          { label: 'New', value: 'new' },
        ],
        initial: 'current',
      },
      {
        key: 'action',
        label: 'Action',
        type: 'switch',
        options: [
          { label: 'Click', value: 'click' },
          { label: 'Enter', value: 'enter' },
        ],
        initial: 'click',
      },
    ],
  }
}

function urlToAbsolute(url) {
  if (!url) return url
  if (url.startsWith('http')) {
    // already absolute
    return url
  }
  if (url.startsWith('/')) {
    // relative
    return ORIGIN + url
  }
  return 'https://' + url
}
