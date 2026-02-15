export default function main(world, app, fetch, props, setTimeout) {

// Create a white circle with just a border as a fake cursor
const fakeCursor = app.create('ui', {
  width: 20,
  height: 20,
  position: [0.5, 0.5, 0],
  space: 'screen',
  pivot: 'center',
  backgroundColor: 'transparent',
  borderWidth: 2,
  borderColor: '#ffffff',
  borderRadius: 10,
  pointerEvents: false,
  active: false // Start hidden
});

app.add(fakeCursor);

// Get the Cube mesh
const cube = app.get('Cube');
if (cube) {
  cube.onPointerEnter = () => {
    fakeCursor.active = true;
  };
  
  cube.onPointerLeave = () => {
    fakeCursor.active = false;
  };
}

}
