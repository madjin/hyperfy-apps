import React, { useState } from 'react'
import { useFields, useSignal, useFile, useEditing } from 'hyperfy'

const btnRatio = 132 / 370 // h=132px w=370px
const btnSize = 0.45
const buttonGap = 0.1

const DEFAULT_IMAGE = null // 'purple-space-2k.jpg'

export default function Mirror() {
  const editing = useEditing()
  const fields = useFields()
  const [quality, setQuality] = useState(null)
  const {
    width,
    height,
    btnsEnabled,
    btnsPosition,
    btnTheme,
    btnScale,
    hRes,
    hBackdrop,
    hImage,
    lRes,
    lBackdrop,
    lImage,
  } = fields
  const hImageUrl = useFile(hImage)
  const lImageUrl = useFile(lImage)

  let resolution, environment, backdrop
  if (quality === 'high') {
    resolution = hRes
    environment = !hBackdrop
    backdrop = hBackdrop ? hImageUrl || DEFAULT_IMAGE : null
  }
  if (quality === 'low') {
    resolution = lRes
    environment = !lBackdrop
    backdrop = lBackdrop ? lImageUrl || DEFAULT_IMAGE : null
  }

  useSignal('Enable (HD)', () => setQuality('high'))
  useSignal('Enable (SD)', () => setQuality('low'))
  useSignal('Toggle (HD)', () => setQuality(quality === 'high' ? null : 'high'))
  useSignal('Toggle (SD)', () => setQuality(quality === 'low' ? null : 'low'))
  useSignal('Disable', () => setQuality(null))

  return (
    <app>
      {!quality && editing && (
        <image
          src="placeholder.png"
          width={width}
          height={height}
          lit={false}
        />
      )}
      {quality && (
        <mirror
          size={[width, height]}
          resolution={resolution}
          environment={environment}
          backdrop={backdrop}
        />
      )}
      {btnsEnabled && (
        <group position={btnsPosition}>
          <image
            src={`low-${btnTheme}.png`}
            width={btnSize * btnScale}
            height={btnSize * btnScale * btnRatio}
            position={[
              0,
              -((btnSize + buttonGap) / 2) * btnScale * btnRatio,
              0,
            ]}
            lit={false}
            onClick={() => {
              setQuality(quality === 'low' ? null : 'low')
            }}
          />
          <image
            src={`high-${btnTheme}.png`}
            width={btnSize * btnScale}
            height={btnSize * btnScale * btnRatio}
            position={[0, ((btnSize + buttonGap) / 2) * btnScale * btnRatio, 0]}
            lit={false}
            onClick={() => {
              setQuality(quality === 'high' ? null : 'high')
            }}
          />
        </group>
      )}
    </app>
  )
}

const initialState = {
  //
}

export function getStore(state = initialState) {
  return {
    state,
    actions: {},
    fields: [
      {
        key: 'width',
        label: 'Width',
        type: 'float',
        initial: 3,
      },
      {
        key: 'height',
        label: 'Height',
        type: 'float',
        initial: 2,
      },
      {
        label: 'Buttons',
        type: 'section',
      },
      {
        key: 'btnsEnabled',
        label: 'Enabled',
        type: 'switch',
        options: [
          { label: 'No', value: false },
          { label: 'Yes', value: true },
        ],
        initial: true,
      },
      {
        key: 'btnTheme',
        label: 'Theme',
        type: 'switch',
        options: [
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
        ],
        initial: 'light',
        conditions: [{ field: 'btnsEnabled', op: 'eq', value: true }],
      },
      {
        key: 'btnsPosition',
        label: 'Position',
        type: 'vec3',
        initial: [1.8, 0, 0.05],
        conditions: [{ field: 'btnsEnabled', op: 'eq', value: true }],
      },
      {
        key: 'btnScale',
        label: 'Scale',
        type: 'float',
        initial: 1,
        conditions: [{ field: 'btnsEnabled', op: 'eq', value: true }],
      },
      {
        label: 'HD',
        type: 'section',
      },
      {
        key: 'hRes',
        label: 'Resolution',
        type: 'float',
        placeholder: '0 to 1',
        initial: 1,
      },
      {
        key: 'hBackdrop',
        label: 'Display',
        type: 'switch',
        options: [
          { label: 'Backdrop', value: true },
          { label: 'Everything', value: false },
        ],
        initial: false,
      },
      {
        key: 'hImage',
        label: 'Image',
        type: 'file',
        accept: '.jpg,.jpeg,.png',
        conditions: [{ field: 'hBackdrop', op: 'eq', value: true }],
      },
      {
        label: 'SD',
        type: 'section',
      },
      {
        key: 'lRes',
        label: 'Resolution',
        type: 'float',
        placeholder: '0 to 1',
        initial: 0.5,
      },
      {
        key: 'lBackdrop',
        label: 'Display',
        type: 'switch',
        options: [
          { label: 'Backdrop', value: true },
          { label: 'Everything', value: false },
        ],
        initial: true,
      },
      {
        key: 'lImage',
        label: 'Image',
        type: 'file',
        accept: '.jpg,.jpeg,.png',
        conditions: [{ field: 'lBackdrop', op: 'eq', value: true }],
      },
    ],
  }
}
