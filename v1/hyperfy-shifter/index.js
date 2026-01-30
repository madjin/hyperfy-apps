import React, { useRef, useEffect, useState, useMemo } from 'react'
import { DEG2RAD, Vector3, Quaternion, Euler } from 'hyperfy'
import {
  useSignal,
  useWorld,
  useFields,
  useCondition,
  useSyncState,
} from 'hyperfy'

import { Tween } from './Tween'

const e1 = new Euler(0, 0, 0, 'YXZ')

const Easings = {
  linear: Tween.LINEAR,
  qOut: Tween.QUAD_OUT,
  qInOut: Tween.QUAD_IN_OUT,
}

export default function App() {
  const fields = useFields()
  if (fields.controlled) {
    return <ControlledApp />
  }
  return <AutoApp />
}

function ControlledApp() {
  const world = useWorld()
  const bodyRef = useRef()
  const lastAlphaRef = useRef()
  const fields = useFields()
  const [state, dispatch] = useSyncState(state => state)
  const [local, setLocal] = useState(() => ({ returning: true, time: -9999 }))

  const duration = fields.duration || 0
  const easing = Easings[fields.easing]

  const sync = fields.sync
  const returning = sync ? state.returning : local.returning
  const time = sync ? state.time : local.time

  const interact = returning ? fields.sInteract : fields.eInteract
  const canInteract = useCondition(
    returning ? fields.sCondition : fields.eCondition
  )
  let onPointerDownHint
  let onPointerDown
  if (interact && canInteract) {
    onPointerDownHint = returning ? fields.sHint : fields.eHint
    onPointerDown = () => {
      world.trigger(returning ? 'sTrigger' : 'eTrigger')
    }
  }

  const set = _returning => {
    if (returning === _returning) return
    const time = world.getTime()
    dispatch('set', _returning, time)
    setLocal({ returning: _returning, time })
  }

  useSignal('Go Start', () => {
    set(true)
  })

  useSignal('Go End', () => {
    set(false)
  })

  useEffect(() => {
    const sPosV = new Vector3().fromArray(returning ? fields.ePos : fields.sPos)
    const ePosV = new Vector3().fromArray(returning ? fields.sPos : fields.ePos)
    const aPosV = new Vector3()
    // vectors and lerp used instead of quaternions and slerp so that we can support rotations > 180deg
    const sRotV = new Vector3()
      .fromArray(returning ? fields.eRot : fields.sRot)
      .multiplyScalar(DEG2RAD)
    const eRotV = new Vector3()
      .fromArray(returning ? fields.sRot : fields.eRot)
      .multiplyScalar(DEG2RAD)
    const aRotV = new Vector3()

    let anim = new Tween({ alpha: 0 }).to({ alpha: 1 }, duration, easing)

    // if previous transition was only part way through,
    // we need to do some math to make sure this new transition
    // visually resumes from the same place.
    const lastAlpha = lastAlphaRef.current || 0
    if (lastAlpha > 0) {
      const startAlpha = 1 - lastAlpha
      const newDuration = duration - duration * startAlpha
      anim = new Tween({ alpha: startAlpha }).to(
        { alpha: 1 },
        newDuration,
        easing
      )
    }

    const body = bodyRef.current
    let t = world.getTime() - time
    if (t < 0.5) t = 0 // cancel network jitter
    const stop = world.onUpdate(delta => {
      t += delta
      anim.set(t)
      const alpha = anim.value.alpha
      aPosV.lerpVectors(sPosV, ePosV, alpha)
      body.setPosition(aPosV)
      aRotV.lerpVectors(sRotV, eRotV, alpha)
      e1.x = aRotV.x
      e1.y = aRotV.y
      e1.z = aRotV.z
      body.setRotation(e1)
      if (alpha >= 1) stop()
    })
    return () => {
      lastAlphaRef.current = anim.value.alpha
      stop()
    }
  }, [
    returning,
    time,
    fields.duration,
    fields.easing,
    fields.sPos,
    fields.sRot,
    fields.ePos,
    fields.eRot,
  ])

  return (
    <app>
      <rigidbody ref={bodyRef} type="kinematic">
        <model
          src={fields.model?.url || 'block.glb'}
          scale={fields.scale}
          collision={fields.collision}
          onPointerDownHint={onPointerDownHint}
          onPointerDown={onPointerDown}
        />
      </rigidbody>
    </app>
  )
}

