export default function main(world, app, fetch, props, setTimeout) {
/**
 * 10x10 Grid of Squares
 * Creates a 10x10 grid of squares in the upper right corner of the screen
 * Only visible when player is within 10 meters of the app
 * 
 * @author Assistant
 * @license MIT
 */

// Function to convert hex color to rgba with alpha
function hexToRgba(hex, alpha) {
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
  
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})` : null;
  }
  
  const baseColor = hexToRgba('#4a90e2', 0.8);
  const hoverColor = hexToRgba('#357abd', 0.9);
  
  // Drawing state - track if left mouse button is currently held down
  let isLeftMouseDown = false;
  
  // Array to store placed flowers
  const placedFlowers = [];
  
  // Distance threshold for UI visibility (10 meters)
  const UI_VISIBILITY_DISTANCE = 10;
  
  // Track last player position to detect movement
  let lastPlayerPosition = null;
  
  // Track if app is fully initialized
  let appInitialized = false;
  let playerReady = false;
  
  // Function to convert screenspace grid position to world position
  function gridToWorld(row, col) {
  // Convert screenspace (0-9) to world (-5 to 5)
  // Row 0, Column 0 = X: -5, Z: -5
  // Row 9, Column 9 = X: 5, Z: 5
  const worldX = col - 5; // No flip: 0→-5, 9→4
  const worldZ = (9 - row) - 5; // Flip row: 9→-5, 0→4
  return { x: worldX, z: worldZ };
  }
  
  // Function to update grid squares to reflect the current state
  function updateGridSquaresFromState() {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const squareIndex = row * gridSize + col;
        const square = squares[squareIndex];
        const gridIndex = row * gridSize + col;
        
        if (flowerGrid[gridIndex]) {
          square.backgroundColor = '#ffffff';
        } else {
          square.backgroundColor = baseColor;
        }
      }
    }
  }
  
  // Function to check distance and update UI visibility
  function updateUIVisibility() {
    if (!world.isClient || !appInitialized || !playerReady) {
      return;
    }
    
    const player = world.getPlayer();
    if (!player || !player.position) {
      return;
    }
    
    let playerPos;
    try {
      playerPos = player.position;
    } catch (error) {
      return;
    }
    
    if (!playerPos || typeof playerPos.distanceTo !== 'function') {
      return;
    }
    
    let appPos;
    try {
      appPos = app.position;
    } catch (error) {
      return;
    }
    
    if (!appPos || typeof appPos.distanceTo !== 'function') {
      return;
    }
    
    try {
      const distance = playerPos.distanceTo(appPos);
      
      // Check if player has moved significantly (more than 0.5 meters)
      if (lastPlayerPosition && typeof lastPlayerPosition.distanceTo === 'function') {
        const movementDistance = playerPos.distanceTo(lastPlayerPosition);
        // Temporarily disable movement threshold for debugging
        // if (movementDistance < 0.5) return; // Skip update if player hasn't moved much
      }
      
      lastPlayerPosition = playerPos.clone();
      
      // Toggle UI visibility based on distance
      const shouldShowUI = distance <= UI_VISIBILITY_DISTANCE;
      if (squares && squares.length > 0) {
        squares.forEach(square => {
          if (square && typeof square.active !== 'undefined') {
            square.active = shouldShowUI;
          }
        });
      }
    } catch (error) {
      // Silently handle any errors in distance calculation
    }
  }
  
  // Grid configuration
  const gridSize = 10; // 10x10 grid
  const squareSize = 30; // Size of each square in pixels
  const gap = 0; // No gap between squares
  const totalGridSize = gridSize * squareSize + (gridSize - 1) * gap;
  
  // Array to track which grid positions already have flowers
  const flowerGrid = Array(gridSize * gridSize).fill(false);
  
  // Calculate starting position for top-right corner
  // Position the grid in the upper right, with some margin from the edges
  const startX = 1; // Right side of screen
  const startY = 0; // Top of screen
  const offsetX = -20; // Margin from right edge
  const offsetY = 60; // Margin from top edge (increased from 20 to 60 to avoid stats bar)
  
  // Create the 10x10 grid of squares
  const squares = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const square = app.create('ui', {
        width: squareSize,
        height: squareSize,
        res: 1,
        position: [startX, startY, 0],
        offset: [
          offsetX - (col * (squareSize + gap)), // Move left for each column
          offsetY + (row * (squareSize + gap)), // Move down for each row
          0
        ],
        space: 'screen',
        pivot: 'top-right',
        backgroundColor: baseColor,
        borderRadius: 0,
        borderWidth: 0,
        pointerEvents: true,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        cursor: 'pointer',
      });
  
      // Add drawing behavior when mouse enters while left button is held down
      square.onPointerEnter = () => {
        // Only turn white if left mouse button is currently held down
        if (isLeftMouseDown) {
          square.backgroundColor = '#ffffff';
        }
      };
  
      // Add click behavior (you can customize this)
      square.onPointerDown = () => {
        // Turn the square white when clicked
        square.backgroundColor = '#ffffff';
        // Start drawing mode
        isLeftMouseDown = true;
      };
  
      app.add(square);
      squares.push(square);
    }
  }
  
  // Create instruction text under the grid
  const instructionText = app.create('ui', {
    width: totalGridSize,
    height: 30,
    res: 1,
    position: [startX, startY, 0],
    offset: [
      offsetX - totalGridSize + 298, // Align with left edge of grid
      offsetY + totalGridSize + 6, // Position below grid with 10px gap
      0
    ],
    space: 'screen',
    pivot: 'top-right',
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    pointerEvents: false,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  });
  
  const textElement = app.create('uitext', {
    value: 'left mouse - paint grass / right mouse - reset',
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    backgroundColor: 'transparent',
  });
  
  instructionText.add(textElement);
  app.add(instructionText);
  
  // Add instruction text to squares array so it gets hidden/shown with the grid
  squares.push(instructionText);
  
  // Set up left mouse button control for drawing
  const control = app.control({
    mouseLeft: true,
    mouseRight: true
  });
  
  // Track left mouse button state
  control.mouseLeft.onPress = () => {
    isLeftMouseDown = true;
  };
  
  control.mouseLeft.onRelease = () => {
    isLeftMouseDown = false;
    // Place flowers for all white squares when mouse is released
    placeFlowersForWhiteSquares();
  };
  
  // Right click to reset
  control.mouseRight.onPress = () => {
    resetGrid();
  };
  
  // Function to place flowers for all white squares
  function placeFlowersForWhiteSquares() {
    // Get the flower mesh from the app
    const flowerMesh = app.get('flower');
    if (!flowerMesh) {
      console.error('Could not find flower mesh - make sure your GLB has a mesh named "flower"');
      return;
    }
  
    // Check each square and place flowers for white ones
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const squareIndex = row * gridSize + col;
        const square = squares[squareIndex];
        
        if (square.backgroundColor === '#ffffff') {
          const gridIndex = row * gridSize + col;
          
          // Only place a flower if one doesn't already exist at this position
          if (!flowerGrid[gridIndex]) {
            // Convert grid position to world position
            const worldPos = gridToWorld(row, col);
            
            // Clone the flower and place it at the world position
            const flowerClone = flowerMesh.clone(true);
            flowerClone.position.x = worldPos.x;
            flowerClone.position.y = 0; // Ground level
            flowerClone.position.z = worldPos.z;
            
            // Add random rotation on Y axis (0 to 360 degrees)
            flowerClone.rotation.y = Math.random() * Math.PI * 2;
            
            // Add to app and store reference
            app.add(flowerClone);
            placedFlowers.push(flowerClone);
            
            // Mark this grid position as having a flower
            flowerGrid[gridIndex] = true;
          }
        }
      }
    }
  }
  
  // Reset functionality
  function resetGrid() {
    // Reset squares to blue
    squares.forEach(square => {
      square.backgroundColor = baseColor;
    });
    
    // Remove all placed flowers
    placedFlowers.forEach(flower => {
      app.remove(flower);
    });
    placedFlowers.length = 0; // Clear the array
    
    // Reset the flower grid tracking
    flowerGrid.fill(false);
  }
  
  // Initialize the app
  if (world.isClient) {
    // Mark app as initialized
    appInitialized = true;
    
    // Check if player is already available
    const existingPlayer = world.getPlayer();
    if (existingPlayer && existingPlayer.position) {
      playerReady = true;
      // Initial UI visibility check
      updateUIVisibility();
    } else {
      // Wait for player to be ready
      world.on('player', (player) => {
        playerReady = true;
        // Initial UI visibility check
        updateUIVisibility();
      });
    }
  }
  
  // Update function to check distance when player moves
  if (world.isClient) {
    // Check distance every frame instead of using setInterval
    let lastCheckTime = 0;
    const checkInterval = 0.1; // Check every 100ms
    
    // Use Hyperfy's update event system
    app.on('update', (delta) => {
      lastCheckTime += delta;
      if (lastCheckTime >= checkInterval) {
        updateUIVisibility();
        lastCheckTime = 0;
      }
    });
  }
  
}
