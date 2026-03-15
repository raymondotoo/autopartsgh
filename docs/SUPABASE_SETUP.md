# Low-Cost Prototype (Supabase)

This setup gives you shared listings across users without running a backend server.

## 1) Create project
- Create a new Supabase project
- Get the project URL and anon key

## 2) Create table
Run this SQL in Supabase SQL editor:

```sql
create table if not exists parts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  category text,
  condition text,
  price text not null,
  location text,
  images text[] default '{}',
  car_make text not null,
  car_model text not null,
  car_year int not null,
  seller_name text not null,
  seller_phone text not null,
  seller_whatsapp text,
  created_at timestamptz default now()
);

alter table parts enable row level security;

create policy "Public read" on parts
  for select using (true);

create policy "Public insert" on parts
  for insert with check (true);
```

## 3) Add env vars
Create `.env` in the project root:

```
VITE_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR-ANON-KEY"
```

## 4) Run
```bash
npm install
npm run dev
```

## Notes
- This is a low-cost prototype setup. Anyone can insert records.
- For production, add auth + policies and move to the full backend.
