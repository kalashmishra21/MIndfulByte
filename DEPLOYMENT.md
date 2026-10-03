# Render deployment and login verification

Use the existing Render services when present; do not create duplicates. The Blueprint describes both the backend and static frontend. Existing manually-created services need their settings updated separately.

Backend: root `backend/server`, build `npm ci --omit=dev`, start `npm start`, Node 22, health check `/health`.
Frontend: root `frontend`, build `npm ci && npm run build`, publish `dist`, rewrite `/*` to `/index.html`.

Required backend environment:
- `MONGO_URI`: use the current MongoDB connection string for the existing database. The deployed hostname currently fails DNS lookup (`querySrv ENOTFOUND`), so copy a fresh URI from MongoDB Atlas after confirming the cluster is active. The old URI and database password were committed publicly; rotate that database user password and update this value in Render.
- `JWT_SECRET`: use a new random secret. The previous value was committed in the public repository, so rotating it is necessary and signs out sessions created with the old value.
- `FRONTEND_URL`: actual frontend origin (comma-separated if needed), no path.
- `GOOGLE_CLIENT_ID`: Google Web OAuth client ID, matching the frontend.
- `BACKEND_URL`: optional public backend origin for profile image URLs.

Required frontend build environment:
- `VITE_API_BASE_URL`: actual backend HTTPS origin, optionally ending in `/api`. Set before building and redeploy after changes.
- `VITE_GOOGLE_CLIENT_ID`: same Web OAuth client ID as the backend.

In Google Cloud, add the actual frontend origin under Authorized JavaScript origins. The new Google button returns an ID token which the backend verifies. It does not use the legacy redirect callback or require a Google client secret. Google accounts without a family name are supported. Existing non-Gmail/non-Workspace password accounts must keep using their existing sign-in method rather than being automatically linked.

The health workflow defaults to the existing backend `https://mindfulbyte.onrender.com`, verified from the live frontend bundle. Override GitHub repository Actions variable `BACKEND_URL` if the backend moves. It requests `/health` every five minutes and reports `/ready` as a warning when the database is down. GitHub scheduling can be delayed and public-repository schedules can be disabled after inactivity; this is not an always-on guarantee. Render free instance-hour limits still apply. Choose an always-on Render instance if guaranteed avoidance of idle spin-down is required.

`/health` checks the running process; `/ready` also checks the database connection. API requests fail promptly with 503 when the database is disconnected instead of buffering login queries. Frontend requests time out after 20 seconds and show an actionable error; opening the app sends a best-effort warm-up request.

Do not switch to SQLite on an ephemeral Render filesystem: a persistent disk and an explicit data migration would be needed. Existing profile uploads are also ephemeral without durable storage; this patch does not migrate old images.

Verification:
1. `cd backend/server && npm ci && npm test` (HTTP auth regressions with stubbed persistence/Google verifier; no production DB writes).
2. `cd frontend && npm ci && npm run build`.
3. After deploying with a valid MongoDB URI, check `/health` and `/ready`, sign in with an existing password account, refresh a protected page, and sign in with Google using the configured frontend origin.
4. Check Render deploy logs and GitHub health workflow. A local build alone does not verify production credentials, Google Console configuration, or the live database.
