export default function main(world, app, fetch, props, setTimeout) {
app.configure([
  {
    type: 'section',
    key: 'uiDimensionsSection',
    label: 'UI Dimensions'
  },
  {
    type: 'range',
    key: 'uiWidth',
    label: 'UI Width',
    min: 100,
    max: 4800,
    step: 1,
    initial: 200
  },
  {
    type: 'range',
    key: 'uiHeight',
    label: 'UIHeight',
    min: 100,
    max: 2700,
    step: 1,
    initial: 150
  },
  {
    type: 'section',
    key: 'uiPositionSection',
    label: 'UI Position'
  },
  {
    type: 'number',
    key: 'uiX3',
    label: 'X Position',
     min: -6,
    max: 50,
    dp: 2,
    initial: 0
  },
  {
    type: 'number',
    key: 'uiY3',
    label: 'Y Position',
    min: -6,
    max: 50,
    dp: 2,
    initial: 0
  },
  {
    type: 'number',
    key: 'uiZ3',
    label: 'Z Position',
    min: -6,
    max: 50,
    dp: 2,
    initial: 0
  },
  {
    type: 'section',
    key: 'uiImageSection',
    label: 'UIImage'
  },
  {
    type: 'file',
    key: 'imageFile',
    label: 'Image File',
    kind: 'texture'  
  },
  {
    type: 'range',
    key: 'imageWidth',
    label: 'ImageWidth',
    min: 50,
    max: 4800,
    step: 1,
    initial: 100
  },
  {
    type: 'range',
    key: 'imageHeight',
    label: 'ImageHeight',
    min: 50,
    max: 2700,
    step: 1,
    initial: 100
  },
  {
    type: 'dropdown',
    key: 'imageFit',
    label: 'ImageFit',
    options: [
      { label: 'Contain', value: 'contain' },
      { label: 'Cover', value: 'cover' },
      { label: 'Fill', value: 'fill' },
      { label: 'None', value: 'none' },
      { label: 'ScaleDown', value: 'scale-down' }
    ],
    initial: 'contain'
  },
]);

const ui = app.create('ui');
app.add(ui);

ui.width = props.uiWidth;
ui.height = props.uiHeight;
ui.pivot = 'bottom-center';
ui.lit = true;
ui.borderRadius = 10;
ui.padding = 20;

// Set the position
ui.position.set(props.uiX3, props.uiY3, props.uiZ3);

const view = app.create('uiview');
view.padding = 20;
view.borderRadius = 8;
ui.add(view);

const image = app.create('uiimage');
image.src = props.imageFile?.url.replace('asset://', '/assets/');
image.width = props.imageWidth;
image.height = props.imageHeight;
image.objectFit = props.imageFit;
view.add(image);
}
