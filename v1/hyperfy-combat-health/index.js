import React, { useEffect, useRef } from 'react'
import {
  useEditing,
  useWorld,
  useSyncState,
  useFields,
  useSignal,
} from 'hyperfy'
import { Vector3, Tween } from 'hyperfy'
import { randomInt } from 'hyperfy'

const v1 = new Vector3()

const COMBAT_TEXT_TIME = 0.2
const COMBAT_TEXT_ANIM = new Tween({ alpha: 0 }).to({ alpha: 1 }, COMBAT_TEXT_TIME, Tween.QUAD_OUT) // prettier-ignore

export default function App() {
  const world = useWorld()
  const fields = useFields()
  const editing = useEditing()
  const [playerIds, dispatch] = useSyncState(state => state.playerIds)

  const maxHP = fields.maxHP

  useSignal('Enable', () => {
    const playerId = world.getAvatar()?.uid
    dispatch('addPlayer', playerId)
  })

  useSignal('Disable', () => {
    const playerId = world.getAvatar()?.uid
    dispatch('removePlayer', playerId)
  })

  useSignal('Restore HP', () => {
    const playerId = world.getAvatar()?.uid
    dispatch('restorePlayer', playerId)
  })

  // DEBUG: for testing receiving damage
  // useSignal('Take Damage', () => {
  //   const playerId = world.getAvatar()?.uid
  //   const crit = randomInt(0, 10) > 7
  //   dispatch('hitPlayer', playerId, crit ? 20 : 10, crit)
  // })

  useEffect(() => {
    return world.on(
      'hfy-combat-hit',
      ({ sourceId, targetId, amount, crit }) => {
        dispatch('hitPlayer', sourceId, targetId, amount, crit)
      }
    )
  }, [])

  useEffect(() => {
    return world.on('hfy-combat-heal', ({ playerId, amount }) => {
      dispatch('healPlayer', playerId, amount)
    })
  }, [])

  useEffect(() => {
    if (!world.isServer) return
    // ensures that when a player leaves the world they are removed
    // from the simulation.
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
      {playerIds.map(playerId => (
        <Player
          key={playerId}
          world={world}
          playerId={playerId}
          maxHP={maxHP}
        />
      ))}
    </app>
  )
}

/**
 * This component attaches the health bar and combat text to a player.
 * If the player is local it also waits for your health to reach zero
 * and then triggers death and posts a chat message.
 */
function Player({ world, playerId, maxHP }) {
  const [player] = useSyncState(state => state.players[playerId])
  if (!player) return null
  return <PlayerInner world={world} player={player} maxHP={maxHP} />
}
function PlayerInner({ world, player, maxHP }) {
  const barRef = useRef()
  const hitboxRef = useRef()
  const editing = useEditing()

  const hp = Math.max(0, maxHP - player.dmg)
  const hpPercent = (hp / maxHP) * 100
  const isDead = hp === 0
  const hitNum = player.hitNum
  const hitSourceId = player.hitSourceId
  const hitAmount = player.hitAmount
  const hitCrit = player.hitCrit

  const isLocalPlayer = world.getAvatar()?.uid === player.id

  // attach to player head
  useEffect(() => {
    if (!world.isClient) return
    const bar = barRef.current
    const hitbox = hitboxRef.current
    return world.onUpdate(() => {
      const avatar = world.getAvatar(player.id)
      if (!avatar) return
      avatar.getBonePosition('head', v1)
      bar.setPosition(v1)
      avatar.getPosition(v1)
      hitbox.setPosition(v1)
    })
  }, [])

  // if local player, watch for death
  useEffect(() => {
    if (!world.isClient) return
    if (!isDead) return
    if (!isLocalPlayer) return
    world.trigger('dead')
    const sourceName = world.getAvatar(hitSourceId)?.name || 'Unknown'
    const targetName = world.getAvatar()?.name || 'Unknown'
    world.chat(`${sourceName} killed ${targetName}`)
  }, [isDead])

  return (
    <global>
      <group ref={hitboxRef}>
        {!isLocalPlayer && (
          <sensor
            id={player.id}
            label="combat_hitbox"
            type="capsule"
            size={[0.2, 1.4]}
            position={[0, 0.9, 0]}
            debug={editing}
          />
        )}
      </group>
      <billboard ref={barRef} axis="y">
        <panel
          size={[0.2, 0.025]}
          canvasSize={[128, 128]}
          unitSize={1}
          style={{ bg: 'rgba(0,0,0,.2)' }}
          position={[0, 0.35, 0]}
          layer="COSMETIC"
        >
          <rect
            style={{
              top: 0,
              left: 0,
              bottom: 0,
              width: hpPercent + '%',
              bg: '#e83232',
            }}
          />
        </panel>
        <DamageText
          key={hitNum}
          world={world}
          amount={hitAmount}
          crit={hitCrit}
        />
      </billboard>
    </global>
  )
}

/**
 * This component displays damage text above the player when they are hit.
 * It is spawned/recreated each time a hit comes in.
 * It quickly scales up from zero and then hides itself.
 * It scales up larger when the hit was a crit.
 *
 * Note: see how <DamageText> uses a "key" prop? This forces it to re-create each time that value changes!
 */
function DamageText({ world, amount, crit }) {
  if (!amount) return null
  const textRef = useRef()
  useEffect(() => {
    const text = textRef.current
    const anim = COMBAT_TEXT_ANIM
    let time = 0
    const stop = world.onUpdate(delta => {
      time += delta
      anim.set(time)
      const alpha = anim.value.alpha
      v1.setScalar(alpha)
      text.setScale(v1)
      if (alpha >= 1) {
        stop()
        text.setVisible(false)
      }
    })
    return () => {
      stop()
    }
  }, [])
  return (
    <text
      position={[0, 0.5, 0]}
      ref={textRef}
      value={amount}
      color={crit ? 'red' : 'white'}
      fontSize={crit ? 0.4 : 0.2}
      anchorY={'bottom'}
    />
  )
}

const initialState = {
  playerIds: [],
  players: {}, // { id, dmg, hitNum, hitSourceId, hitAmount, hitCrit }
}

export function getStore(state = initialState) {
  return {
    state,
    actions: {
      addPlayer(state, playerId) {
        const exists = state.players[playerId]
        if (exists) return
        state.playerIds.push(playerId)
        state.players[playerId] = {
          id: playerId,
          dmg: 0,
          hitNum: 0,
          hitSourceId: null,
          hitAmount: 0,
          hitCrit: false,
        }
      },
      removePlayer(state, playerId) {
        const exists = state.players[playerId]
        if (!exists) return
        state.playerIds = state.playerIds.filter(id => id !== playerId)
        delete state.players[playerId]
      },
      hitPlayer(state, sourceId, targetId, amount, crit) {
        const player = state.players[targetId]
        if (!player) return
        player.dmg += amount
        player.hitNum++
        player.hitSourceId = sourceId
        player.hitAmount = amount
        player.hitCrit = crit
      },
      healPlayer(state, playerId, amount) {
        const player = state.players[playerId]
        if (!player) return
        player.dmg -= amount
        if (player.dmg < 0) player.dmg = 0
      },
      restorePlayer(state, playerId) {
        const player = state.players[playerId]
        if (!player) return
        player.dmg = 0
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
        key: 'maxHP',
        label: 'HP',
        type: 'float',
        initial: 100,
        instant: false,
      },
      {
        type: 'trigger',
        name: 'dead',
        label: 'On Dead',
      },
    ],
  }
}
