export default function main(world, app, fetch, props, setTimeout) {
app.configure(() => {
  return [
    {
      type: 'text',
      key: 'url',
      label: 'Canonical URL',
      placeholder: 'The canonical URL of your world.',
      initial: '',
    },
    {
      type: 'text',
      key: 'name',
      label: 'Name',
      placeholder: 'The name of your world.',
      initial: '',
    },
    {
      type: 'text',
      key: 'description',
      label: 'Description',
      placeholder: 'The description of your world.',
      initial: '',
    },
    {
      type: 'image',
      key: 'image',
      label: 'Preview Image',
      placeholder: 'A preview image for your world.',
      initial: '',
    },
    {
      type: 'tags',
      key: 'tags',
      label: 'Tags',
      placeholder: 'Comma-separated tags for your world.',
      initial: '',
    }
  ]
})

// Set this to true once you've configured the relevant information below
const configured = false;

// The canonical URL to your world
const url = "<YOUR_SITE_URL>";
// The name of your world
const name = "<YOUR_WORLD_NAME>";
// A description of your world.
const description = "<YOUR_WORLD_DESCRIPTION>";
// A preview image of your world
const image = "<YOUR_WORLD_PREVIEW_IMAGE>";
// A list of comma-separated keywords about your world (i.e. social,action,puzzle)
const tags = "<comma,separated,keywords>";

// Relay-specific vars
const relay = 'https://relay.zesty.xyz';
const sessionId = uuid();
let sendHeartbeats = false;

// Initial signal
(async function() {
  if (!configured) return;

  try {
    await fetch(`${relay}/beacon`, {
      method: 'PUT',
      body: JSON.stringify({
        url,
        name,
        description,
        active: true,
        image,
        adult: false,
        tags,
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    sendHeartbeats = true;
  } catch {
    console.error("Failed to communicate with relay server!");
  }
})()

// Session Heartbeats
let time = 0;
app.on('update', delta => {
  if (!sendHeartbeats || world.isServer) return;

  time += delta;
  if (time > 4.5) {
    try {
      (async function() {
        await fetch(`${relay}/session`, {
          method: 'POST',
          body: JSON.stringify({
            session_id: sessionId,
            url,
            timestamp: Date.now(),
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
      })();
      time = 0;
    } catch(e) {
      console.log(e);
      console.error("Failed to send heartbeat signal! Relay server is not reachable.")
    }
  }
})
}
