# Evolve

Mobile-first social fitness app: share workouts, follow athletes, track nutrition, and train — with a black / white / electric green identity and 15 languages.

**Status:** `v1.0.0-alpha` — production UI ready for Vercel. Data currently runs on browser `localStorage` (demo); Supabase can be wired next.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, Framer Motion |
| Icons | Lucide |
| Maps | Leaflet + Carto tiles (no API key) |
| i18n | i18next / react-i18next (15 locales) |
| Backend (planned) | Supabase |

## Features

### Free
- Feed, Explore, Network, Profile
- Create posts, likes, comments, stories
- EvoFit: food search (500+ items), workouts, tools
- 15 languages + RTL (Arabic)
- Dark / light theme (Evolve palette)

### Pro (badged in UI)
- Premium Explore catalog items
- Upgrade CTA on `/pricing`
- Freemium badges mark locked capabilities clearly

## Color scheme

- **Black** — primary surfaces (`#0a0a0a` / near-black cards)
- **White** — typography and light-mode surfaces
- **Electric green** — accent (`accent` / Evolve green)

## Languages

EN, ES, FR, DE, IT, PT-BR, RU, ZH-CN, ZH-TW, JA, KO, HI, AR (RTL), TR, VI.

Switch language in **Settings**. Preference persists in `localStorage` across refresh and logout.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local server (127.0.0.1:3000) |
| `npm run dev:lan` | LAN access for phone testing |
| `npm run build` | Production build |
| `npm start` | Serve production build |

### Mobile preview (dev only)

In Cursor: **⌘⇧B → Evolve: Mobile Preview** → `/dev/preview` (phone frame). This route is **disabled in production**.

## Environment

No secrets are required for the demo app. When you add Supabase:

1. Copy `.env.example` (create if needed) to `.env.local`
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Never commit `.env.local` or service-role keys

## Deploy on Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Framework preset: **Next.js** (defaults are fine)
4. Add env vars when Supabase is connected
5. Deploy — production URL serves the App Router build

Optional: set a custom domain in the Vercel project settings.

## Project layout (high level)

```
app/(app)/          Authenticated shell (Feed, Explore, EvoFit, Profile, …)
app/login|register  Auth screens
components/         UI, feed, social, stories, providers
lib/                Storage, mock seed data, i18n helpers, share cards
public/locales/     Translation JSON (15 languages)
```

## Notes

- Auth and social graph are **client-side demo** persistence until Supabase is integrated.
- Maps use public Carto tiles; no Google Maps key needed.
- `/dev/preview` is for development QA only.
