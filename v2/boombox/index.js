export default function main(world, app, fetch, props, setTimeout) {
const DEG2RAD = Math.PI / 180;

// Remove default block
app.remove(app.get('Block'));

app.configure([
  {
    key: 'audio',
    type: 'file',
    kind: 'audio',
    label: 'Audio File'
  },
  {
    key: 'volume',
    type: 'range',
    label: 'Volume',
    min: 0,
    max: 1,
    step: 0.1,
    default: 0.5
  },
  {
    key: 'audioDistance',
    type: 'range',
    label: 'Audio Distance',
    min: 1,
    max: 50,
    step: 1,
    default: 10
  },
  {
    key: 'rolloffFactor',
    type: 'range',
    label: 'Audio Rolloff',
    min: 0.5,
    max: 5,
    step: 0.1,
    default: 1
  },
  {
    key: 'isPlaying',
    type: 'boolean',
    label: 'Play Audio',
    default: false
  }
]);

// Initialize server-side state
if (world.isServer) {
  app.state.isPlaying = app.state.isPlaying ?? false;
}

// Create boombox group
const boombox = app.create('group');

// Create spatial audio (client-side only)
let boomboxAudio = null;
if (world.isClient && app.props.audio?.url) {
  boomboxAudio = app.create('audio', {
    src: app.props.audio.url,
    volume: app.props.volume || 0.5,
    loop: true,
    spatial: true,
    refDistance: app.props.audioDistance || 10,
    maxDistance: (app.props.audioDistance || 10) * 3,
    rolloffFactor: app.props.rolloffFactor || 1,
    distanceModel: 'inverse'
  });
  boomboxAudio.position.set(0, 0.22 / 2, 0); // Center of boombox body
  app.add(boomboxAudio);

  // Sync initial state from server
  if (app.state.isPlaying) {
    boomboxAudio.play();
  } else {
    boomboxAudio.stop();
  }
}

// Dimensions
const W = 0.60; // width (meters)
const H = 0.22; // height
const D = 0.16; // depth
const halfW = W / 2;
const halfH = H / 2;
const halfD = D / 2;
const frontOffset = 0.001; // tiny offset to avoid z-fighting

// Body
const body = app.create('prim', {
  type: 'box',
  size: [W, H, D],
  position: [0, halfH, 0],
  color: '#1f1f1f',
  physics: 'static'
});
boombox.add(body);

// Speaker parameters
const speakerX = 0.18;
const speakerRadius = 0.09;
const grillThickness = 0.02;
const grillZ = halfD + grillThickness / 2 + frontOffset;
const wooferRadius = 0.055;
const wooferDepth = 0.06;
const wooferZ = halfD - wooferDepth / 2 + 0.005;
const dustCapRadius = 0.015;
const dustCapZ = wooferZ + wooferDepth / 4;

// Left speaker grill
const leftGrill = app.create('prim', {
  type: 'cylinder',
  size: [speakerRadius, speakerRadius, grillThickness],
  position: [-speakerX, halfH, grillZ],
  rotation: [90 * DEG2RAD, 0, 0],
  color: '#070707',
  physics: 'static'
});
boombox.add(leftGrill);

// Left woofer cone
const leftWoofer = app.create('prim', {
  type: 'cylinder',
  size: [wooferRadius, wooferRadius, wooferDepth],
  position: [-speakerX, halfH, wooferZ],
  rotation: [90 * DEG2RAD, 0, 0],
  color: '#0f0f0f',
  physics: 'static'
});
boombox.add(leftWoofer);

// Left dust cap
const leftDust = app.create('prim', {
  type: 'sphere',
  size: [dustCapRadius],
  position: [-speakerX, halfH, dustCapZ],
  color: '#0b0b0b',
  physics: 'static'
});
boombox.add(leftDust);

// Right speaker grill
const rightGrill = leftGrill.clone();
rightGrill.position.set(speakerX, halfH, grillZ);
boombox.add(rightGrill);

// Right woofer
const rightWoofer = leftWoofer.clone();
rightWoofer.position.set(speakerX, halfH, wooferZ);
boombox.add(rightWoofer);

// Right dust cap
const rightDust = leftDust.clone();
rightDust.position.set(speakerX, halfH, dustCapZ);
boombox.add(rightDust);

// Cassette compartment
const cassetteW = 0.22;
const cassetteH = 0.12;
const cassetteD = 0.02;
const cassetteY = halfH - 0.02;
const cassetteZ = halfD + cassetteD / 2 + frontOffset;

const cassetteDoor = app.create('prim', {
  type: 'box',
  size: [cassetteW, cassetteH, cassetteD],
  position: [0, cassetteY, cassetteZ],
  color: '#4a4a4a',
  physics: 'static'
});
boombox.add(cassetteDoor);

// Cassette window
const windowW = 0.18;
const windowH = 0.09;
const windowD = 0.003;
const windowZ = cassetteZ + cassetteD / 2 + windowD / 2 + frontOffset;

const cassetteWindow = app.create('prim', {
  type: 'box',
  size: [windowW, windowH, windowD],
  position: [0, cassetteY, windowZ],
  color: '#000000',
  opacity: 0.35,
  physics: 'static'
});
boombox.add(cassetteWindow);

// Spools
const spoolR = 0.015;
const spoolThickness = 0.005;
const spoolYOffset = 0;
const spoolZpos = cassetteZ - 0.004;
const leftSpool = app.create('prim', {
  type: 'cylinder',
  size: [spoolR, spoolR, spoolThickness],
  position: [-0.045, cassetteY + spoolYOffset, spoolZpos],
  rotation: [90 * DEG2RAD, 0, 0],
  color: '#cfcfcf',
  physics: 'static'
});
boombox.add(leftSpool);

const rightSpool = leftSpool.clone();
rightSpool.position.set(0.045, cassetteY + spoolYOffset, spoolZpos);
boombox.add(rightSpool);

// LED indicator
const led = app.create('prim', {
  type: 'box',
  size: [0.02, 0.008, 0.02],
  position: [-0.12, cassetteY + 0.04, cassetteZ + 0.001],
  color: 'red',
  emissive: 'red',
  emissiveIntensity: world.isClient && app.state.isPlaying ? 6 : 0,
  physics: 'static'
});
boombox.add(led);

// Play/Pause button
const topY = halfH + halfH;
const btnW = 0.04;
const btnH = 0.02;
const btnD = 0.03;
const buttonsCount = 6;
const startX = -0.24;

const playButton = app.create('prim', {
  type: 'box',
  size: [btnW, btnH, btnD],
  position: [startX, topY + 0.015, -0.01],
  color: '#ffcc00',
  physics: 'static',
  cursor: 'pointer'
});
boombox.add(playButton);

const playAction = app.create('action', {
  label: 'Play/Pause',
  onTrigger: () => {
    if (world.isClient) {
      // Send toggle request to server
      app.send('togglePlay', { isPlaying: !app.state.isPlaying });
    }
  }
});
playButton.add(playAction);

// Remaining top buttons
for (let i = 1; i < buttonsCount; i++) {
  const b = app.create('prim', {
    type: 'box',
    size: [btnW, btnH, btnD],
    position: [startX + i * (btnW + 0.01), topY + 0.015, -0.01],
    color: '#d0d0d0',
    physics: 'static'
  });
  boombox.add(b);
}

// Tuning knobs
const knobRadius = 0.03;
const knobHeight = 0.03;
const knobY = topY + knobHeight / 2 + 0.01;
const knobL = app.create('prim', {
  type: 'cylinder',
  size: [knobRadius, knobRadius, knobHeight],
  position: [-0.12, knobY, 0.02],
  color: '#666666',
  physics: 'static'
});
boombox.add(knobL);

const knobR = knobL.clone();
knobR.position.set(0.12, knobY, 0.02);
boombox.add(knobR);

// Brand label
const label = app.create('prim', {
  type: 'box',
  size: [0.18, 0.02, 0.01],
  position: [0, topY + 0.01, 0.04],
  color: '#bdbdbd',
  physics: 'static'
});
boombox.add(label);

// Antenna
const antPivot = app.create('group');
antPivot.position.set(0.28, topY + 0.01, -0.04);
antPivot.rotation.x = -15 * DEG2RAD;

const antenna = app.create('prim', {
  type: 'cylinder',
  size: [0.007, 0.007, 0.8],
  position: [0, 0.4, 0],
  color: '#cfcfcf',
  physics: 'static'
});
antPivot.add(antenna);
boombox.add(antPivot);

// Corner screws
const screwR = 0.01;
const screwY = 0.06;
const screwZ = halfD + 0.002;
const screws = [
  [-halfW + 0.03, screwY, screwZ],
  [halfW - 0.03, screwY, screwZ],
  [-halfW + 0.03, screwY, -screwZ + 2 * frontOffset],
  [halfW - 0.03, screwY, -screwZ + 2 * frontOffset]
];
for (let i = 0; i < screws.length; i++) {
  const s = screws[i];
  const screw = app.create('prim', {
    type: 'sphere',
    size: [screwR],
    position: s,
    color: '#2f2f2f',
    physics: 'static'
  });
  boombox.add(screw);
}

// Server-side: Handle play/pause toggle
if (world.isServer) {
  app.on('togglePlay', data => {
    app.state.isPlaying = data.isPlaying;
    app.send('updatePlayState', { isPlaying: app.state.isPlaying });
  });
}

// Client-side: Handle play state updates and prop changes
if (world.isClient) {
  // Handle server state updates
  app.on('updatePlayState', data => {
    app.state.isPlaying = data.isPlaying;
    if (boomboxAudio) {
      if (app.state.isPlaying && !boomboxAudio.isPlaying) {
        boomboxAudio.play();
        led.emissiveIntensity = 6;
      } else if (!app.state.isPlaying && boomboxAudio.isPlaying) {
        boomboxAudio.stop();
        led.emissiveIntensity = 0;
      }
    }
  });

  // Handle prop changes (e.g., from app inspector)
  app.on('updateProps', () => {
    if (app.props.isPlaying !== app.state.isPlaying) {
      // Sync prop change to server
      app.send('togglePlay', { isPlaying: app.props.isPlaying });
    }
    // Update audio properties
    if (boomboxAudio) {
      boomboxAudio.volume = app.props.volume || 0.5;
      boomboxAudio.refDistance = app.props.audioDistance || 10;
      boomboxAudio.maxDistance = (app.props.audioDistance || 10) * 3;
      boomboxAudio.rolloffFactor = app.props.rolloffFactor || 1;
    }
  });
}

// Finalize
app.add(boombox);
}
