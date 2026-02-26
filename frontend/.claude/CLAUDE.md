# CLAUDE.md

## Overview

Admin dashboard for **Instant Wellness Kits** drone delivery service. The frontend allows operators to manage orders, import bulk data via CSV, and instantly view sales tax breakdowns calculated per GPS delivery coordinates within New York State.

## Features

### Order Management

- **CSV Import** — upload a batch of orders; the system processes each one, calculates applicable taxes, and persists results
- **Manual Order Creation** — enter `latitude`, `longitude`, and `subtotal` via a form to create and immediately calculate a single order
- **Orders Table** — paginated list of all orders displaying:
  - Subtotal, tax amount, total amount
  - Composite tax rate
  - Breakdown: `state_rate`, `county_rate`, `city_rate`, `special_rates`
  - Jurisdictions applied (bonus)
  - Filters by date, location, tax rate, etc.

## Commands

- `npm run dev` - Start the dev server at http://localhost:8080
- `npm run build` - Build for production
- `npm run preview` - Preview the production build locally

## Rules

- Architecture details: `.claude/rules/architecture.md`
- Code style: `.claude/rules/code-style.md`
