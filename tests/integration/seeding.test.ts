import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

describe('Database Seeding Verification', () => {
  let prisma: PrismaClient;
  let pool: pg.Pool;

  beforeAll(() => {
    const connectionString = process.env.DATABASE_URL;
    pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
    const adapter = new PrismaPg(pool as any);
    prisma = new PrismaClient({ adapter });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  it('should have at least 19 records in each main table', async () => {
    const tables = [
      'region', 'zone', 'woreda', 'kebele', 'section',
      'union', 'destination', 'pC', 'user', 'farmer',
      'farmerDemand', 'fertilizerSale', 'shippingLot',
      'lotDispatch', 'pCInventory', 'warehouse',
      'fertilizerSubsidy', 'lockHistory', 'cropFertilizerRate'
    ];

    for (const table of tables) {
      // @ts-ignore
      const count = await prisma[table].count();
      expect(count).toBeGreaterThanOrEqual(19);
    }
  }, 30000);

  it('should have all specific users with correct phone numbers and roles', async () => {
    const specificUsers = [
      { phone: '0910000000', role: Role.SUPER_ADMIN },
      { phone: '0910000001', role: Role.KEBELE_MANAGER },
      { phone: '0910000011', role: Role.KEBELE_DA },
      { phone: '0910000002', role: Role.WOREDA_MANAGER },
      { phone: '0910000022', role: Role.WOREDA_EXPERT },
      { phone: '0910000003', role: Role.ZONE_MANAGER },
      { phone: '0910000033', role: Role.ZONE_EXPERT },
      { phone: '0910000004', role: Role.REGION_MANAGER },
      { phone: '0910000044', role: Role.REGION_EXPERT },
      { phone: '0910000005', role: Role.MOA_MANAGER },
      { phone: '0910000055', role: Role.MOA_EXPERT },
      { phone: '0910000006', role: Role.PC_ACCOUNTANT },
      { phone: '0910000066', role: Role.PC_STOREMAN },
      { phone: '0910000007', role: Role.UNION_MEMBER },
    ];

    for (const u of specificUsers) {
      const user = await prisma.user.findUnique({ where: { phoneNumber: u.phone } });
      expect(user).toBeDefined();
      expect(user?.role).toBe(u.role);
    }
  }, 30000);

  it('should maintain referential integrity for demands', async () => {
    const demand = await prisma.farmerDemand.findFirst({ include: { farmer: true } });
    expect(demand).toBeDefined();
    expect(demand?.farmer).toBeDefined();
  });
});
