# Screen_UI_link_section.hyp

## Metadata
- **Author**: Gert-Jan Akerboom
- **Channel**: #🎨│showcase
- **Date**: 2025-06-19
- **Size**: 9,826 bytes

## Discord Context
> add (download) links to your world

## Blueprint
- **Name**: Screen UI link section
- **Version**: 90
- **Model**: `asset://efb0f3ac587dd7911b2a6e0865401e9380af8dc6fde9da8439d94d0b661c3ee3.glb`
- **Script**: `asset://176816b323daee6e998df016faae8234ba013f4a9a360ed2058611bb2f002446.js`

## Props
- `button_count`: int = `14`
- `button_text_1`: str = `link 1`
- `button_text_2`: str = `link 2`
- `button_text_3`: str = `link 3`
- `button_text_4`: str = `link 4`
- `button_text_5`: str = `link 5`
- `download_link_1`: str = ``
- `download_link_2`: str = ``
- `download_link_3`: str = ``
- `download_link_4`: str = ``
- `download_link_5`: str = ``
- `button_text_6`: str = `link 6`
- `download_link_6`: str = ``
- `button_text_7`: str = `link 7`
- `download_link_7`: str = ``
- `button_text_8`: str = `link 8`
- `download_link_8`: str = ``
- `button_text_9`: str = `link 9`
- `download_link_9`: str = ``
- `button_text_10`: str = `link 10`
- `download_link_10`: str = ``
- `button_text_11`: str = `link 11`
- `download_link_11`: str = ``
- `button_text_12`: str = `link 12`
- `download_link_12`: str = ``
- `button_text_13`: str = `link 13`
- `download_link_13`: str = ``
- `button_text_14`: str = `link 14`
- `download_link_14`: str = ``
- `button_text_15`: str = `link 15`
- `download_link_15`: str = ``
- `button_text_16`: str = `link 16`
- `download_link_16`: str = ``
- `button_text_17`: str = `link 17`
- `download_link_17`: str = ``
- `button_text_18`: str = `link 18`
- `download_link_18`: str = ``
- `button_text_19`: str = `link 19`
- `download_link_19`: str = ``
- `button_text_20`: str = `link 20`
- `download_link_20`: str = ``
- `header_text`: str = `Download Section`
- `visible`: str = `true`

## Assets
- `[model]` efb0f3ac587dd7911b2a6e0865401e9380af8dc6fde9da8439d94d0b661c3ee3.glb (1,948 bytes)
- `[script]` 176816b323daee6e998df016faae8234ba013f4a9a360ed2058611bb2f002446.js (6,159 bytes)

## Script Analysis
**App Methods**: `app.add()`, `app.configure()`, `app.create()`, `app.get()`
**World Methods**: `world.open()`
**Nodes Created**: `ui`, `uitext`

## Keywords (for Discord search)
active, alignItems, alpha, attach, backgroundColor, based, behavior, below, borderRadius, borderWidth, button, buttonCount, buttons, center, click, color, comment, config, configFields, configure

## Script Source
```javascript
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
```

---
*Extracted from Screen_UI_link_section.hyp. Attachment ID: 1385257861516492912*