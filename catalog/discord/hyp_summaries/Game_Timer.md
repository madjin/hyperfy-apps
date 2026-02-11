# Game_Timer.hyp

## Metadata
- **Author**: 0mka
- **Channel**: #💻│developers
- **Date**: 2025-03-24
- **Size**: 225,974 bytes

## Blueprint
- **Name**: Game Timer
- **Version**: 38
- **Model**: `asset://12949aeb4d2bbc8baa26ba163be377542ebe5152a258bee4fd4c0e610c8679b9.glb`
- **Script**: `asset://2f08767df23cbc62434d8e5eb64fe7cd485398a587dfb50857b23c05cda3c64a.js`

## Props
- `attack`: emote → `asset://9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb`
- `attack1`: emote → `asset://9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb`
- `attack2`: emote → `asset://9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb`
- `screen`: bool = `True`
- `screen1`: bool = `False`
- `screen2`: bool = `True`
- `screen3`: bool = `True`
- `screen4`: bool = `True`
- `screen5`: bool = `True`
- `text1`: str = `Hello 1`
- `text2`: str = `Hello 2`
- `text3`: str = `Hello 3`
- `text4`: str = `Hello 4`
- `text5`: str = `Hello 5`
- `message`: str = `T`
- `message2`: str = `=`
- `message3`: str = `<`
- `message4`: str = `d`
- `emoji`: str = `T`
- `emoji2`: str = `=`
- `emoji3`: str = `=`
- `emoji4`: str = `d`
- `emoji5`: str = `<T`
- `emoji6`: str = `<`
- `emoji7`: str = ``
- `emoji8`: str = `=`
- `emojiTLa`: str = `P`
- `emoji1-1`: str = `P`
- `emojia1`: str = ``
- `emojib2`: str = `<`
- `emojib1`: str = `<P`
- `emojibl1`: str = `<`
- `emojibc`: str = ``
- `emojibc1`: str = ``
- `emojibc2`: str = ``
- `emojiTL`: str = `>`
- `emojiTLb`: str = `<P`
- `emojiTL1`: str = `P`
- `emojiTL2`: str = `<`
- `emojiBL0`: str = `=`
- `emojiBL1`: str = `<`
- `emojiBR0`: str = `=`
- `emojiTR0`: str = `d`
- `emojiTC0`: str = `<T`
- `emojiBC0`: str = ``
- `emojiBC1`: str = `=`
- `emojiBC2`: str = `=`
- `emojiL`: str = ``
- `emojiR`: str = `=`
- `emojiTCL`: str = `=%`
- `emojiTCR`: str = `=%`
- `emojiTRL`: str = `d`
- `emojiTRD`: str = `d`
- `emojiRD`: str = `=`
- `emojiRU`: str = `=`
- `emojiBRT`: str = `=`
- `emojiBRL`: str = `=`
- `emojiLT`: str = ``
- `emojiLB`: str = ``
- `emojiTCL2`: str = `=%`
- `emojiTCR2`: str = `=%`
- `emojiTRL1`: str = `d`
- `emojiTRL2`: str = `d`
- `emojiBRL2`: str = `=`
- `emojiBRT2`: str = `=`
- `emojiTL3`: str = `<`
- `emojiBL2`: str = `<`
- `emojiBL3`: str = `<`
- `emojiBC3`: str = `=`
- `emojiTRL3`: str = `d`
- `emojiTRL4`: str = `d`
- `emojiRUp`: str = `=`
- `emojiRUp2`: str = `=`
- `emojiRUp3`: str = `=`
- `b1`: str = `❤️`
- `b2`: str = `❤️`
- `b3`: str = `❤️`
- `b4`: str = `❤️`
- `b5`: str = `❤️`
- `b6`: str = `❤️`
- `br2`: str = `❤️`
- `br1`: str = `❤️`
- `br3`: str = `❤️`
- `br4`: str = `❤️`
- `br5`: str = `❤️`
- `b7`: str = `❤️`
- `timerText`: str = ``
- `uiBackgroundColor`: str = `#00aaff`
- `uiBorderColor`: str = `#aaff00`
- `uiTextColor`: str = `#ffaa00`
- `uiTextBackgroundColor`: str = `rgba(0,0,0,.1)`
- `uiTextBorderColor`: str = `#aa00ff`
- `timerMinutes`: int = `5`
- `uiBackgroundAlpha`: float = `0.5`

