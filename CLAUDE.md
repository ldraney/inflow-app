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
│   ├── inventory/
│   │   └── page.tsx             # Inventory list
│   ├── orders/
│   │   └── page.tsx             # Order history
│   ├── alerts/
│   │   └── page.tsx             # Reorder alerts
│   └── api/
│       ├── inventory/route.ts
│       ├── alerts/route.ts
│       └── ...
├── lib/
│   └── db.ts                    # Database connection helper
├── scripts/
│   ├── seed.ts                  # inflow-get wrapper
│   └── materialize.ts           # inflow-materialize wrapper
├── data/
│   └── .gitkeep                 # inflow.db lives here (gitignored)
├── .env.local                   # Credentials (gitignored)
└── CLAUDE.md
```

## API Routes Pattern

```typescript
// app/api/alerts/route.ts
import { db } from '@/lib/db';

export async function GET() {
  const alerts = db.prepare('SELECT * FROM reorder_alerts').all();
  return Response.json(alerts);
}
```

## Database Helper

```typescript
// lib/db.ts
import Database from 'better-sqlite3';

export const db = new Database('./data/inflow.db', { readonly: true });
```

## Dependencies

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "better-sqlite3": "^11"
  },
  "devDependencies": {
    "inflow-get": "^0.3",
    "inflow-materialize": "^0.2",
    "@types/better-sqlite3": "^7"
  }
}
```

Note: `inflow-get` and `inflow-materialize` are devDependencies since they're only used in scripts, not at runtime.

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
