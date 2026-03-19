import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

async function testGeneration() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🧪 Testing Demand Generation System...');

    const fert = await prisma.fertilizerType.findFirst();
    if (!fert) {
      console.log('❌ No fertilizer type found.');
      return;
    }

    const { generateDemands } = await import('../src/services/demand.service.js');
    
    console.log(`Generating demands for Fertilizer: ${fert.name} (${fert.id})`);
    const result = await generateDemands(fert.id);
    
    console.log('\n📊 Generation Summary:');
    console.log(JSON.stringify(result, null, 2));

    // Verify in DB
    const count = await prisma.farmerDemand.count({
      where: { fertilizerTypeId: fert.id }
    });
    console.log(`\nTotal demands in DB for this fertilizer: ${count}`);

    // Check characteristics
    const samples = await prisma.farmerDemand.findMany({
      where: { fertilizerTypeId: fert.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { farmer: { include: { kebele: true } } }
    });

    console.log('\n🔍 Sample Data Check:');
    samples.forEach((s, i) => {
      console.log(`[${i+1}] Qty: ${s.originalQuantity}, Priority: ${s.priority}, Recurrence: ${s.recurrence}, TargetDate: ${s.targetDate?.toISOString()}, Kebele: ${s.farmer.kebele.name}`);
    });

  } catch (error) {
    console.error('❌ Generation test failed:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testGeneration();
