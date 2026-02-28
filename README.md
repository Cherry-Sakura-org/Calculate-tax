# 🚁 Instant Wellness Kits

**Automated drone delivery tax platform for New York State**

> Hackathon project by **Team Acheron** — Full-stack platform that calculates precise, jurisdiction-level sales tax for drone-delivered wellness kits using native GeoJSON point-in-polygon lookups. Zero external API calls.
>
> Designed for **financial specialists** — the UI follows an Excel-like paradigm with virtualized tables, inline filtering, sortable columns, bulk operations, and CSV import/export workflows familiar to accounting and tax professionals.

---

## What It Does

Every drone delivery in New York lands in a specific county, city, and possibly a special taxing district — each with its own tax rate. This platform takes GPS coordinates and **instantly resolves the exact tax jurisdiction and composite rate** using bundled GeoJSON boundary data and the JTS Topology Suite.

**Key capabilities:**

- **Create orders** with latitude, longitude, and subtotal — tax is auto-calculated
- **Bulk CSV import** at ~11,000 records/second using Java virtual threads
- **Interactive county heat map** — choropleth visualization of orders, revenue, and tax across all 62 NY counties
- **Dashboard analytics** — revenue by region, top counties, tax distribution
- **CSV export** — download filtered order data for compliance reporting
- **OAuth2 login** — GitHub + Google alongside email/password auth

---

## Screenshots

<!-- Add screenshots of your app here -->
<!-- ![Dashboard](docs/screenshots/dashboard.png) -->
<!-- ![Orders Table](docs/screenshots/orders.png) -->
<!-- ![Heat Map](docs/screenshots/heatmap.png) -->

---

## Tech Stack

| Layer              | Technologies                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**       | React 19, TypeScript 5.9, MUI 7, Rspack, TanStack Query/Table/Virtual, Recharts, react-simple-maps, D3, Zod, react-hook-form |
| **Backend**        | Java 25, Spring Boot 4.0.3, Spring Security + OAuth2, Spring Data JPA, Spring Batch, JTS Topology Suite, Liquibase           |
| **Database**       | PostgreSQL 18                                                                                                                |
| **Cache**          | Redis 8.4                                                                                                                    |
| **Infrastructure** | Docker, Docker Compose                                                                                                       |

---

## Getting Started

### Prerequisites

- **Java 25** (JDK)
- **Node.js 20+** and **npm**
- **Docker** and **Docker Compose**

### 1. Start the database and cache

```bash
cd backend
docker compose up -d
```

This spins up PostgreSQL 18 and Redis 8.4.

### 2. Run the backend

```bash
cd backend
./gradlew bootRun
```

The API starts at `http://localhost:8080` (or your configured port). Swagger UI is available at `/swagger-ui.html`.

**On Windows:**

```powershell
cd backend
.\gradlew.bat bootRun
```

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at `http://localhost:8080` and connects to the backend API at `https://api.ya3.uk` by default.

**Demo credentials:** `test@test.com` / `password`

### 4. Build for production

**Frontend:**

```bash
cd frontend
npm run build
```

**Backend Docker image:**

```bash
cd backend
docker build -t instant-wellness-kits .
```

---

## Project Structure

```
instant-wellness-kits/
├── backend/
│   ├── src/main/java/com/acheron/   # Spring Boot application
│   │   ├── controller/              # REST API controllers
│   │   ├── service/                 # Business logic & tax engine
│   │   ├── entity/                  # JPA entities
│   │   ├── repository/             # Data access
│   │   ├── config/                  # Security, CORS, caching
│   │   └── dto/                     # Request/response DTOs
│   ├── src/main/resources/
│   │   ├── data/                    # GeoJSON boundaries + tax locality data
│   │   └── db/changelog/           # Liquibase migrations
│   ├── docker-compose.yaml          # PostgreSQL + Redis
│   └── Dockerfile                   # Multi-stage JDK→JRE build
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── orders-table/        # Virtualized infinite-scroll table
│   │   │   ├── dashboard/           # Stats cards + county heat map
│   │   │   ├── orders-import/       # CSV drag-and-drop import
│   │   │   ├── manual-order-create/ # Single order creation dialog
│   │   │   ├── login/               # Auth forms (login + register)
│   │   │   ├── sidebar/             # Navigation drawer
│   │   │   └── layout/              # App shell + header
│   │   ├── api/                     # Axios API clients
│   │   └── types/                   # TypeScript type definitions
│   └── rspack.config.ts             # Build configuration
└── requests/
    └── openapi.yaml                 # Full API specification
```

