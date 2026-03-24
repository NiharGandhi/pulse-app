# CLAUDE.md

## What is Pulse?
Pulse is a real-time vibe discovery app for Dubai. Users check in to restaurants, cafes, bars and nightlife venues and report the current atmosphere — how busy it is, what the vibe is like, whether the Burj Khalifa view is clear. Other users see live check-ins from the last 2 hours to decide where to go tonight.

This is not a review app. It is a real-time signal app. Check-ins are ephemeral (2-hour TTL). There are no star ratings from users (only cached Google ratings).

---

## Project Structure

```
/pulse
├── /frontend        → Next.js 14 (App Router, TypeScript)
├── /backend         → Node.js + Hono (TypeScript)
└── /auth            → Clerk (hosted auth, not a folder we build)
```

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 14, App Router, TypeScript | |
| Styling | Tailwind CSS v4 + CSS custom properties | Global theming via `:root` vars |
| Backend | Node.js + Hono | Lightweight, edge-ready, TypeScript |
| Database | Neon (Postgres) | Serverless Postgres |
| ORM | Drizzle ORM | Type-safe, works great with Neon |
| Auth | Clerk | Phone + Google OAuth. Never build auth manually |
| Storage | Cloudflare R2 | S3-compatible, for check-in photos |
| Real-time TTL | Upstash Redis | Check-ins auto-expire after 2 hours |
| Venue data | Google Places API | Venue database, photos, hours, ratings |
| AI search | OpenAI API (gpt-4o-mini) | Natural language vibe search |

---

## Environment Variables

### Frontend (/frontend/.env.local)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=
```

### Backend (/backend/.env)
```
DATABASE_URL=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=pulse-checkins
OPENAI_API_KEY=
GOOGLE_PLACES_API_KEY=
```

---

## Database Schema (Drizzle + Neon Postgres)

### users
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
clerk_id    text UNIQUE NOT NULL
username    text UNIQUE
avatar_url  text
created_at  timestamp DEFAULT now()
```

### venues
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
google_place_id     text UNIQUE NOT NULL
name                text NOT NULL
area                text          -- e.g. "DIFC", "Business Bay"
category            text          -- e.g. "restaurant", "bar", "cafe"
latitude            decimal(10,8)
longitude           decimal(11,8)
google_rating       decimal(2,1)
photo_reference     text          -- Google Places photo ref
created_at          timestamp DEFAULT now()
```

### check_ins
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
venue_id        uuid REFERENCES venues(id)
user_id         uuid REFERENCES users(id)
busy_level      text CHECK (busy_level IN ('dead', 'moderate', 'packed'))
vibe_tags       text[]        -- ['chill', 'lively', 'loud', 'romantic']
view_status     text CHECK (view_status IN ('clear', 'blocked', 'na'))
photo_url       text          -- Cloudflare R2 URL (optional)
is_anonymous    boolean DEFAULT false
created_at      timestamp DEFAULT now()
expires_at      timestamp     -- created_at + 2 hours
```

