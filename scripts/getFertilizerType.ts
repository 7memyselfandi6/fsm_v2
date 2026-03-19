import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function getFertilizerTypeId() {
  try {
    const fertilizerType = await prisma.fertilizerType.findFirst({
      select: { id: true, name: true },
    });

    if (fertilizerType) {
      console.log('Fertilizer Type Found:');
      console.log(`  Name: ${fertilizerType.name}`);
      console.log(`  ID: ${fertilizerType.id}`);
    } else {
      console.log('No fertilizer type found.');
    }
  } catch (error) {
    console.error('Error fetching fertilizer type:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getFertilizerTypeId();