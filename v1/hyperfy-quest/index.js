import React, { useRef, useEffect, useState, useMemo } from 'react'
import {
  useWorld,
  useEditing,
  useFields,
  useSignal,
  useEntityUid,
  useCondition,
} from 'hyperfy'

export default function App() {
  const id = useEntityUid()
  const world = useWorld()
  const fields = useFields()
  const editing = useEditing()
  const questRef = useRef()

  const tasks = useMemo(() => {
    const tasks = []
    for (let n = 1; n <= fields.tasks; n++) {
      const task = {}
      task.id = `${id}/${n}`
      task.name = fields[`task${n}Name`]
      task.needed = fields[`task${n}Needed`]
      task.complete = `task${n}Complete`
      tasks.push(task)
    }
    return tasks
  }, [fields])

  useSignal('Reset', () => {
    questRef.current.reset()
  })

  const enabled = useCondition(fields.enabled)

  return (
    <app>
      <quest
        ref={questRef}
        id={id}
        name={fields.name}
        startText={fields.startText}
        activeText={fields.activeText}
        endText={fields.endText}
        startPointId={fields.startPointId}
        endPointId={fields.endPointId}
        enabled={enabled}
        onStart={() => {
          world.trigger('Start')
        }}
        onComplete={() => {
          world.trigger('Complete')
        }}
        onReset={() => {
          world.trigger('Reset')
        }}
      >
        {tasks.map(task => (
          <task
            key={task.id}
            id={task.id}
            name={task.name}
            needed={task.needed}
            onComplete={() => {
              world.trigger(task.complete)
            }}
          />
        ))}
      </quest>
      <link kind="hyp/quest" label={fields.name} value={id} />
      {tasks.map(task => (
        <link
          key={task.id}
          kind="hyp/questTask"
          label={`${fields.name} > ${task.name}`}
          value={task.id}
        />
      ))}
      {editing && <model src="block.glb" />}
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
        key: 'name',
        label: 'Name',
        type: 'text',
        instant: false,
        descriptor: true,
      },
      {
        key: 'startText',
        label: 'Start Text',
        type: 'textarea',
        instant: false,
      },
      {
        key: 'activeText',
        label: 'Active Text',
        type: 'textarea',
        instant: false,
      },
      {
        key: 'endText',
        label: 'End Text',
        type: 'textarea',
        instant: false,
      },
      {
        key: 'startPointId',
        label: 'Start At',
        type: 'link',
        kind: 'hyp/questPoint',
      },
      {
        key: 'endPointId',
        label: 'End At',
        type: 'link',
        kind: 'hyp/questPoint',
      },
      {
        key: 'enabled',
        label: 'Requirement',
        type: 'condition',
        zero: 'None',
      },
      {
        type: 'trigger',
        name: 'Start',
      },
      {
        type: 'trigger',
        name: 'Complete',
      },
      {
        type: 'trigger',
        name: 'Reset',
      },
      {
        key: 'tasks',
        label: 'Tasks',
        type: 'switch',
        options: [
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '4', value: 4 },
          { label: '5', value: 5 },
        ],
        initial: 1,
      },
      ...makeTaskFields(1),
      ...makeTaskFields(2),
      ...makeTaskFields(3),
      ...makeTaskFields(4),
      ...makeTaskFields(5),
    ],
  }
}

function makeTaskFields(n) {
  return [
    {
      type: 'section',
      label: `Task #${n}`,
      conditions: [{ field: 'tasks', op: 'gte', value: n }],
    },
    {
      key: `task${n}Name`,
      label: 'Name',
      type: 'text',
      instant: false,
      conditions: [{ field: 'tasks', op: 'gte', value: n }],
    },
    {
      key: `task${n}Needed`,
      label: 'Needed',
      type: 'text',
      instant: false,
      initial: '0',
      conditions: [{ field: 'tasks', op: 'gte', value: n }],
    },
    {
      type: 'trigger',
      name: `task${n}Complete`,
      label: 'On Complete',
      conditions: [{ field: 'tasks', op: 'gte', value: n }],
    },
  ]
}