### waitlist
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
email       text UNIQUE NOT NULL
position    integer
created_at  timestamp DEFAULT now()
```

---

## API Routes (Hono Backend — port 3001)

### Check-ins
- `POST /api/checkins` — create a check-in
- `GET /api/checkins/venue/:venueId` — get live check-ins for a venue (last 2hrs only)
- `GET /api/checkins/feed?lat=&lng=&radius=` — get live feed near a location

### Venues
- `GET /api/venues/search?q=` — search venues via Google Places
- `GET /api/venues/:id` — get venue details + live check-in summary
- `POST /api/venues` — create/upsert venue from Google Places data

### Search
- `POST /api/search/vibe` — natural language vibe search (AI-powered, **SSE streaming**)
  - Body: `{ query: "lively Indian place in Business Bay with Burj views" }`
  - Streams `event: step` events with `{ step: "..." }` at each pipeline stage
  - Ends with `event: done` containing `{ success, data: VibeSearchResult[] }`
  - Pipeline stages: Analyzing → Google Places → Reading reviews → Ranking → Summaries

### Waitlist
- `POST /api/waitlist` — add email to waitlist, return position number

### Upload
- `POST /api/upload/checkin-photo` — upload photo to Cloudflare R2, return URL

---

## Key Business Rules

1. **Check-ins expire after 2 hours.** Use `expires_at` field. All queries filter `WHERE expires_at > NOW()`.
2. **A venue's "current vibe" is the aggregate of check-ins in the last 2 hours.** If no check-ins, show "No data yet."
3. **Check-ins can be anonymous.** If `is_anonymous = true`, never expose `user_id` in API responses.
4. **Vibe search uses real check-in data.** AI search must only return venues that have active check-ins matching the query. Don't return venues with no recent data as "lively."
5. **Google Places is the source of truth for venue info.** We cache venue data in our DB but always defer to Google for hours, ratings, photos.
6. **One check-in per user per venue per hour.** Rate limit to prevent spam.

---

## Coding Conventions

- **TypeScript everywhere.** No `any` types. Define interfaces for all API request/response shapes.
- **Drizzle for all DB queries.** Never write raw SQL except in migrations.
- **Hono middleware for auth.** Every protected route uses Clerk JWT verification middleware.
- **Error handling.** All API routes return `{ success: boolean, data?: any, error?: string }`.
- **No console.log in production.** Use a proper logger (pino).
- **CSS custom properties for all colors.** Use `var(--bg)`, `var(--text)`, etc. — never hardcode hex values in components. See Design System below.
- **Server Components by default** in Next.js. Only use `'use client'` when you need interactivity.
- **No inline style hacks.** Don't mix `background` shorthand and `backgroundImage` in the same style object — use `backgroundImage` only for both gradient and photo cases.

---

## Frontend Pages

```
/                       → Waitlist landing page
/home                   → Live feed + hero (authenticated)
/search                 → Vibe search (AI-powered, SSE streaming loader)
/venue/[id]             → Venue detail + live check-ins (our DB venues)
/place/[placeId]        → Place detail (Google Places — photo gallery, hours, reviews)
/checkin/[venueId]      → Check-in flow (10-second tap flow)
/saved                  → Saved/bookmarked venues
/leaderboard            → Community points leaderboard
/profile                → User profile
/sign-in, /sign-up      → Clerk auth pages
```

---

## Component Architecture

```
/frontend
├── app/                        → Next.js App Router pages
├── components/
│   ├── layout/
│   │   └── Navbar.tsx          → Desktop header + mobile bottom tab bar + check-in FAB
│   ├── venue/
│   │   ├── PlaceCard.tsx       → SHARED reusable card: PlaceCard, PlaceCardGrid, PlaceCardSkeleton
│   │   └── VibeSummaryBlock.tsx → Live vibe summary (busy level + vibe tags)
│   ├── checkin/
│   │   ├── CheckInsList.tsx    → List of recent check-ins for a venue
│   │   └── CheckInFlow.tsx     → Check-in tap flow
│   └── ai/
│       └── AIConcierge.tsx     → AI assistant component
├── lib/
│   ├── api.ts                  → API client. vibeSearch() uses SSE streaming with onStep callback
│   ├── utils.ts                → helpers (timeAgo, cn, etc.)
│   └── constants.ts            → vibe tags, busy levels, etc.
└── hooks/
    ├── useCheckins.ts          → fetch + poll check-ins for a venue
    └── useVenue.ts             → venue data + check-in summary
```

### PlaceCard — Shared Component
`PlaceCardData` type: `id, name, area, googleRating, photoReference, openNow, aiSummary, relevanceScore, liveSummary, onClick, href`
- Renders as `<a>` if `href` provided, otherwise `<button>` with `onClick`
- Photo with `aspectRatio: "4/3"` (not fixed height — scales proportionally)
- Badge top-left: match % or live count
- Open/Closed pill top-right
- Info panel: name → area/rating → AI summary → vibe tags

### vibeSearch() in lib/api.ts
```typescript
vibeSearch(query: string, onStep?: (step: string) => void): Promise<ApiResponse<VibeSearchResult[]>>
```
Consumes SSE stream, calls `onStep` for each `event: step`, resolves on `event: done`.

---

## Design System

All colors are CSS custom properties defined in `frontend/app/globals.css`. **Never hardcode hex values in components.**

### Color Tokens (`:root`)
```css
/* Backgrounds */
--bg:          #FAF9F7;     /* page background */
--surface:     #FFFFFF;     /* cards, panels */
--surface-2:   #F2F0ED;     /* inputs, skeletons */
--surface-3:   #EAE7E3;     /* hover states */

/* Borders */
--border:      #E2DDD8;
--border-2:    #CEC8C1;     /* focused inputs */

/* Text */
--text:        #1A1714;     /* primary text */
--text-2:      #6E6760;     /* secondary text */
--text-3:      #AFA89F;     /* muted/placeholder */

