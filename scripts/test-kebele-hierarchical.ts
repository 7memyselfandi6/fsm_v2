import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';
import * as service from '../src/services/hierarchicalDemand.service.js';

async function testKebele() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🧪 Testing Kebele Hierarchical Summary...');

    const kebele = await prisma.kebele.findFirst();
    if (!kebele) {
      console.log('❌ No kebele found.');
      return;
    }

    console.log(`\n--- Testing KEBELE Summary (ID: ${kebele.id}) ---`);
    const summary = await service.getKebeleSummary(kebele.id, {});
    console.log(JSON.stringify(summary, null, 2));

    console.log(`\n--- Testing KEBELE Drill-Down (UREA) ---`);
    const drillDown = await service.getKebeleDrillDown(kebele.id, 'UREA', {});
    console.log(JSON.stringify(drillDown, null, 2));

    console.log('\n✨ Kebele test completed.');

  } catch (error) {
    console.error('❌ Kebele test failed:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testKebele();
