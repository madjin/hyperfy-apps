import React, { useEffect, useRef } from 'react'
import {
  useEntityUid,
  useFile,
  useEditing,
  useWorld,
  useSyncState,
  useFields,
  useSignal,
} from 'hyperfy'
import { Vector3, Euler } from 'hyperfy'
import { randomInt } from 'hyperfy'

const v1 = new Vector3()
const e1 = new Euler()

export default function App() {
  const world = useWorld()
  const fields = useFields()
  const editing = useEditing()
  const [playerIds, dispatch] = useSyncState(state => state.playerIds)

  const emoteSrc = useFile(fields.emote)

  useSignal('Equip', () => {
    const playerId = world.getAvatar()?.uid
    const isEquipped = playerIds.includes(playerId)
    if (isEquipped) return
    dispatch('addPlayer', playerId)
    world.emit('held', { entityId: playerId, hand: fields.hand })
  })

  useSignal('Unequip', () => {
    const playerId = world.getAvatar()?.uid
    const isEquipped = playerIds.includes(playerId)
    if (!isEquipped) return
    dispatch('removePlayer', playerId)
  })

  useSignal('Toggle', () => {
    const playerId = world.getAvatar()?.uid
    const isEquipped = playerIds.includes(playerId)
    if (isEquipped) {
      dispatch('removePlayer', playerId)
    } else {
      dispatch('addPlayer', playerId)
      world.emit('held', { entityId: playerId, hand: fields.hand })
    }
  })

  useEffect(() => {
    if (!world.isServer) return
    const onLeave = avatar => {
      dispatch('removePlayer', avatar.uid)
    }
    world.on('leave', onLeave)
    return () => {
      world.off('leave', onLeave)
    }
  }, [])

  return (
    <app>
      {editing && (
        <model src="block.glb" castShadow={false} receiveShadow={false} />
      )}
      {emoteSrc && (
        <emote key={emoteSrc} id={emoteSrc} src={emoteSrc} upperBody />
      )}
      {playerIds.map(playerId => (
        <Player key={playerId} playerId={playerId} />
      ))}
    </app>
  )
}

function Player({ playerId }) {
  const world = useWorld()
  const editing = useEditing()
  const fields = useFields()
  const weaponRef = useRef()
  const soundRef = useRef()
  const hurtboxRef = useRef()
  const hitlistRef = useRef()
  const [player, dispatch] = useSyncState(state => state.players[playerId])

  const isLocalPlayer = world.getAvatar()?.uid === playerId

  const modelSrc = useFile(fields.model)
  const hand = fields.hand
  const position = fields.position
  const rotation = fields.rotation
  const emoteSrc = useFile(fields.emote)
  const soundSrc = useFile(fields.sound)
  const minDmg = fields.minDmg
  const maxDmg = fields.maxDmg
  const critChance = fields.critChance
  const critMultiplier = fields.critMultiplier
  const cooldown = fields.cooldown || 0
  const hbSize = fields.hbSize
  const hbPosition = fields.hbPosition
  const hbRotation = fields.hbRotation
  const hbDelay = (fields.hbDelay || 0) * 1000
  const hbTime = (fields.hbTime || 0.5) * 1000

  const usedAt = player?.usedAt || -9999

  useEffect(() => {
    if (!world.isClient) return
    const weapon = weaponRef.current
    return world.onUpdate(() => {
      const avatar = world.getAvatar(playerId)
      if (!avatar) return
      avatar.getBonePosition(hand, v1)
      avatar.getBoneRotation(hand, e1)
      weapon.setPosition(v1)
      weapon.setRotation(e1)
    })
  }, [hand])

  useEffect(() => {
    if (!player) return
    const timeAgo = world.getTime() - player.usedAt
    if (timeAgo > 3) return // dont play old sounds
    soundRef.current?.play(true)
  }, [usedAt])

  useEffect(() => {
    const avatar = world.getAvatar()
    const isLocalPlayer = avatar?.uid === playerId
    if (!isLocalPlayer) return
    const hurtbox = hurtboxRef.current
    hurtbox.setEnabled(false)
    const hitlist = new Set()
    hitlistRef.current = hitlist
    let lastUsed = -9999
    let timer1
    let timer2
    const onPointerUp = e => {
      const now = world.getTime()
      if (lastUsed + cooldown > now) return
      clearTimeout(timer1)
      clearTimeout(timer2)
      lastUsed = now
      hitlist.clear()
      world.emote(emoteSrc)
      dispatch('usePlayer', playerId, now)
      timer1 = setTimeout(() => {
        hurtbox.setEnabled(true)
        timer2 = setTimeout(() => {
          hurtbox.setEnabled(false)
        }, hbTime)
      }, hbDelay)
    }
    const onSomethingHeld = msg => {
      // semi-standard event called when any app "holds" an item
      // so that people don't hold multiple items in their hand
      if (msg.entityId === playerId && (!msg.hand || msg.hand === hand)) {
        dispatch('removePlayer', msg.entityId)
      }
    }
    world.on('pointer-up', onPointerUp)
    world.on('held', onSomethingHeld)
    return () => {
      world.off('pointer-up', onPointerUp)
      world.off('held', onSomethingHeld)
    }
  }, [emoteSrc, hand, hbDelay, hbTime, cooldown])

  return (
    <global>
      <group ref={weaponRef}>
        <group position={position} rotation={rotation}>
          {modelSrc && <model src={modelSrc} layer="COSMETIC" />}
          {isLocalPlayer && (
            <sensor
              ref={hurtboxRef}
              type="box"
              size={hbSize}
              position={hbPosition}
              rotation={hbRotation}
              onEnter={(label, id) => {
                if (label !== 'combat_hitbox') return
                // only hit player once per swing
                if (hitlistRef.current.has(id)) return
                // deal damage
                let amount = randomInt(minDmg, maxDmg)
                const crit = randomInt(0, 100) < critChance
                if (crit) amount *= critMultiplier
                world.emit('hfy-combat-hit', {
                  sourceId: playerId,
                  targetId: id,
                  amount,
                  crit,
                })
                // track hit
                hitlistRef.current.add(id)
              }}
              debug={isLocalPlayer && editing}
            />
          )}
          {soundSrc && <audio ref={soundRef} src={soundSrc} />}
        </group>
      </group>
    </global>
  )
}

