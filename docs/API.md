# Autoparts Hub Ghana - API

The UI uses a service layer in `src/services/partsService.js` and switches to the backend API when `VITE_API_URL` is set.

## Core endpoints
- `GET /api/cars` -> car makes/models/years
- `GET /api/parts?make=&model=&year=&query=&category=&condition=` -> filtered parts
- `POST /api/parts` -> create listing (auth required)
- `GET /api/parts/:id` -> listing details
- `GET /api/me/listings` -> seller listings

## Auth
- `POST /api/auth/login`
- `POST /api/auth/register`

## Admin
- `GET /api/admin/listings` -> pending listings
- `POST /api/admin/listings/:id/approve`
- `POST /api/admin/listings/:id/reject`

## Uploads
- `POST /api/uploads/sign` -> Cloudinary signed upload payload (auth required)

## Payments
- `POST /api/payments/initialize` -> creates Flutterwave checkout link
- `POST /api/payments/webhook` -> Flutterwave webhook updates order status
