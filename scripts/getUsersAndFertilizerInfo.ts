import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function getRegionManagerUserPhoneNumber() {
  try {
    const regionManagerUser = await prisma.user.findFirst({
      where: { role: Role.REGION_MANAGER, regionId: '0e214a28-56bb-4e26-9b81-9e56aaccbb5a' }, // Idaho Region 7
      select: { phoneNumber: true, username: true, id: true, regionId: true },
    });

    if (regionManagerUser) {
      console.log('Region Manager User Found:');
      console.log(`  Username: ${regionManagerUser.username}`);
      console.log(`  Phone Number: ${regionManagerUser.phoneNumber}`);
      console.log(`  ID: ${regionManagerUser.id}`);
      console.log(`  Region ID: ${regionManagerUser.regionId}`);
    } else {
      console.log('No REGION_MANAGER user found.');
    }
  } catch (error) {
    console.error('Error fetching REGION_MANAGER user:', error);
  } finally {
    // Disconnect only at the end of the script, not after each function
    // await prisma.$disconnect(); 
  }
}

async function getDemandsForFertilizerType(fertilizerTypeId: string) {
  try {
    const demands = await prisma.farmerDemand.findMany({
      where: {
        fertilizerTypeId: fertilizerTypeId,
      },
      select: {
        farmer: {
          select: {
            kebele: {
              select: {
                id: true,
                name: true,
                woreda: {
                  select: {
                    id: true,
                    name: true,
                    zone: {
                      select: {
                        id: true,
                        name: true,
                        region: {
                          select: {
                            id: true,
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (demands.length > 0) {
      console.log(`\nDemands for Fertilizer Type ID: ${fertilizerTypeId}`);
      demands.forEach((demand, index) => {
        if (demand.farmer?.kebele) {
          console.log(`  Demand ${index + 1}:`);
          console.log(`    Kebele ID: ${demand.farmer.kebele.id}`);
          console.log(`    Kebele Name: ${demand.farmer.kebele.name}`);
          console.log(`    Woreda ID: ${demand.farmer.kebele.woreda.id}`);
          console.log(`    Woreda Name: ${demand.farmer.kebele.woreda.name}`);
          console.log(`    Zone ID: ${demand.farmer.kebele.woreda.zone.id}`);
          console.log(`    Zone Name: ${demand.farmer.kebele.woreda.zone.name}`);
          console.log(`    Region ID: ${demand.farmer.kebele.woreda.zone.region.id}`);
          console.log(`    Region Name: ${demand.farmer.kebele.woreda.zone.region.name}`);
        }
      });
    } else {
      console.log(`\nNo demands found for Fertilizer Type ID: ${fertilizerTypeId}`);
    }
  } catch (error) {
    console.error('Error fetching demands:', error);
  }
}

async function main() {
  await getRegionManagerUserPhoneNumber();
  await getDemandsForFertilizerType('274e48ae-0b34-4d8b-afc9-fdbd326325ab');
  await prisma.$disconnect();
}

main();