function AutoApp() {
  const bodyRef = useRef()
  const world = useWorld()
  const fields = useFields()

  useEffect(() => {
    const type = fields.type
    const duration = fields.duration || 0
    const easing = Easings[fields.easing]
    const anim = new Tween({ alpha: 0 })
      .wait(fields.pause || 0)
      .to({ alpha: 1 }, duration, easing)
      .wait(fields.pause || 0)
      .to({ alpha: 0 }, duration, easing)
      .loop()
    const body = bodyRef.current

    const sPosV = new Vector3().fromArray(fields.sPos)
    const ePosV = new Vector3().fromArray(fields.ePos)
    const aPosV = new Vector3()
    // vectors and lerp used instead of quaternions and slerp so that we can support rotations > 180deg
    const sRotV = new Vector3().fromArray(fields.sRot).multiplyScalar(DEG2RAD)
    const eRotV = new Vector3().fromArray(fields.eRot).multiplyScalar(DEG2RAD)
    const aRotV = new Vector3()

    return world.onUpdate(() => {
      let time = world.getTime()
      if (type === 'loop') time = time % duration
      anim.set(time)
      aPosV.lerpVectors(sPosV, ePosV, anim.value.alpha)
      body.setPosition(aPosV)
      aRotV.lerpVectors(sRotV, eRotV, anim.value.alpha)
      e1.x = aRotV.x
      e1.y = aRotV.y
      e1.z = aRotV.z
      body.setRotation(e1)
    })
  }, [
    fields.type,
    fields.duration,
    fields.easing,
    fields.pause,
    fields.sPos,
    fields.sRot,
    fields.ePos,
    fields.eRot,
  ])

  return (
    <app>
      <rigidbody ref={bodyRef} type="kinematic">
        <model
          src={fields.model?.url || 'block.glb'}
          scale={fields.scale}
          collision={fields.collision}
        />
      </rigidbody>
    </app>
  )
}

const initialState = {
  returning: true,
  time: -99999,
}

export function getStore(state = initialState) {
  return {
    state,
    actions: {
      set(state, returning, time) {
        if (state.returning === returning) return
        state.returning = returning
        state.time = time
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
        key: 'model',
        label: 'Model',
        type: 'file',
        accept: '.glb',
        placeholder: 'glb',
      },
      // {
      //   key: 'scale',
      //   label: 'Scale',
      //   type: 'float',
      //   initial: 1,
      // },
      {
        key: 'collision',
        label: 'Collision',
        type: 'switch',
        options: [
          { label: 'Auto', value: 'auto' },
          { label: 'Convex', value: 'convex' },
          { label: 'Trimesh', value: 'trimesh' },
        ],
        initial: 'auto',
      },
      {
        key: 'controlled',
        label: 'Controlled',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        key: 'type',
        label: 'Type',
        type: 'switch',
        options: [
          { label: 'Ping Pong', value: 'pingpong' },
          { label: 'Loop', value: 'loop' },
        ],
        initial: 'pingpong',
        conditions: [{ field: 'controlled', op: 'eq', value: false }],
      },
      {
        key: 'sync',
        label: 'Sync',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: true,
        conditions: [{ field: 'controlled', op: 'eq', value: true }],
      },

      {
        type: 'section',
        label: 'Timing',
      },
      {
        key: 'duration',
        label: 'Duration',
        type: 'float',
        initial: 1,
      },
      {
        key: 'easing',
        label: 'Easing',
        type: 'dropdown',
        options: [
          { label: 'Linear', value: 'linear' },
          { label: 'Quad Out', value: 'qOut' },
          { label: 'Quad In Out', value: 'qInOut' },
        ],
        initial: 'qOut',
      },
      {
        key: 'pause',
        label: 'Pause',
        type: 'float',
        initial: 0,
        conditions: [{ field: 'controlled', op: 'eq', value: false }],
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
        key: 'sRot',
        label: 'Rotation',
        type: 'vec3',
        initial: [0, 0, 0],
      },
      {
        key: 'sInteract',
        label: 'Interactive',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        key: 'sCondition',
        label: 'Allowed',
        type: 'condition',
        conditions: [{ field: 'sInteract', op: 'eq', value: true }],
      },
      {
        key: 'sHint',
        label: 'Hint',
        type: 'text',
        conditions: [{ field: 'sInteract', op: 'eq', value: true }],
      },
      {
        type: 'trigger',
        name: `sTrigger`,
        label: 'On Interact',
        conditions: [{ field: 'sInteract', op: 'eq', value: true }],
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
        key: 'eRot',
        label: 'Rotation',
        type: 'vec3',
        initial: [0, 360, 0],
      },
      {
        key: 'eInteract',
        label: 'Interactive',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        key: 'eCondition',
        label: 'Allowed',
        type: 'condition',
        conditions: [{ field: 'eInteract', op: 'eq', value: true }],
      },
      {
        key: 'eHint',
        label: 'Hint',
        type: 'text',
        conditions: [{ field: 'eInteract', op: 'eq', value: true }],
      },
      {
        type: 'trigger',
        name: `eTrigger`,
        label: 'On Interact',
        conditions: [{ field: 'eInteract', op: 'eq', value: true }],
      },
    ],
  }
}
