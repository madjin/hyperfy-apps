import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useEntityUid, useWorld, useFields, useFile, useSignal } from 'hyperfy'
import { Vector3, Euler } from 'hyperfy'

const ns = 'hyperfy-pocket-realm'

const bv3 = (x, y, z) => [x, z, -y]

const placePosition = bv3(0, -7.50722, 0)
const exitPosition = bv3(0, 7.71013, 0)

const defaults = {
  // ...
}

const v1 = new Vector3()
const e1 = new Euler().reorder('YXZ')

export default function App() {
  const id = useEntityUid()
  const world = useWorld()
  const [position, setPosition] = useState(null)
  const [inside, setInside] = useState(false)
  const [beacon, setBeacon] = useState(null)

  let { label, teleporter } = useFields()

  label = label || defaults.label

  useEffect(() => {
    let slot
    // start listening to other realms to find out which
    // slots they are using
    const claimed = new Set()
    const l1 = world.on(`${ns}:claimed`, slot => {
      claimed.add(slot)
    })
    // ask other realms to tell us which slots they've claimed
    world.emit(`${ns}:check`)
    // find an un-claimed slot for ourself
    let cursor = 1
    while (claimed.has(cursor)) {
      cursor++
    }
    slot = cursor
    // set our position using slot as an offset so that we
    // have our own space
    const position = [slot * 100, 1500, 0]
    setPosition(position)
    // console.log(`${id} given slot ${slot}`)
    // listen for other realms needing to find a slot
    const l2 = world.on(`${ns}:check`, () => {
      world.emit(`${ns}:claimed`, slot)
    })
    // listen for beacons from any other realm so that if you realm
    // hop you can still exit
    const l3 = world.on(`${ns}:beacon`, beacon => {
      setBeacon(beacon)
    })
    // cleanup
    return () => {
      l1()
      l2()
      l3()
    }
  }, [])

  const enter = () => {
    // if we don't have a beacon this means we are entering
    // from outside ANY realm and we need to set it and let
    // other realms know too.
    if (!beacon) {
      const avatar = world.getAvatar()
      const position = avatar.getPosition(v1).toArray()
      const rotationY = avatar.getRotation(e1).y
      const beacon = { position, rotationY }
      setBeacon(beacon)
      world.emit(`${ns}:beacon`, beacon)
    }
    setInside(true)
    world.teleport(null, id)
  }

  const exit = () => {
    if (!inside) return
    if (!beacon) return console.warn('no beacon')
    world.teleport(null, beacon.position, beacon.rotationY)
    setInside(false)
    setBeacon(null)
    world.emit(`${ns}:beacon`, null)
  }

  useSignal('Enter', () => {
    enter()
  })

  useSignal('Exit', () => {
    exit()
  })

  if (!position) return <app />

  return (
    <app>
      <global>
        <group position={position}>
          <rigidbody>
            <model src="room.glb" castShadow={false} receiveShadow={false} />
          </rigidbody>
          <place label={id} position={placePosition} rotationY={0} hidden />
          {teleporter && (
            <group position={exitPosition}>
              <trigger
                size={[1, 2, 1]}
                position={[0, 1, 0]}
                onEnter={() => {
                  exit()
                }}
              />
              <model src="teleporter.glb" />
            </group>
          )}
        </group>
      </global>
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
        instant: false,
        descriptor: true,
      },
      {
        key: 'teleporter',
        label: 'Teleporter',
        type: 'switch',
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
        initial: true,
      },
    ],
  }
}
