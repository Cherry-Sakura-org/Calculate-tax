# Product Requirements Document (PRD)

## Instant Wellness Kits — Drone Delivery Tax Platform

**Team:** Acheron
**Date:** February 28, 2026
**Version:** 1.0 — Hackathon Release

---

## 1. Problem Statement

Drone delivery of wellness kits across New York State introduces complex sales tax compliance challenges. Each of New York's 62 counties — plus cities and special taxing districts — levies different tax rates. A single order's tax obligation depends on the precise GPS coordinates of the delivery point, not just a zip code or city name.

Existing solutions either rely on expensive third-party geocoding APIs (Avalara, TaxJar) or use zip-code-level approximations that can miscalculate tax by entire percentage points. For a high-volume drone delivery operation processing thousands of orders daily, neither option is acceptable.

**Instant Wellness Kits** solves this by performing **native, offline, point-in-polygon tax calculation** — determining the exact county, city, and special district for any GPS coordinate using bundled GeoJSON boundary data, then computing the precise composite tax rate with zero external API calls.

---

## 2. Target Users

| Persona                  | Description                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **Operations Admin**     | Day-to-day operator who creates orders, imports CSVs from field devices, monitors fulfillment, and exports tax reports. |
| **Super Admin**          | System manager with user management access who oversees platform configuration and tax locality data.                   |
| **Finance / Compliance** | Consumes exported CSV data and dashboard analytics to verify tax collection accuracy across jurisdictions.              |

---

## 3. Goals & Success Metrics

| Goal                               | Metric                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| Accurate automated tax calculation | Composite tax rate matches NYS published rates for all 62 counties + NYC boroughs |
| High-throughput bulk import        | ≥ 10,000 orders/second CSV import performance                                     |
| Operational visibility             | Dashboard loads in < 2 seconds with up to 1M orders                               |
| Zero external tax API dependency   | All tax lookups performed offline using bundled GeoJSON + locality data           |
| Hackathon delivery                 | Full-stack working demo with auth, CRUD, import/export, analytics, and map        |

---

## 4. Features

### 4.1 Authentication & Authorization

| Requirement                         | Details                                             |
| ----------------------------------- | --------------------------------------------------- |
| Email/password registration & login | JWT-based stateless auth; tokens stored client-side |
| OAuth2 social login                 | GitHub and Google providers                         |
| Role-based access                   | `ADMIN` (standard), `SUPER_ADMIN` (user management) |
| Session persistence                 | JWT in `localStorage` with Bearer header injection  |

### 4.2 Order Management

| Requirement         | Details                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Create order        | Input: latitude, longitude, subtotal. System auto-calculates county, region, tax breakdown, and total.                                |
| List orders         | Paginated, sortable, filterable by 17+ parameters (bounding box, amounts, tax rates, dates, county, region, NY validity, import file) |
| Delete orders       | Soft delete with bulk selection support                                                                                               |
| CSV export          | Download filtered orders as CSV with all tax breakdown columns                                                                        |
| Out-of-NY detection | Orders outside New York State boundaries are flagged and visually distinguished                                                       |

### 4.3 Bulk CSV Import

| Requirement             | Details                                                                           |
| ----------------------- | --------------------------------------------------------------------------------- |
| Multi-file upload       | Drag-and-drop zone accepting multiple CSV files simultaneously                    |
| High-performance engine | Native import using Java virtual threads — target ~11,000 records/sec             |
| Batch processing        | Records parsed in batches of 1,000; saved in batches of 500                       |
| Import tracking         | Per-file metadata: total/successful/failed/out-of-NY counts, duration, throughput |
| Alternate batch path    | Spring Batch async import with SSE real-time progress streaming                   |
| Import file filtering   | Filter the orders table by originating import file                                |

### 4.4 Tax Calculation Engine

| Requirement                | Details                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| Point-in-polygon lookup    | Uses JTS Topology Suite against loaded NY county + NYC borough GeoJSON boundaries        |
| Composite rate computation | State base rate (4%) + county + city + special district rates                            |
| Tax breakdown storage      | Per-order breakdown: state, county, city, and special rates + jurisdiction names (JSONB) |
| Coordinate caching         | `ConcurrentHashMap` cache for repeated coordinate lookups                                |
| Tax locality management    | CRUD for locality data; reload from bundled JSON or import custom data                   |
| No external API calls      | Entire computation is offline using bundled boundary + rate data                         |

### 4.5 Dashboard & Analytics

