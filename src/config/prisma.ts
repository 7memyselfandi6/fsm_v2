import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = `${process.env.DATABASE_URL}`;

if (!process.env.DATABASE_URL) {
  console.warn('[PRISMA] Warning: DATABASE_URL is not set in environment variables');
}

const pool = new pg.Pool({ connectionString });
// Use 'as any' to bypass the Pool type version mismatch
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

export default prisma;
