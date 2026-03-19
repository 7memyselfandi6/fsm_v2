import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

async function testSummary() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🧪 Testing Hierarchical Demand Summary...');

    // 1. Get some real IDs from the database
    const federal = await prisma.federal.findFirst();
    const region = await prisma.region.findFirst();
    const zone = await prisma.zone.findFirst();
    const woreda = await prisma.woreda.findFirst();
    const kebele = await prisma.kebele.findFirst();
    const fertType = await prisma.fertilizerType.findFirst();

    if (!federal || !region || !zone || !woreda || !kebele || !fertType) {
      console.log('❌ Could not find required seed data. Please run seeding first.');
      return;
    }

    const { getHierarchicalDemandSummary } = await import('../src/services/demand.service.js');

    // 2. Test Federal Level
    console.log('\n--- Testing FEDERAL Level ---');
    const fedSummary = await getHierarchicalDemandSummary(fertType.id, federal.id, 'FEDERAL');
    console.log(JSON.stringify(fedSummary, null, 2));

    // 3. Test Region Level
    console.log('\n--- Testing REGION Level ---');
    const regSummary = await getHierarchicalDemandSummary(fertType.id, region.id, 'REGION');
    console.log(JSON.stringify(regSummary, null, 2));

    // 4. Test Woreda Level
    console.log('\n--- Testing WOREDA Level ---');
    const worSummary = await getHierarchicalDemandSummary(fertType.id, woreda.id, 'WOREDA');
    console.log(JSON.stringify(worSummary, null, 2));

    console.log('\n✨ Test completed.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testSummary();
