import React, { useRef, useEffect, useState } from 'react'
import { DEG2RAD, useWorld, useSignal, useFields, useSyncState } from 'hyperfy'

import { Tween } from './Tween'

export const blenderVec3 = ([x, y, z]) => [x, z, -y]

const lidOffset = blenderVec3([0, 0.342208, 0.370742])

const OPEN_CLOSE_SPEED = 0.5

export default function TreasureChest() {
  const world = useWorld()
  const lidRef = useRef()
  const [state, dispatch] = useSyncState(state => state)

  useEffect(() => {
    const lid = lidRef.current
    const tween = state.open ? openTween : closeTween
    return world.onUpdate(delta => {
      tween.set(world.getServerTime() - state.time)
      lid.setRotationX(tween.value.deg * DEG2RAD)
    })
  }, [state.time])

  function setOpen(open) {
    if (state.open === open) return
    const time = world.getServerTime()
    dispatch('setOpen', open, time)
  }

  function toggle() {
    setOpen(!state.open)
  }

  useSignal('Toggle', () => {
    toggle()
  })
  useSignal('Open', () => {
    setOpen(true)
  })
  useSignal('Close', () => {
    setOpen(false)
  })

  return (
    <app>
      <rigidbody type="kinematic">
        <model
          ref={lidRef}
          src="treasure-chest-top.glb"
          position={lidOffset}
          onClick={toggle}
        />
        <model src="treasure-chest-bottom.glb" onClick={toggle} />
      </rigidbody>
    </app>
  )
}

const initialState = {
  open: false,
  time: -9999,
}

export function getStore(state = initialState) {
  return {
    state,
    actions: {
      setOpen(state, open, time) {
        state.open = open
        state.time = time
      },
    },
  }
}

const openTween = new Tween({ deg: 0 }).to({ deg: -130 }, OPEN_CLOSE_SPEED, Tween.QUAD_IN_OUT) // prettier-ignore
const closeTween = new Tween({ deg: -130 }).to({ deg: 0 }, OPEN_CLOSE_SPEED, Tween.QUAD_IN_OUT) // prettier-ignore
