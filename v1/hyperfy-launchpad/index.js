import React, { useEffect, useRef } from 'react'
import { useWorld, useFields, useFile, useEditing, useEntityUid } from 'hyperfy'

const presets = {
  scifi: {
    model: 'launchpad.glb',
    collision: 'auto',
    hitbox: [1.3, 0.4, 1.3],
    hitboxY: 0.2,
    anim: null,
    animOn: 'enter',
    sound: 'Futuristic Teleport.mp3',
    soundOn: 'enter',
  },
}

const defaultForce = 15

export default function App() {
  const world = useWorld()
  const fields = useFields()
  const modelRef = useRef()
  const soundRef = useRef()
  const soundEvent = useEntityUid() + '_sound'
  const editing = useEditing()

  const modelFile = useFile(fields.modelFile)
  const soundFile = useFile(fields.soundFile)

  const type = fields.type
  const isCustom = type === 'custom'
  const modelSrc = isCustom ? modelFile : presets[type].model // prettier-ignore
  const collision = isCustom ? fields.collision : presets[type].collision // prettier-ignore
  const anim = isCustom ? fields.anim.name : presets[type].anim
  const animOn = isCustom ? fields.animOn : presets[type].animOn
  const hitbox = isCustom ? fields.hitbox : presets[type].hitbox
  const hitboxY = isCustom ? fields.hitboxY : presets[type].hitboxY
  const soundSrc = isCustom ? soundFile : presets[type].sound // prettier-ignore
  const soundOn = isCustom ? fields.soundOn : presets[type].soundOn
  const force = fields.force || defaultForce

  useEffect(() => {
    return world.on(soundEvent, () => {
      if (soundSrc && soundOn === 'enter') {
        soundRef.current?.play(true)
      }
      if (anim && animOn === 'enter') {
        modelRef.current?.playAnimation(anim, false)
      }
    })
  }, [anim, animOn, soundOn, soundSrc])

  return (
    <app>
      {modelSrc && (
        <rigidbody type="kinematic">
          <model
            ref={modelRef}
            src={modelSrc}
            collision={collision}
            animate={animOn === 'always' ? anim : undefined}
            animateLoop={true}
            animateSlot="anim"
          />
        </rigidbody>
      )}
      <trigger
        size={hitbox}
        position={[0, hitbox[1] / 2 + hitboxY, 0]}
        onEnter={() => {
          world.broadcast(soundEvent)
          world.applyUpwardForce(force)
          world.trigger('enter')
        }}
        debug={editing}
      />
      {soundSrc && (
        <audio
          ref={soundRef}
          src={soundSrc}
          autoplay={soundOn === 'always' || undefined}
          loop={soundOn === 'always' || undefined}
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
        key: 'type',
        label: 'Type',
        type: 'dropdown',
        options: [
          { label: 'Sci-Fi', value: 'scifi' },
          { label: 'Custom', value: 'custom' },
        ],
        initial: 'scifi',
      },
      {
        key: 'modelFile',
        label: 'GLB',
        type: 'file',
        accept: '.glb',
        conditions: [{ field: 'type', op: 'eq', value: 'custom' }],
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
        initial: 'none',
        conditions: [{ field: 'type', op: 'eq', value: 'custom' }],
      },
      {
        key: 'anim',
        label: 'Animation',
        type: 'anim',
        slot: 'anim',
        hideLoopOption: true,
        hideBlendOption: true,
        conditions: [{ field: 'type', op: 'eq', value: 'custom' }],
      },
      {
        key: 'animOn',
        label: 'Animate',
        type: 'switch',
        options: [
          { label: 'On Enter', value: 'enter' },
          { label: 'Always', value: 'always' },
        ],
        initial: 'enter',
        conditions: [{ field: 'type', op: 'eq', value: 'custom' }],
      },
      {
        key: 'hitbox',
        label: 'Hitbox',
        type: 'vec3',
        initial: [1.5, 0.3, 1.5],
        conditions: [{ field: 'type', op: 'eq', value: 'custom' }],
      },
      {
        key: 'hitboxY',
        label: 'Hitbox Offset',
        type: 'float',
        initial: 0,
        conditions: [{ field: 'type', op: 'eq', value: 'custom' }],
      },
      {
        key: 'soundFile',
        label: 'Sound',
        type: 'file',
        accept: '.mp3',
        placeholder: 'mp3',
        conditions: [{ field: 'type', op: 'eq', value: 'custom' }],
      },
      {
        key: 'soundOn',
        label: 'Play Sound',
        type: 'switch',
        options: [
          { label: 'On Enter', value: 'enter' },
          { label: 'Always', value: 'always' },
        ],
        initial: 'enter',
        conditions: [{ field: 'type', op: 'eq', value: 'custom' }],
      },
      {
        label: 'Behavior',
        type: 'section',
      },
      {
        key: 'force',
        label: 'Force',
        type: 'float',
        initial: defaultForce,
      },
      {
        type: 'trigger',
        name: 'enter',
        label: 'On Enter',
      },
    ],
  }
}