| Requirement             | Details                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Summary stat cards      | Total Orders, Total Revenue, Tax Collected, Average Order Value                                                  |
| County heat map         | Interactive choropleth of NY counties with 3 switchable metrics: order count, total revenue, average order value |
| Map interactions        | Zoom, pan, hover tooltips, top-10 counties sidebar with bar indicators                                           |
| Revenue by region chart | Bar chart breaking down revenue across NYC, Long Island, Hudson Valley, Capital District, Upstate                |
| Performance caching     | Dashboard stats cached in-memory (10-min TTL); map data cached via Redis                                         |

### 4.6 Map & Geospatial

| Requirement             | Details                                                           |
| ----------------------- | ----------------------------------------------------------------- |
| County boundaries       | Full NY county GeoJSON served for frontend rendering              |
| Borough boundaries      | NYC borough GeoJSON for granular city-level visualization         |
| Per-county aggregations | Orders, revenue, tax, and average order value per county          |
| Orders GeoJSON          | All orders served as GeoJSON FeatureCollection for map plotting   |
| CSV preview             | Upload a CSV and preview its orders on the map without persisting |

---

## 5. Region Classification

| Region               | Counties                                                                        |
| -------------------- | ------------------------------------------------------------------------------- |
| **NYC**              | New York (Manhattan), Kings (Brooklyn), Queens, Bronx, Richmond (Staten Island) |
| **Long Island**      | Nassau, Suffolk                                                                 |
| **Hudson Valley**    | Westchester, Rockland, Putnam, Dutchess, Orange, Sullivan, Ulster               |
| **Capital District** | Albany, Rensselaer, Saratoga, Schenectady                                       |
| **Upstate**          | All remaining NY counties                                                       |
| **Out of State**     | Coordinates outside New York boundaries                                         |

---

## 6. Technical Architecture

### 6.1 System Diagram

```
┌──────────────────────┐       HTTPS/JWT        ┌──────────────────────────┐
│                      │ ◄────────────────────►  │                          │
│   React Frontend     │                         │   Spring Boot Backend    │
│   (Rspack + MUI 7)  │                         │   (Java 25 / Virtual     │
│                      │                         │    Threads)              │
└──────────────────────┘                         └─────────┬───────┬───────┘
                                                           │       │
                                                    ┌──────┘       └──────┐
                                                    ▼                     ▼
                                             ┌────────────┐       ┌────────────┐
                                             │ PostgreSQL  │       │   Redis    │
                                             │     18      │       │    8.4     │
                                             └────────────┘       └────────────┘
```

### 6.2 Frontend Stack

| Technology                 | Purpose                                        |
| -------------------------- | ---------------------------------------------- |
| React 19 + TypeScript 5.9  | UI framework                                   |
| MUI 7 (Material UI)        | Component library with custom green/teal theme |
| Rspack                     | Build tooling (Rust-based, fast)               |
| React Router 7             | Client-side routing                            |
| TanStack Query 5           | Server state management & caching              |
| TanStack Table 8 + Virtual | Virtualized infinite-scroll data table         |
| Recharts                   | Revenue bar charts                             |
| react-simple-maps + D3     | Interactive choropleth heat map                |
| Zod + react-hook-form      | Form validation                                |
| Axios                      | HTTP client with JWT interceptor               |
| Luxon                      | Date/time formatting                           |

### 6.3 Backend Stack

| Technology                  | Purpose                                        |
| --------------------------- | ---------------------------------------------- |
| Java 25 + Spring Boot 4.0.3 | Application framework                          |
| Spring Security + OAuth2    | Authentication (JWT + GitHub/Google)           |
| Spring Data JPA + Hibernate | ORM with batch insert optimization             |
| Spring Batch                | Async CSV import with progress streaming (SSE) |
| JTS Topology Suite          | Point-in-polygon geospatial computation        |
| Liquibase                   | Database schema migrations (10 changelogs)     |
| SpringDoc OpenAPI 3.1       | Auto-generated API documentation               |
| Virtual Threads             | High-concurrency CSV processing                |

### 6.4 Infrastructure

| Component                  | Details                              |
| -------------------------- | ------------------------------------ |
| PostgreSQL 18 (Alpine)     | Primary datastore                    |
| Redis 8.4 (Alpine)         | Dashboard & map data cache           |
| Docker multi-stage build   | JDK 25 build → JRE 25 Alpine runtime |
| Docker Compose             | Local development orchestration      |
| G1GC, 75% MaxRAMPercentage | JVM tuning                           |
| Hibernate batch_size=500   | Bulk insert optimization             |

---

## 7. API Surface

### Auth

| Method | Endpoint         | Description                    |
| ------ | ---------------- | ------------------------------ |
| `POST` | `/auth/register` | Register new admin user        |
| `POST` | `/auth/login`    | Login with email/password      |
| `GET`  | `/auth/me`       | Get current authenticated user |

