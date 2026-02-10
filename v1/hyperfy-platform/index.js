import React, { useRef, useEffect, useMemo } from 'react'
import { DEG2RAD, Vector3 } from 'hyperfy'
import { useEngine, useFields } from 'hyperfy'

import { Tween } from './Tween'

const Easings = {
  linear: Tween.LINEAR,
  qInOut: Tween.QUAD_IN_OUT,
}

export default function Platform() {
  const bodyRef = useRef()
  const engine = useEngine()
  const fields = useFields()

  const anim = useMemo(() => {
    if (!fields.travel) return // required
    const easing = Easings[fields.easing]
    return new Tween({ alpha: 0 })
      .wait(fields.pause || 0)
      .to({ alpha: 1 }, fields.travel, easing)
      .wait(fields.pause || 0)
      .to({ alpha: 0 }, fields.travel, easing)
      .loop()
  }, [fields.travel, fields.easing, fields.pause])

  useEffect(() => {
    if (!anim) return
    const body = bodyRef.current
    const sPosV = new Vector3().fromArray(fields.sPos)
    const ePosV = new Vector3().fromArray(fields.ePos)
    const aPosV = new Vector3()
    return engine.onUpdate(() => {
      anim.set(engine.getServerTime() + (fields.offset || 0))
      aPosV.lerpVectors(sPosV, ePosV, anim.value.alpha)
      body.setPosition(aPosV)
      body.setRotationY(
        (fields.sRotY + (fields.eRotY - fields.sRotY) * anim.value.alpha) *
          DEG2RAD
      )
    })
  }, [
    anim,
    fields.offset,
    fields.sPos,
    fields.sRotY,
    fields.ePos,
    fields.eRotY,
  ])

  return (
    <app>
      <rigidbody ref={bodyRef} type="kinematic">
        <model
          src={fields.model?.url || 'platform.glb'}
          scale={fields.scale}
          collision={fields.collision}
        />
      </rigidbody>
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
        key: 'model',
        label: 'Model',
        type: 'file',
        accept: '.glb',
        descriptor: true,
      },
      {
        key: 'scale',
        label: 'Scale',
        type: 'float',
        initial: 1,
      },
      {
        key: 'collision',
        label: 'Collision',
        type: 'switch',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Inherit', value: 'auto' },
          { label: 'All', value: 'trimesh' },
        ],
        initial: 'trimesh',
      },
      {
        type: 'section',
        label: 'Timing',
      },
      {
        key: 'travel',
        label: 'Travel',
        type: 'float',
        initial: 3,
      },
      {
        key: 'easing',
        label: 'Easing',
        type: 'switch',
        options: [
          { label: 'Linear', value: 'linear' },
          { label: 'QuadInOut', value: 'qInOut' },
        ],
        initial: 'qInOut',
      },
      {
        key: 'pause',
        label: 'Pause',
        type: 'float',
        initial: 0,
      },
      {
        key: 'offset',
        label: 'Offset',
        type: 'float',
        initial: 0,
      },
      {
        type: 'section',
        label: 'Start',
      },
      {
        key: 'sPos',
        label: 'Position',
        type: 'vec3',
        initial: [0, 0, 0],
      },
      {
        key: 'sRotY',
        label: 'Rotation',
        type: 'float',
        initial: 0,
      },
      {
        type: 'section',
        label: 'End',
      },
      {
        key: 'ePos',
        label: 'Position',
        type: 'vec3',
        initial: [0, 2, 0],
      },
      {
        key: 'eRotY',
        label: 'Rotation',
        type: 'float',
        initial: 0,
      },
    ],
  }
}
