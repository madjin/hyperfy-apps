import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  useWorld,
  useFile,
  useSignal,
  useFields,
  useEditing,
  useSyncState,
} from 'hyperfy'

export default function App() {
  const world = useWorld()
  // const editing = useEditing()
  const ref = useRef()
  const fields = useFields()
  const [local, setLocal] = useState(() => ({ mode: null, modeN: 0 }))
  const [global] = useSyncState(s => s)

  // playback
  const autoPlay = fields.autoPlay
  const sync = fields.sync
  const duration = fields.duration
  const loop = fields.loop
  const prewarm = fields.prewarm
  const delay = fields.delay
  const timeScale = fields.timeScale
  const autoRandomSeed = fields.autoRandomSeed
  const customSeed = fields.customSeed

  // emission
  const rate = fields.rate
  const maxParticles = fields.maxParticles

  // render
  const billboard = fields.billboard
  const textureSrc = useFile(fields.textureSrc)
  const lit = fields.lit
  const additive = fields.additive
  const worldSpace = fields.worldSpace

  // shape
  const shapeType = fields.shapeType
  const shapeRadius = fields.shapeRadius
  const shapeThickness = fields.shapeThickness
  const shapeAngle = fields.shapeAngle
  const shapeArc = fields.shapeArc
  const shapeRandomizeDir = fields.shapeRandomizeDir

  // spawn
  const lifeType = fields.lifeType
  const lifeConstant = fields.lifeConstant
  const lifeCurve = fields.lifeCurve
  const speedType = fields.speedType
  const speedConstant = fields.speedConstant
  const speedCurve = fields.speedCurve
  const sizeType = fields.sizeType
  const sizeConstant = fields.sizeConstant
  const sizeCurve = fields.sizeCurve
  const rotationType = fields.rotationType
  const rotationConstant = fields.rotationConstant
  const rotationCurve = fields.rotationCurve
  const colorType = fields.colorType
  const colorConstant = fields.colorConstant
  const colorGradient = fields.colorGradient

  // size over lifetime
  const sizeLifetime = fields.sizeLifetime
  const sizeLifetimeCurve = fields.sizeLifetimeCurve

  // rotation over lifetime
  const rotationLifetime = fields.rotationLifetime
  const rotationLifetimeCurve = fields.rotationLifetimeCurve

  // color over lifetime
  const colorLifetime = fields.colorLifetime
  const colorLifetimeGradient = fields.colorLifetimeGradient

  // velocity over lifetime
  const velocityLifetime = fields.velocityLifetime
  const velocityLinear = fields.velocityLinear
  const velocityLinearWorld = fields.velocityLinearWorld
  const velocityOrbital = fields.velocityOrbital
  const velocityOrbitalOffset = fields.velocityOrbitalOffset
  const velocityOrbitalRadial = fields.velocityOrbitalRadial

  let mode
  let modeN
  if (sync) {
    mode = global.mode
    modeN = global.modeN
  } else {
    mode = local.mode
    modeN = local.modeN
  }

  // console.log({ mode, modeN, autoPlay })

  const setMode = mode => {
    // console.log('setMode', mode)
    world.dispatch('setMode', mode)
    setLocal(l => ({ mode, modeN: l.modeN + 1 }))
  }

  useEffect(() => {
    // get it going!
    if (mode) {
      if (mode === 'play') {
        ref.current.play()
      }
      if (mode === 'pause') {
        ref.current.pause()
      }
      if (mode === 'restart') {
        ref.current.restart()
      }
      if (mode === 'stop') {
        ref.current.stop()
      }
    } else {
      if (autoPlay) {
        ref.current.play()
      } else {
        ref.current.stop()
      }
    }
  }, [autoPlay, mode, modeN])

  useEffect(() => {
    if (!world.isServer) return
    // reset global mode when autoPlay/sync changes
    world.dispatch('setMode', null)
  }, [autoPlay, sync])

  useEffect(() => {
    if (!world.isClient) return
    // reset local mode when sync changes
    setLocal(l => ({ mode: null, modeN: l.modeN + 1 }))
  }, [sync])

  const onReady = () => {
    // after the system is rebuilt, kick off the mode/autoPlay again
    setMode(mode)
  }

  useSignal('Play', () => {
    setMode('play')
  })

  useSignal('Pause', () => {
    setMode('pause')
  })

  useSignal('Restart', () => {
    setMode('restart')
  })

  useSignal('Stop', () => {
    setMode('stop')
  })

  useSignal(
    'Clipboard: Copy',
    () => {
      const data = { ...fields }
      if (data.textureSrc) {
        data.textureSrc = {
          name: data.textureSrc.name,
          url: data.textureSrc.url,
        }
      }
      world.copyToClipboard(JSON.stringify(data, null, 2))
    }
    // !editing
  )

  useSignal(
    'Clipboard: Paste',
    async () => {
      let data
      const text = await world.readFromClipboard()
      try {
        // try json
        data = JSON.parse(text)
      } catch (err) {
        console.log('json fail')
        try {
          // try object
          data = world.evaluate(`(${text})`)
        } catch (err) {
          console.log('obj fail')
        }
      }
      if (!data) return console.error('invalid')
      world.dispatch('$setFields', data)
    }
    // !editing
  )

  return (
    <app>
      <particles
        ref={ref}
        // autoPlay={autoPlay}
        duration={duration}
        loop={loop}
        prewarm={prewarm}
        delay={delay}
        timeScale={timeScale}
        autoRandomSeed={autoRandomSeed}
        customSeed={customSeed}
        rate={rate}
        maxParticles={maxParticles}
        billboard={billboard}
        textureSrc={textureSrc}
        lit={lit}
        additive={additive}
        worldSpace={worldSpace}
        shapeType={shapeType}
        shapeRadius={shapeRadius}
        shapeThickness={shapeThickness}
        shapeAngle={shapeAngle}
        shapeArc={shapeArc}
        shapeRandomizeDir={shapeRandomizeDir}
        lifeType={lifeType}
        lifeConstant={lifeConstant}
        lifeCurve={lifeCurve}
        speedType={speedType}
        speedConstant={speedConstant}
        speedCurve={speedCurve}
        sizeType={sizeType}
        sizeConstant={sizeConstant}
        sizeCurve={sizeCurve}
        rotationType={rotationType}
        rotationConstant={rotationConstant}
        rotationCurve={rotationCurve}
        colorType={colorType}
        colorConstant={colorConstant}
        colorGradient={colorGradient}
        sizeLifetime={sizeLifetime}
        sizeLifetimeCurve={sizeLifetimeCurve}
        rotationLifetime={rotationLifetime}
        rotationLifetimeCurve={rotationLifetimeCurve}
        colorLifetime={colorLifetime}
        colorLifetimeGradient={colorLifetimeGradient}
        velocityLifetime={velocityLifetime}
        velocityLinear={velocityLinear}
        velocityLinearWorld={velocityLinearWorld}
        velocityOrbital={velocityOrbital}
        velocityOrbitalOffset={velocityOrbitalOffset}
        velocityOrbitalRadial={velocityOrbitalRadial}
        onReady={onReady}
      />
    </app>
  )
}

