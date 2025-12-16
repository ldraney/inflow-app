# inflow-app

Next.js frontend for Inflow Inventory data.

## What This Is

A Next.js application that displays inventory data from Inflow. Uses SQLite as the data layer, populated by `inflow-get` and enhanced with views from `inflow-materialize`.

## Architecture

```
┌─────────────┐      ┌────────────────────┐      ┌─────────────────────┐
│ Inflow API  │ ──▶  │ inflow-get         │ ──▶  │ SQLite DB           │
│ (cloud)     │      │ (seeds raw tables) │      │ (data/inflow.db)    │
└─────────────┘      └────────────────────┘      └──────────┬──────────┘
                                                            │
                     ┌────────────────────┐                 │
                     │ inflow-materialize │ ────────────────┘
                     │ (creates views)    │
                     └────────────────────┘
                                                            │
                                                            ▼
                                                 ┌─────────────────────┐
                                                 │ Next.js App         │
                                                 │ (this repo)         │
                                                 └─────────────────────┘
```

## Data Flow

1. **Seed** - Run `inflow-get` to pull data from Inflow API into SQLite
2. **Materialize** - Run `inflow-materialize` to create business-friendly views
3. **Serve** - Next.js queries the views via API routes

## Setup

```bash
npm install
npm run db:seed       # Fetch from Inflow API (requires credentials)
npm run db:views      # Create materialized views
npm run dev           # Start Next.js
```

## Scripts

| Script | Purpose |
|--------|---------|
| `db:seed` | Run inflow-get to sync from Inflow API |
| `db:views` | Run inflow-materialize to create/refresh views |
| `db:reset` | Drop all views and reseed |
| `dev` | Start Next.js dev server |
| `build` | Production build |

## Environment Variables

```env
# .env.local (not committed)
INFLOW_API_KEY=your-api-key
INFLOW_COMPANY_ID=your-company-id
```

## Database

SQLite file lives at `data/inflow.db` (gitignored).

### Available Views

**Dashboard Layer**
- `product_inventory_status` - Product cards with stock levels
- `reorder_alerts` - Products needing reorder
- `open_orders_unified` - All open PO/SO/MO

**Operational Layer**
- `inventory_by_location` - Stock by warehouse
- `location_stock_summary` - Aggregate per location
- `location_reorder_alerts` - Per-location reorder points
- `transfer_pipeline` - Open transfers

**Expert Layer**
- `inventory_detail` - Full granularity (sublocation/serial/lot)
- `stock_movement_ledger` - All stock movements
- `lot_inventory` - Lot tracking with expiry
- `serial_inventory` - Serial number tracking

**Business Analytics**
- `customer_360` - Customer profiles with revenue
- `vendor_scorecard` - Vendor performance
- `product_margin` - Price vs cost analysis
- `bom_costed` - Bill of materials with costs
- `category_inventory_summary` - Stock by category

**Time-Series**
- `order_history` - Completed orders with line detail
- `product_velocity` - Sales velocity (7/30/90 day)
- `dead_stock` - Inventory with no movement (30+/60+/90+ days)

## Project Structure

```
inflow-app/
├── app/
│   ├── page.tsx                 # Dashboard
│   ├── layout.tsx               # Navigation + layout
│   ├── inventory/
│   │   └── page.tsx             # Inventory list
│   ├── locations/
│   │   ├── page.tsx             # Location summary cards + detail
│   │   └── alerts/
│   │       └── page.tsx         # Location reorder alerts
│   ├── transfers/
│   │   └── page.tsx             # Transfer pipeline
│   ├── orders/
│   │   └── page.tsx             # Order history
│   ├── alerts/
│   │   └── page.tsx             # Reorder alerts
│   └── api/
│       ├── inventory/route.ts
│       ├── locations/
│       │   ├── route.ts         # inventory_by_location, location_stock_summary
│       │   └── alerts/route.ts  # location_reorder_alerts
│       ├── transfers/route.ts   # transfer_pipeline
│       ├── orders/route.ts      # order_history, open_orders_unified
│       └── alerts/route.ts      # reorder_alerts
├── lib/
│   └── db.ts                    # Drizzle database connection
├── scripts/
│   ├── seed.ts                  # inflow-get wrapper
│   └── materialize.ts           # inflow-materialize wrapper
├── data/
│   └── inflow.db                # SQLite database (gitignored)
├── .env.local                   # Credentials (gitignored)
└── CLAUDE.md
```

## API Routes Pattern

```typescript
// app/api/alerts/route.ts
import { db } from '@/lib/db';
import { reorderAlerts } from 'inflow-materialize/schemas';

export async function GET() {
  const alerts = db.select().from(reorderAlerts).all();
  // ^? Fully typed!
  return Response.json(alerts);
}
```

## Database Helper

```typescript
// lib/db.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

const sqlite = new Database('./data/inflow.db', { readonly: true });
export const db = drizzle(sqlite);
```

## View Creation

```typescript
// scripts/materialize.ts
import { createViews } from 'inflow-materialize';
import Database from 'better-sqlite3';

const sqlite = new Database('./data/inflow.db');
createViews(sqlite);
```