/* Accent */
--lime:        #C8FF00;     /* backgrounds, buttons, highlights */
--lime-text:   #4E6200;     /* lime as readable text on light bg */
--lime-bg:     #F0FFB3;     /* lime as subtle tinted surface */

/* Semantic */
--open:        #2E7D32;     /* open now */
--closed:      #C0392B;     /* closed */
--live:        #22c55e;     /* live pulse dot */

/* Shadows */
--shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 1px 8px rgba(0,0,0,0.04);
```

### Global CSS Utilities (globals.css)
- `.page` — `min-height: 100vh; background: var(--bg); color: var(--text)`
- `.card` — `background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-card)`
- `.input-field` — styled input with border, focus state
- `.label-muted` — 11px uppercase tracking label in `var(--text-3)`
- `.no-scrollbar` — hides scrollbar cross-browser

### Fonts
- **Display / Headings:** Space Grotesk — `font-display italic font-bold` — used for all `h1`-level headings on every page
- **Body:** DM Sans — `font-body` — all body text, labels, UI copy
- **Serif (accent):** Instrument Serif — `.serif` — used sparingly for editorial text

### Vibe Tag Colors (light theme pastels)
Used consistently in PlaceCard, VibeSummaryBlock, CheckInsList:
```
lively:   bg #EEFF99  text #4E6200
chill:    bg #CCF0FF  text #005A75
loud:     bg #FFE5CC  text #7A3000
romantic: bg #FFD6F0  text #7A004F
packed:   bg #FFD6D6  text #7A0000
moderate: bg #FFF0CC  text #664800
dead:     bg #EDEBE8  text #5A5450
view clear: bg #D6FFE8 text #005A2A
```

### Photo Hero Pattern
Pages with a photo hero (`venue/[id]`, `place/[placeId]`):
- Photo fills hero area, gradient overlay `linear-gradient(to top, rgba(0,0,0,0.75), transparent)`
- Name/address overlaid in white on the photo — this is intentional and fine
- Back button: white/85% opacity bg with dark icon (visible on both light and dark photos)
- Content below the hero uses `var(--bg)` background — full light theme

### Home Page Cards (horizontal scroll — NOT grid)
`PlaceCard` and `FeedCard` in `/home` are vertical scroll cards (320px tall, 240px wide) with dark photo overlays. This is intentional — the home page uses horizontal scroll sections, not the `PlaceCardGrid`.

### Search Page Cards (grid)
Search results use `PlaceCardGrid` (2-col mobile, 3-col desktop) with the shared `PlaceCard` component. Portrait cards with `aspectRatio: 4/3` photo.

---

## Current Status (as of 2026-03-17)

### Built and working
- [x] Folder structure + project scaffolding
- [x] Next.js frontend with App Router + TypeScript
- [x] Hono backend on port 3001
- [x] Neon DB connected + Drizzle schema migrated
- [x] Clerk auth integrated (sign-in/sign-up)
- [x] Waitlist landing page (`/`)
- [x] Navbar — desktop header + mobile bottom tab bar
- [x] Home page (`/home`) — hero, vibe filters, Google Places nearby, live feed, editorial section
- [x] Search page (`/search`) — AI vibe search with SSE streaming progress UI, result grid
- [x] Venue detail (`/venue/[id]`) — our DB venues, live vibe summary, recent check-ins
- [x] Place detail (`/place/[placeId]`) — Google Places data, photo gallery, hours, reviews, CTA
- [x] Saved page (`/saved`) — bookmarked venues list
- [x] Leaderboard (`/leaderboard`) — community points rankings
- [x] PlaceCard shared component (used in search, extensible)
- [x] VibeSummaryBlock — live vibe display
- [x] CheckInsList — recent check-ins per venue
- [x] Full light theme — all pages use CSS custom property tokens

### Not yet built
- [ ] Check-in flow (`/checkin/[venueId]`) — 10-second tap flow
- [ ] Profile page (`/profile`)
- [ ] Bookmarking / save functionality (UI exists but save action not wired)
- [ ] Points / leaderboard backend (frontend UI exists, backend not built)

---

## What NOT to build (V1 scope)

- No notifications (V2)
- No social following/followers (V2)
- No comments on check-ins (V2)
- No restaurant-facing dashboard (V2)
- No mobile app (V2 — PWA first)
- No payments (V3)

> Note: Gamification/points leaderboard was originally V2, but the frontend UI has been built. Backend points logic is still deferred.
