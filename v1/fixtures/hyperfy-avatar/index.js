import React from 'react'
import { useSettings, useWorldAvatar, useSyncState } from 'hyperfy'

const HYPERBOT_AVATAR = 'hyperbot-v2.vrm' // prettier-ignore
const BASIC_AVATAR = 'fallback-v2.vrm' // prettier-ignore

/**
 * Avatars are updated to custom VRM's by setting Account.avatarState to a src url:-
 * '{"src":"https://data.hyperfy.xyz/uploads/some-avatar.vrm", "rank":3}'
 */

export default function HyperfyAvatar() {
  const [state] = useSyncState(state => state)
  const { minAvatarRank } = useSettings()
  const defaultSrc = useWorldAvatar() || HYPERBOT_AVATAR
  let src
  if (!state.rank) {
    src = defaultSrc
  } else if (state.rank < minAvatarRank) {
    src = BASIC_AVATAR
  } else {
    src = state.src
  }
  return <avatar src={src} />
}

const InitialState = {
  src: null,
  rank: null,
}

export function getStore(state = InitialState) {
  return {
    state,
    actions: {
      update(state, { src, rank }) {
        state.src = src
        state.rank = rank
      },
    },
  }
}
