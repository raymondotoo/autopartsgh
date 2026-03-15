# Autoparts Hub Ghana

A marketplace for buyers to find compatible car parts and for sellers to list inventory with photos.

## Two ways to run

### Option A: Low-cost prototype (recommended to start)
Uses Supabase (free tier) to share listings across users.

```bash
npm install
npm run dev
```

Create `.env` in the project root with:
```
VITE_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR-ANON-KEY"
```

Setup instructions: `docs/SUPABASE_SETUP.md`

### Option B: Full production stack
Express + Postgres + Cloudinary + Flutterwave (paid or usage-based).

```bash
cd server
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Set the frontend API URL:
```bash
export VITE_API_URL="http://localhost:4000"
```

## Project docs
- Plan: `docs/PLAN.md`
- Architecture: `docs/ARCHITECTURE.md`
- API: `docs/API.md`
- Deployment (prod): `docs/DEPLOYMENT.md`
- Supabase prototype: `docs/SUPABASE_SETUP.md`

## GitHub Pages (starter deployment)
1. Run `npm run build`
2. Push the `dist/` folder to the `gh-pages` branch
3. Enable GitHub Pages for the repository
