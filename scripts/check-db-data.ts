import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

async function checkData() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  try {
    const fedCount = await prisma.federal.count();
    const regCount = await prisma.region.count();
    const demandCount = await prisma.farmerDemand.count();
    
    console.log('--- DB Stats ---');
    console.log('Federal count:', fedCount);
    console.log('Region count:', regCount);
    console.log('Demand count:', demandCount);

    const fed = await prisma.federal.findFirst();
    console.log('First Federal ID:', fed?.id);

    const fert = await prisma.fertilizerType.findFirst();
    console.log('First Fertilizer Type ID:', fert?.id);

    // Check if any demands are linked to regions which are linked to federal
    const demands = await prisma.farmerDemand.findMany({
      take: 5,
      include: {
        farmer: {
          include: {
            kebele: {
              include: {
                woreda: {
                  include: {
                    zone: {
                      include: {
                        region: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log('\n--- Sample Demands ---');
    demands.forEach((d, i) => {
      console.log(`Demand ${i+1}: ID=${d.id}, RegionID=${d.farmer.kebele.woreda.zone.region.id}, FederalID=${d.farmer.kebele.woreda.zone.region.federalId}`);
    });

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkData();
