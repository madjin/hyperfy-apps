export default function main(world, app, fetch, props, setTimeout) {
app.configure([
  {
    key: 'audio',
    type: 'file',
    kind: 'audio',
    label: 'Audio',
  }
])

const src = props.audio?.url

if (src) {
  const audio = app.create('audio', {
    src,
    loop: true,
    group: 'music',
    spatial: false,
    volume: 0.1
  })
  world.add(audio)
  audio.play()
}


// =======================================
// Box & Label
const LABEL = 'Background Audio'
const $ui = app.create('ui', {
  height: 50,
  alignItems: 'center',
  justifyContent: 'center',
})
$ui.position.y = 1.3
const $text = app.create('uitext', {
  value: LABEL || 'No Label',
  textAlign: 'center',
  color: 'white'
})
$ui.add($text)
app.add($ui)
// =======================================















}
