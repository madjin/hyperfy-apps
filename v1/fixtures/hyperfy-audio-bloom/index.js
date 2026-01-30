import React, { useState, useEffect, useRef } from 'react'
import { useWorld, useFields, useFile, useCondition } from 'hyperfy'

export default function App() {
  const modelRef = useRef()
  const world = useWorld()
  const fields = useFields()
  const [material, setMaterial] = useState(null)

  const { bridgeId, band, factor } = fields // reactor config
  const { src, scale, materialName } = fields // model config
  const active = useCondition(fields.active)

  const url = useFile(src)

  const findMaterial = () => {
    if (!materialName) return
    const model = modelRef.current
    if (!model) return
    const material = model.getMaterial(materialName)
    setMaterial(material)
  }

  useEffect(() => {
    findMaterial()
  }, [materialName])

  useEffect(() => {
    if (!world.isClient) return
    if (!material) return
    material.setEmissiveIntensity(0)
    if (!bridgeId) return
    if (!active) return
    return world.on('audio-bridge-output', output => {
      if (output.id !== bridgeId) return
      const value = output.values[band]
      material.setEmissiveIntensity(value * factor)
    })
  }, [active, bridgeId, band, factor, material])

  return (
    <app>
      {url && (
        <model src={url} scale={scale} ref={modelRef} onLoad={findMaterial} />
      )}
    </app>
  )
}

const initialState = {}

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
        key: 'src',
        label: 'Model',
        type: 'file',
        accept: '.glb',
        placeholder: 'glb',
        descriptor: true,
      },
      {
        key: 'scale',
        label: 'Scale',
        type: 'float',
        initial: 1,
        placeholder: 1,
      },
      {
        key: 'materialName',
        label: 'Material',
        type: 'text',
        instant: false,
      },

      {
        type: 'section',
        label: 'Audio',
      },
      {
        key: 'bridgeId',
        label: 'Bridge',
        type: 'link',
        kind: 'hyp/audioBridge',
      },
      {
        key: 'band',
        label: 'Band',
        type: 'switch',
        options: [
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '4', value: 4 },
        ],
        initial: 1,
      },

      {
        key: 'factor',
        label: 'Factor',
        type: 'float',
        initial: 1,
      },

      {
        key: 'active',
        label: 'Active',
        type: 'condition',
      },
    ],
  }
}
