import React, { useRef, useEffect, useState, useMemo } from 'react'
import {
  useWorld,
  useEditing,
  useSyncState,
  useFields,
  useFile,
  useSignal,
  useEntityUid,
} from 'hyperfy'
import { RAD2DEG, DEG2RAD, Vector3, Quaternion, Euler } from 'hyperfy'

const v1 = new Vector3()
const e1 = new Euler()

export default function App() {
  const id = useEntityUid()
  const world = useWorld()
  const fields = useFields()
  let [avatarIds, dispatch] = useSyncState(s => s.avatarIds)

  const src = useFile(fields.model)
  const anim = fields.anim
  const bone = fields.bone
  const synced = fields.synced
  const position = fields.position
  const rotation = fields.rotation

  if (!synced) {
    const avatarId = world.getAvatar()?.uid
    avatarIds = avatarIds.filter(id => id === avatarId)
  }

  useSignal('Equip', () => {
    const avatarId = world.getAvatar().uid
    world.emit('hyp:attach', bone)
    dispatch('equip', avatarId)
  })

  useSignal('Un-Equip', () => {
    const avatarId = world.getAvatar().uid
    dispatch('unequip', avatarId)
  })

  useEffect(() => {
    if (!world.isClient) return
    const onAttach = toBone => {
      const avatarId = world.getAvatar().uid
      // if another app attaches to the same bone we detach
      if (bone === toBone && avatarIds.includes(avatarId)) {
        dispatch('unequip', avatarId)
      }
    }
    world.on('hyp:attach', onAttach)
    return () => world.off('hyp:attach', onAttach)
  }, [avatarIds, bone])

  useEffect(() => {
    if (!world.isServer) return
    const onLeave = avatar => {
      dispatch('unequip', avatar.uid)
    }
    world.on('leave', onLeave)
    return () => {
      world.off('leave', onLeave)
    }
  }, [])

  return (
    <app>
      <global>
        {avatarIds.map(id => (
          <Item
            key={id}
            avatarId={id}
            src={src}
            anim={anim}
            bone={bone}
            position={position}
            rotation={rotation}
          />
        ))}
      </global>
      <preload type="model" src={src} animateSlot="anim" />
    </app>
  )
}

function Item({ avatarId, src, anim, bone, position, rotation }) {
  const world = useWorld()
  const groupRef = useRef()
  useEffect(() => {
    const group = groupRef.current
    return world.onUpdate(() => {
      const avatar = world.getAvatar(avatarId)
      if (!avatar) return
      avatar.getBonePosition(bone, v1)
      group.setPosition(v1)
      avatar.getBoneRotation(bone, e1)
      group.setRotation(e1)
    })
  }, [bone])
  return (
    <group ref={groupRef}>
      {src && (
        <model
          src={src}
          animate={anim.name}
          animateLoop={anim.loop || false}
          animateBlend={anim.blend || false}
          position={position}
          rotation={rotation}
          layer="COSMETIC"
          castShadow={false}
          receiveShadow={false}
        />
      )}
    </group>
  )
}

const initialState = {
  avatarIds: [],
}

export function getStore(state = initialState) {
  return {
    state,
    actions: {
      equip(state, avatarId) {
        const idx = state.avatarIds.indexOf(avatarId)
        if (idx !== -1) return
        state.avatarIds.push(avatarId)
      },
      unequip(state, avatarId) {
        state.avatarIds = state.avatarIds.filter(id => id !== avatarId)
      },
    },
    fields: [
      {
        key: 'model',
        label: 'Model',
        type: 'file',
        accept: '.glb',
        placeholder: 'glb',
        descriptor: true,
      },
      {
        key: 'anim',
        label: 'Animation',
        type: 'anim',
        slot: 'anim',
        // hideLoopOption: true,
        hideBlendOption: true,
      },
      {
        key: 'bone',
        label: 'Attach To',
        type: 'dropdown',
        options: [
          { label: 'Head', value: 'head' },
          { label: 'Neck', value: 'neck' },
          { label: 'Spine', value: 'spine' },
          { label: 'Left Hand', value: 'leftHand' },
          { label: 'Right Hand', value: 'rightHand' },
          { label: 'Hips', value: 'hips' },
          { label: 'Left Foot', value: 'leftFoot' },
          { label: 'Right Foot', value: 'rightFoot' },
        ],
        initial: 'rightHand',
      },
      {
        key: 'synced',
        label: 'Visibility',
        type: 'switch',
        options: [
          { label: 'Local Only', value: false },
          { label: 'Everyone', value: true },
        ],
        initial: true,
      },
      {
        key: 'position',
        label: 'Position',
        type: 'vec3',
        initial: [0, 0, 0],
      },
      {
        key: 'rotation',
        label: 'Rotation',
        type: 'vec3',
        initial: [0, 0, 0, 'YXZ'],
      },
    ],
  }
}
