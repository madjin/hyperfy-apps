import React, { useEffect, useState, useRef } from 'react'
import {
  useEntityUid,
  useWorld,
  useFields,
  useFile,
  useEditing,
  useSignal,
} from 'hyperfy'

/**
 *
 * TODO:
 *
 * - seat fields + prefab seat values
 */

export default function App() {
  const carRef = useRef()
  const audioRef = useRef()
  const entityId = useEntityUid()
  const world = useWorld()
  const editing = useEditing()
  const fields = useFields()
  const [riding, setRiding] = useState(false)

  const values = prefabs[fields.prefab] || fields
  const reset = fields.reset

  const src = useFile(values.src)

  const driverEmoteSrc = useFile(values.driverEmote)
  const passengerEmoteSrc = useFile(values.passengerEmote)

  useSignal('Return', () => {
    carRef.current.idle()
  })

  useSignal(
    'Copy',
    () => {
      const data = { ...fields }
      data.src = { name: data.src.name, url: data.src.url }
      data.prefab = ''
      world.copyToClipboard(JSON.stringify(data, null, 2))
    },
    fields.prefab
  )

  useSignal(
    'Paste',
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
    },
    fields.prefab
  )

  const request = () => {
    carRef.current.request()
  }

  let onPointerDown
  let onPointerDownHint
  if (!riding) {
    onPointerDown = request
    onPointerDownHint = 'Enter'
  }

  useEffect(() => {
    const car = carRef.current
    const stats = car.getStats()
    let riding = false
    return world.onUpdate(() => {
      if (stats.riding !== riding) {
        riding = stats.riding
        setRiding(riding)
      }
    })
  }, [])

  useEffect(() => {
    const car = carRef.current
    const audio = audioRef.current
    if (!values.engineSound) return
    const stats = car.getStats()
    let active = false
    return world.onUpdate(() => {
      if (stats.active !== active) {
        active = stats.active
        audio[active ? 'play' : 'stop']()
      }
      if (active) {
        let rate = 1 + Math.abs(stats.speed) * 0.05
        if (rate > 1000) rate = 1000 // max
        audio.setPlaybackRate(rate)
      }
    })
  }, [values.engineSound])

  return (
    <app>
      <car
        alpha={1}
        ref={carRef}
        id={entityId}
        reset={reset}
        src={src}
        size={values.size}
        // mass={values.mass}
        centerOfMass={values.centerOfMass}
        drag={values.drag}
        angularDrag={values.angularDrag}
        accelAmount={values.accelAmount}
        decelAmount={values.decelAmount}
        brakeAmount={values.brakeAmount}
        speedMax={values.speedMax}
        powerCurve={values.powerCurve}
        turnSpeed={values.turnSpeed}
        turnMax={values.turnMax}
        turnCurve={values.turnCurve}
        antiRoll={values.antiRoll}
        forwardSlip={values.forwardSlip}
        frontDrive={values.mode === 'FWD' || values.mode === '4WD'}
        backDrive={values.mode === 'RWD' || values.mode === '4WD'}
        frontZ={values.frontZ}
        frontY={values.frontY}
        frontWidth={values.frontWidth}
        frontSpringLength={values.frontSpringLength}
        frontSpringStrength={values.frontSpringStrength}
        frontSpringDamper={values.frontSpringDamper}
        frontTireRadius={values.frontTireRadius}
        // frontTireMass={values.frontTireMass}
        frontGripCurve={values.frontGripCurve}
        frontBrake={values.frontBrake}
        frontBrakeGrip={values.frontBrakeGrip}
        backZ={values.backZ}
        backY={values.backY}
        backWidth={values.backWidth}
        backSpringLength={values.backSpringLength}
        backSpringStrength={values.backSpringStrength}
        backSpringDamper={values.backSpringDamper}
        backTireRadius={values.backTireRadius}
        // backTireMass={values.backTireMass}
        backGripCurve={values.backGripCurve}
        backBrake={values.backBrake}
        backBrakeGrip={values.backBrakeGrip}
        onEnter={() => world.trigger('enter')}
        onExit={() => world.trigger('exit')}
        helpers={editing}
        onPointerDown={onPointerDown}
        onPointerDownHint={onPointerDownHint}
      >
        {values.engineSound && (
          <audio ref={audioRef} src="engine-2.mp3" loop volume={0.8} />
        )}
        {values.seat1Enabled && (
          <seat
            position={values.seat1Position}
            rotationY={values.seat1RotationY}
            emote={driverEmoteSrc}
          />
        )}
        {values.seat2Enabled && (
          <seat
            position={values.seat2Position}
            rotationY={values.seat2RotationY}
            emote={passengerEmoteSrc}
          />
        )}
        {values.seat3Enabled && (
          <seat
            position={values.seat3Position}
            rotationY={values.seat3RotationY}
            emote={passengerEmoteSrc}
          />
        )}
        {values.seat4Enabled && (
          <seat
            position={values.seat4Position}
            rotationY={values.seat4RotationY}
            emote={passengerEmoteSrc}
          />
        )}
      </car>
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
        instant: false,
        descriptor: true,
      },
      {
        key: 'prefab',
        label: 'Prefab',
        type: 'dropdown',
        options: [
          { label: 'Drift', value: 'drift' },
          { label: 'Offroad', value: 'offroad' },
          { label: 'GoKart', value: 'gokart' },
          // { label: 'Nissan 350Z', value: '350z' },
          // { label: 'Lambo', value: 'lambo' },
          { label: 'Custom', value: '' },
        ],
        initial: defaults.prefab,
      },
      {
        key: 'reset',
        label: 'Reset Time',
        type: 'float',
        initial: defaults.reset,
        placeholder: 'None',
        instant: false,
      },
      {
        type: 'trigger',
        label: 'On Enter',
        name: `enter`,
      },
      {
        type: 'trigger',
        label: 'On Exit',
        name: `exit`,
      },
      {
        type: 'section',
        label: 'Body',
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'src',
        label: 'Model',
        type: 'file',
        accept: '.glb',
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'size',
        label: 'Size',
        type: 'vec3',
        initial: defaults.size,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      // {
      //   key: 'mass',
      //   label: 'Mass',
      //   type: 'float',
      //   initial: 1,
      //   placeholder: 1,
      //   conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      // },
      {
        key: 'centerOfMass',
        label: 'Center Of Mass',
        type: 'vec3',
        initial: defaults.centerOfMass,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'drag',
        label: 'Drag',
        type: 'float',
        initial: defaults.drag,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'angularDrag',
        label: 'Angular Drag',
        type: 'float',
        initial: defaults.angularDrag,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'accelAmount',
        label: 'Acceleration',
        type: 'float',
        initial: defaults.accelAmount,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'decelAmount',
        label: 'Deceleration',
        type: 'float',
        initial: defaults.decelAmount,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'brakeAmount',
        label: 'Brake Force',
        type: 'float',
        initial: defaults.brakeAmount,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'speedMax',
        label: 'Max Speed',
        type: 'float',
        initial: defaults.speedMax,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'powerCurve',
        label: 'Power Curve',
        type: 'curve',
        initial: '0,1,0,0|1,1,0,0',
        x: 'Speed Ratio',
        y: 'Power Ratio',
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'turnSpeed',
        label: 'Turn Speed',
        type: 'float',
        initial: defaults.turnSpeed,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'turnMax',
        label: 'Turn Angle',
        type: 'float',
        initial: defaults.turnMax,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'turnCurve',
        label: 'Turn Curve',
        type: 'curve',
        initial: defaults.turnCurve,
        x: 'Speed Ratio',
        y: 'Turn Ratio',
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'antiRoll',
        label: 'Anti-roll',
        type: 'float',
        initial: defaults.antiRoll,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'forwardSlip',
        label: 'Forward Slip',
        type: 'float',
        initial: defaults.forwardSlip,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'mode',
        label: 'Mode',
        type: 'switch',
        options: [
          { label: 'FWD', value: 'FWD' },
          { label: 'RWD', value: 'RWD' },
          { label: '4WD', value: '4WD' },
        ],
        initial: defaults.mode,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'engineSound',
        label: 'Engine Sound',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: defaults.engineSound,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        type: 'section',
        label: 'Front Wheels',
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'frontZ',
        label: 'Axle Z',
        type: 'float',
        initial: defaults.frontZ,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'frontY',
        label: 'Axle Y',
        type: 'float',
        initial: defaults.frontY,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'frontWidth',
        label: 'Axle Width',
        type: 'float',
        initial: defaults.frontWidth,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'frontSpringLength',
        label: 'Spring Length',
        type: 'float',
        initial: defaults.frontSpringLength,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'frontSpringStrength',
        label: 'Spring Strength',
        type: 'float',
        initial: defaults.frontSpringStrength,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'frontSpringDamper',
        label: 'Spring Damper',
        type: 'float',
        initial: defaults.frontSpringDamper,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'frontTireRadius',
        label: 'Tire Radius',
        type: 'float',
        initial: defaults.frontTireRadius,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      // {
      //   key: 'frontTireMass',
      //   label: 'Tire Mass',
      //   type: 'float',
      //   initial: 0.1,
      //   placeholder: '0.1',
      //   conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      // },
      {
        key: 'frontGripCurve',
        label: 'Grip Curve',
        type: 'curve',
        initial: defaults.frontGripCurve,
        x: 'Slip Ratio',
        y: 'Grip Amount',
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'frontBrake',
        label: 'H-brake',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: defaults.frontBrake,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'frontBrakeGrip',
        label: 'H-brake Grip',
        type: 'float',
        initial: defaults.frontBrakeGrip,
        conditions: [
          { field: 'prefab', op: 'eq', value: '' },
          { field: 'frontBrake', op: 'eq', value: true },
        ],
      },
      {
        type: 'section',
        label: 'Back Wheels',
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'backZ',
        label: 'Axle Z',
        type: 'float',
        initial: defaults.backZ,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'backY',
        label: 'Axle Y',
        type: 'float',
        initial: defaults.backY,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'backWidth',
        label: 'Axle Width',
        type: 'float',
        initial: defaults.backWidth,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'backSpringLength',
        label: 'Spring Length',
        type: 'float',
        initial: defaults.backSpringLength,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'backSpringStrength',
        label: 'Spring Strength',
        type: 'float',
        initial: defaults.backSpringStrength,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'backSpringDamper',
        label: 'Spring Damper',
        type: 'float',
        initial: defaults.backSpringDamper,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'backTireRadius',
        label: 'Tire Radius',
        type: 'float',
        initial: defaults.backTireRadius,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      // {
      //   key: 'backTireMass',
      //   label: 'Tire Mass',
      //   type: 'float',
      //   initial: 0.1,
      //   placeholder: '0.1',
      //   conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      // },
      {
        key: 'backGripCurve',
        label: 'Grip Curve',
        type: 'curve',
        initial: defaults.backGripCurve,
        x: 'Slip Ratio',
        y: 'Grip Amount',
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'backBrake',
        label: 'Hbrake',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: defaults.backBrake,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'backBrakeGrip',
        label: 'Hbrake Grip',
        type: 'float',
        initial: defaults.backBrakeGrip,
        conditions: [
          { field: 'prefab', op: 'eq', value: '' },
          { field: 'backBrake', op: 'eq', value: true },
        ],
      },
      {
        type: 'section',
        label: 'Emotes',
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'driverEmote',
        label: 'Driver',
        type: 'file',
        accept: '.glb',
        placeholder: 'glb',
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'passengerEmote',
        label: 'Passenger',
        type: 'file',
        accept: '.glb',
        placeholder: 'glb',
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        type: 'section',
        label: 'Seat #1 (Driver)',
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'seat1Enabled',
        label: 'Enabled',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: defaults.seat1Enabled,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'seat1Position',
        label: 'Position',
        type: 'vec3',
        initial: defaults.seat1Position,
        conditions: [
          { field: 'prefab', op: 'eq', value: '' },
          { field: 'seat1Enabled', op: 'eq', value: true },
        ],
      },
      {
        key: 'seat1RotationY',
        label: 'Rotation',
        type: 'float',
        initial: defaults.seat1RotationY,
        conditions: [
          { field: 'prefab', op: 'eq', value: '' },
          { field: 'seat1Enabled', op: 'eq', value: true },
        ],
      },
      {
        type: 'section',
        label: 'Seat #2',
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'seat2Enabled',
        label: 'Enabled',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: defaults.seat2Enabled,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'seat2Position',
        label: 'Position',
        type: 'vec3',
        initial: defaults.seat2Position,
        conditions: [
          { field: 'prefab', op: 'eq', value: '' },
          { field: 'seat2Enabled', op: 'eq', value: true },
        ],
      },
      {
        key: 'seat2RotationY',
        label: 'Rotation',
        type: 'float',
        initial: defaults.seat2RotationY,
        conditions: [
          { field: 'prefab', op: 'eq', value: '' },
          { field: 'seat2Enabled', op: 'eq', value: true },
        ],
      },
      {
        type: 'section',
        label: 'Seat #3',
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'seat3Enabled',
        label: 'Enabled',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: defaults.seat3Enabled,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'seat3Position',
        label: 'Position',
        type: 'vec3',
        initial: defaults.seat3Position,
        conditions: [
          { field: 'prefab', op: 'eq', value: '' },
          { field: 'seat3Enabled', op: 'eq', value: true },
        ],
      },
      {
        key: 'seat3RotationY',
        label: 'Rotation',
        type: 'float',
        initial: defaults.seat3RotationY,
        conditions: [
          { field: 'prefab', op: 'eq', value: '' },
          { field: 'seat3Enabled', op: 'eq', value: true },
        ],
      },
      {
        type: 'section',
        label: 'Seat #4',
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'seat4Enabled',
        label: 'Enabled',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: defaults.seat4Enabled,
        conditions: [{ field: 'prefab', op: 'eq', value: '' }],
      },
      {
        key: 'seat4Position',
        label: 'Position',
        type: 'vec3',
        initial: defaults.seat4Position,
        conditions: [
          { field: 'prefab', op: 'eq', value: '' },
          { field: 'seat4Enabled', op: 'eq', value: true },
        ],
      },
      {
        key: 'seat4RotationY',
        label: 'Rotation',
        type: 'float',
        initial: defaults.seat4RotationY,
        conditions: [
          { field: 'prefab', op: 'eq', value: '' },
          { field: 'seat4Enabled', op: 'eq', value: true },
        ],
      },
    ],
  }
}

