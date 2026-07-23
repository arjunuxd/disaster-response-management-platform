# 🌪️ DRMP — Disaster Response & Management Platform

A full-stack MERN application for monitoring, reporting, and managing disaster incidents across India. DRMP gives citizens a fast way to report incidents and gives administrators the tools to track, verify, and respond — all backed by real-time maps, analytics, and a role-based admin panel.

![MERN](https://img.shields.io/badge/stack-MERN-3C873A?logo=mongodb)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-18%2B-339933?logo=node.js)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Seeding an Admin User](#seeding-an-admin-user)
  - [Running Locally](#running-locally)
- [API Overview](#api-overview)
- [Frontend Routes](#frontend-routes)
- [Security](#security)
- [Production Build](#production-build)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- 📍 **Interactive incident mapping** with Leaflet — view live reports, risk zones, and shelters on a map
- 📊 **Analytics dashboards** powered by Chart.js for admins to track trends across regions and disaster types
- 🔔 **Real-time notifications** for alerts and report status updates
- 🛡️ **Role-based access control** separating public users from admins, with differing JWT expiry windows
- 🗂️ **Dynamic disaster type management** — admins can define new incident categories without a code change
- 🏕️ **Shelter and risk zone management** for coordinating response resources
- 🖼️ **Multi-image incident reports** with server-side validation (type, size, count)
- ⚡ **Optimized frontend** — 22 routes, 34+ lazy-loaded, code-split chunks for fast initial load

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, React Router 7, TailwindCSS 3, Axios |
| Maps | Leaflet 1.9, React-Leaflet 5 |
| Charts | Chart.js 4.5, react-chartjs-2 5.3 |
| Backend | Express 4, Node.js |
| Database | MongoDB (Mongoose 8) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Security | Helmet, express-rate-limit, express-mongo-sanitize, hpp, CORS |
| File Uploads | Multer (disk storage) |

## Architecture

```
Backend:   Controller → Service → Model   (3-tier)
Frontend:  Context Providers + Lazy-Loaded Route Pages
```

- **Backend** follows a clean 3-tier separation — controllers handle HTTP concerns, services hold business logic, and models manage data access via Mongoose.
- **Frontend** uses React Context for cross-cutting state (auth, notifications) and route-based code splitting to keep bundle size low across 22 routes.

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (Atlas or local instance)

### Installation

```bash
# From project root
npm run install-all
```

This installs dependencies for the root, `client/`, and `server/` in one step. Equivalent manual steps:

```bash
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/drmp
JWT_SECRET=change_me_to_a_random_secret_at_least_32_chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> ⚠️ Never commit `.env` to version control. Add it to `.gitignore` if it isn't already there.

### Database Setup

**Option A — MongoDB Atlas (Cloud, recommended for quick start)**
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Spin up a free M0 cluster
3. Create a database user and whitelist your IP
4. Copy the connection string into `MONGO_URI`

**Option B — Local MongoDB**
1. Install MongoDB Community Edition from [mongodb.com/try/download](https://www.mongodb.com/try/download/community)
2. Set `MONGO_URI=mongodb://localhost:27017/drmp`

### Seeding an Admin User

1. Start the server and register a normal user through the app
2. Open the `users` collection in MongoDB Compass (or `mongosh`)
3. Change that user's `role` field from `"user"` to `"admin"`

### Running Locally

```bash
npm run dev
```

| Service | URL |
|---|---|
| Backend  | http://localhost:5000 |
| Frontend | http://localhost:5173 |

## API Overview

| Category | Endpoints | Auth |
|---|---|---|
| Auth | 5 | Public / Protected |
| Reports | 6 | Public / Protected / Admin |
| Alerts | 5 | Public / Admin |
| Risk Zones | 5 | Public / Admin |
| Shelters | 5 | Public / Admin |
| Dashboard | 1 | Protected |
| Admin | 6 | Admin |
| Analytics | 11 | Admin |
| Notifications | 5 | Protected |
| Search | 1 | Protected |
| Disaster Types | 6 | Public / Admin |

**56 endpoints total.** For detailed request/response schemas, see `server/routes/` or generate an OpenAPI spec (see [Roadmap](#roadmap)).

## Frontend Routes

| Route | Page | Access |
|---|---|---|
| `/` | Landing page | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | Dashboard | Authenticated |
| `/reports` | My Reports | Authenticated |
| `/reports/new` | Report Incident | Authenticated |
| `/map` | Map View | Authenticated |
| `/alerts` | Alerts | Authenticated |
| `/admin` | Admin Dashboard | Admin |
| `/admin/analytics` | Analytics | Admin |
| `/admin/users` | Manage Users | Admin |
| `/admin/reports` | Manage Reports | Admin |
| `/admin/alerts` | Manage Alerts | Admin |
| `/admin/risk-zones` | Manage Risk Zones | Admin |
| `/admin/shelters` | Manage Shelters | Admin |

## Security

- **Helmet** for secure HTTP headers
- **Rate limiting** — 100 req/15min general, 20 req/15min on auth routes
- **CORS** restricted to a known origin (`CLIENT_URL`)
- **NoSQL injection prevention** via `express-mongo-sanitize`
- **HTTP parameter pollution protection** via `hpp`
- **JWT authentication** with role-based expiry — 7 days for users, 72 hours for admins
- **bcrypt** password hashing (12 rounds)
- **File upload validation** — JPEG/PNG/WebP only, 5MB max per file, 5 files max
- **TTL indexes** — alerts auto-expire, notifications auto-delete after 30 days

## Production Build

```bash
cd client && npm run build
```

Output goes to `client/dist/`. Serve it via Express as static files, or place nginx in front as a reverse proxy for better caching and TLS termination.

## Roadmap

- [ ] OpenAPI/Swagger documentation for all 56 endpoints
- [ ] Automated tests (unit + integration)
- [ ] Docker Compose setup for one-command local dev
- [ ] CI pipeline (lint, test, build) on pull requests
- [ ] Push notifications (web push / FCM)

## Contributing

Contributions are welcome! Please open an issue to discuss significant changes before submitting a pull request.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push and open a PR

## License

This project is licensed under the MIT License. See `LICENSE` for details.