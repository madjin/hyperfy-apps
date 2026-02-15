export default function main(world, app, fetch, props, setTimeout) {
const rig = app.get('Rig')

const anims = rig.anims

const pickRandomAnim = () => {
  return anims[num(0, anims.length)]
}

rig.play({ name: 'idle' })

app.onPointerDown = () => {
  rig.play({ name: pickRandomAnim(), speed: 1.2, fade: 0.2 })
}

}
