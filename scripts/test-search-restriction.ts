import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

async function testSearch() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🧪 Testing Restricted Fertilizer Search (UREA/DAP only)...');

    const { searchFertilizer } = await import('../src/services/fertilizer.service.js');

    // 1. Get UREA and DAP IDs
    const urea = await prisma.fertilizerType.findFirst({ where: { name: 'UREA' } });
    const dap = await prisma.fertilizerType.findFirst({ where: { name: 'DAP' } });
    const other = await prisma.fertilizerType.findFirst({ where: { name: { notIn: ['UREA', 'DAP'] } } });

    if (!urea || !dap) {
      console.log('❌ UREA or DAP not found in database. Please run seeding first.');
      return;
    }

    // 2. Test UREA search
    console.log('\n--- Testing UREA Search ---');
    try {
      const result = await searchFertilizer(urea.id);
      console.log('✅ UREA Search Success:', result?.name === 'UREA');
    } catch (e: any) {
      console.log('❌ UREA Search Failed:', e.message);
    }

    // 3. Test DAP search
    console.log('\n--- Testing DAP Search ---');
    try {
      const result = await searchFertilizer(dap.id);
      console.log('✅ DAP Search Success:', result?.name === 'DAP');
    } catch (e: any) {
      console.log('❌ DAP Search Failed:', e.message);
    }

    // 4. Test Invalid search (other type)
    if (other) {
      console.log(`\n--- Testing Restricted Search (Type: ${other.name}) ---`);
      try {
        await searchFertilizer(other.id);
        console.log('❌ Restriction Failed: Allowed non-UREA/DAP type');
      } catch (e: any) {
        console.log('✅ Restriction Success:', e.message);
      }
    }

    // 5. Test Invalid search (random ID)
    console.log('\n--- Testing Invalid ID Search ---');
    try {
      await searchFertilizer('00000000-0000-0000-0000-000000000000');
      console.log('❌ Restriction Failed: Allowed random ID');
    } catch (e: any) {
      console.log('✅ Restriction Success:', e.message);
    }

    console.log('\n✨ Search test completed.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testSearch();
