export default function main(world, app, fetch, props, setTimeout) {
// Remove default block if present
app.remove(app.get('Block'));

// =================================================================
// Book Configuration
// =================================================================
const BOOK_CONFIG = {
  cover: { thickness: 0.004, overhang: 0.006, color: 'red' },
  page: { width: 0.14, height: 0.22, depth: 0.03, color: '#f6f2df' },
  spine: { width: 0.012 },
  epsilon: 0.0001
};

const coverWidth = BOOK_CONFIG.page.width + BOOK_CONFIG.cover.overhang * 2;
const coverHeight = BOOK_CONFIG.page.height + BOOK_CONFIG.cover.overhang * 2;
const centerY = coverHeight / 2;

// Create book group
const bookGroup = app.create('group');

// Add page block
bookGroup.add(app.create('prim', {
  type: 'box',
  size: [BOOK_CONFIG.page.width, BOOK_CONFIG.page.height, BOOK_CONFIG.page.depth],
  color: BOOK_CONFIG.page.color,
  position: [0, centerY, 0],
  physics: 'static'
}));

// Add front and back covers
[-1, 1].forEach(sign => {
  bookGroup.add(app.create('prim', {
    type: 'box',
    size: [coverWidth, coverHeight, BOOK_CONFIG.cover.thickness],
    color: BOOK_CONFIG.cover.color,
    position: [0, centerY, sign * (BOOK_CONFIG.page.depth / 2 + BOOK_CONFIG.cover.thickness / 2 + BOOK_CONFIG.epsilon)],
    physics: 'static'
  }));
});

// Add spine
bookGroup.add(app.create('prim', {
  type: 'box',
  size: [BOOK_CONFIG.spine.width, coverHeight, BOOK_CONFIG.page.depth + BOOK_CONFIG.cover.thickness * 2 + BOOK_CONFIG.epsilon * 2],
  color: BOOK_CONFIG.cover.color,
  position: [-(coverWidth / 2) + BOOK_CONFIG.spine.width / 2 + BOOK_CONFIG.epsilon, centerY, 0],
  physics: 'static'
}));

// Add book group to app
app.add(bookGroup);

// =================================================================
// Flip Mechanic Configuration
// =================================================================
app.configure([{
  key: 'flipEmote',
  type: 'file',
  kind: 'emote',
  label: 'Flip Emote'
}]);

const FLIP_CONFIG = {
  forwardImpulse: new Vector3(0, 0, -13),
  jumpStrength: 3,
  forwardStart: 5,
  forwardLand: 5,
  landDelay: 200,
  flipDuration: 600,
  safeHeight: 1.0
};

// =================================================================
// Client-Side Flip Mechanic
// =================================================================
if (world.isClient) {
  // Destructure props
  const { flipEmote } = app.props;

  const player = world.getPlayer();
  const control = app.control();

  let canFlip = true;
  let flipInProgress = false;

  const tempVec = new Vector3();
  const tempQuat = new Quaternion();
  const tempEuler = new Euler(0, 0, 0, 'YXZ');

  // Compute forward direction based on camera orientation
  function getForwardDirection(outVec) {
    tempEuler.setFromQuaternion(control.camera.quaternion);
    tempEuler.x = 0;
    tempEuler.z = 0;
    tempQuat.setFromEuler(tempEuler);
    return outVec.copy(FLIP_CONFIG.forwardImpulse).applyQuaternion(tempQuat).normalize();
  }

  // Apply impulse to player
  function applyImpulse(x, y, z) {
    player.push(new Vector3(x, y, z));
  }

  // Perform the flip action
  function performFlip() {
    if (!canFlip || flipInProgress) return;
    canFlip = false;
    flipInProgress = true;

    const dir = getForwardDirection(tempVec);

    // Adjust starting height if necessary
    if (player.position.y < FLIP_CONFIG.safeHeight) {
      player.position.y = FLIP_CONFIG.safeHeight;
    }

    // Apply initial jump and forward impulse
    applyImpulse(
      dir.x * FLIP_CONFIG.forwardStart,
      FLIP_CONFIG.jumpStrength,
      dir.z * FLIP_CONFIG.forwardStart
    );

    // Apply landing forward impulse after delay
    setTimeout(() => {
      applyImpulse(
        dir.x * FLIP_CONFIG.forwardLand,
        0,
        dir.z * FLIP_CONFIG.forwardLand
      );
    }, FLIP_CONFIG.landDelay);

    // Play emote if configured
    if (flipEmote?.url) {
      player.applyEffect({
        emote: `${flipEmote.url}?l=0`,
        turn: true,
        duration: FLIP_CONFIG.flipDuration / 1000,
        onEnd: () => {
          canFlip = true;
          flipInProgress = false;
        }
      });
    } else {
      // Fallback timeout if no emote
      setTimeout(() => {
        canFlip = true;
        flipInProgress = false;
      }, FLIP_CONFIG.flipDuration);
    }
  }

  // Listen for flip trigger on update
  app.on('update', () => {
    if (control.keyF?.pressed && !flipInProgress) {
      performFlip();
    }
  });
}
}
