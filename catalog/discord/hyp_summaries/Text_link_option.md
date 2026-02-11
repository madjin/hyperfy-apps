# Text_link_option.hyp

## Metadata
- **Author**: Gert-Jan Akerboom
- **Channel**: #🧊│3d-design
- **Date**: 2025-10-10
- **Size**: 7,891 bytes

## Discord Context
> Here, i updated the default text app, now you can add a link to it : )

## Blueprint
- **Name**: Text (link option)
- **Version**: 41
- **Model**: `asset://e7cfd8f907f8979fc32f3afabc0962c8d74ea484a61d150187fec23bd0c03a5c.glb`
- **Script**: `asset://454b5d4f694e5191fbc8c83f56790d90e6a1fb7cf4dc01718021302bab42347d.js`

## Props
- `width`: int = `200`
- `height`: int = `60`
- `lit`: bool = `False`
- `text`: str = `Enter text...`
- `color`: str = `white`
- `align`: str = `center`
- `bg`: str = `black`
- `padding`: int = `20`
- `size`: int = `24`
- `doubleside`: bool = `True`
- `shadows`: bool = `True`
- `hover`: bool = `True`
- `link`: str = ``

## Assets
- `[model]` e7cfd8f907f8979fc32f3afabc0962c8d74ea484a61d150187fec23bd0c03a5c.glb (2,416 bytes)
- `[script]` 454b5d4f694e5191fbc8c83f56790d90e6a1fb7cf4dc01718021302bab42347d.js (2,262 bytes)
- `[texture]` a737851aa49988665c40380007a8e3ef3fc7d5eb27cffcdf199ded87abcc7bcf.png (2,069 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.get()`, `app.remove()`
**World Methods**: `world.open()`
**Nodes Created**: `ui`, `uitext`

## Keywords (for Discord search)
align, backgroundColor, bigStep, black, bottom, canvas, center, color, configure, create, doubleside, fontSize, height, initial, justifyContent, keepActive, label, left, link, number

## Script Source
```javascript
app.configure([
    {
      key: 'text',
      type: 'textarea',
      label: 'Text',
    },
    {
      key: 'size',
      type: 'number',
      label: 'Size',
      initial: 12,
    },
    {
      key: 'color',
      type: 'text',
      label: 'Color',
      initial: 'white',
    },
    {
      key: 'align',
      type: 'switch',
      label: 'Align',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
      initial: 'center',
    },
    {
      key: 'canvas',
      type: 'section',
      label: 'Canvas'
    },
    {
      key: 'width',
      type: 'number',
      label: 'Width',
      dp: 1,
      step: 1,
      bigStep: 10,
      initial: 100,
    },
    {
      key: 'height',
      type: 'number',
      label: 'Height',
      dp: 1,
      step: 1,
      bigStep: 10,
      initial: 100,
    },
    {
      key: 'bg',
      type: 'text',
      label: 'Background',
      initial: 'black',
    },
    {
      key: 'padding',
      type: 'number',
      label: 'Padding',
      initial: 10,
    },
    {
      key: 'lit',
      type: 'toggle',
      label: 'Lit',
    },
    {
      key: 'doubleside',
      type: 'toggle',
      label: 'Doubleside',
    },
    {
      key: 'link',
      type: 'text',
      label: 'Link URL',
      initial: '',
      placeholder: 'optional',
    },
  ])
  app.keepActive = true
  
  const text = props.text
  const size = props.size
  const color = props.color || 'white'
  const align = props.align
  const bg = props.bg
  const width = props.width
  const padding = props.padding
  const height = props.height
  const lit = props.lit
  const doubleside = props.doubleside
  const link = props.link
  
  const surface = app.get('Surface')
  app.remove(surface)
  
  const $ui = app.create('ui', {
    pivot: 'bottom-center',
    width,
    height,
    backgroundColor: bg,
    justifyContent: 'center',
    padding,
    lit,
    doubleside,
  })
  const $text = app.create('uitext', {
    value: text,
    fontSize: size,
    color,
    textAlign: align,
  })
  $ui.add($text)
  
  if (link && link.trim() !== '') {
    $ui.onPointerDown = () => {
      world.open(link, true)
    }
  }
  
  app.add($ui)
  
```

---
*Extracted from Text_link_option.hyp. Attachment ID: 1426148370971361370*