const defaults = {
  prefab: 'drift',
  reset: null,
  size: [1.8, 1.3, 4.3],
  centerOfMass: [0, 0.2, 0],
  drag: 0.3,
  angularDrag: 3,
  accelAmount: 5,
  decelAmount: 3,
  brakeAmount: 5,
  speedMax: 30,
  powerCurve: '0,0.309,0,0|0.461,1,0,0|0.662,1,0,0|1,0.206,0,0',
  turnSpeed: 8,
  turnMax: 35,
  turnCurve: '0,1,0,0|1,0.349,0,0',
  antiRoll: 50,
  forwardSlip: 5,
  mode: '4WD',
  engineSound: true,
  frontZ: -1.56,
  frontY: 0.2,
  frontWidth: 1.8,
  frontSpringLength: 0.5,
  frontSpringStrength: 20,
  frontSpringDamper: 4,
  frontTireRadius: 0.44,
  frontGripCurve: '0,0.600,0,0|0.525,0.451,-0.478,-0.647|1,0.274,0,0',
  frontBrake: false,
  frontBrakeGrip: 0.2,
  backZ: 1.4,
  backY: 0.2,
  backWidth: 1.8,
  backSpringLength: 0.5,
  backSpringStrength: 20,
  backSpringDamper: 4,
  backTireRadius: 0.45,
  backGripCurve: '0,0.580,0,0|0.548,0.411,-0.462,-0.749|1,0.226,0,0',
  backBrake: true,
  backBrakeGrip: 0.2,
  seat1Enabled: true,
  seat1Position: [-0.38, 0.3, -0.2],
  seat1RotationY: 0,
  seat2Enabled: true,
  seat2Position: [0.38, 0.3, -0.2],
  seat2RotationY: 0,
  seat3Enabled: false,
  seat3Position: [0, 0, 0],
  seat3RotationY: 0,
  seat4Enabled: false,
  seat4Position: [0, 0, 0],
  seat4RotationY: 0,
}

