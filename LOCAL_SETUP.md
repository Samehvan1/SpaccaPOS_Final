# Spacca POS — Local Setup Guide (Windows 11)

## Prerequisites

Install the following before continuing:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 24 or later | https://nodejs.org (choose LTS 24) |
| pnpm | 9 or later | `npm install -g pnpm` (after Node.js) |
| PostgreSQL | 16 or later | https://www.postgresql.org/download/windows/ |
| Git | Any | https://git-scm.com/download/win |

> During PostgreSQL installation, you will be asked to set a password for the `postgres` user. **Remember this password** — you will need it in Step 3.

---

## Step 1 — Get the code

Clone the repository (or download and extract the ZIP), then open **Windows Terminal** or **PowerShell** in the project root folder:

```powershell
git clone <your-repo-url> spacca-pos
cd spacca-pos
```

---

## Step 2 — Install dependencies

```powershell
pnpm install
```

---

## Step 3 — Create the database

Open the **pgAdmin** app that was installed with PostgreSQL (or use psql).  
Create a new empty database called `spacca`:

```sql
CREATE DATABASE spacca;
```

Or via psql in PowerShell:

```powershell
psql -U postgres -c "CREATE DATABASE spacca;"
```

---

## Step 4 — Create environment files

Create the following two `.env` files exactly as shown.  
Replace `YOUR_POSTGRES_PASSWORD` with the password you set during PostgreSQL installation.

### `artifacts/api-server/.env`

```env
# Port the API server listens on
PORT=8080

# PostgreSQL connection string
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/spacca

# Session encryption secret — any long random string is fine for local dev
SESSION_SECRET=local-dev-secret-change-in-production

# Node environment
NODE_ENV=development
```

### `artifacts/spacca-pos/.env`

```env
# Port the frontend dev server listens on
PORT=3000

# Base path — must be "/" for local development
BASE_PATH=/
```

### `lib/db/.env`

```env
# Must match the DATABASE_URL above
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/spacca
```

---

## Step 5 — Push the database schema

This creates all the tables and seeds the initial data (users, sample drinks, ingredients):

```powershell
$env:DATABASE_URL = "postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/spacca"
pnpm --filter @workspace/db run push
```

> You only need to run this once (or again after schema changes).

---

## Step 6 — Run the API server

Open a **new PowerShell window** and run:

```powershell
cd path\to\spacca-pos

$env:PORT            = "8080"
$env:DATABASE_URL    = "postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/spacca"
$env:SESSION_SECRET  = "local-dev-secret-change-in-production"
$env:NODE_ENV        = "development"

pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/api-server run start
```

You should see:

```
[INFO]: Server listening  port: 8080
```

---

## Step 7 — Run the frontend

Open a **second PowerShell window** and run:

```powershell
cd path\to\spacca-pos

$env:PORT      = "3000"
$env:BASE_PATH = "/"

pnpm --filter @workspace/spacca-pos run dev
```

You should see:

```
VITE ready in ...ms
➜  Local: http://localhost:3000/
```

---

## Step 8 — Open the app

Go to **http://localhost:3000** in your browser.

---

## Login PINs

| Name | Role | PIN |
|------|------|-----|
| Admin | admin | `000000` |
| Sarah | barista | `111111` |
| James | barista | `222222` |
| Spacca POS | front desk kiosk | `999999` |

---

## Optional: Start scripts (double-click to launch)

To avoid typing env vars every time, save these as `.bat` files in the project root.

### `start-api.bat`

```bat
@echo off
set PORT=8080
set DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/spacca
set SESSION_SECRET=local-dev-secret-change-in-production
set NODE_ENV=development

call pnpm --filter @workspace/api-server run build
call pnpm --filter @workspace/api-server run start
pause
```

### `start-frontend.bat`

```bat
@echo off
set PORT=3000
set BASE_PATH=/

call pnpm --filter @workspace/spacca-pos run dev
pause
```

Double-click `start-api.bat` first (wait for "Server listening"), then double-click `start-frontend.bat`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `pnpm: command not found` | Run `npm install -g pnpm` then close and reopen PowerShell |
| `Error: PORT environment variable is required` | You skipped setting `$env:PORT` — re-read Steps 6 & 7 |
| `Error: DATABASE_URL must be set` | You skipped setting `$env:DATABASE_URL` — check Step 5 & 6 |
| `password authentication failed for user "postgres"` | Wrong password in `DATABASE_URL` — update it to match what you set during PostgreSQL install |
| `database "spacca" does not exist` | Run Step 3 to create the database first |
| `ECONNREFUSED` on API calls in browser | The API server (Step 6) is not running — start it first |
| Browser shows blank page | The frontend (Step 7) is not running — check the PowerShell window for errors |
| `@replit/vite-plugin-*` import error | These plugins are Replit-only; they are skipped automatically when `REPL_ID` is not set — safe to ignore |

---

## How the two services connect

```
Browser (http://localhost:3000)
    │
    ├── Static UI    →  Vite frontend  (port 3000)
    │
    ├── /api/*       →  Express API server  (port 8080)
    │
    └── /uploads/*   →  Express API server  (port 8080)  ← drink images
```

The frontend makes all its API calls to `/api/...` which Vite proxies to `http://localhost:8080` during development.
Drink images uploaded via the Admin are stored on the API server and served via `/uploads/...`, also proxied through Vite.

> **Note:** If you see CORS errors in the browser console, make sure both services are running and the ports match exactly what you set in the `.env` files.
