export default function main(world, app, fetch, props, setTimeout) {
// Configurable image display with refresh functionality
// - Allows customization of chart URL and display settings

// Configure the app's customization fields
app.configure([
  // Section for Chart Settings
  {
    type: 'section',
    key: 'chartSection',
    label: 'Chart Settings'
  },
  {
    type: 'text',
    key: 'chartUrl',
    label: 'Chart URL',
    placeholder: 'Enter chart URL',
    initial: 'https://cambrian.rickydata.com/plot_best_categories'
  },
  {
    type: 'text',
    key: 'refreshLabel',
    label: 'Refresh Button Label',
    placeholder: 'Enter refresh button label',
    initial: 'Refresh Chart [E]'
  },
  {
    type: 'range',
    key: 'refreshRadius',
    label: 'Interaction Radius (meters)',
    min: 1,
    max: 10,
    step: 0.5,
    initial: 5
  },

  // Section for Display Settings
  {
    type: 'section',
    key: 'displaySection',
    label: 'Display Settings'
  },
  {
    type: 'range',
    key: 'width',
    label: 'Chart Width',
    min: 300,
    max: 1200,
    step: 10,
    initial: 640
  },
  {
    type: 'range',
    key: 'height',
    label: 'Chart Height',
    min: 200,
    max: 800,
    step: 10,
    initial: 480
  },
  {
    type: 'range',
    key: 'posX',
    label: 'Position X',
    min: -10,
    max: 10,
    step: 0.1,
    initial: 0
  },
  {
    type: 'range',
    key: 'posY',
    label: 'Position Y (Height)',
    min: 0,
    max: 5,
    step: 0.1,
    initial: 1.7
  },
  {
    type: 'range',
    key: 'posZ',
    label: 'Position Z',
    min: -10,
    max: 10,
    step: 0.1,
    initial: -3
  },
  {
    type: 'dropdown',
    key: 'imageFit',
    label: 'Image Fit',
    options: [
      { label: 'Contain', value: 'contain' },
      { label: 'Cover', value: 'cover' },
      { label: 'Fill', value: 'fill' },
      { label: 'None', value: 'none' },
      { label: 'Scale-down', value: 'scale-down' }
    ],
    initial: 'fill'
  }
]);

// Position from config
const POS_X = props.posX;
const POS_Y = props.posY;
const POS_Z = props.posZ;

// Chart URL from config
const CHART_URL_BASE = props.chartUrl;
let currentChartUrl = CHART_URL_BASE;

// Track refresh state and cooldown
let isRefreshing = false;
let refreshStartTime = 0;
let frameCounter = 0;
let lastRefreshTime = 0;
const REFRESH_COOLDOWN = 600; // 10 seconds at 60fps

// Create the UI container
const ui = app.create('ui');
app.add(ui);

// Set properties from config
ui.width = props.width;
ui.height = props.height;
ui.size = 0.01;
ui.backgroundColor = 'transparent';
ui.position.set(POS_X, POS_Y, POS_Z);
ui.billboard = 'full';
ui.lit = true;

// Add the image
const image = app.create('uiimage');
image.src = currentChartUrl;
image.width = props.width;
image.height = props.height;
image.objectFit = props.imageFit;
ui.add(image);

// Create an action for the E key press
const chartAction = app.create('action');
chartAction.position.set(POS_X, POS_Y, POS_Z);
chartAction.radius = props.refreshRadius;
chartAction.label = props.refreshLabel;

// Define what happens when E is pressed
chartAction.onTrigger = () => {
  // Check if we're already refreshing
  if (isRefreshing) return;
  
  // Check cooldown period (10 seconds)
  const timeSinceLastRefresh = frameCounter - lastRefreshTime;
  if (lastRefreshTime > 0 && timeSinceLastRefresh < REFRESH_COOLDOWN) {
    return; // Still in cooldown
  }
  
  // Start refresh process
  isRefreshing = true;
  refreshStartTime = frameCounter;
  lastRefreshTime = frameCounter; // Record the time of this refresh
  
  // Force reload with unique timestamp (cache-busting)
  currentChartUrl = `${CHART_URL_BASE}?t=${Date.now()}`;
  image.src = currentChartUrl;
};

// Add the action to the scene
app.add(chartAction);

// Use update loop for timing
app.on('update', (delta) => {
  // Increment frame counter for timing
  frameCounter++;
  
  // Handle refresh state changes
  if (isRefreshing) {
    // After ~2 seconds (assuming 60fps), complete the refresh
    if (frameCounter - refreshStartTime > 120) {
      isRefreshing = false;
    }
  }
});

console.log('Created configurable chart display with refresh functionality');
}
