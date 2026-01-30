import React from 'react'

export function Icon({ position, icon }) {
  if (!icon) return null
  return (
    <image
      position={position}
      width={0.3}
      src={`quest-${icon}.png`}
      lit={false}
    />
  )
}