## Assets
- `[model]` 12949aeb4d2bbc8baa26ba163be377542ebe5152a258bee4fd4c0e610c8679b9.glb (36,948 bytes)
- `[script]` 2f08767df23cbc62434d8e5eb64fe7cd485398a587dfb50857b23c05cda3c64a.js (3,303 bytes)
- `[emote]` 9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb (60,912 bytes)
- `[emote]` 9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb (60,912 bytes)
- `[emote]` 9eed8f2520fae4b02052fa66264aec8b8ca285bc004267a5a13f6576d40c22ed.glb (60,912 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.off()`, `app.on()`
**Events Listened**: `update`
**Nodes Created**: `ui`, `uitext`

## Keywords (for Discord search)
aa00ff, aaff00, alpha, backgroundColor, borderColor, borderRadius, borderWidth, center, color, configuration, configure, configured, convert, countdown, create, cursor, display, done, event, exec

## Script Source
```javascript
// Define configuration fields
app.configure([
  {
    type: 'text',
    key: 'uiBackgroundColor',
    label: 'UI Background Color',
    placeholder: '#00aaff',
    initial: '#00aaff',
  },
  {
    type: 'number',
    key: 'uiBackgroundAlpha',
    label: 'UI Background Alpha',
    min: 0,
    max: 1,
    step: 0.01,
    initial: 1,
    dp: 2,
  },
  {
    type: 'text',
    key: 'uiBorderColor',
    label: 'UI Border Color',
    placeholder: '#aaff00',
    initial: '#aaff00',
  },
  {
    type: 'text',
    key: 'uiTextColor',
    label: 'UI Text Color',
    placeholder: '#ffaa00',
    initial: '#ffaa00',
  },
  {
    type: 'text',
    key: 'uiTextBackgroundColor',
    label: 'UI Text Background Color',
    placeholder: 'rgba(0,0,0,.5)',
    initial: 'rgba(0,0,0,.5)',
  },
  {
    type: 'text',
    key: 'uiTextBorderColor',
    label: 'UI Text Border Color',
    placeholder: '#aa00ff',
    initial: '#aa00ff',
  },
  {
    type: 'number',
    key: 'timerMinutes',
    label: 'Timer Start Minutes',
    min: 1,
    max: 60,
    step: 1,
    initial: 2,
    dp: 0,
  },
]);

// Function to convert hex color to rgba with alpha
function hexToRgba(hex, alpha) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})` : null;
}

const timerUI = app.create('ui', {
  width: 123,
  height: 55,
  res: 2,
  position: [1, 0, 0],
  offset: [-666, 10, 0],
  space: 'screen',
  pivot: 'top-center',
  backgroundColor: hexToRgba(props.uiBackgroundColor, props.uiBackgroundAlpha),
  borderRadius: 2,
  borderColor: props.uiBorderColor,
  borderWidth: 1,
  padding: 5,
  pointerEvents: true,
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 7,
});

const timerText = app.create('uitext', {
  value: formatTime(props.timerMinutes * 60), // Start with the configured minutes
  backgroundColor: props.uiTextBackgroundColor,
  width: 60,
  height: 60,
  fontSize: 40,
  textAlign: 'center',
  color: props.uiTextColor,
  padding: 5,
  cursor: 'pointer',
  borderRadius: 2,
  borderWidth: 1,
  borderColor: props.uiTextBorderColor,
});

timerUI.add(timerText);
app.add(timerUI);

// Variables to manage the countdown
let timer = props.timerMinutes * 60; // Initialize timer with the configured minutes
let lastUpdate = Date.now(); // Track the last update time

// Function to format time as MM:SS
function formatTime(seconds) {
  let minutes = parseInt(seconds / 60, 10);
  let secs = parseInt(seconds % 60, 10);

  minutes = minutes < 10 ? "0" + minutes : minutes;
  secs = secs < 10 ? "0" + secs : secs;

  return minutes + ":" + secs;
}

// Subscribe to the update event
app.on('update', function() {
  const now = Date.now();
  if (now - lastUpdate >= 1000) { // Check if a second has passed
    lastUpdate = now;
    if (timer > 0) {
      timer--;
      timerText.value = formatTime(timer);
    } else {
      timerText.value = "00:00"; // Optional: Set display to 00:00 when done
      app.off('update'); // Stop the countdown
    }
  }
});
```

---
*Extracted from Game_Timer.hyp. Attachment ID: 1353704856690360340*