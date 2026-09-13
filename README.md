# OptiRail — Intelligent Railway Journey Planner

OptiRail is a full-stack, date-aware railway itinerary planner designed to compute optimal multi-train connections, layovers, and on-time reliability metrics across complex railway networks.

---

## Features

- **Multi-Hop Railway Routing**: Computes optimal multi-train itineraries with transfers using Dijkstra-based graph search.
- **Date-Aware Schedules**: Supports weekly train operating schedules, leap year calendar math, and midnight day-rollovers.
- **Reliability Scoring**: Calculates normalized reliability ratings (0–100%) based on historical delay probabilities and transfer windows.
- **User Accounts & Saved Journeys**: Full Express/MongoDB JWT authentication allowing travelers to bookmark and manage saved routes.
- **Google-Style Clean Interface**: Responsive React frontend built with Vite, TailwindCSS, and Lucide Icons.

---

## Tech Stack

### Frontend (`/client`)
- **Framework**: React 18 + Vite 5 + TypeScript
- **Styling**: TailwindCSS + Lucide Icons
- **State & HTTP**: React Router 6, TanStack Query, Axios

### Backend (`/server`)
- **Runtime**: Node.js + Express + TypeScript
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JWT (`jsonwebtoken`) + Password Hashing (`bcrypt`)
- **Algorithms**: Decoupled Graph Builder & Dijkstra Search Engine

---

## Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (Local MongoDB at `mongodb://127.0.0.1:27017` or MongoDB Atlas)

---

### Installation & Setup

1. **Clone Repository**:
   ```bash
   git clone https://github.com/your-username/optirail.git
   cd optirail
   ```

2. **Backend Setup (`/server`)**:
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in `/server`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/optirail
   JWT_SECRET=super_secret_optirail_jwt_signature_key_2026
   JWT_EXPIRES_IN=7d
   ```
   Seed database with initial station and train datasets:
   ```bash
   npm run seed
   ```

3. **Frontend Setup (`/client`)**:
   ```bash
   cd ../client
   npm install
   ```

---

## Running the Application

- **Start Backend Server**:
  ```bash
  cd server
  npm run dev
  ```
  Backend will run at: `http://localhost:5000`

- **Start Frontend Dev Server**:
  ```bash
  cd client
  npm run dev
  ```
  Frontend will run at: `http://localhost:3000`

---

## Testing & Verification Scripts

Run verification commands inside the `/server` directory:

| Command | Description |
| :--- | :--- |
| `npm run validate` | Validates raw JSON station & train datasets for referential integrity. |
| `npm run seed` | Populates MongoDB with stations, trains, and train stop schedules. |
| `npm run verify` | Runs database aggregation checks. |
| `npm run test-planner` | Runs Dijkstra journey planning algorithm tests. |
| `npm run test-topk` | Tests Top-K itinerary ranking engine. |
| `npm run test-date-aware` | Executes date & schedule validation test suite. |

---

## Production Build

To build both client and server for production deployment:

```bash
# Server Build
cd server
npm run build

# Client Build
cd ../client
npm run build

# Monorepo Build (from root)
npm run build
```

---

## Vercel Deployment Guide

### Option 1: All-In-One Monorepo Deployment (Recommended)
1. Push all latest changes to GitHub:
   ```bash
   git add .
   git commit -m "Configure Vercel deployment and serverless entrypoint"
   git push origin main
   ```
2. In [Vercel Dashboard](https://vercel.com/dashboard):
   - Click **Add New Project** and select your GitHub repository (`optirail`).
   - Keep Root Directory as `./` (default).
   - Under **Environment Variables**, add:
     - `MONGODB_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`).
     - `JWT_SECRET`: A secure random string for JWT token signing.
   - Click **Deploy**. Vercel will automatically build both static client assets and serverless `/api` endpoints!

### Option 2: Frontend-Only on Vercel + Backend on Render/Railway
If deploying the server separately on Render/Railway:
- In Vercel Project Settings for Frontend:
  - Set **Root Directory** to `client`.
  - Set **Environment Variable** `VITE_API_URL` to `https://your-backend-api.onrender.com/api`.


---

## License

MIT License. Developed for railway routing optimization.
