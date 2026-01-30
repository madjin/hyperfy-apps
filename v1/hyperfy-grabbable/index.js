import React, { useRef, useEffect } from 'react'
import {
  useWorld,
  useSignal,
  useFields,
  useSyncState,
  useFile,
  useEntityUid,
  useEditing,
} from 'hyperfy'
import { RAD2DEG, DEG2RAD, Vector3, Quaternion, Euler } from 'hyperfy'

const v1 = new Vector3()
const v2 = new Vector3()
const e1 = new Euler()
const e2 = new Euler()
const e3 = new Euler()
const q1 = new Quaternion()
const q2 = new Quaternion()

const UP = new Vector3(0, 1, 0)
const DEFAULT_MODEL = 'default.glb'
const HIT_DISTANCE = 5

/**
 * NOTES:
 *
 * - can only place item on flat(ish) surfaces
 * - if clicking a non-flat surface regular interaction will work (eg clicking a button on a wall)
 * - collision allows making movable/stackable objects, low-effort physics puzzles etc
 */

export default function App() {
  const groupRef = useRef()
  const modelRef = useRef()
  const world = useWorld()
  const entityId = useEntityUid()
  const fields = useFields()
  const editing = useEditing()
  const [state, dispatch] = useSyncState(s => s)

  const myAvatarId = world.getAvatar()?.uid

  const mode = state.mode
  const avatarId = state.avatarId
  const hand = state.hand
  const position = state.position
  const rotation = state.rotation

  const modelSrc = useFile(fields.model) || DEFAULT_MODEL
  const collision = fields.collision
  const guide = fields.guide
  const defaultPosition = fields.defaultPosition
  const defaultRotation = fields.defaultRotation
  const leftPosition = fields.leftPosition
  const leftRotation = fields.leftRotation
  const rightPosition = fields.rightPosition
  const rightRotation = fields.rightRotation

  const grab = event => {
    const avatarId = world.getAvatar().uid
    const hand = event.hand || 'rightHand'
    dispatch('hold', avatarId, hand)
    // dispatch('hold', avatarId, e.hand || 'leftHand') // DEBUG LEFT HAND
    world.emit('held', { entityId })
  }

  useSignal('Return', () => {
    dispatch('reset')
  })

  useEffect(() => {
    // Server:
    // - if person holding or placing item disconnects, reset back to initial place
    if (!world.isServer) return
    const onLeave = avatar => {
      if (avatarId !== avatar.uid) return
      dispatch('reset')
    }
    world.on('leave', onLeave)
    return () => {
      world.off('leave', onLeave)
    }
  }, [avatarId])

  useEffect(() => {
    // Client
    // - idle: place in default transform
    // - held: place in correct hand transform
    // - placed: place in default transform
    if (!world.isClient) return
    if (mode === 'idle') {
      const model = modelRef.current
      if (editing && guide === 'left') {
        v1.fromArray(leftPosition)
        model.setPosition(v1)
        e1.fromArray(leftRotation)
        model.setRotation(e1)
      } else if (editing && guide === 'right') {
        v1.fromArray(rightPosition)
        model.setPosition(v1)
        e1.fromArray(rightRotation)
        model.setRotation(e1)
      } else {
        v1.fromArray(defaultPosition)
        model.setPosition(v1)
        e1.fromArray(defaultRotation)
        model.setRotation(e1)
      }
    }
    if (mode === 'held') {
      const group = groupRef.current
      const model = modelRef.current
      return world.onUpdate(delta => {
        const avatar = world.getAvatar(avatarId)
        if (!avatar) return

        avatar.getBonePosition(hand, v1)
        group.setPosition(v1)
        avatar.getBoneRotation(hand, e1)
        group.setRotation(e1)

        v1.fromArray(hand === 'leftHand' ? leftPosition : rightPosition)
        model.setPosition(v1)
        e1.fromArray(hand === 'leftHand' ? leftRotation : rightRotation)
        model.setRotation(e1)
      })
    }
    if (mode === 'placed') {
      const group = groupRef.current
      const model = modelRef.current

      v1.fromArray(position)
      group.setPosition(v1)
      e1.fromArray(rotation)
      group.setRotation(e1)

      v1.fromArray(defaultPosition)
      model.setPosition(v1)
      e1.fromArray(defaultRotation)
      model.setRotation(e1)
    }
  }, [
    editing,
    mode,
    avatarId,
    hand,
    position,
    rotation,
    guide,
    defaultPosition,
    defaultRotation,
    leftPosition,
    leftRotation,
    rightPosition,
    rightRotation,
  ])

  useEffect(() => {
    // Client:
    // - clicking while holding will place item down
    if (!world.isClient) return
    if (mode !== 'held') return
    const avatar = world.getAvatar()
    const isLocalPlayer = avatar?.uid === state.avatarId
    if (!isLocalPlayer) return
    const onPointerDown = e => {
      const ray = avatar.getRay()
      const hit = world.raycast(ray)
      if (!hit) return
      if (hit.distance > HIT_DISTANCE) return
      const angle = hit.normal.angleTo(UP) * RAD2DEG
      if (angle > 45) return // must be a flat-ish surface
      const position = hit.point.toArray()
      const rotation = avatar.getRotation(e1).toArray()
      dispatch('place', position, rotation)
      e.preventDefault()
    }
    const onSomethingHeld = msg => {
      // semi-standard event called when any app "holds" an item
      // so that people don't hold multiple items in their hand
      if (msg.entityId !== entityId) {
        dispatch('reset')
      }
    }
    world.on('pointer-down', onPointerDown)
    world.on('held', onSomethingHeld)
    return () => {
      world.off('pointer-down', onPointerDown)
      world.off('held', onSomethingHeld)
    }
  }, [mode, avatarId])

  return (
    <app>
      {mode === 'idle' && (
        <group ref={groupRef}>
          <RigidBody enabled={collision}>
            <model
              ref={modelRef}
              src={modelSrc}
              onPointerDownHint="Grab"
              onPointerDown={grab}
              hitDistance={HIT_DISTANCE}
              collision={collision}
            />
          </RigidBody>
          {editing && guide === 'left' && <model src="left-hand.glb" />}
          {editing && guide === 'right' && <model src="right-hand.glb" />}
        </group>
      )}
      {mode === 'held' && (
        <global>
          <group ref={groupRef}>
            <model
              ref={modelRef}
              src={modelSrc}
              hitDistance={HIT_DISTANCE}
              layer={mode === 'held' ? 'COSMETIC' : undefined}
              castShadow={false}
              receiveShadow={false}
            />
          </group>
        </global>
      )}
      {mode === 'placed' && (
        <global>
          <group ref={groupRef}>
            <RigidBody enabled={collision}>
              <model
                ref={modelRef}
                src={modelSrc}
                onPointerDownHint="Grab"
                onPointerDown={grab}
                hitDistance={HIT_DISTANCE}
                collision={collision}
              />
            </RigidBody>
          </group>
        </global>
      )}
    </app>
  )
}

