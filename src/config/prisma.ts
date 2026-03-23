import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = `${process.env.DATABASE_URL}`;

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
  console.error('❌ Error: DATABASE_URL is not set in environment variables. Please check your .env file.');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

// Verify connection immediately using top-level await
try {
  await pool.query('SELECT 1');
  console.log('✅ DATABASE_URL is valid and reachable');
} catch (err: any) {
  console.error('❌ DATABASE_URL is invalid or unreachable:', err.message);
  process.exit(1);
}

// Use 'as any' to bypass the Pool type version mismatch
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

export default prisma;
