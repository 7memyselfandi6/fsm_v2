import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, MoaPosition, MoaRole, MoaSector, MoaLeadExecutive } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing data
  await prisma.fertilizerSale.deleteMany({});
  await prisma.pCInventory.deleteMany({});
  await prisma.lotDispatch.deleteMany({});
  await prisma.shippingLot.deleteMany({});
  await prisma.farmerDemand.deleteMany({});
  await prisma.farmer.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.pC.deleteMany({});
  await prisma.destination.deleteMany({});
  await prisma.union.deleteMany({});
  await prisma.kebele.deleteMany({});
  await prisma.woreda.deleteMany({});
  await prisma.zone.deleteMany({});
  await prisma.regionalFlag.deleteMany({});
  await prisma.region.deleteMany({});
  await prisma.fertilizerType.deleteMany({});
  await prisma.cropType.deleteMany({});
  await prisma.cropCategory.deleteMany({});
  await prisma.season.deleteMany({});

  // 2. Create Seasons
  const meher = await prisma.season.create({ data: { name: 'Meher' } });
  const belg = await prisma.season.create({ data: { name: 'Belg' } });
  const mesno = await prisma.season.create({ data: { name: 'Mesno' } });

  // 3. Create Crop Categories & Types
  await prisma.cropCategory.create({
    data: {
      name: 'Cereals',
      cropTypes: {
        create: [
          { name: 'Teff' },
          { name: 'Wheat' },
          { name: 'Maize' },
          { name: 'Barley' },
          { name: 'Sorghum' },
        ],
      },
    },
  });

  await prisma.cropCategory.create({
    data: {
      name: 'Pulses',
      cropTypes: {
        create: [
          { name: 'Faba Bean' },
          { name: 'Field Pea' },
          { name: 'Chickpea' },
          { name: 'Lentil' },
        ],
      },
    },
  });

  // 4. Create Fertilizer Types
  const urea = await prisma.fertilizerType.create({ data: { name: 'Urea' } });
  const dap = await prisma.fertilizerType.create({ data: { name: 'DAP' } });

  // 5. Create Geographic Hierarchy
  const amhara = await prisma.region.create({
    data: {
      name: 'Amhara',
      regionalFlag: {
        create: {
          name: 'Amhara Flag',
          category: 'Regional',
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1625000000/amhara_flag.png',
        },
      },
    },
  });

  const zone1 = await prisma.zone.create({
    data: { name: 'North Shewa', regionId: amhara.id },
  });

  const woreda1 = await prisma.woreda.create({
    data: { name: 'Basona Werana', zoneId: zone1.id },
  });

  const kebele1 = await prisma.kebele.create({
    data: { name: 'Kebele 01', woredaId: woreda1.id },
  });

  // 6. Create Unions & Destinations
  const union1 = await prisma.union.create({
    data: { name: 'Guna Union', regionId: amhara.id, zoneId: zone1.id },
  });

  const destination1 = await prisma.destination.create({
    data: { name: 'Debre Berhan Warehouse', unionId: union1.id },
  });

  // 7. Create PCs
  const pc1 = await prisma.pC.create({
    data: {
      name: 'Basona Primary Cooperative',
      kebeleId: kebele1.id,
      destinationId: destination1.id,
    },
  });

  // 8. Create Users for Each Role
  const hashedPassword = await bcrypt.hash('password123', 10);

  const usersData = [
    {
      fullName: 'Super Admin User',
      username: 'superadmin',
      email: 'admin@fms.et',
      phoneNumber: '+251911000001',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
    },
    {
      fullName: 'MoA Manager User',
      username: 'moamanager',
      email: 'moa_mgr@fms.et',
      phoneNumber: '+251911000002',
      password: hashedPassword,
      role: Role.MOA_MANAGER,
      moaPosition: MoaPosition.MINISTER,
      moaRole: MoaRole.DATA,
      moaSector: MoaSector.INPUT_AND_INVESTMENT,
      moaLeadExecutive: MoaLeadExecutive.INPUT_LE,
      moaDesk: 'National Fertilizer Desk',
    },
    {
      fullName: 'Region Manager User',
      username: 'regionmanager',
      email: 'region_mgr@fms.et',
      phoneNumber: '+251911000003',
      password: hashedPassword,
      role: Role.REGION_MANAGER,
      regionId: amhara.id,
    },
    {
      fullName: 'Zone Manager User',
      username: 'zonemanager',
      email: 'zone_mgr@fms.et',
      phoneNumber: '+251911000004',
      password: hashedPassword,
      role: Role.ZONE_MANAGER,
      zoneId: zone1.id,
    },
    {
      fullName: 'Woreda Manager User',
      username: 'woredamanager',
      email: 'woreda_mgr@fms.et',
      phoneNumber: '+251911000005',
      password: hashedPassword,
      role: Role.WOREDA_MANAGER,
      woredaId: woreda1.id,
    },
    {
      fullName: 'Kebele Manager User',
      username: 'kebelemanager',
      email: 'kebele_mgr@fms.et',
      phoneNumber: '+251911000006',
      password: hashedPassword,
      role: Role.KEBELE_MANAGER,
      kebeleId: kebele1.id,
    },
    {
      fullName: 'Kebele DA User',
      username: 'kebeleda',
      email: 'kebele_da@fms.et',
      phoneNumber: '+251911000007',
      password: hashedPassword,
      role: Role.KEBELE_DA,
      kebeleId: kebele1.id,
    },
    {
      fullName: 'PC Accountant User',
      username: 'pcaccountant',
      email: 'pc_acc@fms.et',
      phoneNumber: '+251911000008',
      password: hashedPassword,
      role: Role.PC_ACCOUNTANT,
      pcId: pc1.id,
    },
    {
      fullName: 'PC Storeman User',
      username: 'pcstoreman',
      email: 'pc_store@fms.et',
      phoneNumber: '+251911000009',
      password: hashedPassword,
      role: Role.PC_STOREMAN,
      pcId: pc1.id,
    },
    {
      fullName: 'Union Member User',
      username: 'unionmember',
      email: 'union_mem@fms.et',
      phoneNumber: '+251911000010',
      password: hashedPassword,
      role: Role.UNION_MEMBER,
      unionId: union1.id,
    },
  ];

  for (const userData of usersData) {
    await prisma.user.create({ data: userData });
  }

  // 9. Create a Sample Farmer
  await prisma.farmer.create({
    data: {
      uniqueFarmerId: 'FARM-0001',
      fullName: 'Abebe Bikila',
      gender: 'Male',
      phoneNumber: '+251922000001',
      address: 'Village 01, Kebele 01',
      farmAreaHectares: 2.5,
      kebeleId: kebele1.id,
    },
  });

  // 10. Create Shipping Lots
  for (let i = 1; i <= 21; i++) {
    await prisma.shippingLot.create({
      data: {
        lotNumber: i,
        fertilizerTypeId: urea.id,
        totalQuantity: 25000, // MT
      },
    });
  }

  // 11. Initial Inventory for PC
  await prisma.pCInventory.create({
    data: {
      pcId: pc1.id,
      fertilizerTypeId: urea.id,
      quantity: 500, // QT
    },
  });

  // 12. Create a specific Farmer for testing
  await prisma.farmer.create({
    data: {
      uniqueFarmerId: 'FARM-SPEC-001',
      fullName: 'Tesfaye Gebre',
      gender: 'Male',
      phoneNumber: '+251933000001',
      address: 'Basona Werana, Kebele 01',
      farmAreaHectares: 3.2,
      kebeleId: kebele1.id,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
