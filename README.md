# LabOS

LabOS is a production-oriented Hospital Laboratory Inventory Management System for Kenyan hospitals and clinics. It provides admin-controlled staff accounts, JWT authentication, role-based workspaces, inventory control, request approvals, audit logs, reporting, PDF/Excel exports, MOH 706-style summaries, system settings, and PWA installation support.

## Stack

- Frontend: React, Vite, Tailwind CSS, Recharts, Framer Motion, PWA
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT and bcrypt password hashing
- Exports: PDF and Excel

## Account Model

Public registration is disabled. Admins create and manage all staff accounts from the Staff screen.

Demo users are created only by the seed script and only when no users exist, unless `--force` is used. Demo users are normal accounts: once an admin changes a demo email or password, the old demo login stops working.

## Demo Guide

Seeded first-time testing credentials are intentionally not published in the web app UI or this online README. Use the offline demo guide or the controlled seed script for first-time testing details, then change passwords before any real facility demonstration.
<!-- LabOS fix: remove public demo credentials from project-facing documentation. -->

## Quick Start

1. Install dependencies:

   ```bash
   npm run install:all
   ```

2. Create environment files:

   ```powershell
   copy server\.env.example server\.env
   copy client\.env.example client\.env
   ```

3. Start MongoDB locally or set `MONGO_URI` to MongoDB Atlas in `server/.env`.

4. Seed starter data:

   ```bash
   npm run seed
   ```

5. Run the app:

   ```bash
   npm run dev
   ```

6. Open:

   - Frontend: http://localhost:5173
   - Backend health: http://localhost:5000/api/health

## Role Capabilities

- Admin: staff accounts, departments, system settings, inventory CRUD/deactivation, all request decisions, reports, audit logs, dashboards.
- Staff: request commodities, view own request status, read inventory, and update profile/password settings.
<!-- LabOS fix: document only Admin and Staff roles. -->

## Security Notes

- Passwords are stored as bcrypt hashes in `passwordHash`.
- Inactive users cannot sign in.
- Public self-registration is not exposed.
- Admin-only routes are protected server-side.
- Sensitive actions write audit records with actor, target, before/after data, IP address, user agent, and timestamp.
- Use a long random `JWT_SECRET` in production.

## Reports

The Reports screen exports:

- Inventory report
- Low stock report
- Expiry report
- Request report
- Usage report
- Department usage report
- Audit log report
- MOH 706 monthly laboratory summary

PDF and Excel exports are downloaded through authenticated API requests.

## LabOS Assist

LabOS Assist is a built-in, authenticated help assistant inside the web app. It appears as a floating chat button for signed-in users and gives short, role-aware guidance for Admins and Staff.
<!-- LabOS fix: assistant documentation follows the two-role model. -->

It can help with:

- Profile and password settings
- Staff management guidance for Admins
- Inventory, stock alerts, expiry alerts, and stock movement
- Request submission and approval workflows
- Partial approvals and adjustment reasons
- Audit logs and reports
- MOH 706 monthly summaries
- LAN deployment troubleshooting

Security limitations:

- LabOS Assist is help-only and read-only.
- It does not modify database records.
- It does not store chat history in MongoDB.
- It does not reveal passwords, demo credentials, JWT tokens, environment variables, database URLs, password hashes, or private server configuration.
- It answers only LabOS hospital inventory usage questions.

Future expansion can connect LabOS Assist to database-aware summaries, but keep permission checks server-side and redact sensitive fields before any generated answer.

## LAN Deployment Guide

Use one PC as the LabOS server on the facility network.

1. Install Node.js LTS and MongoDB on the server PC.
2. Find the server PC IP address:

   ```powershell
   ipconfig
   ```

3. In `server/.env`, set:

   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/labos
   CLIENT_URL=http://SERVER_IP:5173
   JWT_SECRET=replace-with-long-secret
   LABOS_SEED_PASSWORD=replace-with-temporary-facility-password
   ```

4. In `client/.env`, set:

   ```env
   VITE_API_URL=http://SERVER_IP:5000/api
   ```

5. Start the system:

   ```bash
   npm run dev
   ```

6. Other devices on the same LAN can open:

   ```text
   http://SERVER_IP:5173
   ```

For a production LAN installation, build the frontend with `npm run build --prefix client` and serve `client/dist` behind Nginx, Caddy, IIS, or Express static hosting.

## Cloud Deployment

- Backend: Render Web Service or a Node host with a stable outbound IP.
- Frontend: Vercel project, root `client`, build `npm run build`, output `dist`.
- Database: MongoDB Atlas.
- Set `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and `CLIENT_URL` in the backend host.
- Set `VITE_API_URL` in the frontend host to the backend API URL plus `/api`.

For Vercel serverless API deployments, MongoDB Atlas must allow traffic from the deployment platform. For a controlled hospital deployment, prefer a backend host with static outbound IPs and allowlist only those IPs in Atlas.

## Commands

```bash
npm run install:all
npm run seed
npm run migrate:roles
npm run dev
npm run build --prefix client
npm start --prefix server
```