function RigidBody({ enabled, children }) {
  if (enabled) {
    return <rigidbody type="kinematic">{children}</rigidbody>
  }
  return children
}

const initialState = {
  // idle: item is movable using editor (local space)
  // held: item is attached to avatar hand (world space)
  // placed: item is placed on ground (world space)
  mode: 'idle',
  avatarId: null,
  hand: null,
  position: [0, 0, 0],
  rotation: [0, 0, 0],
}

export function getStore(state = initialState) {
  return {
    state,
    actions: {
      hold(state, avatarId, hand) {
        state.mode = 'held'
        state.avatarId = avatarId
        state.hand = hand
        state.position = [0, 0, 0]
        state.rotation = [0, 0, 0]
      },
      place(state, position, rotation) {
        state.mode = 'placed'
        state.avatarId = null
        state.hand = null
        state.position = position
        state.rotation = rotation
      },
      reset(state) {
        state.mode = 'idle'
        state.avatarId = null
        state.hand = null
        state.position = [0, 0, 0]
        state.rotation = [0, 0, 0]
      },
    },
    fields: [
      {
        key: 'label',
        label: 'Label',
        type: 'text',
        instant: false,
        descriptor: true,
      },
      {
        key: 'model',
        label: 'Model',
        type: 'file',
        accept: '.glb',
      },
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
        type: 'section',
        label: 'Offsets',
      },
      {
        key: 'guide',
        label: 'Type',
        type: 'switch',
        options: [
          { label: 'Surface', value: 'default' },
          { label: 'L Hand', value: 'left' },
          { label: 'R Hand', value: 'right' },
        ],
        initial: 'default',
      },
      {
        key: 'defaultPosition',
        label: 'Position',
        type: 'vec3',
        initial: [0, 0, 0],
        conditions: [{ field: 'guide', op: 'eq', value: 'default' }],
      },
      {
        key: 'defaultRotation',
        label: 'Rotation',
        type: 'vec3',
        initial: [0, 0, 0, 'YXZ'],
        conditions: [{ field: 'guide', op: 'eq', value: 'default' }],
      },
      {
        key: 'leftPosition',
        label: 'Position',
        type: 'vec3',
        initial: [0, 0, 0],
        conditions: [{ field: 'guide', op: 'eq', value: 'left' }],
      },
      {
        key: 'leftRotation',
        label: 'Rotation',
        type: 'vec3',
        initial: [0, 0, 0, 'YXZ'],
        conditions: [{ field: 'guide', op: 'eq', value: 'left' }],
      },
      {
        key: 'rightPosition',
        label: 'Position',
        type: 'vec3',
        initial: [0, 0, 0],
        conditions: [{ field: 'guide', op: 'eq', value: 'right' }],
      },
      {
        key: 'rightRotation',
        label: 'Rotation',
        type: 'vec3',
        initial: [0, 0, 0, 'YXZ'],
        conditions: [{ field: 'guide', op: 'eq', value: 'right' }],
      },
    ],
  }
}
