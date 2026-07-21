   # DRMP - Project Summary & Manual Setup Guide

   ## Project Overview

   **DRMP (Disaster Response & Management Platform)** is a full-stack MERN (MongoDB, Express, React, Node.js) application built for monitoring, reporting, and managing disaster incidents across India. It features role-based access (user/admin), real-time notifications, interactive Leaflet maps with OpenStreetMap location picker, analytics dashboards with Chart.js, and a complete admin panel with dynamic disaster type management.

   ---

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

   ---

   ## Architecture

   **Backend Pattern:** Controller -> Service -> Model (3-tier)

   - **Controllers** handle HTTP request/response, input validation, and call services
   - **Services** contain all business logic and database queries
   - **Models** define Mongoose schemas with validation rules and indexes

   **Frontend Pattern:** Context providers + lazy-loaded route pages

   - Context providers: AuthProvider, NotificationProvider, ToastProvider, MapProvider
   - All 22 pages are lazy-loaded via React.lazy + Suspense
   - Code-split into 34+ chunks for optimal bundle size

   ---

   ## Database Models

   ### User
   | Field | Type | Notes |
   |---|---|---|
   | fullName | String | Required, 2-100 chars |
   | email | String | Required, unique, lowercase |
   | password | String | Required, min 6 chars, hashed with bcrypt (12 rounds), hidden by default |
   | role | String | `user` or `admin`, default: `user` |
   | phone | String | Optional, validated regex |
   | isActive | Boolean | Default: `true` |

   **Methods:** `comparePassword()`, `generateJwtToken()`, `toPublicJSON()`

   ### Report
   | Field | Type | Notes |
   |---|---|---|
   | reportType | String | Any string (dynamic disaster type — admin-managed via `/api/disaster-types`) |
   | title | String | Required, 3-200 chars |
   | description | String | Required, 10-2000 chars |
   | images | [String] | Up to 5 image paths |
   | latitude / longitude | Number | Required, geo-indexed |
   | district / state | String | Required |
   | severity | String | `Low`, `Medium`, `High`, `Critical` |
   | status | String | `Pending`, `Verified`, `Rejected`, `Resolved` |
   | reportedBy | ObjectId -> User | Required |
   | verifiedBy | ObjectId -> User | Optional |

   ### Alert
   | Field | Type | Notes |
   |---|---|---|
   | title / message | String | Required |
   | priority | String | `Low`, `Medium`, `High`, `Emergency` |
   | affectedDistricts | [String] | At least 1 |
   | expiresAt | Date | TTL index - auto-deletes expired alerts |
   | isActive | Boolean | Default: `true` |

   ### RiskZone
   | Field | Type | Notes |
   |---|---|---|
   | zoneName | String | Required, 2-150 chars |
   | district / state / latitude / longitude | -- | Required, geo-indexed |
   | riskLevel | String | `Low`, `Moderate`, `High`, `Critical` |

   ### EmergencyShelter
   | Field | Type | Notes |
   |---|---|---|
   | shelterName / address / district | String | Required |
   | latitude / longitude | Number | Required |
   | capacity | Number | Min 1 |
   | contactNumber | String | Validated |
   | status | String | `Open` or `Closed` |

   ### Notification
   | Field | Type | Notes |
   |---|---|---|
   | user | ObjectId -> User | Indexed |
   | type | String | `report_verified`, `report_rejected`, `report_resolved`, `report_submitted`, `new_alert`, `new_user`, `account_update`, `system_event` |
   | title / message | String | Required |
   | link / relatedId | -- | Optional routing info |
   | read | Boolean | Default: `false` |

   **Note:** Has a 30-day TTL index that auto-deletes old notifications.

   ### DisasterType
   | Field | Type | Notes |
   |---|---|---|
   | name | String | Required, unique, 2-100 chars |
   | description | String | Optional, max 500 chars |
   | isActive | Boolean | Default: `true` — controls whether users can select it |
   | isDefault | Boolean | Default: `false` — true for the 17 built-in types that seed on first run |

   **Default types seeded on server start:** Flood, Flash Flood, Cyclone, Storm Surge, Coastal Erosion, Landslide, Earthquake, Fire Accident, Building Collapse, Road Accident, Tree Fall, Heavy Rain, Heat Wave, Water Logging, Medical Emergency, Chemical Leak, Other

   ---

   ## API Endpoints (58 total)

   ### Auth (5 endpoints)
   | Method | Endpoint | Auth | Description |
   |---|---|---|---|
   | POST | `/api/auth/register` | Public | Register new user |
   | POST | `/api/auth/login` | Public | Login, returns JWT |
   | GET | `/api/auth/me` | Protected | Get current user |
   | PUT | `/api/auth/me` | Protected | Update profile |
   | PUT | `/api/auth/change-password` | Protected | Change password |

   ### Reports (6 endpoints)
   | Method | Endpoint | Auth | Description |
   |---|---|---|---|
   | POST | `/api/reports` | Protected | Create report (multipart with images) |
   | GET | `/api/reports` | Public | List reports (paginated, filterable) |
   | GET | `/api/reports/:id` | Public | Get single report |
   | PUT | `/api/reports/:id` | Protected | Update report |
   | DELETE | `/api/reports/:id` | Admin | Delete report |
   | PATCH | `/api/reports/:id/status` | Admin | Update status + auto-creates notification |

   ### Alerts (5 endpoints)
   | Method | Endpoint | Auth | Description |
   |---|---|---|---|
   | POST | `/api/alerts` | Admin | Create alert (notifies all active users) |
   | GET | `/api/alerts` | Public | List alerts (`?active=true` filter) |
   | GET | `/api/alerts/:id` | Public | Get single alert |
   | PUT | `/api/alerts/:id` | Admin | Update alert |
   | DELETE | `/api/alerts/:id` | Admin | Delete alert |

   ### Risk Zones (5 endpoints)
   | Method | Endpoint | Auth | Description |
   |---|---|---|---|
   | POST | `/api/risk-zones` | Admin | Create risk zone |
   | GET | `/api/risk-zones` | Public | List all risk zones |
   | GET | `/api/risk-zones/:id` | Public | Get single risk zone |
   | PUT | `/api/risk-zones/:id` | Admin | Update risk zone |
   | DELETE | `/api/risk-zones/:id` | Admin | Delete risk zone |

   ### Shelters (5 endpoints)
   | Method | Endpoint | Auth | Description |
   |---|---|---|---|
   | POST | `/api/shelters` | Admin | Create shelter |
   | GET | `/api/shelters` | Public | List all shelters |
   | GET | `/api/shelters/:id` | Public | Get single shelter |
   | PUT | `/api/shelters/:id` | Admin | Update shelter |
   | DELETE | `/api/shelters/:id` | Admin | Delete shelter |

   ### Dashboard (1 endpoint)
   | Method | Endpoint | Auth | Description |
   |---|---|---|---|
   | GET | `/api/dashboard` | Protected | User dashboard stats |

   ### Admin (6 endpoints)
   | Method | Endpoint | Auth | Description |
   |---|---|---|---|
   | GET | `/api/admin/dashboard` | Admin | Admin overview stats |
   | GET | `/api/admin/users` | Admin | List users (paginated, searchable) |
   | GET | `/api/admin/users/:id` | Admin | Get user by ID |
   | DELETE | `/api/admin/users/:id` | Admin | Delete user |
   | PATCH | `/api/admin/users/:id/toggle-status` | Admin | Toggle active/inactive |
   | PATCH | `/api/admin/users/:id/role` | Admin | Update user role |

   ### Analytics (11 endpoints, all Admin-only)
   | Method | Endpoint | Description |
   |---|---|---|
   | GET | `/api/analytics/overview` | Full overview stats |
   | GET | `/api/analytics/reports-by-month` | Reports trend by month |
   | GET | `/api/analytics/reports-by-district` | Reports by district |
   | GET | `/api/analytics/reports-by-type` | Dynamic disaster type breakdown (admin-managed) |
   | GET | `/api/analytics/reports-by-severity` | Severity distribution |
   | GET | `/api/analytics/reports-by-status` | Status distribution |
   | GET | `/api/analytics/alerts-by-priority` | Alert priority breakdown |
   | GET | `/api/analytics/risk-zones-by-level` | Risk level breakdown |
   | GET | `/api/analytics/shelters-by-status` | Shelter open/closed ratio |
   | GET | `/api/analytics/recent-activity` | Recent activity feed |
   | GET | `/api/analytics/export/:type` | Export data (reports/alerts/risk-zones/users) |

   ### Notifications (5 endpoints)
   | Method | Endpoint | Auth | Description |
   |---|---|---|---|
   | GET | `/api/notifications` | Protected | List notifications (paginated) |
   | GET | `/api/notifications/unread-count` | Protected | Get unread count |
   | PATCH | `/api/notifications/:id/read` | Protected | Mark one as read |
   | PATCH | `/api/notifications/read-all` | Protected | Mark all as read |
   | DELETE | `/api/notifications/:id` | Protected | Delete notification |

   ### Search (1 endpoint)
   | Method | Endpoint | Auth | Description |
   |---|---|---|---|
   | GET | `/api/search?q=term` | Protected | Global search across reports, alerts, risk zones |

   ### Disaster Types (6 endpoints)
   | Method | Endpoint | Auth | Description |
   |---|---|---|---|
   | GET | `/api/disaster-types` | Public | List active disaster types |
   | GET | `/api/disaster-types/all` | Admin | List all types (including inactive) |
   | GET | `/api/disaster-types/:id` | Public | Get single type |
   | POST | `/api/disaster-types` | Admin | Create new type |
   | PUT | `/api/disaster-types/:id` | Admin | Update type |
   | DELETE | `/api/disaster-types/:id` | Admin | Delete type (cannot delete defaults) |

   ---

   ## Frontend Pages (22 routes)

   | Route | Page | Access | Description |
   |---|---|---|---|
   | `/` | Home | Public | Landing page with hero, features, active alerts |
   | `/login` | Login | Public | Login form |
   | `/register` | Register | Public | Registration form |
   | `/unauthorized` | Unauthorized | Public | 403 forbidden page |
   | `/dashboard` | Dashboard | Authenticated | User dashboard with stats, recent reports, alerts |
   | `/reports` | MyReports | Authenticated | Paginated report list with filters and search |
   | `/reports/new` | ReportIncident | Authenticated | Multi-field report form with interactive OpenStreetMap location picker (search, click, drag marker, reverse geocoding) and image upload |
   | `/reports/:id` | ReportDetails | Authenticated | Full report view with edit/delete for owner |
   | `/alerts` | Alerts | Authenticated | Alert list with active/all toggle |
   | `/alerts/:id` | AlertDetails | Authenticated | Full alert view |
   | `/profile` | Profile | Authenticated | View/edit profile with phone validation |
   | `/map` | MapPage | Authenticated | Full-page Leaflet map with layers, search, filters |
   | `/admin` | AdminDashboard | Admin | Admin overview with stats cards |
   | `/admin/analytics` | Analytics | Admin | 10+ Chart.js charts with filters and CSV export |
   | `/admin/users` | ManageUsers | Admin | User table with search, role toggle, status toggle |
   | `/admin/reports` | ManageReports | Admin | Report table with status management |
   | `/admin/alerts` | ManageAlerts | Admin | Alert CRUD management |
   | `/admin/risk-zones` | ManageRiskZones | Admin | Risk zone CRUD management |
   | `/admin/shelters` | ManageShelters | Admin | Shelter CRUD management |
   | `/admin/settings` | SystemSettings | Admin | System configuration view |
   | `/500` | ServerError | Public | 500 error page |
   | `*` | NotFound | Public | 404 catch-all page |

   ---

   ## Security Features

   1. **Helmet** - HTTP security headers
   2. **Rate Limiting** - 100 req/15min (general), 20 req/15min (auth endpoints)
   3. **CORS** - Origin-restricted, credentials allowed
   4. **Mongo Sanitize** - NoSQL injection prevention (strips `$` and `.`)
   5. **HPP** - HTTP parameter pollution protection
   6. **Body Size Limits** - 16kb max for JSON and URL-encoded bodies
   7. **JWT Authentication** - Configurable secret and expiry (default 30 days)
   8. **bcrypt Password Hashing** - 12 salt rounds
   9. **File Upload Validation** - Only JPEG/PNG/WebP, max 5MB per file, max 5 files
   10. **TTL Indexes** - Alerts auto-expire, Notifications auto-delete after 30 days

   ---

   ## What You Need To Do Manually

   ### 1. Environment Setup

   **Create a `.env` file in the project root (`F:\CoastalGuard\.env`):**

   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://<your-username>:<your-password>@<cluster-url>/drmp?retryWrites=true&w=majority
   JWT_SECRET=<generate-a-strong-random-string-at-least-32-chars>
   JWT_EXPIRE=30d
   CLIENT_URL=http://localhost:5173
   ```

   - Replace `<your-username>`, `<your-password>`, and `<cluster-url>` with your actual MongoDB Atlas credentials
   - Generate a strong JWT_SECRET (e.g., run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
   - For local development with a local MongoDB, use `mongodb://localhost:27017/drmp` instead

   ### 2. MongoDB Database

   You need a MongoDB instance. Two options:

   **Option A: MongoDB Atlas (Cloud)**
   1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account
   2. Create a free M0 cluster
   3. Create a database user with username and password
   4. Whitelist your IP address in Network Access
   5. Get the connection string and paste it into `MONGO_URI` in `.env`

   **Option B: Local MongoDB**
   1. Install MongoDB Community Edition from [mongodb.com/try/download](https://www.mongodb.com/try/download/community)
   2. Start the MongoDB service
   3. Set `MONGO_URI=mongodb://localhost:27017/drmp` in `.env`

   ### 3. Install Dependencies

   ```bash
   # From the project root (F:\CoastalGuard)
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```

   Or use the root script:
   ```bash
   npm run install-all
   ```

   ### 4. Seed an Admin User

   There is no seed script included. After starting the server, you need to create the first admin user:

   1. Start the server: `npm run dev`
   2. Register a user through the frontend (`/register`) or via API:
      ```bash
      curl -X POST http://localhost:5000/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{"fullName":"Admin User","email":"admin@example.com","password":"admin123"}'
      ```
   3. Then manually promote that user to admin in MongoDB:
      - Open MongoDB Compass or Atlas Data Explorer
      - Connect to the `drmp` database
      - Go to the `users` collection
      - Find the user and change their `role` from `"user"` to `"admin"`

   Alternatively, you can write your own seed script and add it to `server/package.json`.

   ### 5. Seed Sample Data (Optional)

   There are no seed scripts for reports, alerts, risk zones, or shelters. You can:
   - Create them manually through the admin panel UI after promoting a user to admin
   - Write a custom seed script using the Mongoose models
   - Import sample JSON data via MongoDB Compass

   ### 6. Start the Development Servers

   ```bash
   # From project root - runs both client and server concurrently
   npm run dev
   ```

   This starts:
   - Backend: `http://localhost:5000` (Express)
   - Frontend: `http://localhost:5173` (Vite dev server)

   Vite is configured to proxy `/api` and `/uploads` requests to the backend.

   ### 7. Image Uploads Directory

   The `server/uploads/` directory is referenced in the code and has a `.gitkeep` file, but make sure it exists and is writable:

   ```bash
   # If it doesn't exist
   mkdir -p server/uploads
   ```

   The Multer middleware saves uploaded report images here as `report-{timestamp}-{random}.{ext}`.

   ### 8. Production Build

   ```bash
   # Build the React frontend
   cd client
   npm run build

   # The output goes to client/dist/
   # Serve it from Express or a reverse proxy (nginx)
   ```

   For production:
   - Set `NODE_ENV=production` in `.env`
   - Set a strong, unique `JWT_SECRET`
   - Use a production MongoDB instance
   - Configure CORS to allow only your production domain
   - Serve the built React app from Express or use nginx
   - Consider adding a process manager like PM2 for the Node.js server

   ### 9. No Test Suite

   The project has no tests written. If you want to add tests:

   **For the backend:**
   - Install: `npm install --save-dev jest supertest mongodb-memory-server`
   - Add test script to `server/package.json`: `"test": "jest --forceExit --detectOpenHandles"`
   - Write tests in `server/__tests__/` directory
   - Recommended testing: auth flows, report CRUD, role-based access, file uploads

   **For the frontend:**
   - Install: `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom`
   - Add test script to `client/package.json`: `"test": "vitest"`
   - Write tests in `client/src/__tests__/` or colocated `*.test.jsx` files
   - Recommended testing: form validation, auth flow, protected routes, search debounce

   ### 10. ESLint Configuration

   The project has `oxlint` installed but no ESLint config file (`.eslintrc` or `eslint.config.js`). To add linting:

   ```bash
   cd client
   npm install --save-dev eslint @eslint/js
   npx eslint --init
   ```

   Or create `client/eslint.config.js` manually.

   ### 11. No `.env.example` File

   There is no `.env.example` to help other developers. Consider creating one at the root:

   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/drmp
   JWT_SECRET=change_me_to_a_random_secret
   JWT_EXPIRE=30d
   CLIENT_URL=http://localhost:5173
   ```

   ### 12. No Root README.md

   There is no project-level README. Consider creating one at `F:\CoastalGuard\README.md` with:
   - Project description and screenshots
   - Prerequisites (Node.js 18+, MongoDB)
   - Setup instructions (steps 1-6 above)
   - API documentation summary
   - Tech stack details
   - Contributing guidelines
   - License information

   ### 13. File Cleanup

   The following files exist but may need attention:
   - `client/src/assets/react.svg` and `client/src/assets/vite.svg` - Default Vite template files, not used
   - `client/src/assets/hero.png` - Check if this image is intentional or a placeholder
   - `client/README.md` - Default Vite boilerplate README, not project-specific

   ### 14. Map Configuration

   The Leaflet map uses OpenStreetMap tiles by default, which work out of the box. However:
   - No API key is needed for basic tiles
   - For production with heavy traffic, consider using a tile service with a rate limit (Mapbox, etc.)
   - The map center is hardcoded to Chennai (13.0827, 80.2707) with zoom level 7
   - User geolocation requires browser location permissions

   ### 15. CORS for Production

   When deploying, update `server.js` CORS configuration:
   - Change `origin: process.env.CLIENT_URL` to your production frontend URL
   - Ensure both `http` and `https` are handled correctly
   - Remove any development origins if present

   ### 16. Rate Limiting for Production

   Current rate limits (100 req/15min general, 20 req/15min auth) may need adjustment:
   - For a public-facing app, these limits are reasonable starting points
   - Monitor usage and adjust based on actual traffic patterns
   - Consider using Redis-backed rate limiting (e.g., `rate-limit-redis`) for multi-instance deployments

   ---

   ## Project File Count

   | Directory | Files |
   |---|---|
   | Server (source) | ~30 files (models, controllers, services, routes, middleware, config, utils) |
   | Client (source) | ~55 files (pages, components, context, services, hooks, utils) |
   | Config files | ~8 files (vite.config.js, tailwind.config.js, postcss.config.js, .gitignore, etc.) |
   | **Total source** | **~93 files** |

   ---

   ## Development Timeline (What Was Built)

   | Phase | Description |
   |---|---|
   | Phase 1 | Project setup, MongoDB connection, Express server, User model & auth API |
   | Phase 2 | Report, Alert, RiskZone, Shelter models & CRUD APIs with services/controllers |
   | Phase 3 | React frontend setup, routing, auth pages (Login/Register), protected routes |
   | Phase 4 | User frontend - Dashboard, Reports list/detail, Alert list/detail, Profile |
   | Phase 5 | Admin panel - AdminLayout, AdminDashboard, ManageUsers, ManageReports, ManageAlerts |
   | Phase 6 | Map integration - Leaflet, React-Leaflet, markers, risk zones, shelters, location picker |
   | Phase 7 | Admin extensions - ManageRiskZones, ManageShelters, SystemSettings |
   | Phase 8 | Analytics dashboard - Chart.js, 10+ chart types, filters, CSV export |
   | Phase 9 | Production polish - Notifications system, global search (Cmd+K), security hardening (Helmet, rate limiting, mongo sanitize, hpp), lazy loading (857KB -> 331KB), error boundaries, skeleton loaders, accessibility (ARIA, focus trap, keyboard nav), responsive fixes |

   ---

   ## Current State

   - **Build:** Passing (Vite production build in ~2.3s)
   - **Bundle size:** 331KB gzipped to 102KB (with code splitting)
   - **Security:** 10 layers of protection enabled
   - **Accessibility:** ARIA labels, focus traps, keyboard navigation, screen reader support
   - **Responsive:** Mobile-first with breakpoints for sm/md/lg/xl
   - **Tests:** None written (manual testing required)
