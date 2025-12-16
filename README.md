# Inflow Inventory Dashboard

A Next.js frontend for visualizing Inflow Inventory data.

## Overview

This application provides a web dashboard for inventory management, displaying data from [Inflow Inventory](https://www.inflowinventory.com/) through a SQLite database layer.

**Tech Stack:**
- Next.js 16 / React 19
- SQLite via better-sqlite3
- Drizzle ORM with typed schemas from `inflow-materialize`
- Tailwind CSS

## Features

| Page | Description |
|------|-------------|
| `/` | Dashboard overview |
| `/inventory` | Product inventory with stock levels |
| `/locations` | Warehouse locations with inventory breakdown |
| `/locations/alerts` | Per-location reorder alerts |
| `/transfers` | Stock transfer pipeline |
| `/orders` | Order history and open orders |
| `/alerts` | Products below reorder point |

## Setup

### Prerequisites

- Node.js 18+
- SQLite database from [inflow-get](https://github.com/ldraney/inflow-get)

### Installation

```bash
# Clone the repo
git clone https://github.com/ldraney/inflow-app.git
cd inflow-app

# Install dependencies
npm install

# Copy database from inflow-get
cp ~/inflow-get/data/inflow.db data/

# Create views (if not already created)
npm run db:views

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:views` | Create/refresh materialized views |
| `npm run db:seed` | Sync from Inflow API (requires credentials) |

## Architecture

```
Inflow API → inflow-get → SQLite → inflow-materialize → Next.js App
                          (raw)        (views)           (this repo)
```

The database contains raw tables from the Inflow API plus 19 materialized views for business analytics. This app provides a UI for those views.

## Development

### Adding a new page

1. Create API route: `app/api/<name>/route.ts`
2. Import typed schema: `import { viewName } from 'inflow-materialize/schemas'`
3. Create page: `app/<name>/page.tsx`
4. Add to navigation: `app/layout.tsx`

### Database queries

All queries use Drizzle ORM with full TypeScript inference:

```typescript
import { db } from '@/lib/db';
import { reorderAlerts } from 'inflow-materialize/schemas';

const alerts = db.select().from(reorderAlerts).all();
// alerts is fully typed!
```

## Progress

**8/19 views implemented**

- Dashboard Layer (3/3)
- Operational Layer (4/4)
- Expert Layer (0/4)
- Business Analytics (0/5)
- Time-Series (1/3)

See [CLAUDE.md](./CLAUDE.md) for detailed roadmap.

## Related Projects

- [inflow-get](https://github.com/ldraney/inflow-get) - Syncs Inflow API to SQLite
- [inflow-materialize](https://www.npmjs.com/package/inflow-materialize) - Creates typed views

## License

MIT
