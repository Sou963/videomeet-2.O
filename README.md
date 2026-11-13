# VideoMeet

VideoMeet is a full-stack video conferencing application with native WebRTC calls, Socket.IO signaling and collaboration, an Express API, MongoDB persistence, and a Next.js App Router frontend.

## Features

- User authentication and meeting management.
- Peer-to-peer video, audio, and screen sharing.
- Peer-to-peer file sharing over reliable WebRTC DataChannels, with per-recipient progress and cancellation.
- Host-controlled meeting ending with a backend-enforced five-minute deactivation grace period.
- Socket.IO chat, reactions, hand raising, and host announcements.
- Optional Bengali ↔ English, audio-only translation through Gemini Live API.
- Each participant chooses their own listening language; speech source language is detected by Gemini.

## Translation architecture

The browser captures only incoming remote WebRTC audio, resamples it to 16-bit mono PCM at 16 kHz, and streams it directly to the Gemini Live API. Generated 24 kHz PCM audio is played in the same browser. Audio is never sent through Express or Socket.IO, and local microphone tracks are not used as translation input.

The authenticated Express endpoint `POST /api/gemini/live-token` checks meeting membership and returns a one-use, short-lived Gemini token. The permanent API key remains in the backend repository's `.env`. Client translation configuration is intentionally unlocked in the token constraints so each participant can choose a target language; response modality remains audio-only.

## File sharing and meeting lifecycle

The Files sidebar sends files directly between participants over reliable `file-transfer` WebRTC DataChannels in 32 KiB chunks. Socket.IO authorizes transfers and carries metadata only; file bytes are never sent through Socket.IO. The default maximum is 25 MB per file. Configure `MEETING_MAX_FILE_SIZE_MB` in the backend environment and `NEXT_PUBLIC_MEETING_MAX_FILE_SIZE_MB` in the frontend build environment to the same positive integer if a different limit is needed.

Each browser stores only metadata in `localStorage` under `videomeet_file_sharing_<meetingId>`; the file contents are not persisted. Received downloads remain available only in the current page session, so a refresh or closing the meeting page clears the local download Blob while retaining the metadata history.

The host ends a meeting through `POST /api/meetings/:meetingId/end`. The backend stores `hostEndedAt` and a fixed `deactivateAt` deadline, broadcasts `meeting-ending`, and rejects new joins and meeting activities. A database-backed periodic sweep deactivates overdue meetings after backend restarts, broadcasts `meeting-deactivated`, and disconnects remaining room members. `GET /api/meetings/:meetingId/status` restores the authoritative status and deadline for participants who refresh during the grace period.

## Requirements

- Node.js 22 or later (required by the installed `@google/genai` SDK).
- MongoDB.
- A Gemini API key with access to `gemini-3.5-live-translate-preview`.

## Setup and startup

1. Configure the backend environment in the backend repository's `.env`:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:3000
   GEMINI_API_KEY=your_gemini_api_key
   TURN_URL=
   TURN_USERNAME=
   TURN_CREDENTIAL=
   TURN_SHARED_SECRET=
   MEETING_MAX_FILE_SIZE_MB=25
   ```

2. From the backend repository root, start the backend:

   ```powershell
   npm install
   npm run dev
   ```

3. Configure the frontend environment in `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   API_PROXY_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   NEXT_PUBLIC_MEETING_MAX_FILE_SIZE_MB=25
   ```

4. From the frontend repository root, start the frontend:

   ```powershell
   npm install
   npm run dev
   ```

   Open `http://localhost:3000`. Never place `GEMINI_API_KEY` or TURN secrets in a `NEXT_PUBLIC_*` variable or browser storage.

## Configure TURN for cross-network calls

STUN can establish direct calls on many networks, but it cannot relay media when NATs or firewalls block the direct connection. Configure TURN on the **backend only**; do not set `NEXT_PUBLIC_TURN_*`.

1. Get TURN service details from a TURN provider, or run coturn with its REST API (`use-auth-secret` and `static-auth-secret`).
2. Set `TURN_URL` on the backend to the provider's TURN URLs. Separate multiple transports with commas, for example `turn:turn.example.com:3478?transport=udp,turn:turn.example.com:3478?transport=tcp,turns:turn.example.com:5349?transport=tcp`. Use only URLs supported by your provider.
3. For coturn REST authentication, set the shared secret as backend-only `TURN_SHARED_SECRET`; optionally set `TURN_USERNAME` as the username prefix. The backend generates one-hour credentials for each ICE configuration request. Never set the coturn shared secret as `TURN_CREDENTIAL`.
4. For a provider that issues short-lived credentials directly, set its temporary `TURN_USERNAME` and `TURN_CREDENTIAL` on the backend. Do not use a permanent provider API key as `TURN_CREDENTIAL`; provider API keys must remain server-side.
5. Redeploy the backend and check `/api/health`. It must report `"turnConfigured": true`. The authenticated `/api/webrtc/ice-servers` response should include a TURN entry. It does not expose a coturn shared secret.

The backend repository's `.env.example` lists the supported variables. In Render, configure these in the backend service's environment settings (not the frontend service). TURN is required for reliable calls on restrictive networks; do not claim cross-network support until a relay candidate and media flow are verified.

   The frontend proxies `/api` through Next.js so the authentication cookie stays first-party in mobile browsers. Set `API_PROXY_URL` to the backend's full API URL (including `/api`), and `NEXT_PUBLIC_SOCKET_URL` to the backend origin. The Render blueprint leaves these deployment-specific URLs for configuration rather than hard-coding a stale service hostname.

## Join as a guest

Anyone with an active meeting link can enter a display name and join without an account. Meeting passwords still apply. Guest access is limited to that meeting and expires after two hours. Camera and microphone are optional and can be enabled from the meeting controls; a missing or denied device does not prevent joining.

## Deploy frontend and backend on Render

The frontend and backend are in separate GitHub repositories, so deploy them with separate Render Blueprints. Each repository has its own `render.yaml`.

1. Create a Render Blueprint from the backend repository (`Sou963/videomeet-backend`). When prompted, provide `MONGODB_URI` from MongoDB Atlas and the server-side `GEMINI_API_KEY`; Render generates `JWT_SECRET`.
2. Create a second Render Blueprint from the frontend repository (`Sou963/videomeet-2.O`).
3. Make sure MongoDB Atlas permits connections from the backend service. Set TURN variables on the backend service only. Do not commit credentials or add Gemini/TURN secrets to frontend environment variables.
4. The Render URLs are configured in each repository's `render.yaml`. If you change either service URL, update `CLIENT_URL` in the backend blueprint and the API/socket URLs in the frontend blueprint.
5. Deploy both services. The backend health check is `/api/health`.

The deployment files in these repositories target Render. They do not configure Vercel or Railway. The free Render plan may spin services down while idle, so the first request after inactivity can take longer. Production video calls and translations also require valid camera/microphone permissions and a Gemini API key.

## Enable translation

Join a meeting, open its Translation panel, choose English (`en`) or Bengali (`bn`), and select **Enable Translation**. The original remote audio is muted locally while translation is enabled and restored when it is disabled. Translation status and provider errors appear in the panel. No captions or transcripts are requested or displayed.
