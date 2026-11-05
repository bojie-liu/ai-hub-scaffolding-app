# AI-InnoHub Tool — TBS test harness

Local test pages for the Tool Backend Service (TBS) SDK. Everything talks to TBS
through the single bundled SDK, `tbs-client.js` — there is no other client library.

## Files

| File | Purpose |
| --- | --- |
| `tbs-client.js` | The TBS SDK (identity, AI chat, real-time rooms). Loaded with a `<script>` tag; exposes the `TbsClient`/`TbsError` classes and a ready-made `tbs` instance. |
| `test.html` + `test.js` | **Network test** — connect/verify, optional hub-token exchange, real-time room, per-step status, ping and message sending. |
| `chat.html` + `chat.js` | **Chatbot test** — streaming chat on top of `tbs.chat()`. |
| `ui.js` | Shared UI helpers (`setConnBadge`, `showIdentity`, `fatal`). |
| `test-utils.js` | Shared logging/step helpers used by the network test page. |
| `style.css` | Styling for all pages. |
| `index.html` | Static template page (left untouched). |

## Running

Serve the folder over HTTP (the SDK needs `fetch`, and TBS must allow your origin),
then open a page with the platform handoff parameters:

```
test.html?tbs_url=http://localhost:3001&tbs_token=<tbs-token>&tbs_session=<session-id>&token=<iframe-token>&hubUrl=http://localhost:3000
chat.html?tbs_url=http://localhost:3001&tbs_token=<tbs-token>
```

- `tbs_url` (or `tbsUrl`) — base URL of TBS. **Required.**
- `tbs_token` (or `tbsToken`) — one-time identity token, redeemed once at `/verify`. **Required.**
- `tbs_session` (or `tbsSession`) — optional real-time room id.
- `token` + `hubUrl` — optional, only for the hub-token exchange.

The parameters can also be typed into the form on the page. Note the `tbs_token`
is single-use, so a fresh connect after a successful verify will be rejected —
reload the page with a new token instead.

## Network test page (`test.html`)

1. Verify the TBS token (`/verify`) and keep the JWT in memory.
2. Optionally exchange the iframe token with the hub.
3. Fetch a WebSocket ticket and open the real-time room (when a session id is present).
4. Ping the room, and send `broadcast`, `direct`, `state_sync` (teacher only) or raw messages.

## Chatbot page (`chat.html`)

1. Connect (verify the TBS token).
2. Type a message — the SDK keeps the conversation history and sends it in full every turn.
3. Streams the reply via `tbs.chat(text, { onDelta })`; **Enter** sends, **Shift+Enter** adds a newline.
4. **Clear history** empties the SDK-managed conversation.

The system-prompt field is only honoured when the tool has no teacher-configured
AI persona (`tbs.hasAgent() === false`); otherwise the persona wins and the field is hidden.

## API

See the header comment in `tbs-client.js` for the full surface, and
`templates/docs/tbs-api.md` in the platform repo for the HTTP API it wraps.
