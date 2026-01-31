export default function main(world, app, fetch, props, setTimeout) {
const cube = app.get("$root")

let isRolling = false;
let rollDuration = 2;
let elapsedTime = 0;
let randomRotation = { x: 0, y: 0, z: 0 };

cube.onPointerDown = () => {
  if (!isRolling) {
    isRolling = true;
    elapsedTime = 0;
    randomRotation = {
      x: 10,
      y: 2,
      z: 8,
    };
  }
};

app.on("update", (delta) => {
  if (isRolling) {
    elapsedTime += delta;
    let progress = elapsedTime / rollDuration;
    if (progress < 1) {
      let easingFactor = 1 - progress;
      cube.rotation.x += randomRotation.x * delta * easingFactor;
      cube.rotation.y += randomRotation.y * delta * easingFactor;
      cube.rotation.z += randomRotation.z * delta * easingFactor;
    } else {
      isRolling = false;
    }
  }
});

}
