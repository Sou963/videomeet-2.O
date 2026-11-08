# VideoMeet

VideoMeet is a full-stack video conferencing application with native WebRTC calls, Socket.IO signaling and collaboration, an Express API, MongoDB persistence, and a Next.js App Router frontend.

## Features

- User authentication and meeting management.
- Peer-to-peer video, audio, and screen sharing.
- Socket.IO chat, reactions, hand raising, and host announcements.
- Optional Bengali ↔ English, audio-only translation through Gemini Live API.
- Each participant chooses their own listening language; speech source language is detected by Gemini.

## Translation architecture

The browser captures only incoming remote WebRTC audio, resamples it to 16-bit mono PCM at 16 kHz, and streams it directly to the Gemini Live API. Generated 24 kHz PCM audio is played in the same browser. Audio is never sent through Express or Socket.IO, and local microphone tracks are not used as translation input.

The authenticated Express endpoint `POST /api/gemini/live-token` checks meeting membership and returns a one-use, short-lived Gemini token. The permanent API key remains in `server/.env`. Client translation configuration is intentionally unlocked in the token constraints so each participant can choose a target language; response modality remains audio-only.

## Requirements

- Node.js 22 or later (required by the installed `@google/genai` SDK).
- MongoDB.
- A Gemini API key with access to `gemini-3.5-live-translate-preview`.

## Setup and startup

1. Configure the backend environment in `server/.env`:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:3000
   GEMINI_API_KEY=your_gemini_api_key
   ```

2. Start the backend:

   ```powershell
   cd server
   npm install
   npm run dev
   ```

3. Configure the frontend environment in `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

4. Start the frontend from the repository root:

   ```powershell
   npm install
   npm run dev
   ```

   Open `http://localhost:3000`. Never place `GEMINI_API_KEY` in a `NEXT_PUBLIC_*` variable or browser storage.

## Deploy frontend and backend on Render

The frontend and backend are in separate GitHub repositories, so deploy them with separate Render Blueprints. Each repository has its own `render.yaml`.

1. Create a Render Blueprint from the backend repository (`Sou963/videomeet-backend`). When prompted, provide `MONGODB_URI` from MongoDB Atlas and the server-side `GEMINI_API_KEY`; Render generates `JWT_SECRET`.
2. Create a second Render Blueprint from the frontend repository (`Sou963/videomeet-2.O`).
3. Make sure MongoDB Atlas permits connections from the backend service. Do not commit credentials or add Gemini keys to frontend environment variables.
4. The Render URLs are configured in each repository's `render.yaml`. If you change either service URL, update `CLIENT_URL` in the backend blueprint and the API/socket URLs in the frontend blueprint.
5. Deploy both services. The backend health check is `/api/health`.

The free Render plan may spin services down while idle, so the first request after inactivity can take longer. Production video calls and translations also require valid camera/microphone permissions and a Gemini API key.

## Enable translation

Join a meeting, open its Translation panel, choose English (`en`) or Bengali (`bn`), and select **Enable Translation**. The original remote audio is muted locally while translation is enabled and restored when it is disabled. Translation status and provider errors appear in the panel. No captions or transcripts are requested or displayed.
