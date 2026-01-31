export default function main(world, app, fetch, props, setTimeout) {
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
}
