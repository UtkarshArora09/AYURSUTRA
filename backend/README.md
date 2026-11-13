
## Local setup and database upgrades

Use Node.js 22 and a PostgreSQL database dedicated to AyurSutra. Run these commands from the repository root.

1. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` and a strong `JWT_SECRET`.
2. In `backend`, run `npm ci` and `npm start`. The server applies the versioned SQL files in `database/migrations` before listening. `GET /health/ready` checks PostgreSQL connectivity.
3. To create the first admin, set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in your shell and run `node createAdmin.js` from `backend`. Then sign in and use the admin dashboard to create staff accounts.
4. In `frontend`, run `npm ci` and `npm run dev`. The development server proxies API requests to port 5000. Configure `VITE_API_BASE_URL` when deploying the frontend separately.

Use an empty disposable database for `npm test` in `backend`. Set `NODE_ENV=test`, `HOST=127.0.0.1`, `PORT=0`, and `DATABASE_URL` in the shell. The integration suite creates synthetic accounts and clinic data.

For an existing deployment, take a database backup and test the migrations against a staging copy. Reset passwords for staff accounts created by the old seed scripts and rotate any credentials previously committed to Git. Reissue open password reset links, which now use hashed tokens. Queue tickets are stored in PostgreSQL after this update. Review and restrict the legacy Firebase instance before retiring it, and plan a cutover for any outstanding tickets. The chatbot can answer general questions and run the quiz. Patient record access is handled in the authenticated portal.

## Scheduling and queue operation

In the admin dashboard, set doctors' recurring shifts at each branch and record leave dates. Enter room capacity and each therapy's duration in minutes. Patients choose from available times in the configured shifts. Existing bookings keep their stored duration, which defaults to 90 minutes for bookings created before this update. Configure shifts before offering branch bookings.

Doctors can assign a therapist who is linked to their account, confirm sessions, and upload PDF reports up to 5 MB. Patients can download their own reports and see invoice history. Staff can record internal session notes, which are hidden from the patient timeline.

The queue uses authenticated server-sent events. Configure a reverse proxy to allow streaming responses. Select a date, branch, and service in the staff queue. Call the next ticket and mark it served when the consultation ends. The estimated wait uses the last 30 days of completed consultations for that branch and service, and is shown after service-time data is available.

The API stores appointment email jobs in PostgreSQL and retries failed deliveries. Set `EMAIL_USER` and `EMAIL_PASS` to enable the worker. The current setup uses Gmail SMTP.
