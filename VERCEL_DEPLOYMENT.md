# Vercel Deployment Guide for BloodBank Management System (BBMS)

This project is configured for **unified full-stack deployment on Vercel**, running both the **React/Vite frontend** and **Express/Node.js backend** together under a single domain—using the exact production deployment architecture as **MentorConnect**.

---

## Architecture Overview

```
                           ┌───────────────────────────────┐
                           │   Vercel Deployment (Domain)   │
                           └──────────────┬────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  │                                               │
       Requests to /api/*                              All other routes (/*)
                  │                                               │
                  ▼                                               ▼
       ┌─────────────────────┐                         ┌─────────────────────┐
       │   Express Server    │                         │  Vite React Client  │
       │  (@vercel/node)     │                         │ (@vercel/static)    │
       │  server/server.js   │                         │  client/dist        │
       └──────────┬──────────┘                         └─────────────────────┘
                  │
                  ▼
       ┌─────────────────────┐
       │   MongoDB Atlas     │
       │   (Cloud Database)  │
       └─────────────────────┘
```

- **Vercel Serverless Function (`server/server.js`)**: Serves all API requests under `/api/*`. Database connections are cached and reused across invocations.
- **Vite Static Build (`client/package.json`)**: Pre-rendered and distributed via Vercel Edge CDN with HTML5 client-side routing fallback (`index.html`).
- **Unified Domain**: No CORS issues or external backend hosting needed—`/api` points directly to the serverless function on the same origin.

---

## Step 1: Set Up MongoDB Atlas (Cloud Database)

> [!IMPORTANT]
> Because Vercel functions are serverless, the local Docker MongoDB container (`mongodb://mongo:27017`) cannot be reached. You must use a cloud-hosted MongoDB database (e.g., free M0 cluster on MongoDB Atlas).

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign in or create a free account.
2. Create a new **Free Shared Cluster** (M0).
3. Under **Security → Database Access**:
   - Create a database user with **Read and write to any database** privileges.
   - Note the username and password.
4. Under **Security → Network Access**:
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) — required because Vercel serverless IPs change dynamically.
5. Under **Database → Clusters → Connect**:
   - Choose **Drivers** (Node.js).
   - Copy your connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/bloodbank?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database credentials.

---

## Step 2: Push Code to GitHub

Ensure all recent changes are committed and pushed to your GitHub repository:

```bash
git add .
git commit -m "Configure full-stack deployment for Vercel"
git push origin main
```

---

## Step 3: Import Project to Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository (`BloodBank-Management-System-BBMS-`).
4. In the Project Configuration screen:
   - **Framework Preset**: Leave as default / **Other** (Vercel automatically detects `vercel.json`).
   - **Root Directory**: `./` (leave empty or root; **do NOT** set it to `client` or `server`).
   - **Build and Output Settings**: Leave toggles **OFF** (the settings in `vercel.json` manage both builds).

---

## Step 4: Configure Environment Variables in Vercel

In the **Environment Variables** section on Vercel, add the following:

### Required Variables

| Key | Example / Default | Description |
| :--- | :--- | :--- |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster0.../bloodbank` | Your MongoDB Atlas connection URI |
| `NODE_ENV` | `production` | Production environment flag |
| `JWT_SECRET` | `super_secure_random_key_min_32_chars` | Secret key for signing JWT tokens |
| `JWT_EXPIRE` | `7d` | Token validity duration |
| `JWT_COOKIE_EXPIRE` | `7` | Cookie expiration in days |
| `MAX_FILE_SIZE` | `5242880` | Maximum file upload size in bytes (5 MB) |

### Optional / Feature Variables (Match your existing `.env`)

| Key | Description |
| :--- | :--- |
| `CLIENT_URL` | Frontend domain(s) for CORS (CORS also automatically allows all `*.vercel.app` domains) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID for Google login |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `GEMINI_API_KEY` | Google Gemini API key for AI chat assistant |
| `GEMINI_MODEL` | Gemini AI model (e.g. `gemini-1.5-flash` or `gemini-2.5-flash`) |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key for cloud avatar/file uploads |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint |
| `SMTP_HOST` | SMTP host for email notifications (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (`587`) |
| `SMTP_USER` | SMTP email address |
| `SMTP_PASS` | SMTP app password |
| `FROM_EMAIL` | Sender email address (`noreply@bbms.com`) |
| `FROM_NAME` | Sender display name (`BBMS`) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `TELEGRAM_BOT_USERNAME` | Telegram bot username |

---

## Step 5: Deploy & Verify

1. Click **Deploy**.
2. Once the build completes:
   - Visit `https://<your-project>.vercel.app/api/health` to verify the backend serverless function is live. You should see:
     ```json
     {
       "success": true,
       "message": "BBMS API is running",
       "version": "2.0.0",
       "features": ["multi-branch", "real-time", "geo-location", "automated-inventory"],
       "timestamp": "..."
     }
     ```
   - Visit `https://<your-project>.vercel.app` to see the React frontend.
   - Navigate to `/login`, `/inventory`, or `/locator` to test client-side routing.

---

## Local Development (Both Frontend + Backend)

To develop locally with both frontend and backend running concurrently (matching MentorConnect):

```bash
# 1. Install all dependencies (root, server, and client)
npm run install-all

# 2. Run both server and client concurrently
npm run dev

# Or run separately:
npm run server  # Backend on http://localhost:5000
npm run client  # Frontend on http://localhost:5173
```
