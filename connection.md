# AI-InnoHub Tool

A WebSocket client for AI-InnoHub and TBS (Tool-Based Session) integration.

## Architecture

The project is organized into three files:

- **`connection.js`** - Reusable connection library for AI-InnoHub and TBS
- **`test-utils.js`** - Logging, UI helpers, and debug utilities
- **`index.html`** - Demo client UI that imports and uses the connection library

## Usage

### Using the Connection Library

The connection library can be imported into any HTML page:

```html
<script src="connection.js"></script>
<script>
  // Configure callbacks
  connection.onStepChange = (step, status) => {
    console.log(`${step}: ${status}`);
  };

  connection.onMessage = (data, raw) => {
    console.log('Received:', data);
  };

  connection.onOpen = () => {
    console.log('Connected');
  };

  connection.onFatalError = (title, desc, detail) => {
    console.error(title, desc, detail);
  };

  // Connect
  await connection.connect({
    token: 'your-iframe-token',
    tbs_token: 'your-tbs-token',
    tbs_session: 'session-id',
    tbs_url: 'http://localhost:3011'
  });

  // Send messages
  connection.sendBroadcast({ message: 'Hello everyone' });
  connection.sendDirect('user123', { message: 'Private message' });
  connection.sendStateSync({ state: 'updated' });
  connection.sendPing();

  // Check connection
  if (connection.isConnected()) {
    connection.send({ type: 'custom', payload: {} });
  }

  // Get info
  const identity = connection.getIdentity();
  const tbsInfo = connection.getTbsInfo();
  const jwt = connection.getJwt();
</script>
```

### API Reference

#### Methods

- **`connect(params)`** - Establish connection to AI-InnoHub and TBS
  - `params.token` - iframe token from AI-InnoHub
  - `params.tbs_token` or `params.tbsToken` - TBS authentication token
  - `params.tbs_session` or `params.tbsSession` - TBS session ID
  - `params.tbs_url` or `params.tbsUrl` - TBS server URL (default: `http://localhost:3011`)

- **`send(message)`** - Send raw JSON message
- **`sendBroadcast(payload)`** - Send broadcast message
- **`sendDirect(to, payload)`** - Send direct message to user
- **`sendStateSync(payload)`** - Send state sync (teacher only)
- **`sendPing()`** - Send ping message
- **`isConnected()`** - Check if WebSocket is connected
- **`getIdentity()`** - Get user identity from AI-InnoHub
- **`getTbsInfo()`** - Get TBS session info (role, courseId, toolId)
- **`getJwt()`** - Get TBS JWT token
- **`disconnect()`** - Close WebSocket connection

#### Callbacks

- **`onStepChange(step, status)`** - Called when connection step changes
  - `step`: 'exchange', 'verify', 'ticket', 'ws'
  - `status`: 'busy', 'ok', 'error'

- **`onMessage(data, raw)`** - Called when WebSocket message received
  - `data`: parsed JSON object (or raw string if parse fails)
  - `raw`: raw message string

- **`onOpen()`** - Called when WebSocket opens
- **`onError(err)`** - Called on WebSocket error
- **`onClose(event)`** - Called when WebSocket closes
- **`onFatalError(title, desc, detail)`** - Called on fatal connection error

## Development

Open `index.html` with URL parameters:

```
index.html?token=<iframe-token>&tbs_token=<tbs-token>&tbs_session=<session-id>&tbs_url=http://localhost:3011
```

The demo client will:
1. Exchange the iframe token for user identity
2. Verify the TBS token and get JWT
3. Request a WebSocket ticket
4. Connect to the TBS WebSocket
5. Display connection status and allow sending test messages
