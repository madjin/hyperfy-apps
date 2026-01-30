import React, { useEffect, useState, useMemo, useRef } from 'react'
import {
  useWorld,
  useEditing,
  useFields,
  useFile,
  useSignal,
  useSyncState,
  useQuests,
  useCondition,
} from 'hyperfy'

export default function App() {
  const world = useWorld()
  const fields = useFields()
  const editing = useEditing()

  const [globalStage, dispatch] = useSyncState(s => s.stage)
  const [localStage, setLocalStage] = useState(1)
  const sync = fields.sync
  const stage = sync ? globalStage : localStage

  const setStage = stage => {
    dispatch('setStage', stage)
    setLocalStage(stage)
  }

  const data = useMemo(() => {
    const n = stage
    // calculate overrides
    let model = fields[`model1`]
    let anim = fields[`anim1`]
    let collision = fields[`collision1`]
    for (let i = 2; i <= n; i++) {
      const modelOverride = fields[`modelOverride${i}`]
      if (modelOverride) {
        model = fields[`model${i}`]
      }
      const animOverride = fields[`animOverride${i}`]
      if (animOverride) {
        anim = fields[`anim${i}`]
      }
      const collisionOverride = fields[`collisionOverride${i}`]
      if (collisionOverride) {
        collision = fields[`collision${i}`]
      }
    }
    const data = {
      // logic
      model,
      anim,
      collision,
      audio: fields[`audio${n}`],
      // interaction
      interact: fields[`interact${n}`],
      radius: fields[`radius${n}`],
      hint: fields[`hint${n}`],
      interactive: fields[`interactive${n}`],
      trigger: `trigger${n}`,
    }
    return data
  }, [stage, fields])

  const visible = useCondition(fields.visible)
  const canInteract = useCondition(data.interactive)

  const modelSrc = useFile(data.model)
  const audioSrc = useFile(data.audio)

  const interact = () => {
    world.trigger(data.trigger)
  }

  let onPointerDown
  let onPointerDownHint
  if (data.interact === 'click' && canInteract) {
    onPointerDown = () => interact()
    onPointerDownHint = data.hint
  }

  useSignal('Stage 1', () => {
    setStage(1)
  })

  useSignal('Stage 2', () => {
    setStage(2)
  })

  useSignal('Stage 3', () => {
    setStage(3)
  })

  // we need to preload models and assign animations
  let model1 = useFile(fields.model1)
  let model2 = useFile(fields.model2)
  let model3 = useFile(fields.model3)
  if (!fields.modelOverride2) model2 = model1
  if (!fields.modelOverride3) model3 = model2

  if (!visible) return <app />

  return (
    <app>
      {modelSrc && (
        <rigidbody type="kinematic">
          <model
            src={modelSrc}
            onPointerDown={onPointerDown}
            onPointerDownHint={onPointerDownHint}
            animate={data.anim?.name}
            animateLoop={data.anim?.loop || false}
            animateBlend={data.anim?.blend || false}
            collision={data.collision ? 'trimesh' : undefined}
          />
        </rigidbody>
      )}
      {audioSrc && <audio src={audioSrc} autoplay />}
      {data.interact === 'proximity' && canInteract && (
        <trigger
          position={[0, data.radius, 0]}
          size={data.radius * 2}
          onEnter={interact}
          debug={editing}
        />
      )}
      <preload type="model" src={model1} animateSlot="anim1" />
      <preload type="model" src={model2} animateSlot="anim2" />
      <preload type="model" src={model3} animateSlot="anim3" />
    </app>
  )
}

const initialState = {
  stage: 1,
}

export function getStore(state = initialState) {
  return {
    state,
    actions: {
      setStage(state, stage) {
        state.stage = stage
      },
    },
    fields: [
      {
        key: `label`,
        label: 'Label',
        type: 'text',
        descriptor: true,
      },
      {
        key: 'visible',
        label: 'Active',
        type: 'condition',
      },
      {
        key: `sync`,
        label: 'Sync',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        // display only
        key: `stage`,
        label: 'Stage',
        type: 'switch',
        options: [
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 },
        ],
        initial: 1,
      },
      // PHASE ONE
      {
        type: 'section',
        label: 'State',
        conditions: [{ field: 'stage', op: 'eq', value: 1 }],
      },
      {
        key: 'model1',
        label: 'Model',
        type: 'file',
        accept: '.glb',
        conditions: [{ field: 'stage', op: 'eq', value: 1 }],
      },
      {
        key: 'collision1',
        label: 'Collision',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
        conditions: [{ field: 'stage', op: 'eq', value: 1 }],
      },
      {
        key: 'anim1',
        label: 'Animation',
        type: 'anim',
        slot: 'anim1',
        conditions: [{ field: 'stage', op: 'eq', value: 1 }],
      },

      // PHASE ONE: INTERACTION
      ...makeInteractionFields('One', 1),

      // PHASE TWO
      ...makeStageFields('Two', 2),

      // PHASE TWO: INTERACTION
      ...makeInteractionFields('Two', 2),

      // PHASE THREE
      ...makeStageFields('Three', 3),

      // PHASE THREE: INTERACTION
      ...makeInteractionFields('Three', 3),
    ],
  }
}

