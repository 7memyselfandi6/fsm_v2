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
    const fert = await prisma.fertilizerType.findFirst({
      where: {
        demands: {
          some: {}
        }
      }
    });

    if (!fert) {
      console.log('No fertilizer type with demands found.');
      return;
    }

    console.log('--- VALID TEST PARAMETERS ---');
    console.log('fertilizerTypeId:', fert.id);
    console.log('Fertilizer Name:', fert.name);

    const fed = await prisma.federal.findFirst();
    console.log('\n--- FEDERAL ---');
    console.log('adminId:', fed?.id);

    const reg = await prisma.region.findFirst({
      where: {
        zones: {
          some: {
            woredas: {
              some: {
                kebeles: {
                  some: {
                    farmers: {
                      some: {
                        demands: {
                          some: {
                            fertilizerTypeId: fert.id
                          }
                        }
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
    console.log('\n--- REGION ---');
    console.log('adminId:', reg?.id);
    console.log('Name:', reg?.name);

    const zone = await prisma.zone.findFirst({
      where: {
        woredas: {
          some: {
            kebeles: {
              some: {
                farmers: {
                  some: {
                    demands: {
                      some: {
                        fertilizerTypeId: fert.id
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
    console.log('\n--- ZONE ---');
    console.log('adminId:', zone?.id);
    console.log('Name:', zone?.name);

    const woreda = await prisma.woreda.findFirst({
      where: {
        kebeles: {
          some: {
            farmers: {
              some: {
                demands: {
                  some: {
                    fertilizerTypeId: fert.id
                  }
                }
              }
            }
          }
        }
      }
    });
    console.log('\n--- WOREDA ---');
    console.log('adminId:', woreda?.id);
    console.log('Name:', woreda?.name);

    const kebele = await prisma.kebele.findFirst({
      where: {
        farmers: {
          some: {
            demands: {
              some: {
                fertilizerTypeId: fert.id
              }
            }
          }
        }
      }
    });
    console.log('\n--- KEBELE ---');
    console.log('adminId:', kebele?.id);
    console.log('Name:', kebele?.name);

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();