### Orders

| Method | Endpoint               | Description                               |
| ------ | ---------------------- | ----------------------------------------- |
| `GET`  | `/orders`              | List orders (filtered, paginated, sorted) |
| `POST` | `/orders`              | Create order with auto tax calculation    |
| `POST` | `/orders/import`       | Bulk CSV import (multi-file)              |
| `GET`  | `/orders/export`       | Export filtered orders as CSV             |
| `GET`  | `/orders/import-files` | List import file metadata                 |

### Dashboard

| Method | Endpoint                 | Description           |
| ------ | ------------------------ | --------------------- |
| `GET`  | `/dashboard`             | Aggregated statistics |
| `POST` | `/dashboard/cache/evict` | Clear dashboard cache |

### Map

| Method | Endpoint                   | Description                |
| ------ | -------------------------- | -------------------------- |
| `GET`  | `/map/counties`            | Per-county aggregated data |
| `GET`  | `/map/orders`              | Orders as GeoJSON          |
| `GET`  | `/map/boundaries/counties` | County boundary polygons   |
| `GET`  | `/map/boundaries/boroughs` | NYC borough polygons       |
| `POST` | `/map/csv-preview`         | Preview CSV on map         |

### Tax Localities

| Method | Endpoint                 | Description                 |
| ------ | ------------------------ | --------------------------- |
| `GET`  | `/tax-localities`        | List all localities         |
| `POST` | `/tax-localities`        | Create locality             |
| `POST` | `/tax-localities/reload` | Reload from bundled data    |
| `POST` | `/tax-localities/import` | Import custom locality data |

---

## 8. Data Models

### Order

| Field              | Type      | Description                                     |
| ------------------ | --------- | ----------------------------------------------- |
| `id`               | UUID      | Primary key                                     |
| `latitude`         | Double    | Delivery GPS latitude                           |
| `longitude`        | Double    | Delivery GPS longitude                          |
| `subtotal`         | Decimal   | Pre-tax amount                                  |
| `compositeTaxRate` | Decimal   | Total tax rate applied                          |
| `taxAmount`        | Decimal   | Calculated tax                                  |
| `totalAmount`      | Decimal   | Subtotal + tax                                  |
| `orderedAt`        | Timestamp | Order timestamp                                 |
| `isWithinNewYork`  | Boolean   | NY boundary check result                        |
| `county`           | String    | Resolved county name                            |
| `region`           | String    | Resolved region                                 |
| `taxBreakdown`     | Object    | State/county/city/special rates + jurisdictions |

### Import File

| Field               | Type    | Description           |
| ------------------- | ------- | --------------------- |
| `id`                | UUID    | Primary key           |
| `originalFilename`  | String  | Uploaded file name    |
| `totalRecords`      | Integer | Total rows in CSV     |
| `successfulRecords` | Integer | Successfully imported |
| `failedRecords`     | Integer | Failed rows           |
| `outOfNyRecords`    | Integer | Outside NY boundary   |
| `durationMs`        | Long    | Processing time       |
| `recordsPerSecond`  | Double  | Throughput metric     |

---

## 9. Non-Functional Requirements

| Category               | Requirement                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------- |
| **Performance**        | CSV import ≥ 10K records/sec; dashboard < 2s load; virtualized table handles 100K+ rows |
| **Scalability**        | Virtual threads for concurrent request handling; Redis caching for repeated queries     |
| **Security**           | JWT auth, role-based access, CORS restricted to frontend origin, soft deletes           |
| **Reliability**        | Database migrations via Liquibase; Docker health checks via Spring Actuator             |
| **Offline capability** | Tax calculation requires zero external API calls                                        |
| **Observability**      | Import file tracking with throughput metrics; cache hit statistics                      |

---

## 10. Out of Scope (Future)

- Real-time drone tracking / delivery status
- Payment processing integration
- Multi-state tax support beyond New York
- Mobile application
- Notification system (email/SMS)
- Audit logging for compliance
- Rate limiting / API throttling

---

## 11. Risks & Mitigations

| Risk                       | Impact                                                  | Mitigation                                                                   |
| -------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| GeoJSON boundary precision | Coordinates near county borders may resolve incorrectly | Use high-resolution boundary data; coordinate caching prevents inconsistency |
| Tax rate data staleness    | NY updates rates periodically                           | Tax locality reload endpoint; admin can import updated rates                 |
| Large dataset performance  | 1M+ orders could slow aggregations                      | Redis caching (10-min TTL); database indexes; batch processing               |
| JWT token security         | Token theft enables unauthorized access                 | Short-lived tokens; HTTPS only; no sensitive data in payload                 |
