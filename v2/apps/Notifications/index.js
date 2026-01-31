export default function main(world, app, fetch, props, setTimeout) {
app.configure([
  {
    key: 'debug',
    type: 'toggle',
    label: 'Debug Show',
    initial: false,
    hint: 'Toggles panel visibility for testing position'
  },
        {
    key: 'messageKey',
    type: 'text',
    label: 'Message key',
    initial: 'nots',
    hint: 'Key for .on() listener'
  },
        {
    key: 'color',
    type: 'text',
    label: 'Text Color',
    initial: '#ffffff',
    hint: 'Set text color'
  },
      {
    key: 'position',
    type: 'text',
    label: 'Top Position',
    initial: '0.1',
    hint: 'Set top position of the notification panel'
  },
    {
    key: 'speed',
    type: 'number',
    label: 'Speed',
    initial: 10,
    hint: 'Set notification speed'
  },
      {
    key: 'height',
    type: 'number',
    label: 'Height',
    initial: 100,
    hint: 'Set panel height'
  },
      {
    key: 'width',
    type: 'number',
    label: 'Width',
    initial: 400,
    hint: 'Set panel width'
  },
        {
    key: 'fontSize',
    type: 'number',
    label: 'Font Size',
    initial: 14,
    hint: 'Set font size'
  }
])

let notsApp = app.get('Block')
notsApp.scale.x = 0
notsApp.scale.y = 0
notsApp.scale.z = 0


let animating = false
let direction = 0
let speed = props.speed
let position = -150
let timer = 0
let current = null
let queue = []

let notificationPanel = app.create('ui', {
  width: props.width,
  height: props.height * 1.5,
  res: 2,
  position: [0.5, 0, 1],
  offset: [0, position, 0],
  space: 'screen',
  pivot:'top-center',
  pointerEvents: false,
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

let notificationBG = app.create('uiview', {
  width: props.width,
  height: props.height,
  res: 2,
  position: [0,0, 1],
  offset: [0, 0, 0],
  space: 'screen',
  backgroundColor: 'rgba(0,0,0,0.5)',
  padding: 5,
  borderRadius: 5,
  pointerEvents: false,
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

let notificationMessage = app.create('uitext', {
  value:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
  fontSize: props.fontSize,
  color: props.color,
  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
  height:props.height,
  absolute:true,
})

notificationPanel.add(notificationBG)
notificationPanel.add(notificationMessage)
app.add(notificationPanel)


app.on('update', (delta)=>{
  if(props.debug){
    notificationPanel.offset = new Vector3(0,parseFloat(props.position),0)
    return
  }

  if(!animating){
    notificationBG.display = 'none'
    notificationMessage.display = 'none'
    return
  }

  if(direction === 0){
    if(position < parseFloat(props.position)){
      position += props.speed 
    }else{
      position = parseFloat(props.position)
      checkReturn(delta)
    }
  }else{
    if(position > -150){
      position -= props.speed
    }else{
      animating = false
      current = null
      checkQueue()
    }
  }
  
  notificationBG.display = 'flex'
  notificationMessage.display = 'flex'
  notificationPanel.offset = new Vector3(0,position,0)
})

function checkQueue(){
  if(!animating && queue.length > 0){
    current = queue.shift();
    timer = 3

    if(current.timer && !isNaN(current.timer)){
      timer = current.timer
    }

    if(current.color && typeof current.color === 'string'){
      notificationMessage.color = current.color
    }

    if(current.fontSize && !isNaN(current.fontSize)){
      notificationMessage.fontSize = current.fontSize
    }
    
    direction = 0
    animating = true
    notificationMessage.value = "" + current.message
  }
}

function checkReturn(delta){
  if(current !== null){
    if(current.stay){
      current = null
      return
    }

    if(timer < 0){
      direction = 2
      return
    }
    
    timer -= delta;
  }
}

world.on(props.messageKey, (data)=>{
  if(!data.message) return

  queue.push(data)
  checkQueue()
})
}
