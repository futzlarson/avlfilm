# AVL Film Website - Technical Documentation

> **Audience:** Primary developer (understanding how/why things work)
>
> **Purpose:** Deep technical architecture, implementation details, and decision rationale.
>
> **For AI Assistants:** See [CLAUDE.md](./CLAUDE.md) for development guidelines and best practices.

---

## <a id="table-of-contents"></a> Table of Contents
1. [Glossary](#glossary)
2. [Tech Stack & Architecture Decisions](#tech-stack--architecture-decisions)
3. [File Structure Overview](#file-structure-overview)
4. [How Pages Are Rendered](#how-pages-are-rendered)
5. [Database & Schema](#database--schema)
6. [Anti-Scraping Protection](#anti-scraping-protection)
7. [Key Features](#key-features)
8. [SEO Implementation](#seo-implementation)
9. [Development Workflow](#development-workflow)
10. [Common Patterns](#common-patterns)
11. [Troubleshooting](#troubleshooting)
12. [Code Examples](#code-examples)

---

## Glossary

**Atomicity** - Ensuring multiple operations execute as a single unit that either completely succeeds or completely fails, with no partial states possible. Critical for preventing race conditions in concurrent systems. Example: Redis `multi()` pipeline guarantees increment and expire operations happen together. See [Redis atomic operations example](#code-redis-atomic).

**Connection Pooling** - Reusing database/service connections across multiple requests instead of creating new connections each time. In serverless environments, connections are reused within the same function instance (warm starts) but not across different instances. See implementation in `src/pages/api/reveal-contact.ts`.

**Destructuring** - JavaScript syntax for extracting values from objects or arrays. Example: `const { email, phone, ...rest } = filmmaker` extracts `email` and `phone` properties while keeping everything else in `rest`. Used for excluding sensitive fields. See [example](#code-server-exclusion).

**Frontmatter** - Code between `---` fences at the top of `.astro` files that runs on the server during page rendering, before HTML is generated. Used for imports, database queries, and preparing data for templates.

```astro
---
// This is frontmatter - runs on the server
import { db } from '../db';
const data = await db.query.filmmakers.findMany();
---

<!-- This is the template - uses data from frontmatter -->
<h1>Filmmakers: {data.length}</h1>
```

See [full example](#code-ssr-example).

**Hydration** - Taking static HTML and "bringing it to life" by attaching JavaScript event listeners and state management in the browser. Without hydration, HTML is just static text - clicking buttons does nothing.

**Islands Architecture** - Architecture pattern where most of the page is static HTML (the "ocean") with small interactive components (the "islands") that use JavaScript. Only interactive parts get [hydrated](#glossary) in the browser, keeping bundle sizes minimal. In Astro, these "islands" are `<script>` tags. See [example](#code-islands-example).

**Same Origin** - Requests made from a web page to the same domain, protocol, and port where the page was served from. Browsers automatically include credentials (like Authorization headers) with same-origin requests. Example: Page at `https://example.com/admin` making a request to `https://example.com/api/banner` is same-origin.

**Tree-shaking** - Removing unused code from the final JavaScript bundle. For example, if you import a library but only use one function, tree-shaking removes the rest, resulting in smaller bundles and faster page loads.

---

## Tech Stack & Architecture Decisions

### Core Technologies

**Astro 5 + TypeScript (Strict Mode)**
- **Why Astro**: Zero JavaScript by default, perfect for content-heavy sites. Ships only the JS you need.
- **Why TypeScript**: Type safety prevents runtime errors, better IDE support, self-documenting code.
- **Server-Side Rendering (SSR)**: Dynamic content (filmmaker directory) rendered on the server for optimal performance and SEO.

**PostgreSQL + Drizzle ORM**
- **Why PostgreSQL**: Robust relational database, excellent for structured data (filmmakers, submissions, settings).
- **Why Drizzle**: Type-safe database queries, migrations as code, zero runtime overhead.
- **Hosting**: Vercel Postgres for seamless integration with Vercel deployment.

**Redis (Redis Labs)**
- **Why Redis**: In-memory data store for fast rate limiting
- **Use Case**: Prevents automated scraping of filmmaker contact information
- **Implementation**: IP-based rate limiting (20 reveals per hour)
- **Package**: `redis` (official Redis client)

**Vanilla CSS (No Framework)**
- **Why No Framework**: Site is simple enough that Tailwind/etc. would add unnecessary complexity and bundle size.
- **Scoped Styles**: Astro's built-in scoped CSS prevents style conflicts.
- **Global Utilities**: Reusable classes defined in `BaseLayout.astro` (`.btn-primary`, `.intro`, etc.).

**Vercel Hosting**
- **Why Vercel**: Native Astro support, edge functions, automatic HTTPS, preview deployments.
- **Serverless Functions**: API routes (`/api/*`) run as serverless functions.

### Architecture Philosophy

**Progressive Enhancement**
- Core content works without JavaScript
- JavaScript enhances UX (search, filters, admin interactions)
- Server-side rendering ensures fast initial page loads

**Performance First**
- Minimal JavaScript bundles (~20KB client bundle vs typical React app's 200KB+)
- Server-side data fetching where possible (no client-side loading delays)
- Optimized Core Web Vitals:
  - **LCP** (Largest Contentful Paint): Time until largest element renders
  - **FCP** (First Contentful Paint): Time until first content appears
  - **CLS** (Cumulative Layout Shift): Visual stability score (lower = better)

---

## File Structure Overview

```
avlfilm/
├── src/
│   ├── components/               # Reusable Astro components
│   │   ├── Banner.astro          # Dynamic site-wide announcement banner
│   │   ├── FilmmakerTable.astro  # Sortable table for directory
│   │   └── FilmmakerModal.astro  # Detail modal for filmmaker info
│   │
│   ├── db/
│   │   ├── index.ts              # Database connection singleton
│   │   └── schema.ts             # Drizzle schema definitions (filmmakers, settings)
│   │
│   ├── lib/                      # Framework-aware utilities
│   │   ├── auth.ts               # Authentication utilities for admin API endpoints
│   │   └── api.ts                # Shared API response helpers
│   │
│   ├── utils/                    # Pure utility functions
│   │   ├── formatting.ts         # formatPhone() and other formatters
│   │   └── url.ts                # normalizeUrl() for URL normalization
│   │
│   ├── types/                    # TypeScript type definitions
│   │   └── filmmaker.ts          # Filmmaker, FilmmakerStatus, PublicFilmmaker types
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro      # Main layout: header, nav, footer, global styles, SEO
│   │
│   ├── pages/                    # File-based routing
│   │   ├── index.astro           # Homepage
│   │   ├── calendar.astro        # Google Calendar embed
│   │   ├── directory.astro       # Public filmmaker directory
│   │   ├── submit.astro          # Filmmaker submission form
│   │   ├── faq.astro             # FAQ page
│   │   │
│   │   ├── admin/
│   │   │   ├── index.astro       # Admin dashboard
│   │   │   └── filmmakers.astro  # Manage filmmaker submissions
│   │   │
│   │   └── api/                      # API endpoints (serverless functions)
│   │       ├── banner.ts             # Update banner content
│   │       ├── reveal-contact.ts     # Rate-limited contact reveal
│   │       ├── approve-filmmaker.ts  # Update filmmaker status/data
│   │       ├── submit-filmmaker.ts   # Handle new submissions
│   │       └── check-email.ts        # Email uniqueness validation
│   │
│   ├── scripts/
│   │   ├── import-csv.ts            # CLI tool: bulk import filmmakers from CSV
│   │   └── backup/                  # Database backup automation scripts
│   │       ├── check-changes.ts     # Check if backup needed (compares timestamps)
│   │       ├── update-log.ts        # Update backup log in database
│   │       └── send-alert.ts        # Email alerts on backup failure
│   │
│   └── config/
│       └── roles.ts         # Standardized film role definitions
│
├── drizzle/                 # Database migrations (auto-generated)
│   └── *.sql
│
├── public/                  # Static assets (served as-is)
│
├── astro.config.mjs         # Astro configuration
├── drizzle.config.ts        # Drizzle ORM configuration
└── tsconfig.json            # TypeScript configuration
```

### Key Directories Explained

**`src/pages/`** - File-based routing. `pages/foo.astro` → `example.com/foo`

**`src/pages/api/`** - API routes. Return JSON, not HTML. Run as serverless functions.

**`src/components/`** - Reusable UI components imported into pages.

**`src/lib/`** - Framework-aware utilities (need imports from Astro, DB, etc.)

**`src/utils/`** - Pure utility functions (no framework dependencies)

**`src/types/`** - TypeScript type definitions (single source of truth)

**`drizzle/`** - Version-controlled database migrations. Never edit manually.

---

## How Pages Are Rendered

Astro supports multiple rendering modes. This site uses a hybrid approach:

### 1. Server-Side Rendering (SSR) - Default

Most pages use SSR because the site is deployed with `@astrojs/vercel` adapter. See [SSR example](#code-ssr-example).

**Flow:**
1. User requests `/directory`
2. Vercel serverless function executes page code
3. Server fetches data from database (in [**frontmatter**](#glossary))
4. HTML is generated with data included
5. Fully-rendered HTML sent to browser
6. **No client-side data fetching needed** → Fast, SEO-friendly

### 2. Client-Side Interactivity (Islands Architecture)

[**Islands Architecture**](#glossary) keeps most of the page as static HTML with small interactive JavaScript components. Only interactive parts get [**hydrated**](#glossary) in the browser, keeping bundle sizes minimal.

In Astro, these "islands" are `<script>` tags that add interactivity to otherwise static pages. For example:
- Static HTML: Filmmaker profiles rendered on the server
- Interactive island: Search/filter functionality in a `<script>` tag

JavaScript runs in `<script>` tags for dynamic features. See [Islands Architecture example](#code-islands-example).

**Important - Astro Scoped CSS Gotcha:** Astro scopes CSS by default, but NOT JavaScript-generated HTML. Any classes used in `innerHTML` or `createElement` MUST use `:global()` in CSS. See [CSS scoping example](#code-css-scoping).

### 3. Passing Server Data to Client Scripts

**Current best practice (2025)**: JSON script tag pattern. See [JSON script tag example](#code-json-script-tag).

**Why not `define:vars`?**

Astro has a built-in `define:vars` attribute for passing server data to client scripts, but it has significant limitations:

- **Disables TypeScript type checking** - The script becomes untyped JavaScript, losing IDE autocomplete and type safety
- **Disables bundling/optimization** - Scripts using `define:vars` can't be bundled, minified, or [**tree-shaken**](#glossary) by Vite
- **Forces script to be inline** - The code is embedded directly in HTML instead of being loaded as a separate, cacheable `.js` file
- **Requires removing imports** - You can't use `import` statements, so no shared utilities or type definitions
- **Breaks with complex types** - Only works with JSON-serializable data (no functions, Date objects, etc.)

The JSON script tag pattern avoids all these issues while achieving the same goal.

### 4. API Routes (Serverless Functions)

See [API route example](#code-api-route).

**Flow:**
1. Request to `/api/reveal-contact`
2. Vercel executes the exported `POST` function
3. Connects to Postgres database and Redis
4. Returns JSON response

---

## Database & Schema

### Schema Definition

Database schema defined in `src/db/schema.ts` using Drizzle ORM.

**Key Tables:**
- `filmmakers` - Filmmaker profiles with contact info, roles, gear, status
- `siteSettings` - Key-value store for site configuration (banner content, etc.)

**Type Safety:** TypeScript types in `src/types/filmmaker.ts` match database schema exactly:
- `FilmmakerStatus` = `'pending' | 'approved' | 'archived'`
- `Filmmaker` interface matches all columns
- `PublicFilmmaker` = `Omit<Filmmaker, 'email' | 'phone'>` (for directory display)

### Migration Workflow

```bash
# 1. Edit schema.ts
vim src/db/schema.ts

# 2. Generate migration SQL
npm run db:generate

# 3. Review generated SQL in drizzle/XXXX_name.sql

# 4. Run migration
npm run db:migrate

# 5. Commit both files
git add src/db/schema.ts drizzle/XXXX_name.sql
git commit -m "Add field to filmmakers table"
```

**Important**: Always commit both schema changes AND the generated migration file.

---

## Anti-Scraping Protection

### Problem Statement

The filmmaker directory is public (discoverable, searchable) but contact information (email/phone) needs protection from:
- **Automated scrapers**: Bots harvesting emails for spam
- **Bulk extraction**: Mass collection of contact data
- **Privacy concerns**: Filmmakers' contact info should require user interaction to access

### Solution Architecture: Three-Layer Defense

**Layer 1: Server-Side Data Exclusion**

Contact information is excluded from initial page load. The server sanitizes data before sending to client using [**destructuring**](#glossary).

Implementation in `src/pages/directory.astro`:
```typescript
const results = await db.select().from(filmmakers).where(eq(filmmakers.status, 'approved'));
// Use destructuring to exclude email/phone
const sanitized = results.map(({ email, phone, ...rest }) => rest);
```

**Result**: Email/phone never appear in page HTML, JavaScript variables, network responses (except reveal API), or browser DevTools.

**Layer 2: Reveal API (User Interaction Required)**

Contact info hidden in filmmaker modal by default. A "Reveal contact information" button triggers an API call to `/api/reveal-contact` which returns email/phone after checking rate limits.

Implementation in `src/components/FilmmakerModal.astro` and `src/pages/api/reveal-contact.ts`.

**Layer 3: Redis Rate Limiting (Server-Side)**

The `/api/reveal-contact` endpoint enforces IP-based rate limiting using Redis:
- 20 reveals per IP per hour
- IP extracted from `x-forwarded-for` header (Vercel proxy)
- Redis key: `rate-limit:reveal:${ip}`
- [**Connection pooling**](#glossary) using singleton pattern to reuse connections in warm serverless instances

See full implementation in `src/pages/api/reveal-contact.ts`.

### Redis Implementation Details

**Why Redis?**
- **In-memory storage**: Sub-millisecond lookups (< 1ms)
- **Built-in TTL**: Keys auto-expire after 1 hour (no cleanup needed)
- **Atomic operations**: `multi()` ensures race-condition-free increment + expire
- **Serverless-friendly**: [**Connection pooling**](#glossary) works with Vercel functions

**Why not alternatives?**

| Approach | Problem |
|----------|---------|
| In-memory (app state) | Doesn't work with serverless (each request = new instance) |
| Database (PostgreSQL) | Too slow (10-50ms), no built-in TTL, manual cleanup needed |

---

## Key Features

### 1. Directory Page

**Location:** `src/pages/directory.astro` (server-side rendering) + `src/components/FilmmakerTable.astro` (interactive table)

**Features:**
- Alphabetical sorting by default with click-to-sort on other columns
- Multi-select role filtering (organized by category from `roles.ts`) with collapsible panel
- Live count display (e.g. "15 of 58 filmmakers")
- Selected roles shown as removable tags

### 2. Banner System

Dynamic site-wide announcements editable from admin panel. Component in `src/components/Banner.astro` fetches from `/api/banner`.

Stored in database `siteSettings` table:
- `banner_html` - HTML content
- `banner_enabled` - Boolean toggle

Admin can update via `/admin/index.astro` which POSTs to `/api/banner`.

### 3. Filmmaker Submission Flow

1. User fills out form at `/submit`
2. POST to `/api/submit-filmmaker` via `submitFilmmaker()` function → status: `pending`
3. Email notification sent via Resend (configured in `src/pages/api/submit-filmmaker.ts`)
4. Admin reviews at `/admin/filmmakers`
5. Admin approves via `approveFilmmaker()` or `archiveFilmmaker()` functions → status: `approved` or `archived`
6. Approved filmmakers appear in public directory

### 4. Role Standardization

Predefined roles organized by category in `src/config/roles.ts`, with each canonical role having optional aliases for fuzzy matching.

**How it works:**

**1. Data Structure** (`src/config/roles.ts`)
```typescript
export const FILM_ROLES_BY_CATEGORY = {
  'Camera & Photography': {
    'Director of Photography (DP)': ['Cinematographer', 'DP', 'Director of Photography'],
    'Camera Operator': ['Cam Op', 'Additional Camera Operator'],
    // ... more roles
  },
  // ... more categories
}
```

**2. Autocomplete** (`src/pages/submit.astro`)
- Server generates `roleAliasMap` (lowercase alias → canonical role mapping)
- Passed to client via JSON script tag using [**frontmatter**](#glossary)
- As user types, searches both canonical roles AND aliases
- Dropdown shows only canonical roles (no duplicate "DP" and "Director of Photography (DP)")
- Example: Typing "cinem" matches both "Cinematographer" (alias) and shows "Director of Photography (DP)" (canonical)

**3. Normalization** (`normalizeRole()` function)
- Case-insensitive matching: "director" → "Director"
- Alias resolution: "DP" → "Director of Photography (DP)"
- Deduplication: "DP, Cinematographer" → "Director of Photography (DP)"
- Returns input unchanged if no match found (allows custom roles)

**Benefits:**
- Prevents duplicate roles from typos/aliases
- Consistent data in database
- User-friendly autocomplete with common abbreviations

### 5. Admin Authentication

**Two-Layer Protection:**

1. **Middleware Protection** ([`src/middleware/index.ts`](src/middleware/index.ts))
   - Intercepts all `/admin/*` requests before pages load
   - Checks for HTTP Basic Auth header
   - Validates password against `ADMIN_PASSWORD` environment variable
   - Returns 401 Unauthorized if credentials missing/invalid
   - Browser prompts for username/password on first access

2. **API Endpoint Protection** ([`src/lib/auth.ts`](src/lib/auth.ts))
   - Additional check at API level using `isAuthenticated()` helper
   - Protects admin API endpoints (`/api/approve-filmmaker`, `/api/banner`)
   - Browser auto-includes cached credentials for [**same-origin**](#glossary) requests

**How it works:**
1. User accesses `/admin/*` → Middleware checks Authorization header
2. If missing → Browser shows Basic Auth prompt
3. User enters credentials → Browser sends them in Authorization header
4. Middleware validates password → Serves admin page if correct
5. Admin page loads data server-side (direct DB queries)
6. Admin page makes API calls for updates (credentials auto-included)
7. API endpoints verify Authorization header via `isAuthenticated()`

---

## SEO Implementation

### Meta Tags

`BaseLayout.astro` accepts props for SEO metadata and generates appropriate meta tags. See `src/layouts/BaseLayout.astro`.

**Usage:**
```astro
<BaseLayout
  title="Filmmaker Directory"
  description="Connect with local filmmakers in Asheville, NC"
  keywords="Asheville filmmakers, film crew, video production"
>
```

### Favicon

Emoji-based SVG favicon (clapperboard 🎬):
```html
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎬</text></svg>" />
```

Benefits:
- No image file needed
- Scales perfectly at any size
- Supports dark mode automatically

---

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4321)
npm run dev

# Dev server with network access
# Exposes server to local network (e.g., http://192.168.1.100:4321)
# Allows testing on mobile devices connected to same WiFi
npm run dev -- --host

# Type-check without building
npm run astro check
```

### Database Changes

```bash
# 1. Edit schema
vim src/db/schema.ts

# 2. Generate migration
npm run db:generate

# 3. Apply migration (local)
npm run db:migrate

# 4. View database in browser
npm run db:studio
```

### Building & Deployment

```bash
# Production build
npm run build

# Preview production build locally
# Serves the built output from dist/ with production settings
# Useful for testing SSR behavior, checking final bundle sizes, and verifying production optimizations
npm run preview
```

Deployment:
- Push to `main` branch
- Vercel automatically deploys
- Migrations must be run manually on production database

---

## Common Patterns

### API Response Helpers

**AVOID REPETITION**: Don't manually create Response objects. Use shared helpers from `src/lib/api.ts`:
- `errorResponse(message, status = 400)` - Error responses
- `successResponse(data)` - Success responses
- `jsonResponse(data, status)` - Generic JSON response

See [API response helpers example](#code-api-helpers).

### Database Query Patterns

**Use transactions only when needed:** Only wrap operations in transactions if they must all succeed or all fail together ([**atomicity**](#glossary) across multiple operations). Independent operations don't need transactions.

### Component Prop Pattern

Astro components accept data via props defined in a `Props` interface. The parent component passes data when rendering the child component.

**Key concepts:**
- Props are passed from parent to child, not vice versa (one-way data flow)
- Props interface defines what data the component expects
- Access props via `Astro.props` in component frontmatter
- Props are typed for compile-time safety
- Props can include functions, complex types, and optional fields

**Child component:** `src/components/FilmmakerTable.astro`

```astro
---
import type { PublicFilmmaker } from '../types/filmmaker';

// 1. Define Props interface - tells TypeScript what data this component expects
interface Props {
  filmmakers: PublicFilmmaker[];
}

// 2. Access props via Astro.props - available in all .astro component frontmatter
const { filmmakers } = Astro.props;

// Now you can use filmmakers in the template below
---

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Roles</th>
    </tr>
  </thead>
  <tbody>
    {filmmakers.map(f => (
      <tr>
        <td>{f.name}</td>
        <td>{f.roles}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**Parent component:** `src/pages/directory.astro`

```astro
---
import FilmmakerTable from '../components/FilmmakerTable.astro';
import type { PublicFilmmaker } from '../types/filmmaker';

// 3. Fetch data in parent (server-side in frontmatter)
const filmmakers: PublicFilmmaker[] = await fetchFilmmakers();
---

<!-- 4. Pass data to child component via props (like HTML attributes) -->
<FilmmakerTable filmmakers={filmmakers} />
```

**Why this pattern?**
- **Type safety:** Props interface catches errors at compile time
- **Server-side data fetching:** Parent fetches data, child just renders
- **Reusability:** Same component works with different data sources
- **One-way data flow:** Parent controls data, child is presentational

---

## Troubleshooting

### Styles Not Applying to Dynamic Content

**Problem**: JavaScript-generated HTML doesn't get scoped styles.

**Solution**: Wrap classes in `:global()`. See [CSS scoping example](#code-css-scoping).

### Migration Issues

**Problem**: Migration fails with "relation already exists".

**Solution**:
1. Check `drizzle/meta/_journal.json` for applied migrations
2. Ensure production DB has all migrations applied
3. Don't manually edit migration files

---

## Code Examples

### <a id="code-ssr-example"></a> Server-Side Rendering Example

**File:** `src/pages/directory.astro`

```astro
---
// Frontmatter runs ON THE SERVER when someone visits /directory
import { db } from '../db';
import { filmmakers } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { PublicFilmmaker } from '../types/filmmaker';

// Fetch data on server
const results = await db.select().from(filmmakers)
  .where(eq(filmmakers.status, 'approved'));

// Remove email/phone BEFORE sending to browser
const filmmakers = results.map(({ email, phone, ...filmmaker }) => filmmaker) as PublicFilmmaker[];
---

<!-- HTML is rendered on the server with filmmakers data already populated -->
<BaseLayout title="Directory">
  <FilmmakerTable filmmakers={filmmakers} />
</BaseLayout>
```

---

### <a id="code-islands-example"></a> Islands Architecture Example

**File:** `src/components/FilmmakerTable.astro`

```astro
<script>
  import type { PublicFilmmaker } from '../types/filmmaker';

  // This JavaScript runs IN THE BROWSER (client-side)
  // Unlike frontmatter which runs on the server, this code is bundled
  // and sent to the user's browser where it executes on page load
  const filmmakers: PublicFilmmaker[] = JSON.parse(
    document.getElementById('filmmaker-data')!.textContent || '[]'
  );

  document.getElementById('search')?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    filterResults(target.value);
  });
</script>
```

---

### <a id="code-css-scoping"></a> Astro CSS Scoping Example

**File:** `src/components/FilmmakerTable.astro`

```astro
<style>
  /* Works for static HTML in the template */
  .my-button { color: red; }

  /* Required for innerHTML-generated elements */
  :global(.dynamic-button) { color: blue; }

  /* Role filter tags created via JavaScript need :global() */
  :global(.role-filter-tag) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 16px;
    padding: 0.25rem 0.75rem;
  }
</style>

<script>
  // Creates HTML dynamically - classes MUST have :global() in CSS
  const tagContainer = document.getElementById('selected-roles-container')!;
  tagContainer.innerHTML = `
    <span class="role-filter-tag">
      ${role}
      <button class="dynamic-button">×</button>
    </span>
  `;
</script>
```

---

### <a id="code-json-script-tag"></a> JSON Script Tag Pattern (Passing Server Data)

**File:** `src/components/FilmmakerTable.astro`

```astro
---
// Server-side: Receive filmmakers as prop
interface Props {
  filmmakers: PublicFilmmaker[];
}
const { filmmakers } = Astro.props;
---

<!-- Inline JSON script tag (NOT bundled, just data) -->
<script is:inline id="filmmaker-data" type="application/json" set:html={JSON.stringify(filmmakers)}></script>

<!-- Separate bundled script with full TypeScript support -->
<script>
  import type { PublicFilmmaker } from '../types/filmmaker';

  // Load filmmakers from JSON script tag
  const filmmakers: PublicFilmmaker[] = JSON.parse(
    document.getElementById('filmmaker-data')!.textContent || '[]'
  );

  // Create Map for O(1) lookups
  const filmmakersMap = new Map(filmmakers.map(f => [f.id, f]));

  // Full TypeScript type checking works!
  filmmakers.filter(f => f.name.includes('search'));
</script>
```

**Why this pattern?**
- No unnecessary DOM elements (hidden divs)
- No `getElementById()` before data access
- No global namespace pollution
- Full TypeScript support (imports, type checking)
- Bundling and optimization still work


---

### <a id="code-api-route"></a> API Route Example

**File:** `src/pages/api/reveal-contact.ts`

```typescript
import type { APIRoute } from 'astro';
import { db } from '../../db';
import { filmmakers } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { errorResponse, jsonResponse } from '../../lib/api';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { filmmakerId } = await request.json();

    const result = await db
      .select({ email: filmmakers.email, phone: filmmakers.phone })
      .from(filmmakers)
      .where(eq(filmmakers.id, filmmakerId))
      .limit(1);

    if (!result[0]) {
      return errorResponse('Filmmaker not found', 404);
    }

    return jsonResponse({
      email: result[0].email,
      phone: result[0].phone,
    }, 200);
  } catch (error) {
    console.error('Error revealing contact:', error);
    return errorResponse('Internal error', 500);
  }
};
```

---

### <a id="code-server-exclusion"></a> Server-Side Data Exclusion

**File:** `src/pages/directory.astro`

```typescript
---
import { db } from '../db';
import { filmmakers } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { PublicFilmmaker } from '../types/filmmaker';

// Fetch all approved filmmakers
const results = await db.select().from(filmmakers)
  .where(eq(filmmakers.status, 'approved'));

// Remove email and phone BEFORE sending to browser
// Uses destructuring - cleaner than explicit field selection
const sanitizedFilmmakers = results.map(({ email, phone, ...filmmaker }) => filmmaker) as PublicFilmmaker[];
---

<BaseLayout title="Directory">
  <FilmmakerTable filmmakers={sanitizedFilmmakers} />
</BaseLayout>
```

---

### <a id="code-redis-atomic"></a> Redis Atomic Operations

**File:** `src/pages/api/reveal-contact.ts`

```typescript
// Atomic operations using multi() pipeline
const rateLimitKey = `rate-limit:reveal:${ip}`;

const multi = redis.multi();
multi.incr(rateLimitKey);        // Increment counter
multi.expire(rateLimitKey, 3600); // Set TTL to 1 hour
await multi.exec();               // Execute atomically
```

**Why atomic?** Race condition prevention:
- ❌ **Without atomic**: Get count, increment, set expire → another request could sneak in between
- ✅ **With atomic**: Both operations happen as single unit → no race conditions


---

### <a id="code-api-helpers"></a> API Response Helpers

See `src/lib/api.ts` for helper functions: `errorResponse()`, `successResponse()`, `jsonResponse()`.

**Usage:**

```typescript
// ❌ Bad - Repeated boilerplate
return new Response(
  JSON.stringify({ error: 'Not found' }),
  {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  }
);

// ✅ Good - Use shared helper
import { errorResponse } from '../../lib/api';
return errorResponse('Not found', 404);
```

---

## Additional Resources

- **Astro Docs**: https://docs.astro.build
- **Drizzle ORM**: https://orm.drizzle.team
- **Vercel Docs**: https://vercel.com/docs
- **Project README**: `README.md` (user-facing documentation)
- **Project Instructions**: `CLAUDE.md` (development guidelines)
