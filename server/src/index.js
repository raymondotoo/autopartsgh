import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'autoparts-hub';

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || '';
const FLUTTERWAVE_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY || '';
const FLUTTERWAVE_WEBHOOK_HASH = process.env.FLUTTERWAVE_WEBHOOK_HASH || '';

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '5mb' }));

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing auth token' });
  const token = header.replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  return next();
}

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  whatsapp: z.string().optional(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const createPartSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  category: z.string().optional(),
  condition: z.string().optional(),
  price: z.string().min(1),
  location: z.string().optional(),
  images: z.array(z.string()).min(1),
  car: z.object({
    make: z.string().min(1),
    model: z.string().min(1),
    year: z.number().int()
  })
});

const paymentSchema = z.object({
  partId: z.string().min(1),
  buyerName: z.string().min(2),
  buyerEmail: z.string().email(),
  buyerPhone: z.string().min(6)
});

function parsePriceToNumber(price) {
  const match = String(price).replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function cloudinarySignature(params) {
  const sorted = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(sorted + CLOUDINARY_API_SECRET).digest('hex');
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get('/api/cars', async (req, res) => {
  const cars = await prisma.car.findMany({ orderBy: [{ make: 'asc' }, { model: 'asc' }, { year: 'asc' }] });
  res.json(cars);
});

app.get('/api/parts', async (req, res) => {
  const { make, model, year, query, category, condition, status } = req.query;

  const filters = {
    status: status ? String(status) : 'APPROVED'
  };

  if (make) filters.car = { ...(filters.car || {}), make: String(make) };
  if (model) filters.car = { ...(filters.car || {}), model: String(model) };
  if (year) filters.car = { ...(filters.car || {}), year: Number(year) };
  if (category) filters.category = String(category);
  if (condition) filters.condition = String(condition);
  if (query) {
    filters.OR = [
      { name: { contains: String(query), mode: 'insensitive' } },
      { description: { contains: String(query), mode: 'insensitive' } }
    ];
  }

  const parts = await prisma.part.findMany({
    where: filters,
    include: { seller: true, car: true },
    orderBy: { createdAt: 'desc' }
  });

  const formatted = parts.map(part => ({
    ...part,
    images: JSON.parse(part.images)
  }));

  res.json(formatted);
});

app.get('/api/parts/:id', async (req, res) => {
  const part = await prisma.part.findUnique({
    where: { id: req.params.id },
    include: { seller: true, car: true }
  });
  if (!part) return res.status(404).json({ error: 'Listing not found' });
  res.json({ ...part, images: JSON.parse(part.images) });
});

app.post('/api/auth/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.seller.findUnique({ where: { email: parsed.data.email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const seller = await prisma.seller.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp,
      passwordHash
    }
  });

  const token = signToken(seller);
  res.status(201).json({ token, seller: { id: seller.id, name: seller.name, email: seller.email, role: seller.role } });
});

app.post('/api/auth/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const seller = await prisma.seller.findUnique({ where: { email: parsed.data.email } });
  if (!seller) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(parsed.data.password, seller.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken(seller);
  res.json({ token, seller: { id: seller.id, name: seller.name, email: seller.email, role: seller.role } });
});

app.post('/api/uploads/sign', authRequired, (req, res) => {
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    return res.status(400).json({ error: 'Cloudinary not configured' });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    timestamp,
    folder: CLOUDINARY_FOLDER
  };
  const signature = cloudinarySignature(params);

  res.json({
    timestamp,
    signature,
    apiKey: CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
    folder: CLOUDINARY_FOLDER
  });
});

