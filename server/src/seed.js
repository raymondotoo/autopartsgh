import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const adminEmail = process.env.ADMIN_EMAIL || 'admin@autopartshub.local';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';

async function loadJson(relativePath) {
  const fullPath = path.resolve(process.cwd(), relativePath);
  const raw = await fs.readFile(fullPath, 'utf-8');
  return JSON.parse(raw);
}

async function main() {
  const cars = await loadJson('../src/data/cars.json');
  const parts = await loadJson('../src/data/parts.json');

  const admin = await prisma.seller.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin',
      email: adminEmail,
      phone: '+233000000000',
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: 'ADMIN'
    }
  });

  for (const makeEntry of cars) {
    for (const modelEntry of makeEntry.models) {
      for (const year of modelEntry.years) {
        await prisma.car.upsert({
          where: { make_model_year: { make: makeEntry.make, model: modelEntry.name, year } },
          update: {},
          create: { make: makeEntry.make, model: modelEntry.name, year }
        });
      }
    }
  }

  for (const part of parts) {
    const car = await prisma.car.findUnique({
      where: { make_model_year: { make: part.car.make, model: part.car.model, year: part.car.year } }
    });
    if (!car) continue;

    await prisma.part.create({
      data: {
        name: part.name,
        description: part.description,
        category: part.category,
        condition: part.condition,
        price: part.price,
        location: part.location,
        images: JSON.stringify(part.images || []),
        status: 'APPROVED',
        sellerId: admin.id,
        carId: car.id
      }
    });
  }
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
