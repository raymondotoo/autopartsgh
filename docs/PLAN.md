# Autoparts Hub Ghana - Project Plan

## Vision
Create a central hub where buyers in Ghana can quickly find compatible car parts, and sellers can list inventory with photos and contact details. Start on GitHub Pages with a static-first build, then evolve to a full marketplace.

## Phase 0 - Foundations (Current)
- Define car compatibility data (make, model, year).
- Seed a few sample listings for demo.
- Build buyer search flow with dropdown filters.
- Build seller upload flow with photos stored locally.
- Create a Ghana-first UI with clear calls to action.

## Phase 1 - Marketplace MVP
- Persistent listings backed by a hosted database.
- Seller accounts and basic authentication.
- Admin moderation for listings.
- Image storage (object storage) + CDN.
- SEO landing pages for popular makes/models.

## Phase 2 - Growth & Trust
- Payments and escrow options.
- Verified seller badges and ratings.
- Inventory management for bulk sellers.
- Logistics/dispatch partner integrations.

## Phase 3 - Intelligence
- Recommendations based on car profile.
- Price history and availability trends.
- Auto-suggest compatible alternatives.
- Analytics dashboard for sellers.

## Key Features (MVP)
- Buyer filters: make, model, year, category, condition.
- Listings with photos, price, location, seller contact.
- Seller upload form with image previews.
- WhatsApp/phone contact links.

## Data Model (Initial)
- Car: make, model, years
- Part: id, name, description, category, condition, price, location, images
- Seller: name, phone, whatsapp

## Delivery Milestones
1. Static site UX (GitHub Pages) - Done in this repo.
2. Deploy to GitHub Pages and share public link.
3. Implement hosted backend (API + DB).
4. Add authentication + seller dashboards.
5. Introduce payments and delivery options.
