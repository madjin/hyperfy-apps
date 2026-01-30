import React, { useEffect } from 'react'
import { useWorld } from 'hyperfy'
import { RAD2DEG, Vector3, Euler } from 'hyperfy'

const v1 = new Vector3()
const e1 = new Euler()

export default function App() {
  const world = useWorld()

  useEffect(() => {
    if (!world.isClient) return

    /**
     * Update the URL periodically with current coords
     */
    let timerId
    const push = () => {
      const avatar = world.getAvatar()
      const pos = avatar.getPosition(v1)
      const y = avatar.getRotation(e1).y * RAD2DEG
      const coords = [
        pos.x.toFixed(1),
        pos.y.toFixed(1),
        pos.z.toFixed(1),
        y.toFixed(1),
      ]
      world.setQuery('coords', coords.join(','))
      timerId = setTimeout(push, 1000)
    }

    /**
     * Check if the user is already loaded into the world.
     * This is false when this app runs BEFORE the user enters the world.
     */
    const isReady = !!world.getAvatar()

    if (isReady) {
      /**
       * User is aleady in the world which means the app was just added to the world
       */
      push()
    } else {
      /**
       * User is still entering the world (eg loading screen) so we need to wait
       */
      world.once('ready', () => {
        const value = world.getQuery('coords')
        if (value) {
          const avatar = world.getAvatar()
          const coords = value.split(',').map(n => parseFloat(n))
          const pos = coords.slice(0, 3)
          const y = coords[3]
          const isValid = pos.length === 3 && pos.every(n => !isNaN(n))
          /**
           * If the url has coords in it, lets teleport them to their start position!
           */
          if (isValid) {
            avatar.teleport(pos, y)
          }
        }
        push()
      })
    }

    // const cmd = world.command('coords', value => {
    //   const avatar = world.getAvatar()
    //   // teleport to coords
    //   if (value) {
    //     const coords = value.split(',').map(n => parseFloat(n))
    //     const pos = coords.slice(0, 3)
    //     const y = coords[3]
    //     const isValid = pos.length === 3 && pos.every(n => !isNaN(n))
    //     console.log({ isValid })
    //     if (!isValid) return
    //     avatar.teleport(pos, y)
    //     world.setQuery('coords', coords.join(','))
    //   }

    //   // get current coords
    //   if (!value) {
    //     const pos = avatar.getPosition(v1)
    //     const y = avatar.getRotation(e1).y * RAD2DEG
    //     const coords = [
    //       pos.x.toFixed(1),
    //       pos.y.toFixed(1),
    //       pos.z.toFixed(1),
    //       y.toFixed(1),
    //     ]
    //     world.chat(coords.join(','), true)
    //     world.copyToClipboard(coords.join(','))
    //   }
    // })

    return () => {
      // cmd()
      world.setQuery('coords', null) // clear coords when the app is gone
      clearTimeout(timerId)
    }
  }, [])

  return <app />
}

const initialState = {
  // ...
}

export function getStore(state = initialState) {
  return {
    state,
    actions: {},
    fields: [],
  }
}
