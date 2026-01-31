export default function main(world, app, fetch, props, setTimeout) {
// Function to convert hex color to rgba with alpha
function hexToRgba(hex, alpha) {
  let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})` : null;
}

// Create the main toggle button (top right)
const UItoggle = app.create('ui', {
  width: 60,
  height: 60,
  res: 1,
  position: [1, 0, 0],
  offset: [-15, 15, 0],
  space: 'screen',
  pivot: 'top-right',
  backgroundColor: 'rgba(0,0,0,0.85)',
  borderRadius: 12,
  borderWidth: 0,
  pointerEvents: true,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  cursor: 'pointer',
});

const UItoggleIcon = app.create('uitext', {
  value: '▲',
  fontSize: 24,
  color: '#fff',
  textAlign: 'center',
  backgroundColor: 'transparent',
  cursor: 'pointer',
});
UItoggle.add(UItoggleIcon);
app.add(UItoggle);

// Add app.configure for number of infoUIButtons
app.configure(() => {
  const buttonCount = app.config.button_count || 8;
  const configFields = [
    {
      key: 'button_count',
      label: 'Number of Buttons',
      type: 'number',
      min: 1,
      max: 14,
      step: 1,
      initial: 8,
    },
    {
      key: 'header_text',
      label: 'Header Text',
      type: 'text',
      initial: 'Download Section',
      placeholder: 'Enter header text to explain downloads',
    },
    {
      type: 'switch',
      key: 'visible',
      label: 'Cube Visible',
      options: [
        {
          label: 'Show',
          value: 'true',
        },
        {
          label: 'Hide',
          value: 'false',
        }
      ],
      initial: 'true',
    },
    {
      type: 'section',
      key: 'links',
      label: 'Links',
    }
  ];
  
  // Dynamically add text input fields and download link fields based on button count
  for (let i = 0; i < buttonCount; i++) {
    configFields.push({
      key: `button_text_${i + 1}`,
      label: `Button ${i + 1} Text`,
      type: 'text',
      initial: `link ${i + 1}`,
      placeholder: `Enter text for button ${i + 1}`,
    });
    configFields.push({
      key: `download_link_${i + 1}`,
      label: `Link ${i + 1}`,
      type: 'text',
      initial: '',
      placeholder: `Paste URL`,
    });
  }
  
  return configFields;
});

// Create header button (1.5x height)
const headerButton = app.create('ui', {
  width: 300,
  height: 70, // 1.5x the normal height (50 * 1.5)
  res: 1,
  position: [1, 0, 0],
  offset: [-15, 84, 0],
  space: 'screen',
  pivot: 'top-right',
  backgroundColor: 'rgba(0,0,0,0.85)',
  borderRadius: 12,
  borderWidth: 0,
  pointerEvents: true,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  cursor: 'pointer',
  active: false, // Start hidden
});

const headerText = app.create('uitext', {
  value: app.config.header_text || 'Download Section',
  fontSize: 20,
  color: '#fff',
  textAlign: 'center',
  backgroundColor: 'transparent',
  cursor: 'pointer',
});

headerButton.add(headerText);
app.add(headerButton);

// Remove hover behavior for header since it's just informational
// headerButton.onPointerEnter = () => {
//   headerButton.backgroundColor = 'rgba(64,64,64,0.85)';
// };
// headerButton.onPointerLeave = () => {
//   headerButton.backgroundColor = 'rgba(0,0,0,0.85)';
// };

// Create download buttons, stacked vertically (starting below header)
const infoUIButtons = [];
const buttonCount = app.config.button_count || 8;
for (let i = 0; i < buttonCount; i++) {
  const yOffset = 165 + i * 55; // Start below header (90 + 75 + 10 gap)
  const infoUI = app.create('ui', {
    width: 300,
    height: 50,
    res: 1,
    position: [1, 0, 0],
    offset: [-15, yOffset, 0],
    space: 'screen',
    pivot: 'top-right',
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 12,
    borderWidth: 0,
    pointerEvents: true,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    cursor: 'pointer',
    active: false, // Start hidden
  });
  const linkText = app.create('uitext', {
    value: app.config[`button_text_${i + 1}`] || `link ${i + 1}`,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  });
  infoUI.add(linkText);
  app.add(infoUI);
  
  // Add hover behavior
  infoUI.onPointerEnter = () => {
    infoUI.backgroundColor = 'rgba(64,64,64,0.85)';
  };
  infoUI.onPointerLeave = () => {
    infoUI.backgroundColor = 'rgba(0,0,0,0.85)';
  };
  
  // Add click handler for download
  infoUI.onPointerDown = () => {
    const downloadLink = app.config[`download_link_${i + 1}`];
    if (downloadLink && downloadLink.trim() !== '') {
      world.open(downloadLink, true);
    } else {
      console.log(`No download link configured for button ${i + 1}`);
    }
  };
  
  infoUIButtons.push(infoUI);
  // Also attach the text in case you want to use it later: infoUI.linkText = linkText;
}

// Toggle all infoUI buttons with UItoggle (including header)
UItoggle.onPointerEnter = () => {
  UItoggle.backgroundColor = 'rgba(64,64,64,0.85)';
};
UItoggle.onPointerLeave = () => {
  UItoggle.backgroundColor = 'rgba(0,0,0,0.85)';
};
UItoggle.onPointerDown = () => {
  UItoggleIcon.value = UItoggleIcon.value === '▲' ? '▼' : '▲';
  const newActive = !headerButton.active;
  headerButton.active = newActive;
  infoUIButtons.forEach(btn => btn.active = newActive);
};

// Get the cube and set its visibility
const cube = app.get('Cube');
if (cube) {
  cube.active = app.config.visible === 'true';
}

// Only keep the toggle button logic, comment out the rest
/*
// Array of download items
const downloadItems = [ ... ];
// Create individual download rectangles
const downloadRectangles = downloadItems.map(...);
*/
}