const makeInteractionFields = (label, n) => {
  return [
    {
      type: 'section',
      label: 'Interaction',
      conditions: [{ field: 'stage', op: 'eq', value: n }],
    },
    {
      key: `interact${n}`,
      label: 'Type',
      type: 'switch',
      options: [
        { label: 'None', value: null },
        { label: 'Click', value: 'click' },
        { label: 'Proximity', value: 'proximity' },
      ],
      initial: null,
      conditions: [{ field: 'stage', op: 'eq', value: n }],
    },
    {
      key: `radius${n}`,
      label: 'Radius',
      type: 'float',
      initial: 0.3,
      conditions: [
        { field: 'stage', op: 'eq', value: n },
        { field: `interact${n}`, op: 'eq', value: 'proximity' },
      ],
    },
    {
      key: `hint${n}`,
      label: 'Hint',
      type: 'text',
      conditions: [
        { field: 'stage', op: 'eq', value: n },
        { field: `interact${n}`, op: 'eq', value: 'click' },
      ],
    },
    {
      key: `interactive${n}`,
      label: 'Allowed',
      type: 'condition',
      conditions: [
        { field: 'stage', op: 'eq', value: n },
        { field: `interact${n}`, op: 'ne', value: null },
      ],
    },
    {
      type: 'trigger',
      name: `trigger${n}`,
      label: 'On Interact',
      conditions: [
        { field: 'stage', op: 'eq', value: n },
        { field: `interact${n}`, op: 'ne', value: null },
      ],
    },
  ]
}

const makeStageFields = (label, n) => {
  return [
    {
      type: 'section',
      label: 'State',
      conditions: [{ field: 'stage', op: 'eq', value: n }],
    },
    {
      key: `modelOverride${n}`,
      label: 'Model',
      type: 'switch',
      options: [
        { label: 'Inherit', value: false },
        { label: 'Override', value: true },
      ],
      initial: false,
      conditions: [{ field: 'stage', op: 'eq', value: n }],
    },
    {
      key: `model${n}`,
      label: 'Model',
      type: 'file',
      accept: '.glb',
      conditions: [
        { field: 'stage', op: 'eq', value: n },
        { field: `modelOverride${n}`, op: 'eq', value: true },
      ],
    },
    {
      key: `collisionOverride${n}`,
      label: 'Collision',
      type: 'switch',
      options: [
        { label: 'Inherit', value: false },
        { label: 'Override', value: true },
      ],
      initial: false,
      conditions: [{ field: 'stage', op: 'eq', value: n }],
    },
    {
      key: `collision${n}`,
      label: 'Collision',
      type: 'switch',
      options: [
        { label: 'No', value: false },
        { label: 'Yes', value: true },
      ],
      initial: false,
      conditions: [
        { field: 'stage', op: 'eq', value: n },
        { field: `collisionOverride${n}`, op: 'eq', value: true },
      ],
    },
    {
      key: `animOverride${n}`,
      label: 'Animation',
      type: 'switch',
      options: [
        { label: 'Inherit', value: false },
        { label: 'Override', value: true },
      ],
      initial: false,
      conditions: [{ field: 'stage', op: 'eq', value: n }],
    },
    {
      key: `anim${n}`,
      label: 'Animation',
      type: 'anim',
      slot: `anim${n}`,
      conditions: [
        { field: 'stage', op: 'eq', value: n },
        { field: `animOverride${n}`, op: 'eq', value: true },
      ],
    },
    {
      key: `audio${n}`,
      label: 'Audio',
      type: 'file',
      accept: '.mp3',
      conditions: [{ field: 'stage', op: 'eq', value: n }],
    },
  ]
}
