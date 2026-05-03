# Petrol Bunk Calculator

Full-stack petrol bunk management app with:

- Public homepage and about route
- React frontend
- Node.js + Express backend
- PostgreSQL database
- JWT authentication
- Monthly dashboard with pie chart
- Day-wise tracker calendar
- Daily nozzle entry management
- WhatsApp and email sharing

## Project structure

- `client/` - React + Vite frontend
- `server/` - Express API and PostgreSQL integration

## Local setup

1. Copy `server/.env.example` to `server/.env`
2. Update the PostgreSQL connection string for your local database
3. Install dependencies:

```bash
npm install
```

4. Run migrations:

```bash
npm run db:migrate
```

5. Start the app:

```bash
npm run dev
```

Frontend dev URL: `http://localhost:5173` or the next free Vite port

Backend dev URL: `http://localhost:4000`

Main routes:

- `/` - Public homepage
- `/about` - Product overview
- `/login` - Login
- `/register` - Registration
- `/dashboard` - Protected app dashboard

## PostgreSQL database

You mentioned a local database named `Petrol Bunk Calculator`.
Use a URL like this in `server/.env`:

```text
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/Petrol%20Bunk%20Calculator
```

## Render deployment

- This repo includes `render.yaml` for a single Node web service deployment.
- Run build: `npm install && npm run build`
- Run start: `npm run start`
- The backend serves the built React app in production, so one Render web service is enough.
- Set `DATABASE_URL` to your production PostgreSQL connection string.
- Set `CLIENT_ORIGIN` to your Render app URL after the first deploy.
