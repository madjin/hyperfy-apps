import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useWorld, useFields, useEntityUid, useSignal } from 'hyperfy'

// const API_URL = 'http://localhost:4000/api'
const API_URL = 'https://api.hyperfy.io'

export default function App() {
  const world = useWorld()
  const fields = useFields()
  const entityId = useEntityUid()
  const [n, setN] = useState(0)
  let [scores, setScores] = useState([])

  const worldId = world.getWorldId()
  const id = worldId + '_' + (fields.id || '')
  const sourceId = fields.sourceId
  const top = fields.top
  const scale = fields.scale || 1
  const color = fields.color || '#ffffff'
  const announce = fields.announce
  const board = fields.board
  const title = fields.title

  const names = useMemo(() => {
    let n = 0
    return scores
      .map(score => {
        const num = ++n + '. '
        return num + trim(score.name, 12)
      })
      .join('\n')
  }, [scores])

  const values = useMemo(() => {
    const values = scores.map(item => item.value)
    const wholeNums = hasWholeNumbers(values)
    return values
      .map(value => {
        return wholeNums ? value : value.toFixed(2)
      })
      .join('\n')
  }, [scores])

  useEffect(() => {
    const load = async () => {
      try {
        const url = `${API_URL}/scores?board=${id}&top=${top}`
        const scores = await world.http({
          method: 'GET',
          url,
        })
        setScores(scores)
      } catch (err) {
        console.error('could not load scores')
        console.error(err)
      }
    }
    load()
  }, [id, top, n])

  useEffect(() => {
    return world.on('hyp:score:refresh', _id => {
      if (_id !== id) return
      setN(n => n + 1)
    })
  }, [id])

  useEffect(() => {
    if (!world.isServer) return
    return world.on('hyp:score:submit', async (_entityId, score) => {
      if (entityId !== _entityId) return
      try {
        const url = `${API_URL}/scores?token=${SECRETS.token}`
        await world.http({
          method: 'POST',
          url,
          data: score,
        })
      } catch (err) {
        console.error('could not submit score')
        console.error(err)
        return
      }
      world.broadcast('hyp:score:refresh', id)
    })
  }, [id])

  useSignal('Submit', async () => {
    let value
    world.once('hyp:score:announce', _value => {
      value = _value
    })
    world.emit('hyp:score:request', sourceId)
    if (!value) return
    const avatar = world.getAvatar()
    const name = avatar.name
    const address = avatar.address
    const score = {
      board: id,
      address,
      name,
      value,
      top,
    }
    world.notify('hyp:score:submit', entityId, score)
    if (announce) {
      let text = announce
      text = text.replace('{name}', name)
      text = text.replace(
        '{value}',
        isWholeNumber(value) ? value : value.toFixed(2)
      )
      world.chat(text)
    }
  })

  return (
    <app>
      <group scale={scale}>
        {board && (
          <>
            <model src="scoreboard.glb" />
            <text
              fontSize={0.3}
              align="center"
              color={color}
              position={[0, 2.8, 0]}
              value={title}
            />
          </>
        )}
        <text
          fontSize={0.15}
          align="left"
          anchorX="left"
          color={color}
          position={[-1.2, 2.35, 0]}
          value={names}
        />
        <text
          fontSize={0.15}
          align="right"
          anchorX="right"
          color={color}
          position={[1.2, 2.35, 0]}
          value={values}
        />
      </group>
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
        key: 'label',
        label: 'Label',
        type: 'text',
        descriptor: true,
      },
      {
        key: 'id',
        label: 'Board ID',
        type: 'text',
        instant: false,
      },
      {
        key: 'sourceId',
        label: 'Source',
        type: 'link',
        kind: 'hyp/scoreboardSource',
      },
      {
        key: 'top',
        label: 'Top',
        type: 'switch',
        options: [
          { label: 'Highest', value: 'high' },
          { label: 'Lowest', value: 'low' },
        ],
        initial: 'high',
      },
      {
        key: 'color',
        label: 'Color',
        type: 'color',
        initial: '#ffffff',
      },
      {
        key: 'scale',
        label: 'Scale',
        type: 'float',
        initial: 1,
      },
      {
        key: 'announce',
        label: 'Announce',
        type: 'text',
        placeholder: 'None',
        initial: '{name} finished in {value}s',
      },
      {
        type: 'section',
        label: 'Board',
      },
      {
        key: 'board',
        label: 'Enabled',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: true,
      },
      {
        key: 'title',
        label: 'Title',
        type: 'text',
        initial: 'High Scores',
        conditions: [{ field: 'board', op: 'eq', value: true }],
      },
    ],
  }
}

function trim(str, maxLength) {
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '…'
  }
  return str
}

function hasWholeNumbers(arr) {
  return arr.every(num => num === Math.floor(num))
}

function isWholeNumber(num) {
  return num === Math.floor(num)
}
