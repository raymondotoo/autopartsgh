# Autoparts Hub Ghana - System Architecture

## Current (GitHub Pages MVP)
- Static Vite + React site
- Local JSON data for cars and seed listings
- Seller uploads stored in browser localStorage
- No backend yet

```mermaid
flowchart TB
  subgraph Client[User Browser]
    UI[React UI]
    LS[LocalStorage]
    JSON[Seed JSON Data]
  end

  UI --> JSON
  UI --> LS

  subgraph Hosting[GitHub Pages]
    Static[Static Assets]
  end

  Static --> UI
```

## Production (Option 1)
- Render for API + Postgres
- Cloudinary for images
- Flutterwave for payments
- Netlify/Vercel for frontend

```mermaid
flowchart TB
  subgraph Client[Web]
    Buyer[Buyer UI]
    Seller[Seller UI]
    Admin[Admin UI]
  end

  subgraph Hosting[Frontend Hosting]
    FE[Netlify/Vercel]
  end

  subgraph Backend[Render API]
    API[Express API]
    Auth[JWT Auth]
  end

  subgraph Data[Render Postgres]
    DB[(Postgres)]
  end

  subgraph Media[Cloudinary]
    Cloudinary[Image Storage]
  end

  subgraph Payments[Flutterwave]
    Flutterwave[Payment Gateway]
  end

  FE --> Buyer
  FE --> Seller
  FE --> Admin

  Buyer --> API
  Seller --> API
  Admin --> API

  API --> DB
  API --> Cloudinary
  API --> Flutterwave
```
