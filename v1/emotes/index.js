import React, { useEffect } from 'react'
import { useWorld } from 'hyperfy'

export default function App() {
  const world = useWorld()

  useEffect(() => {
    const dance = world.command('dance', () => {
      world.emote('dance')
    })
    const wave = world.command('wave', () => {
      world.emote('wave')
    })
    const clap = world.command('clap', () => {
      world.emote('clap')
    })
    const backflip = world.command('backflip', () => {
      world.emote('backflip')
    })
    const die = world.command('die', () => {
      world.emote('die')
    })
    const point = world.command('point', () => {
      world.emote('point')
    })
    const cheer = world.command('cheer', () => {
      world.emote('cheer')
    })
    const sad = world.command('sad', () => {
      world.emote('sad')
    })
    const sit = world.command('sit', () => {
      world.emote('sit')
    })
    const sit2 = world.command('sit2', () => {
      world.emote('sit2')
    })
    return () => {
      dance()
      wave()
      clap()
      sad()
      cheer()
      die()
      backflip()
      point()
      sit()
      sit2()
    }
  }, [])

  return (
    <app>
      <emote id="wave" src="Waving.fbx" loop />
      <emote id="backflip" src="Backflip.fbx" />
      <emote id="cheer" src="Cheering.fbx" loop />
      <emote id="clap" src="Clapping.fbx" loop />
      <emote id="dance" src="Dancing.fbx" loop />
      <emote id="die" src="Dying.fbx" />
      <emote id="point" src="Pointing.fbx" />
      <emote id="sad" src="Sadness.fbx" />
      <emote id="sit" src="Sitting_idle.fbx" loop />
      <emote id="sit2" src="Sitting_rest.fbx" loop />
    </app>
  )
}
