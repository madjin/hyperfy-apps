import React, { useMemo } from 'react'
import { useQuests } from 'hyperfy'

export function useQuestPoint(id, messages) {
  const chatTaskIds = useMemo(() => {
    return messages.filter(m => m.taskId).map(m => m.taskId)
  }, [messages])

  const quests = useQuests(
    nodes => {
      const quests = []
      for (const quest of nodes) {
        if (quest.startPointId === id) {
          if (quest.canStart()) {
            quests.push(quest)
          }
        }
        if (quest.endPointId === id) {
          if (quest.isActive()) {
            quests.push(quest)
          }
        }
      }
      return quests
    },
    [chatTaskIds]
  )

  const icon = useQuests(
    nodes => {
      let hasNew
      let hasStarted
      let hasReady
      let hasChat
      for (const quest of nodes) {
        // check status
        if (quest.startPointId === id) {
          if (quest.canStart()) {
            hasNew = true
          }
        }
        if (quest.endPointId === id) {
          if (quest.isStarted()) {
            hasStarted = true
          } else if (quest.isReady()) {
            hasReady = true
          }
        }
        // check tasks
        for (const task of quest.tasks) {
          if (chatTaskIds.includes(task.id)) {
            if (task.canIncrement()) {
              hasChat = true
              break
            }
          }
        }
      }
      const icon = hasReady
        ? 'ready'
        : hasNew
        ? 'new'
        : hasStarted
        ? 'started'
        : hasChat
        ? 'chat'
        : null
      return icon
    },
    [chatTaskIds]
  )

  return { quests, icon }
}