## Dependencies

```json
{
  "dependencies": {
    "next": "^16",
    "react": "^19",
    "better-sqlite3": "^11",
    "drizzle-orm": "0.38.4",
    "inflow-materialize": "^0.3.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7"
  }
}
```

Note: Database is seeded by copying from `inflow-get` project (`cp ~/inflow-get/data/inflow.db data/`). Views are created by `inflow-get` during seeding.

## Development Workflow

1. Make changes to Next.js app
2. If schema changes upstream, re-run `npm run db:seed && npm run db:views`
3. Views are persisted in SQLite, so `db:views` only needs to run once (or after schema changes)

## Deployment

The SQLite file must be included in deployment or seeded on first run. Options:
- Include `data/inflow.db` in build artifacts
- Seed on container startup
- Use a persistent volume

## Security Notes

- SQLite file contains business data - keep private
- API routes should add auth middleware for production
- `.env.local` contains API credentials - never commit

---

## Next Steps

**Continue implementing views.** The app needs a UI page for each of the 19 views from `inflow-materialize`. Currently 8/19 are done.

**Next up: Phase 2 - Advanced Inventory Tracking**

To implement each view:
1. Check the schema: `sqlite3 data/inflow.db "PRAGMA table_info(<view_name>);"`
2. Create API route importing from `inflow-materialize/schemas`
3. Create page component with table/cards
4. Add to navigation in `layout.tsx`
5. Update roadmap below

All schemas are available: `import { <viewName> } from 'inflow-materialize/schemas'`

---

## Closed Issues

### Issue #1: Migrate to typed Drizzle integration with inflow-materialize

**Status:** Closed

Migrated from raw `better-sqlite3` queries to typed Drizzle ORM with `inflow-materialize/schemas`.

**Tasks:**
- [x] Install dependencies: `inflow-materialize@0.3.0`, `drizzle-orm@0.38.4`
- [x] Rewrite `lib/db.ts` to use Drizzle with better-sqlite3 driver
- [x] Update `app/api/alerts/route.ts` to use typed schema
- [x] Update `app/api/inventory/route.ts` to use typed schema
- [x] Update `app/api/orders/route.ts` to use typed schema
- [x] Update `scripts/materialize.ts` to use `createViews()` function

**Note:** Must use `drizzle-orm@0.38.4` to match `inflow-materialize`'s peer dependency

---

## Roadmap: View Implementation Status

### ✅ Implemented (8/19)

| View | Page | API Route |
|------|------|-----------|
| `product_inventory_status` | `/inventory` | `/api/inventory` |
| `reorder_alerts` | `/alerts` | `/api/alerts` |
| `open_orders_unified` | `/orders` (open filter) | `/api/orders?status=open` |
| `order_history` | `/orders` | `/api/orders` |
| `inventory_by_location` | `/locations` | `/api/locations` |
| `location_stock_summary` | `/locations` | `/api/locations?view=summary` |
| `location_reorder_alerts` | `/locations/alerts` | `/api/locations/alerts` |
| `transfer_pipeline` | `/transfers` | `/api/transfers` |

### 🚧 Phase 2: Advanced Inventory Tracking

| View | Planned Page | Priority |
|------|--------------|----------|
| `inventory_detail` | `/inventory/[id]` (detail view) | High |
| `lot_inventory` | `/lots` | Medium |
| `serial_inventory` | `/serials` | Medium |
| `stock_movement_ledger` | `/movements` | Low |

### 🚧 Phase 3: Business Analytics

| View | Planned Page | Priority |
|------|--------------|----------|
| `customer_360` | `/customers` | High |
| `vendor_scorecard` | `/vendors` | High |
| `product_margin` | `/analytics/margins` | Medium |
| `category_inventory_summary` | `/analytics/categories` | Medium |
| `bom_costed` | `/bom` | Low |

### 🚧 Phase 4: Time-Series & Insights

| View | Planned Page | Priority |
|------|--------------|----------|
| `product_velocity` | `/analytics/velocity` | High |
| `dead_stock` | `/analytics/dead-stock` | High |

---

## Implementation Notes

### Adding a New View Page

1. Create API route in `app/api/<view>/route.ts`
2. Create page in `app/<view>/page.tsx`
3. Add navigation link in `app/layout.tsx`
4. Update this roadmap

### Navigation Structure (Planned)

```
/ (Dashboard)
├── /inventory          # product_inventory_status
├── /inventory/[id]     # inventory_detail
├── /locations          # inventory_by_location, location_stock_summary
│   └── /locations/alerts   # location_reorder_alerts
├── /orders             # order_history, open_orders_unified
├── /transfers          # transfer_pipeline
├── /alerts             # reorder_alerts
├── /lots               # lot_inventory
├── /serials            # serial_inventory
├── /movements          # stock_movement_ledger
├── /customers          # customer_360
├── /vendors            # vendor_scorecard
├── /bom                # bom_costed
└── /analytics
    ├── /margins        # product_margin
    ├── /categories     # category_inventory_summary
    ├── /velocity       # product_velocity
    └── /dead-stock     # dead_stock
```