app.post('/api/parts', authRequired, async (req, res) => {
  const parsed = createPartSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const car = await prisma.car.upsert({
    where: { make_model_year: { make: parsed.data.car.make, model: parsed.data.car.model, year: parsed.data.car.year } },
    update: {},
    create: {
      make: parsed.data.car.make,
      model: parsed.data.car.model,
      year: parsed.data.car.year
    }
  });

  const listing = await prisma.part.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      category: parsed.data.category,
      condition: parsed.data.condition,
      price: parsed.data.price,
      location: parsed.data.location,
      images: JSON.stringify(parsed.data.images),
      sellerId: req.user.sub,
      carId: car.id
    },
    include: { seller: true, car: true }
  });

  res.status(201).json({ ...listing, images: parsed.data.images });
});

app.get('/api/me/listings', authRequired, async (req, res) => {
  const listings = await prisma.part.findMany({
    where: { sellerId: req.user.sub },
    include: { car: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(listings.map(item => ({ ...item, images: JSON.parse(item.images) })));
});

app.post('/api/payments/initialize', async (req, res) => {
  if (!FLUTTERWAVE_SECRET_KEY || !FLUTTERWAVE_PUBLIC_KEY) {
    return res.status(400).json({ error: 'Flutterwave not configured' });
  }

  const parsed = paymentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const part = await prisma.part.findUnique({
    where: { id: parsed.data.partId },
    include: { seller: true }
  });
  if (!part || part.status !== 'APPROVED') {
    return res.status(404).json({ error: 'Listing not available' });
  }

  const amount = parsePriceToNumber(part.price);
  if (!amount) return res.status(400).json({ error: 'Invalid price format' });

  const txRef = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const order = await prisma.order.create({
    data: {
      buyerName: parsed.data.buyerName,
      buyerEmail: parsed.data.buyerEmail,
      buyerPhone: parsed.data.buyerPhone,
      amount,
      currency: 'GHS',
      txRef,
      partId: part.id,
      sellerId: part.sellerId
    }
  });

  const response = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tx_ref: txRef,
      amount,
      currency: 'GHS',
      redirect_url: `${CLIENT_ORIGIN}/?payment=success&tx_ref=${txRef}`,
      customer: {
        email: parsed.data.buyerEmail,
        name: parsed.data.buyerName,
        phonenumber: parsed.data.buyerPhone
      },
      customizations: {
        title: 'Autoparts Hub Ghana',
        description: part.name
      }
    })
  });

  const payload = await response.json();
  if (!response.ok || payload?.status !== 'success') {
    return res.status(502).json({ error: 'Payment initialization failed', details: payload });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentLink: payload.data?.link }
  });

  res.json({
    paymentLink: payload.data?.link,
    txRef,
    orderId: order.id
  });
});

app.post('/api/payments/webhook', async (req, res) => {
  const hash = req.headers['verif-hash'];
  if (!hash || hash !== FLUTTERWAVE_WEBHOOK_HASH) {
    return res.status(401).send('Unauthorized');
  }

  const event = req.body;
  if (event?.data?.tx_ref) {
    const status = event?.data?.status === 'successful' ? 'PAID' : 'FAILED';
    await prisma.order.updateMany({
      where: { txRef: event.data.tx_ref },
      data: { status, paymentRef: event.data.flw_ref }
    });
  }

  res.status(200).send('ok');
});

app.get('/api/admin/listings', authRequired, adminOnly, async (req, res) => {
  const listings = await prisma.part.findMany({
    where: { status: 'PENDING' },
    include: { seller: true, car: true },
    orderBy: { createdAt: 'desc' }
  });

  res.json(listings.map(listing => ({ ...listing, images: JSON.parse(listing.images) })));
});

app.post('/api/admin/listings/:id/approve', authRequired, adminOnly, async (req, res) => {
  const listing = await prisma.part.update({
    where: { id: req.params.id },
    data: { status: 'APPROVED' }
  });
  res.json({ ...listing, images: JSON.parse(listing.images) });
});

app.post('/api/admin/listings/:id/reject', authRequired, adminOnly, async (req, res) => {
  const listing = await prisma.part.update({
    where: { id: req.params.id },
    data: { status: 'REJECTED' }
  });
  res.json({ ...listing, images: JSON.parse(listing.images) });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
