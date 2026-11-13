
## Local setup and database upgrades

Use Node.js 22 and a PostgreSQL database dedicated to AyurSutra. Run these commands from the repository root.

1. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` and a strong `JWT_SECRET`.
2. In `backend`, run `npm ci` and `npm start`. The server applies the versioned SQL files in `database/migrations` before listening. `GET /health/ready` checks PostgreSQL connectivity.
3. To create the first admin, set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in your shell and run `node createAdmin.js` from `backend`. Then sign in and use the admin dashboard to create staff accounts.
4. In `frontend`, run `npm ci` and `npm run dev`. The development server proxies API requests to port 5000. Configure `VITE_API_BASE_URL` when deploying the frontend separately.

Use an empty disposable database for `npm test` in `backend`. Set `NODE_ENV=test`, `HOST=127.0.0.1`, `PORT=0`, and `DATABASE_URL` in the shell. The integration suite creates synthetic accounts and clinic data.

For an existing deployment, take a database backup and test the migrations against a staging copy. Reset passwords for staff accounts created by the old seed scripts and rotate any credentials previously committed to Git. Reissue open password reset links, which now use hashed tokens. Queue tickets are stored in PostgreSQL after this update. Review and restrict the legacy Firebase instance before retiring it, and plan a cutover for any outstanding tickets. The chatbot can answer general questions and run the quiz. Patient record access is handled in the authenticated portal.