---

## API Overview

| Area               | Endpoints                                                                  | Description                                             |
| ------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Auth**           | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`                  | JWT auth + OAuth2 (GitHub, Google)                      |
| **Orders**         | `GET /orders`, `POST /orders`, `POST /orders/import`, `GET /orders/export` | CRUD, bulk CSV import, filtered export                  |
| **Dashboard**      | `GET /dashboard`                                                           | Aggregated stats with 10-min cache                      |
| **Map**            | `GET /map/counties`, `GET /map/boundaries/*`, `GET /map/orders`            | GeoJSON boundaries, county aggregations, order plotting |
| **Tax Localities** | `GET /tax-localities`, `POST /tax-localities/reload`                       | Manage NY tax rate data                                 |

Full API documentation available via Swagger UI at `/swagger-ui.html` when the backend is running.

---

## How Tax Calculation Works

```
GPS Coordinates (lat, lng)
        │
        ▼
┌─────────────────────────┐
│  JTS Point-in-Polygon   │  ◄── NY County GeoJSON boundaries
│  Lookup                 │  ◄── NYC Borough GeoJSON boundaries
└────────────┬────────────┘
             │
             ▼
   County: "Westchester"
   Region: "Hudson Valley"
             │
             ▼
┌─────────────────────────┐
│  Tax Locality Lookup    │  ◄── Bundled NY tax locality data
└────────────┬────────────┘
             │
             ▼
   State Rate:   4.000%
   County Rate:  4.000%
   City Rate:    0.000%
   Special Rate: 0.375%
   ─────────────────────
   Composite:    8.375%
```

All computation is **offline** — no external geocoding or tax API calls. Coordinate results are cached in a `ConcurrentHashMap` for repeated lookups.

---

## Key Features in Detail

### High-Performance CSV Import

- Multi-file drag-and-drop upload
- Processed using Java **virtual threads** with batch sizes of 1,000 (parse) and 500 (save)
- Achieves ~11,000 records/second throughput
- Per-file tracking: success/failure/out-of-NY counts, duration, throughput

### Interactive County Heat Map

- Choropleth map of all 62 NY counties using react-simple-maps
- Three switchable metrics: order count, total revenue, average order value
- D3 quantile color scaling (green palette)
- Zoom/pan + hover tooltips + top-10 counties sidebar

### Virtualized Orders Table

- TanStack Table + TanStack Virtual for **endless scroll** instead of traditional page-based pagination — with 10,000+ homogeneous records, paging through numbered pages adds friction without benefit; continuous scrolling lets financial specialists scan data naturally, as they would in a spreadsheet
- 17+ filter parameters: bounding box, amount ranges, tax rates, dates, county, region, import file
- Sortable columns, bulk selection, density toggle
- Out-of-NY rows highlighted

### Region-Based Analytics

- Revenue breakdown across 5 NY regions: NYC, Long Island, Hudson Valley, Capital District, Upstate
- Dashboard stat cards: Total Orders, Revenue, Tax Collected, Avg Order Value

---

## Environment Configuration

### Backend

Configuration is in `backend/src/main/resources/application.yaml` with profile-specific overrides:

| Profile | File                    | Use                   |
| ------- | ----------------------- | --------------------- |
| `dev`   | `application-dev.yaml`  | Local development     |
| `prod`  | `application-prod.yaml` | Production deployment |

Key settings: database URL, Redis connection, JWT secret, OAuth2 client IDs, CORS allowed origins.

### Frontend

The API base URL is configured in `frontend/src/api/client.ts` (default: `https://api.ya3.uk`).

---

## Team

**Team Acheron**

---

## License

This project was built for a hackathon. See the repository for license details.