const initialState = {
  mode: null,
  modeN: 0,
}

export function getStore(state = initialState) {
  return {
    state,
    actions: {
      setMode(state, mode) {
        state.mode = mode
        state.modeN++
      },
    },
    fields: [
      {
        key: `label`,
        label: 'Label',
        type: 'text',
        descriptor: true,
      },
      {
        type: 'section',
        label: 'Playback',
      },
      {
        key: 'autoPlay',
        label: 'Auto Play',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: true,
      },
      {
        key: 'sync',
        label: 'Sync',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: true,
      },
      {
        key: 'duration',
        label: 'Duration',
        type: 'float',
        initial: 5,
        placeholder: '0',
      },
      {
        key: 'loop',
        label: 'Loop',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: true,
      },
      {
        key: 'prewarm',
        label: 'Prewarm',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
        conditions: [{ field: 'loop', op: 'eq', value: true }],
      },
      {
        key: 'delay',
        label: 'Start Delay',
        type: 'float',
        initial: 0,
        placeholder: '0',
      },
      {
        key: 'timeScale',
        label: 'Time Scale',
        type: 'float',
        initial: 1,
        placeholder: '1',
      },
      {
        key: 'autoRandomSeed',
        label: 'Random Seed',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: true,
      },
      {
        key: 'customSeed',
        label: 'Seed',
        type: 'text',
        initial: '0',
        placeholder: '0',
        conditions: [{ field: 'autoRandomSeed', op: 'eq', value: false }],
      },
      {
        type: 'section',
        label: 'Emission',
      },
      {
        key: 'rate',
        label: 'Rate',
        type: 'float',
        initial: 10,
        placeholder: '10',
      },
      {
        key: 'maxParticles',
        label: 'Max Particles',
        type: 'float',
        initial: 1000,
        placeholder: '1000',
      },
      {
        type: 'section',
        label: 'Render',
      },
      {
        key: 'billboard',
        label: 'Billboard',
        type: 'dropdown',
        options: [
          { label: 'Full', value: 'FULL' },
          { label: 'Horizontal', value: 'HORIZONTAL' },
          { label: 'Vertical', value: 'VERTICAL' },
        ],
        initial: 'FULL',
      },
      {
        key: 'textureSrc',
        label: 'Texture',
        type: 'file',
        accept: '.png',
        placeholder: 'png',
      },
      {
        key: 'lit',
        label: 'Material',
        type: 'switch',
        options: [
          { label: 'Unlit', value: false },
          { label: 'Lit', value: true },
        ],
        initial: false,
      },
      {
        key: 'additive',
        label: 'Blending',
        type: 'switch',
        options: [
          { label: 'Normal', value: false },
          { label: 'Additive', value: true },
        ],
        initial: false,
      },
      {
        key: 'worldSpace',
        label: 'World Space',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: true,
      },
      {
        type: 'section',
        label: 'Shape',
      },
      {
        key: 'shapeType',
        label: 'Type',
        type: 'dropdown',
        options: [
          { label: 'Cone', value: 'CONE' },
          { label: 'Sphere', value: 'SPHERE' },
          { label: 'Circle', value: 'CIRCLE' },
        ],
        initial: 'CONE',
      },
      {
        key: 'shapeRadius',
        label: 'Radius',
        type: 'float',
        initial: 1,
        placeholder: '1',
      },
      {
        key: 'shapeThickness',
        label: 'Thickness',
        type: 'float',
        initial: 1,
        placeholder: '1',
      },
      {
        key: 'shapeAngle',
        label: 'Angle',
        type: 'float',
        initial: 25,
        placeholder: '25',
        conditions: [{ field: 'shapeType', op: 'eq', value: 'CONE' }],
      },
      {
        key: 'shapeArc',
        label: 'Arc',
        type: 'float',
        initial: 360,
        placeholder: '360',
      },
      {
        key: 'shapeRandomizeDir',
        label: 'Randomize Direction',
        type: 'float',
        initial: 0,
        placeholder: '0',
      },
      {
        type: 'section',
        label: 'Spawn',
      },
      {
        key: 'lifeType',
        label: 'Start Life',
        type: 'dropdown',
        options: [
          { label: 'Constant', value: 'CONSTANT' },
          { label: 'Linear Curve', value: 'LINEAR_CURVE' },
          { label: 'Random Curve', value: 'RANDOM_CURVE' },
        ],
        initial: 'CONSTANT',
      },
      {
        key: 'lifeConstant',
        label: '',
        type: 'float',
        initial: 5,
        placeholder: '5',
        conditions: [{ field: 'lifeType', op: 'eq', value: 'CONSTANT' }],
        instant: false,
      },
      {
        key: 'lifeCurve',
        label: '',
        type: 'curve',
        initial: '0,5,0,0|1,5,0,0',
        title: 'Start Life',
        x: 'Duration',
        y: 'Life',
        yMin: 0,
        yMax: 10,
        conditions: [{ field: 'lifeType', op: 'ne', value: 'CONSTANT' }],
      },
      {
        key: 'speedType',
        label: 'Start Speed',
        type: 'dropdown',
        options: [
          { label: 'Constant', value: 'CONSTANT' },
          { label: 'Linear Curve', value: 'LINEAR_CURVE' },
          { label: 'Random Curve', value: 'RANDOM_CURVE' },
        ],
        initial: 'CONSTANT',
      },
      {
        key: 'speedConstant',
        label: '',
        type: 'float',
        initial: 1,
        placeholder: '1',
        conditions: [{ field: 'speedType', op: 'eq', value: 'CONSTANT' }],
        instant: false,
      },
      {
        key: 'speedCurve',
        label: '',
        type: 'curve',
        initial: '0,1,0,0|1,1,0,0',
        title: 'Start Speed',
        x: 'Duration',
        y: 'Speed',
        yMin: -5,
        yMax: 5,
        conditions: [{ field: 'speedType', op: 'ne', value: 'CONSTANT' }],
      },
      {
        key: 'sizeType',
        label: 'Start Size',
        type: 'dropdown',
        options: [
          { label: 'Constant', value: 'CONSTANT' },
          { label: 'Linear Curve', value: 'LINEAR_CURVE' },
          { label: 'Random Curve', value: 'RANDOM_CURVE' },
        ],
        initial: 'CONSTANT',
      },
      {
        key: 'sizeConstant',
        label: '',
        type: 'float',
        initial: 1,
        placeholder: '1',
        conditions: [{ field: 'sizeType', op: 'eq', value: 'CONSTANT' }],
        instant: false,
      },
      {
        key: 'sizeCurve',
        label: '',
        type: 'curve',
        initial: '0,1,0,0|1,1,0,0',
        title: 'Start Size',
        x: 'Duration',
        y: 'Size',
        yMin: 0,
        yMax: 10,
        conditions: [{ field: 'sizeType', op: 'ne', value: 'CONSTANT' }],
      },
      {
        key: 'rotationType',
        label: 'Start Rotation',
        type: 'dropdown',
        options: [
          { label: 'Constant', value: 'CONSTANT' },
          { label: 'Linear Curve', value: 'LINEAR_CURVE' },
          { label: 'Random Curve', value: 'RANDOM_CURVE' },
        ],
        initial: 'CONSTANT',
      },
      {
        key: 'rotationConstant',
        label: '',
        type: 'float',
        initial: 0,
        placeholder: '0',
        conditions: [{ field: 'rotationType', op: 'eq', value: 'CONSTANT' }],
        instant: false,
      },
      {
        key: 'rotationCurve',
        label: '',
        type: 'curve',
        initial: '0,0,0,0|1,0,0,0',
        title: 'Start Rotation',
        x: 'Duration',
        y: 'Rotation',
        yMin: 0,
        yMax: 360,
        conditions: [{ field: 'rotationType', op: 'ne', value: 'CONSTANT' }],
      },
      {
        key: 'colorType',
        label: 'Start Color',
        type: 'dropdown',
        options: [
          { label: 'Constant', value: 'CONSTANT' },
          { label: 'Linear Gradient', value: 'LINEAR_GRADIENT' },
          { label: 'Random Gradient', value: 'RANDOM_GRADIENT' },
        ],
        initial: 'CONSTANT',
      },
      {
        key: 'colorConstant',
        label: '',
        type: 'color',
        initial: '#ffffffff',
        placeholder: '#ffffffff',
        alpha: true,
        conditions: [{ field: 'colorType', op: 'eq', value: 'CONSTANT' }],
      },
      {
        key: 'colorGradient',
        label: '',
        type: 'gradient',
        title: 'Start Color',
        initial: 'a,0,1|a,1,1|c,0,1,1,1|c,1,1,1,1',
        conditions: [{ field: 'colorType', op: 'ne', value: 'CONSTANT' }],
      },
      {
        type: 'section',
        label: 'Size over lifetime',
      },
      {
        key: 'sizeLifetime',
        label: 'Enabled',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        key: 'sizeLifetimeCurve',
        label: '',
        type: 'curve',
        initial: '0,1,0,0|1,1,0,0',
        title: 'Curve',
        x: 'Duration',
        y: 'Size',
        yMin: 0,
        yMax: 10,
        conditions: [{ field: 'sizeLifetime', op: 'eq', value: true }],
      },
      {
        type: 'section',
        label: 'Rotation over lifetime',
      },
      {
        key: 'rotationLifetime',
        label: 'Enabled',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        key: 'rotationLifetimeCurve',
        label: '',
        type: 'curve',
        initial: '0,0,0,0|1,0,0,0',
        title: 'Curve',
        x: 'Duration',
        y: 'Rotation',
        yMin: -180,
        yMax: 180,
        conditions: [{ field: 'rotationLifetime', op: 'eq', value: true }],
      },
      {
        type: 'section',
        label: 'Color over lifetime',
      },
      {
        key: 'colorLifetime',
        label: 'Enabled',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        key: 'colorLifetimeGradient',
        label: '',
        type: 'gradient',
        title: 'Gradient',
        initial: 'a,0,1|a,1,1|c,0,1,1,1|c,1,1,1,1',
        conditions: [{ field: 'colorLifetime', op: 'eq', value: true }],
      },
      {
        type: 'section',
        label: 'Velocity over lifetime',
      },
      {
        key: 'velocityLifetime',
        label: 'Enabled',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
      },
      {
        key: 'velocityLinear',
        label: 'Linear',
        type: 'vec3',
        initial: [0, 0, 0],
        conditions: [{ field: 'velocityLifetime', op: 'eq', value: true }],
      },
      {
        key: 'velocityLinearWorld',
        label: 'World Space',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: false,
        conditions: [{ field: 'velocityLifetime', op: 'eq', value: true }],
      },
      {
        key: 'velocityOrbital',
        label: 'Orbital',
        type: 'vec3',
        initial: [0, 0, 0],
        conditions: [{ field: 'velocityLifetime', op: 'eq', value: true }],
      },
      {
        key: 'velocityOrbitalOffset',
        label: 'Orbital Offset',
        type: 'vec3',
        initial: [0, 0, 0],
        conditions: [{ field: 'velocityLifetime', op: 'eq', value: true }],
      },
      {
        key: 'velocityOrbitalRadial',
        label: 'Orbital Radial',
        type: 'float',
        initial: 0,
        placeholder: '0',
        conditions: [{ field: 'velocityLifetime', op: 'eq', value: true }],
      },
    ],
  }
}
