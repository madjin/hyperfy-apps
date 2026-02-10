import React, { useEffect } from 'react'
import { useWorld, useFields, useEditing, useEntityUid } from 'hyperfy'

/**
 * HOW THIS APP WORKS:
 *
 * Frequencies 0 to 3 determine the frequencies each band consists of, eg band-1 is between freq-0 and freq-1.
 * The last band is freq-3 up to the max frequency.
 *
 * Each band then defines a ratio which is a threshold at which it outputs a >0 value.
 * Ratios are used as they are easier for the user to understand.
 * Internally we convert that ratio into an amplitude threshold, based on the minDecibels and maxDecibels
 * values of the AudioAnalyser.
 *
 * We then calculate output values for each band which is simply the average amplitude that goes over the threshold.
 * These output values are then emitted to any apps that care about it, eg AudioLight.
 *
 * INTERESTING INFO:
 *
 * - Humans hear from 20 to 20,000 Hz (higher is ultrasound)
 * - SampleRate is 48,000 Hz by default
 * - MinDecibels defaults to -100
 * - MaxDecibels defaults to -30
 * - FloatData is an array of frequency items from 0 Hz to SampleRate/2 Hz (eg 24,000 Hz)
 * - FloatData item values are amplitude (dB) where 0 is the loudest and negatives go quieter
 *
 */

export default function App() {
  const world = useWorld()
  const fields = useFields()
  const editing = useEditing()
  const entityId = useEntityUid()

  const {
    label,
    sourceId,
    freq0,
    freq1,
    freq2,
    freq3,
    ratio1,
    ratio2,
    ratio3,
    ratio4,
  } = fields

  useEffect(() => {
    if (!world.isClient) return
    if (!sourceId) return
    const analyser = world.getAudioAnalyser(sourceId)
    const output = {
      id: entityId,
      values: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
      },
    }
    // convert ratios to actual amplitude thresholds
    const min = analyser.node.minDecibels
    const max = analyser.node.maxDecibels
    const db1 = alpha(min, max, ratio1)
    const db2 = alpha(min, max, ratio2)
    const db3 = alpha(min, max, ratio3)
    const db4 = alpha(min, max, ratio4)
    const stop = world.onUpdate(delta => {
      const data = analyser.getFloatFrequencyData()
      // console.log(data)
      const sampleRate = analyser.context.sampleRate
      const maxFrequency = sampleRate / 2
      output.values[1] = getOutputValue(data, sampleRate, freq0, freq1, db1) // prettier-ignore
      output.values[2] = getOutputValue(data, sampleRate, freq1, freq2, db2) // prettier-ignore
      output.values[3] = getOutputValue(data, sampleRate, freq2, freq3, db3) // prettier-ignore
      output.values[4] = getOutputValue(data, sampleRate, freq3, maxFrequency, db4) // prettier-ignore
      world.emit('audio-bridge-output', output)
    })
    return () => {
      stop()
      output.values[1] = 0
      output.values[2] = 0
      output.values[3] = 0
      output.values[4] = 0
      world.emit('audio-bridge-output', output)
    }
  }, [sourceId, freq0, freq1, freq2, freq3, ratio1, ratio2, ratio3, ratio4])

  return (
    <app>
      {editing && <model src="block.glb" />}
      <link
        kind="hyp/audioBridge"
        label={label || 'No Label'}
        value={entityId}
      />
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
        key: 'sourceId',
        label: 'Source',
        type: 'link',
        kind: 'hyp/audioSource',
      },
      {
        type: 'section',
        label: 'Frequencies',
      },
      {
        key: 'freq0',
        label: '0',
        type: 'float',
        initial: 0,
      },
      {
        key: 'freq1',
        label: '1',
        type: 'float',
        initial: 125,
      },
      {
        key: 'freq2',
        label: '2',
        type: 'float',
        initial: 500,
      },
      {
        key: 'freq3',
        label: '3',
        type: 'float',
        initial: 5000,
      },
      {
        type: 'section',
        label: 'Threshold Ratios',
      },
      {
        key: 'ratio1',
        label: 'Band 1',
        type: 'float',
        initial: 0.8,
      },
      {
        key: 'ratio2',
        label: 'Band 2',
        type: 'float',
        initial: 0.8,
      },
      {
        key: 'ratio3',
        label: 'Band 3',
        type: 'float',
        initial: 0.8,
      },
      {
        key: 'ratio4',
        label: 'Band 4',
        type: 'float',
        initial: 0.8,
      },
    ],
  }
}

function getOutputValue(data, sampleRate, freqMin, freqMax, threshold) {
  // calculate frequency range indices
  const freqMinIndex = Math.round((freqMin / sampleRate) * data.length)
  const freqMaxIndex = Math.round((freqMax / sampleRate) * data.length)
  // calculate average value of frequency range
  let sum = 0
  for (let i = freqMinIndex; i < freqMaxIndex; i++) {
    sum += data[i]
  }
  const averageValue = sum / (freqMaxIndex - freqMinIndex)
  // calculate amount above threshold
  const result = Math.max(0, averageValue - threshold)
  return result
}

function alpha(min, max, ratio) {
  return min + ratio * (max - min)
}
