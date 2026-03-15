# Deployment Guide (Option 1)

## 1) Cloudinary
1. Create a Cloudinary account.
2. Note `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
3. (Optional) Set `CLOUDINARY_FOLDER` to `autoparts-hub`.

## 2) Flutterwave
1. Create a Flutterwave account.
2. Copy `FLUTTERWAVE_SECRET_KEY` and `FLUTTERWAVE_PUBLIC_KEY`.
3. Create a webhook secret hash and set `FLUTTERWAVE_WEBHOOK_HASH`.
4. Add webhook URL: `https://YOUR-API-DOMAIN/api/payments/webhook`.

## 3) Render (Backend + Postgres)
1. Create a new Render Blueprint using `render.yaml`.
2. Fill in env vars for Cloudinary + Flutterwave.
3. Update `CLIENT_ORIGIN` to your frontend domain.
4. Deploy and capture the API URL.

## 4) Netlify (Frontend)
1. Deploy the repo on Netlify.
2. Add environment variable:
   - `VITE_API_URL` = `https://YOUR-API-DOMAIN`
3. Deploy.

## 5) Admin access
Seeded admin credentials come from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the backend env.

## Notes
- Payments are GHS via Flutterwave.
- Listings are `PENDING` until approved by an admin.
