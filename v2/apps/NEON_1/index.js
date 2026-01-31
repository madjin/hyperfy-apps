export default function main(world, app, fetch, props, setTimeout) {
/**
 * neon_letters.js
 * 
 * This file contains the implementation for neon letter effects.
 */

// Get all letter meshes
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numbers = '0123456789';
const specialChars = {
  '@': 'at',
  '?': 'question',
  '&': 'ampersand',
  '#': 'hash',
  '!': 'exclamation',
  '/': 'slash',
  '(': 'parenthesisLeft',
  ')': 'parenthesisRight',
  '{': 'curlyLeft',
  '}': 'curlyRight',
  '[': 'bracketLeft',
  ']': 'bracketRight',
  '*': 'asterisk',
  '-': 'minus',
  '_': 'underscore',
  '"': 'quote',
  ':': 'colon',
  '=': 'equals'
};

// Create meshes object
const meshes = {};

// Add letter meshes
letters.split('').forEach(letter => {
  meshes[letter] = app.get(letter);
});

// Add number meshes
numbers.split('').forEach(num => {
  meshes[num] = app.get(num);
});

// Add special character meshes
Object.entries(specialChars).forEach(([char, name]) => {
  const mesh = app.get(name);
  if (mesh) {
    meshes[char] = mesh;
  }
});

// Store cloned meshes
let clonedMeshes = [];

// Function to show specific letters
function showLetters(text) {
  // Remove all cloned meshes from the scene
  clonedMeshes.forEach(clone => app.remove(clone));
  clonedMeshes = [];

  // Calculate total width of text including spaces
  let totalWidth = 0;
  let validLetters = 0;
  let spaceCount = 0;
  
  for (let i = 0; i < text.length; i++) {
    const letter = text[i];
    const processedLetter = /[a-zA-Z]/.test(letter) ? letter.toUpperCase() : letter;
    
    if (letter === ' ') {
      spaceCount++;
    } else {
      validLetters++;
      totalWidth += spaceCount * app.config.letter_spacing;
      spaceCount = 0;
      if (validLetters > 1) {
        totalWidth += app.config.letter_spacing;
      }
    }
  }

  // Apply scale to total width
  const scaledTotalWidth = totalWidth * app.config.scale;

  // Calculate starting position based on alignment
  let startX = 0;
  if (app.config.alignment === 'center') {
    startX = -scaledTotalWidth / 2;
  } else if (app.config.alignment === 'right') {
    startX = -scaledTotalWidth;
  }

  // Show only the letters in the text
  let currentX = startX;
  spaceCount = 0;
  
  for (let i = 0; i < text.length; i++) {
    const letter = text[i];
    const processedLetter = /[a-zA-Z]/.test(letter) ? letter.toUpperCase() : letter;
    
    if (letter === ' ') {
      spaceCount++;
      continue;
    }
    
    const mesh = meshes[processedLetter];
    if (mesh) {
      currentX += spaceCount * app.config.letter_spacing * app.config.scale;
      spaceCount = 0;
      
      const clone = mesh.clone(true);
      clone.scale.set(app.config.scale, app.config.scale, app.config.scale);
      clone.position.set(
        currentX,
        app.config.height * app.config.scale,
        0
      );
      
      app.add(clone);
      clonedMeshes.push(clone);
      
      currentX += app.config.letter_spacing * app.config.scale;
    }
  }
}

// Configure the UI input
app.configure(() => {
  return [
    {
      key: "text_input",
      label: "Enter Text",
      type: "text",
      initial: "HELLO",
      placeholder: "Type your text here..."
    },
    {
      key: "letter_spacing",
      label: "Letter Spacing",
      type: "range",
      initial: 1.5,
      min: 0.1,
      max: 5,
      step: 0.1,
      dp: 1
    },
    {
      key: "scale",
      label: "Scale",
      type: "range",
      initial: 1,
      min: 0.1,
      max: 5,
      step: 0.1,
      dp: 1
    },
    {
      key: "height",
      label: "Height",
      type: "range",
      initial: 1,
      min: 1,
      max: 10,
      step: 0.1,
      dp: 1
    },
    {
      key: "emission_intensity",
      label: "Glow Intensity",
      type: "range",
      initial: 1,
      min: 0,
      max: 20,
      step: 0.1,
      dp: 1
    },
    {
      key: "uvcolor",
      label: "Color",
      type: "range",
      initial: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      dp: 2
    },
    {
      type: 'dropdown',
      key: 'alignment',
      label: 'Text Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' }
      ],
      initial: 'center',
    },
    {
      type: 'switch',
      key: 'visible',
      label: 'Show/Hide all characters',
      options: [
        { label: 'Show', value: 'true' },
        { label: 'Hide', value: 'false' }
      ],
      initial: 'true',
    },
  ];
});

// Initial setup
if (world.isClient) {
  showLetters(app.config.text_input);
}

// Set material properties for all meshes
Object.values(meshes).forEach(mesh => {
  if (mesh) {
    mesh.material.emissiveIntensity = app.config.emission_intensity;
    mesh.material.textureY = app.config.uvcolor;
    mesh.active = app.config.visible === 'true';
  }
});





}
