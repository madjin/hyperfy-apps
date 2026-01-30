import React, { useState, useMemo } from 'react'
import { useWorld, useFields, useFile } from 'hyperfy'

export default function App() {
  // const world = useWorld()
  const fields = useFields()
  const glb = useFile(fields.glb)
  const splatMap = useFile(fields.splatMap)
  const layer1Map = useFile(fields.layer1Map)
  const layer1Scale = fields.layer1Scale
  const layer2Map = useFile(fields.layer2Map)
  const layer2Scale = fields.layer2Scale
  const layer3Map = useFile(fields.layer3Map)
  const layer3Scale = fields.layer3Scale
  const layer4Map = useFile(fields.layer4Map)
  const layer4Scale = fields.layer4Scale

  return (
    <app>
      <rigidbody type="kinematic">
        <terrainmesh
          src={glb}
          splatMap={splatMap}
          layer1Map={layer1Map}
          layer1Scale={layer1Scale}
          layer2Map={layer2Map}
          layer2Scale={layer2Scale}
          layer3Map={layer3Map}
          layer3Scale={layer3Scale}
          layer4Map={layer4Map}
          layer4Scale={layer4Scale}
        />
      </rigidbody>
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
        key: 'glb',
        label: 'Glb',
        type: 'file',
        accept: '.glb',
      },
      // {
      //   key: 'splatMap',
      //   label: 'Splat Map',
      //   type: 'file',
      //   accept: '.png,.jpg,.jpeg',
      // },
      {
        type: 'section',
        label: 'Layer 1 (Black)',
      },
      {
        key: 'layer1Map',
        label: 'Map',
        type: 'file',
        accept: '.png,.jpg,.jpeg',
      },
      {
        key: 'layer1Scale',
        label: 'Scale',
        type: 'float',
        initial: 1,
      },
      {
        type: 'section',
        label: 'Layer 2 (Red)',
      },
      {
        key: 'layer2Map',
        label: 'Map',
        type: 'file',
        accept: '.png,.jpg,.jpeg',
      },
      {
        key: 'layer2Scale',
        label: 'Scale',
        type: 'float',
        initial: 1,
      },
      {
        type: 'section',
        label: 'Layer 3 (Green)',
      },
      {
        key: 'layer3Map',
        label: 'Map',
        type: 'file',
        accept: '.png,.jpg,.jpeg',
      },
      {
        key: 'layer3Scale',
        label: 'Scale',
        type: 'float',
        initial: 1,
      },
      {
        type: 'section',
        label: 'Layer 4 (Blue)',
      },
      {
        key: 'layer4Map',
        label: 'Map',
        type: 'file',
        accept: '.png,.jpg,.jpeg',
      },
      {
        key: 'layer4Scale',
        label: 'Scale',
        type: 'float',
        initial: 1,
      },
    ],
  }
}
