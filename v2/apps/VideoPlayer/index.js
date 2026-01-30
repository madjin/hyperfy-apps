export default function main(world, app, fetch, props, setTimeout) {
app.configure([
  {
    key: 'placeholder',
    type: 'file',
    kind: 'video',
    label: 'Placeholder',
    hidden: true,
  },
  {
    key: 'video',
    type: 'file',
    kind: 'video',
    label: 'Video',
    hint: 'The video file to play.'
  },
  // NEW: optional HLS stream URL (non-breaking)
  {
    key: 'videoUrl',
    type: 'text',
    label: 'Video URL',
    placeholder: '.m3u8',
    hint: 'The URL to an HLS (m3u8) video manifest.'
  },
  {
    key: 'loop',
    type: 'toggle',
    label: 'Loop',
    hint: 'Whether the video should loop or stop when it reaches the end.',
    initial: true,
  },
  {
    key: 'sync',
    type: 'toggle',
    label: 'Sync',
    hint: 'When enabled, video state will be synchronized over multiplayer.',
    initial: true,
  },
  {
    key: 'surface',
    type: 'section',
    label: 'Surface'
  },
  {
    key: 'width',
    type: 'number',
    label: 'Width',
    dp: 1,
    step: 0.1,
    bigStep: 1,
    hint: 'The width of the surface. This can be set to zero as long as you provide a height, and the width will automatically adapt to the videos aspect ratio.',
    initial: 0,
  },
  {
    key: 'height',
    type: 'number',
    label: 'Height',
    dp: 1,
    step: 0.1,
    bigStep: 1,
    hint: 'The height of the surface. This can be set to zero as long as you provide a width, and the height will automatically adapt to the videos aspect ratio.',
    initial: 1,
  },
  {
    key: 'fit',
    type: 'switch',
    label: 'Fit',
    options: [
      { label: 'Stretch', value: 'none' },
      { label: 'Cover', value: 'cover' },
      { label: 'Contain', value: 'contain' },
    ],
    hint: 'How the video should be scaled to fit the surface. This is only relevant when both height and width are set.',
    initial: 'none',
  },
  {
    key: 'lit',
    type: 'toggle',
    label: 'Lit',
    hint: 'Whether the surface reacts to world lighting or not.'
  },
  {
    key: 'shadows',
    type: 'toggle',
    label: 'Shadows',
  },
  {
    key: 'doubleside',
    type: 'toggle',
    label: 'Doubleside',
  },
  {
    key: 'audio',
    type: 'section',
    label: 'Audio'
  },
  {
    key: 'volume',
    type: 'number',
    label: 'Volume',
    dp: 1,
    step: 0.1,
    bigStep: 1,
    initial: 1,
  }
])

app.keepActive = true

// ---- Source selection (preserve existing precedence for local files) ----
const src = (props.video?.url) || props.videoUrl || props.placeholder?.url
const loop = props.loop
const sync = props.sync
const width = props.width === 0 ? null : props.width
const height = props.height === 0 ? null : props.height
const fit = props.fit
const transparent = props.transparent
const lit = props.lit
const shadows = props.shadows
const doubleside = props.doubleside
const volume = props.volume

// Stream detection: explicit URL or .m3u8 extension
const isStream = Boolean(props.videoUrl) || (/\.m3u8(\?.*)?$/i.test(src || ''))

// ---- Replace the baked surface with a video node (unchanged visuals) ----
const surface = app.get('Surface')
app.remove(surface)

const video = app.create('video')
video.src = src
video.loop = loop
video.width = width
video.height = height
video.fit = fit
video.lit = lit
video.castShadow = shadows
video.receiveShadow = shadows
video.doubleside = doubleside
video.pivot = 'bottom-center'
video.volume = volume

app.add(video)

if (!src) return

// ---- Sync logic ----
if (sync) {
  if (world.isServer) {
    // NB: Only set startAt for VOD; streams don’t use elapsed math
    app.state.isStream = isStream
    if (!isStream) {
      app.state.startAt = world.getTime()
    }
    app.state.ready = true
    app.send('init', app.state)
  }

  if (world.isClient) {
    if (app.state.ready) {
      init(app.state)
    } else {
      app.on('init', init)
    }

    function init(state) {
      // Streams: no duration math — just start when loaded
      if (state.isStream) {
        if (video.loading) {
          video.onLoad = () => video.play()
        } else {
          video.play()
        }
        return
      }

      // Existing VOD sync path (unchanged)
      if (video.loading) {
        video.onLoad = () => startVod()
      } else {
        startVod()
      }

      function startVod() {
        const startAt = state.startAt
        const elapsed = world.getTime() - startAt
        const duration = video.duration

        let time
        let play = true
        if (loop) {
          time = elapsed % duration
        } else if (elapsed >= duration) {
          time = duration
          play = false
        } else {
          time = Math.min(elapsed, duration)
        }
        video.time = time
        if (play) video.play()
      }
    }
  }
}

// No-sync: behave as before
if (!sync) {
  if (video.loading) {
    video.onLoad = () => video.play()
  } else {
    video.play()
  }
}

}
