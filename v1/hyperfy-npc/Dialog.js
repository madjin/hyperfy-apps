import React, { useEffect, useState, useRef, useMemo } from 'react'
import {
  useScreen,
  useWorld,
  useFields,
  useFile,
  useQuests,
  useEntityUid,
  useCondition,
} from 'hyperfy'

export function Dialog({ title, greeting, quests, messages, onClose }) {
  const screen = useScreen()
  const world = useWorld()
  const [viewId, setViewId] = useState(null)

  let _title = title
  let _text = greeting
  const quest = viewId && quests?.find(q => q.id === viewId)
  if (quest) {
    _title = quest.name
    if (quest.canStart()) {
      _text = quest.startText
    }
    if (quest.isStarted()) {
      _text = quest.activeText
    }
    if (quest.isReady()) {
      _text = quest.endText
    }
  }
  const message = viewId && messages?.find(m => m.id === viewId)
  if (message) {
    _title = title
    _text = message.response
  }

  let width = 340
  let height = 400
  let top
  let left
  if (screen.width > 880) {
    top = screen.height / 2 - height / 2
    left = screen.width - (screen.width / 2 - width / 2)
  } else {
    top = screen.height - height - 20
    left = screen.width / 2 - width / 2
  }

  useEffect(() => {
    world.blur()
    return world.on('focus', () => {
      onClose()
    })
  }, [])

  return (
    <gui
      style={{
        top: top + 'px',
        left: left + 'px',
        width: width + 'px',
        height: height + 'px',
        backgroundColor: 'rgba(22, 22, 28, 1)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.03)',
        borderRadius: '22px',
      }}
    >
      <guiview style={{ padding: '30px' }}>
        <guitext
          style={{
            fontSize: '24px',
            fontWeight: '600',
            textAlign: 'center',
            margin: '0 0 20px',
          }}
        >
          {_title || '...'}
        </guitext>
        <guitext
          style={{
            fontSize: '16px',
            lineHeight: '1.4',
            // textAlign: 'center',
            color: 'rgba(255,255,255,.7)',
          }}
        >
          {_text || '...'}
        </guitext>
      </guiview>
      <guiview style={{ padding: '0 22px' }}>
        {!viewId && (
          <>
            {quests?.map(quest => (
              <Item
                key={quest.id}
                icon={getQuestIcon(quest)}
                text={quest.name}
                onSelect={() => setViewId(quest.id)}
              />
            ))}
            {messages.map(message => (
              <Item
                key={message.id}
                icon="dialog-message.png"
                text={message.prompt}
                condition={message.condition}
                onSelect={() => {
                  setViewId(message.id)
                  const num = message.id.split('/')[1]
                  world.trigger(`message${num}Trigger`)
                }}
              />
            ))}
          </>
        )}
        {viewId && (
          <>
            {quest?.canStart() && (
              <Item
                icon="dialog-accept.png"
                text="Accept Quest"
                onSelect={() => {
                  quest.start()
                  setViewId(null)
                }}
              />
            )}
            {quest?.isReady() && (
              <Item
                icon="dialog-complete.png"
                text="Complete Quest"
                onSelect={() => {
                  quest.complete()
                  setViewId(null)
                }}
              />
            )}
            <Item
              icon="dialog-back.png"
              text="Back"
              onSelect={() => setViewId(null)}
            />
          </>
        )}
      </guiview>
    </gui>
  )
}

function Item({ icon, text, condition, onSelect }) {
  const [hover, setHover] = useState(false)
  const visible = useCondition(condition)
  if (!visible) return null
  return (
    <guiview
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderRadius: '8px',
        padding: '8px',
        border: hover
          ? '1px solid rgba(255,255,255,.2)'
          : '1px solid transparent',
        cursor: 'pointer',
      }}
      onHoverEnter={() => setHover(true)}
      onHoverLeave={() => setHover(false)}
      onPointerDown={() => {
        onSelect()
      }}
    >
      <guiimage
        src={icon}
        style={{ width: '20px', height: '20px', marginRight: '6px' }}
      />
      <guitext style={{ lineHeight: '1.2', flex: '1' }}>{text}</guitext>
    </guiview>
  )
}

function getQuestIcon(quest) {
  if (quest.canStart()) {
    return 'dialog-quest-new.png'
  }
  if (quest.isStarted()) {
    return 'dialog-quest-progress.png'
  }
  if (quest.isReady()) {
    return 'dialog-quest-ready.png'
  }
}
