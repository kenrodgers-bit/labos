# LabOS

LabOS is a production-oriented Hospital Laboratory Inventory Management System for Kenyan hospitals and clinics. It includes JWT authentication, role-based access, inventory control, partial approval workflows, audit logs, reporting, PDF/Excel exports, MOH 706-style monthly summaries, and PWA installation support.

## Stack

- Frontend: React, Vite, Tailwind CSS, Recharts, Framer Motion, PWA
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT and bcrypt password hashing
- Exports: PDF and Excel

## Quick Start

1. Install dependencies:

   ```bash
   npm run install:all
   ```

2. Create environment files:

   ```bash
   copy .env.example server\.env
   copy .env.example client\.env
   ```

3. Start MongoDB locally or set `MONGO_URI` to MongoDB Atlas in `server/.env`.

4. Seed starter data with a facility-controlled password:

   ```powershell
   $env:LABOS_SEED_PASSWORD="<set-a-strong-temporary-password>"
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

- Admin: staff accounts, departments, permissions, inventory CRUD, all request decisions, reports, audit logs, dashboards.
- Commodity Manager: approval queue, stock alerts, reports, audit visibility.
- Lab Staff: request commodities, view own request status, inventory visibility.

## Approval Logic

Requests store requested quantity, approved quantity, adjustment reason, adjusted by, approved by, and approval timestamp. Stock is reduced only when a request is approved or partially approved. Rejections do not affect stock.

## Reports

The Reports screen exports:

- Inventory report
- Request report
- Usage report
- Department usage report
- Audit logs
- MOH 706 monthly laboratory summary

PDF exports and Excel exports are downloaded through authenticated API requests.

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

- Backend: Render Web Service, build `npm install`, start `npm start`, root `server`.
- Frontend: Vercel project, root `client`, build `npm run build`, output `dist`.
- Database: MongoDB Atlas, set `MONGO_URI` in Render.
- Set `VITE_API_URL` in Vercel to the Render API URL plus `/api`.
- Set `CLIENT_URL` in Render to the Vercel frontend URL.

For Vercel serverless API deployments, MongoDB Atlas must allow traffic from the deployment platform. For a controlled hospital deployment, prefer a backend host with static outbound IPs and allowlist only those IPs in Atlas. For a short demonstration, Atlas can temporarily allow `0.0.0.0/0`, then be tightened immediately after the demo.

## Environment Variables

See `.env.example`.

Important production notes:

- Use a long random `JWT_SECRET`.
- Use HTTPS for cloud deployment.
- Restrict CORS to known client URLs.
- Do not publish or display seeded account credentials.
- Rotate bootstrap passwords before real hospital use.
- Create individual staff accounts through the Admin Staff screen.