const initialState = {
  playerIds: [],
  players: {}, // { id, usedAt }
}

export function getStore(state = initialState) {
  return {
    state,
    actions: {
      addPlayer(state, playerId) {
        const player = state.players[playerId]
        if (player) return
        state.playerIds.push(playerId)
        state.players[playerId] = {
          id: playerId,
          usedAt: -9999,
        }
      },
      removePlayer(state, playerId) {
        const player = state.players[playerId]
        if (!player) return
        state.playerIds = state.playerIds.filter(id => id !== playerId)
        delete state.players[playerId]
      },
      usePlayer(state, playerId, time) {
        const player = state.players[playerId]
        if (!player) return
        player.usedAt = time // used for audio sync
      },
    },
    fields: [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        instant: false,
        descriptor: true,
      },
      {
        key: 'model',
        label: 'Model',
        type: 'file',
        accept: '.glb',
        placeholder: 'glb',
      },
      {
        key: 'hand',
        label: 'Hand',
        type: 'switch',
        options: [
          { label: 'Left', value: 'leftHand' },
          { label: 'Right', value: 'rightHand' },
        ],
        initial: 'rightHand',
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
      {
        type: 'section',
        label: 'Hitbox',
      },
      {
        key: 'hbSize',
        label: 'Size',
        type: 'vec3',
        initial: [0.2, 0.2, 0.2],
      },
      {
        key: 'hbPosition',
        label: 'Position',
        type: 'vec3',
        initial: [0, 0.6, 0],
      },
      {
        key: 'hbRotation',
        label: 'Rotation',
        type: 'vec3',
        initial: [0, 0, 0, 'YXZ'],
      },
      {
        key: 'hbDelay',
        label: 'Active Delay',
        type: 'float',
        initial: 0,
      },
      {
        key: 'hbTime',
        label: 'Active Time',
        type: 'float',
        initial: 0.5,
      },
      {
        type: 'section',
        label: 'Effect',
      },
      {
        key: 'emote',
        label: 'Emote',
        type: 'file',
        accept: '.glb',
        placeholder: 'glb',
      },
      {
        key: 'sound',
        label: 'Sound',
        type: 'file',
        accept: '.mp3',
        placeholder: 'mp3',
      },
      {
        key: 'minDmg',
        label: 'Min Damage',
        type: 'float',
        initial: 10,
        instant: false,
      },
      {
        key: 'maxDmg',
        label: 'Max Damage',
        type: 'float',
        initial: 20,
        instant: false,
      },
      {
        key: 'critChance',
        label: 'Crit %',
        type: 'float',
        initial: 40,
        instant: false,
      },
      {
        key: 'critMultiplier',
        label: 'Crit Multiplier',
        type: 'float',
        initial: 3,
        instant: false,
      },
      {
        key: 'cooldown',
        label: 'Cooldown',
        type: 'float',
        initial: 0.5,
        instant: false,
      },
    ],
  }
}
