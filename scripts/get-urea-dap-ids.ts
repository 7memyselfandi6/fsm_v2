import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

async function run() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  try {
    const urea = await prisma.fertilizerType.findFirst({ where: { name: 'UREA' } });
    const dap = await prisma.fertilizerType.findFirst({ where: { name: 'DAP' } });

    console.log('UREA ID:', urea?.id);
    console.log('DAP ID:', dap?.id);

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();