const prefabs = {
  drift: {
    prefab: '',
    reset: null,
    size: [1.7, 1.1, 4],
    centerOfMass: [0, 0.2, 0],
    drag: 0.3,
    angularDrag: 3,
    accelAmount: 16,
    decelAmount: 10,
    brakeAmount: 8,
    speedMax: 50,
    powerCurve:
      '0,0.5928571428571429,0,0|0.3536231884057971,1,0,0|0.6463768115942029,1,0,0|1,0.34857142857142853,0,0',
    turnSpeed: 8,
    turnMax: 35,
    turnCurve: '0,1,0,0|1,0.1914285714285714,0,0',
    antiRoll: 100,
    forwardSlip: 3,
    mode: 'RWD',
    engineSound: true,
    frontZ: -1.34,
    frontY: 0.3,
    frontWidth: 1.6,
    frontSpringLength: 0.4,
    frontSpringStrength: 20,
    frontSpringDamper: 5,
    frontTireRadius: 0.34,
    frontGripCurve: '0,0.44571428571428573,0,0|1,0.10285714285714287,0,0',
    frontBrake: false,
    frontBrakeGrip: 0.2,
    backZ: 1.3,
    backY: 0.3,
    backWidth: 1.6,
    backSpringLength: 0.4,
    backSpringStrength: 20,
    backSpringDamper: 5,
    backTireRadius: 0.34,
    backGripCurve:
      '0,0.4057142857142857,0,0|0.4318840579710145,0.2857142857142857,-0.7714285714285709,-1.3142857142857138|0.6057971014492753,0.10285714285714287,0,0|1,0.0942857142857143,0,0',
    backBrake: true,
    backBrakeGrip: 0.2,
    seat1Enabled: true,
    seat1Position: [-0.4, 0.2, -0.2],
    seat1RotationY: 0,
    seat2Enabled: true,
    seat2Position: [0.4, 0.2, -0.2],
    seat2RotationY: 0,
    seat3Enabled: true,
    seat3Position: [0.4, 0.2, 0.8],
    seat3RotationY: 0,
    seat4Enabled: false,
    seat4Position: [0, 0, 0],
    seat4RotationY: 0,
    src: {
      name: 'vehicle-drift.glb',
      url: 'vehicle-drift.glb',
    },
  },
  offroad: {
    prefab: '',
    reset: null,
    size: [1.8, 1.3, 4.3],
    centerOfMass: [0, 0.2, 0],
    drag: 0.3,
    angularDrag: 3,
    accelAmount: 5,
    decelAmount: 3,
    brakeAmount: 5,
    speedMax: 30,
    powerCurve:
      '0,0.3085714285714286,0,0|0.4608695652173913,1,0,0|0.6623188405797101,1,0,0|1,0.20571428571428574,0,0',
    turnSpeed: 8,
    turnMax: 35,
    turnCurve: '0,1,0,0|1,0.34857142857142853,0,0',
    antiRoll: 50,
    forwardSlip: 0,
    mode: '4WD',
    engineSound: true,
    frontZ: -1.56,
    frontY: 0.2,
    frontWidth: 1.8,
    frontSpringLength: 0.5,
    frontSpringStrength: 20,
    frontSpringDamper: 4,
    frontTireRadius: 0.44,
    frontGripCurve:
      '0,0.6,0,0|0.5246376811594203,0.4514285714285714,-0.4779220779220776,-0.6468749999999998|1,0.27428571428571424,0,0',
    frontBrake: false,
    frontBrakeGrip: 0.2,
    backZ: 1.4,
    backY: 0.2,
    backWidth: 1.8,
    backSpringLength: 0.5,
    backSpringStrength: 20,
    backSpringDamper: 4,
    backTireRadius: 0.45,
    backGripCurve:
      '0,0.5800000000000001,0,0|0.5478260869565217,0.4114285714285715,-0.4620535714285722,-0.749142857142857|1,0.22571428571428576,0,0',
    backBrake: true,
    backBrakeGrip: 0.1,
    seat1Enabled: true,
    seat1Position: [-0.38, 0.3, -0.2],
    seat1RotationY: 0,
    seat2Enabled: true,
    seat2Position: [0.38, 0.3, -0.2],
    seat2RotationY: 0,
    seat3Enabled: false,
    seat3Position: [0, 0, 0],
    seat3RotationY: 0,
    seat4Enabled: false,
    seat4Position: [0, 0, 0],
    seat4RotationY: 0,
    src: {
      name: 'vehicle-offroad.glb',
      url: 'vehicle-offroad.glb',
    },
  },
  gokart: {
    prefab: '',
    reset: null,
    src: {
      name: 'gokart.glb',
      url: 'vehicle-gokart.glb',
    },
    size: [1.4, 1, 2.2],
    centerOfMass: [0, 0.1, 0],
    drag: 0.3,
    angularDrag: 3,
    accelAmount: 8,
    decelAmount: 8,
    brakeAmount: 8,
    speedMax: 20,
    powerCurve: '0,1,0,0|1,1,0,0',
    turnSpeed: 8,
    turnMax: 35,
    turnCurve: '0,1,0,0|1,0.349,0,0',
    antiRoll: 20,
    forwardSlip: 0,
    mode: 'FWD',
    engineSound: false,
    frontZ: -0.7,
    frontY: 0.2,
    frontWidth: 0.95,
    frontSpringLength: 0.2,
    frontSpringStrength: 40,
    frontSpringDamper: 4,
    frontTireRadius: 0.18,
    frontGripCurve: '0,0.600,0,0|0.525,0.451,-0.478,-0.647|1,0.274,0,0',
    frontBrake: false,
    frontBrakeGrip: 0.2,
    backZ: 0.75,
    backY: 0.25,
    backWidth: 0.95,
    backSpringLength: 0.2,
    backSpringStrength: 40,
    backSpringDamper: 4,
    backTireRadius: 0.21,
    backGripCurve: '0,0.580,0,0|0.548,0.411,-0.462,-0.749|1,0.226,0,0',
    backBrake: true,
    backBrakeGrip: 0.2,
    seat1Enabled: true,
    seat1Position: [0.02, 0.1, 0.1],
    seat1RotationY: 0,
    seat2Enabled: false,
    seat2Position: [0.28, 0.3, -0.2],
    seat2RotationY: 0,
    seat3Enabled: false,
    seat3Position: [0, 0, 0],
    seat3RotationY: 0,
    seat4Enabled: false,
    seat4Position: [0, 0, 0],
    seat4RotationY: 0,
  },
  lambo: {
    prefab: '',
    reset: null,
    // src: {
    //   name: 'lambo-edit.glb',
    //   url: 'http://localhost:4000/api/static/uploads/wCi3X1aBcHOrSy6LHqgtu.glb',
    // },
    size: [2.5, 1, 5.2],
    centerOfMass: [0, 0.4, 0],
    drag: 0.3,
    angularDrag: 3,
    accelAmount: 16,
    decelAmount: 14,
    brakeAmount: 8,
    speedMax: 80,
    powerCurve: '0,0.589,0,0|0.443,1,0,0|0.704,1,0,0|1,0.360,0,0',
    turnSpeed: 8,
    turnMax: 35,
    turnCurve: '0,1,0,0|0.458,0.351,-0.467,-1.040|1,0.097,0,0',
    antiRoll: 50,
    forwardSlip: 3,
    mode: 'FWD',
    engineSound: true,
    frontZ: -1.65,
    frontY: 0.6,
    frontWidth: 2.5,
    frontSpringLength: 0.5,
    frontSpringStrength: 30,
    frontSpringDamper: 4,
    frontTireRadius: 0.42,
    frontGripCurve: '0,0.697,0,0|0.545,0.517,-0.478,-0.647|1,0.274,0,0',
    frontBrake: false,
    backZ: 1.81,
    backY: 0.6,
    backWidth: 2.5,
    backSpringLength: 0.5,
    backSpringStrength: 30,
    backSpringDamper: 4,
    backTireRadius: 0.42,
    backGripCurve: '0,0.580,0,0|0.548,0.411,-0.462,-0.749|1,0.226,0,0',
    backBrake: true,
    seat1Enabled: true,
    seat1Position: [-0.38, 0.1, -0.4],
    seat1RotationY: 0,
    seat2Enabled: true,
    seat2Position: [0.38, 0.1, -0.4],
    seat2RotationY: 0,
    seat3Enabled: false,
    seat3Position: [0, 0, 0],
    seat3RotationY: 0,
    seat4Enabled: false,
    seat4Position: [0, 0, 0],
    seat4RotationY: 0,
  },
}
