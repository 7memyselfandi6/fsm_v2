import { PrismaClient, Role, DemandStatus, LockingLevel, PaymentMethod, SaleStatus, MoaPosition, MoaRole, MoaSector, MoaLeadExecutive } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually find and parse the .env file
const envPath = path.resolve(__dirname, '../../.env');
let dbUrl = process.env.DATABASE_URL;
console.log('DATABASE_URL:', process.env.DATABASE_URL);
if (!dbUrl && fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  const match = envFile.match(/DATABASE_URL=["']?(.+?)["']?(\s|$)/);
  if (match) dbUrl = match[1];
}

// Fallback for dbUrl if not found
if (!dbUrl) {
  console.log('DATABASE_URL is not set in environment variables. Please check your .env file.');
  throw new Error('DATABASE_URL environment variable is not set');}

const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

const pool = new pg.Pool({ 
  connectionString: dbUrl, 
  ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
  connectionTimeoutMillis: 30000,
});
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const SEED_PASSWORD = 'Password123!';
const HASHED_PASSWORD = await bcrypt.hash(SEED_PASSWORD, 10);

async function main() {
  console.log('🚀 Starting comprehensive database seeding (at least 19 records per table)...');
  const report: Record<string, number> = {};

  try {
    // 1. Clear existing data in correct order
    console.log('🧹 Cleaning existing data...');
    const tables = [
      'lockHistory',
      'cropFertilizerRate',
      'fertilizerSubsidy',
      'warehouse',
      'fertilizerSale',
      'pCInventory',
      'lotDispatch',
      'shippingLot',
      'farmerDemand',
      'farmer',
      'user',
      'pC',
      'destination',
      'union',
      'section',
      'kebele',
      'woreda',
      'zone',
      'regionalFlag',
      'region',
      'federalFlag',
      'federal',
      'season',
      'cropType',
      'cropCategory',
      'fertilizerType',
    ];

    for (const table of tables) {
      // @ts-ignore
      await prisma[table].deleteMany();
    }

    // 2. Reference Data
    console.log('📦 Seeding reference data...');
    const fertilizerTypes = [];
    for (const name of ['UREA', 'DAP', 'NPS', 'NPSB', 'KCL', 'COMP-1', 'COMP-2', 'COMP-3', 'COMP-4', 'COMP-5', 'COMP-6', 'COMP-7', 'COMP-8', 'COMP-9', 'COMP-10', 'COMP-11', 'COMP-12', 'COMP-13', 'COMP-14', 'COMP-15']) {
      fertilizerTypes.push(await prisma.fertilizerType.create({ data: { name } }));
    }
    report.FertilizerType = fertilizerTypes.length;

    const seasons = [];
    for (let i = 1; i <= 20; i++) {
      seasons.push(await prisma.season.create({ data: { name: `Season ${i} - ${2024 + Math.floor(i / 2)}` } }));
    }
    report.Season = seasons.length;

    const cropCategories = [];
    for (const name of ['Cereals', 'Legumes', 'Oilseeds', 'Vegetables', 'Fruits', 'Industrial', 'Spices', 'Root Crops', 'Tubers', 'Beverage', 'Stimulants', 'Fodder', 'Ornamentals', 'Medicinal', 'Aromatic', 'Latex', 'Fiber', 'Dye', 'Gums', 'Resins']) {
      cropCategories.push(await prisma.cropCategory.create({ data: { name } }));
    }
    report.CropCategory = cropCategories.length;

    const cropTypes = [];
    for (let i = 0; i < 20; i++) {
      cropTypes.push(await prisma.cropType.create({
        data: {
          name: faker.commerce.productName() + ' ' + i,
          categoryId: cropCategories[i % cropCategories.length].id
        }
      }));
    }
    report.CropType = cropTypes.length;

    // 3. Administrative Hierarchy
    console.log('🏛️ Seeding administrative hierarchy...');
    const federal = await prisma.federal.create({ data: { name: 'Ethiopia Federal' } });
    report.Federal = 1;

    const regions = [];
    for (let i = 0; i < 20; i++) {
      const regionName = `Region Name ${i} ${Math.random().toString(36).substring(7)}`;
      console.log(`Creating region ${i}: ${regionName}`);
      const region = await prisma.region.create({
        data: {
          name: regionName,
          federalId: federal.id,
          code: `CODE-${i}-${Math.random().toString(36).substring(7)}`,
          status: true,
          isLocked: false,
        }
      });
      regions.push(region);
    }
    report.Region = regions.length;

    const zones = [];
    for (let i = 0; i < 20; i++) {
      zones.push(await prisma.zone.create({
        data: {
          name: faker.location.city() + ' Zone ' + i,
          regionId: regions[i % regions.length].id
        }
      }));
    }
    report.Zone = zones.length;

    const woredas = [];
    for (let i = 0; i < 20; i++) {
      woredas.push(await prisma.woreda.create({
        data: {
          name: faker.location.county() + ' Woreda ' + i,
          zoneId: zones[i % zones.length].id
        }
      }));
    }
    report.Woreda = woredas.length;

    const kebeles = [];
    for (let i = 0; i < 20; i++) {
      kebeles.push(await prisma.kebele.create({
        data: {
          name: 'Kebele ' + faker.string.numeric(3) + '-' + i,
          woredaId: woredas[i % woredas.length].id
        }
      }));
    }
    report.Kebele = kebeles.length;

    const sections = [];
    for (let i = 0; i < 20; i++) {
      sections.push(await prisma.section.create({
        data: {
          name: 'Section ' + faker.string.alpha(1).toUpperCase() + '-' + i,
          kebeleId: kebeles[i % kebeles.length].id
        }
      }));
    }
    report.Section = sections.length;

    // 4. Logistics & Supply Chain
    console.log('🚚 Seeding supply chain...');
    const unions = [];
    for (let i = 0; i < 20; i++) {
      unions.push(await prisma.union.create({
        data: {
          name: faker.company.name() + ' Union ' + i,
          regionId: regions[i % regions.length].id
        }
      }));
    }
    report.Union = unions.length;

    const destinations = [];
    for (let i = 0; i < 20; i++) {
      destinations.push(await prisma.destination.create({
        data: {
          name: faker.location.city() + ' Port ' + i,
          unionId: unions[i % unions.length].id
        }
      }));
    }
    report.Destination = destinations.length;

    const pcs = [];
    for (let i = 0; i < 20; i++) {
      pcs.push(await prisma.pC.create({
        data: {
          name: faker.company.name() + ' PC ' + i,
          destinationId: destinations[i % destinations.length].id,
          kebeleId: kebeles[i % kebeles.length].id
        }
      }));
    }
    report.PC = pcs.length;

    // 5. Users (Specific users requested + random ones)
    console.log('👥 Seeding specific users and roles...');
    
    const specificUsers = [
      { phone: '0910000000', role: Role.SUPER_ADMIN, username: 'admin_sa' },
      { phone: '0910000001', role: Role.KEBELE_MANAGER, username: 'k_manager' },
      { phone: '0910000011', role: Role.KEBELE_DA, username: 'k_da' },
      { phone: '0910000002', role: Role.WOREDA_MANAGER, username: 'w_manager' },
      { phone: '0910000022', role: Role.WOREDA_EXPERT, username: 'w_expert' },
      { phone: '0910000003', role: Role.ZONE_MANAGER, username: 'z_manager' },
      { phone: '0910000033', role: Role.ZONE_EXPERT, username: 'z_expert' },
      { phone: '0910000004', role: Role.REGION_MANAGER, username: 'r_manager' },
      { phone: '0910000044', role: Role.REGION_EXPERT, username: 'r_expert' },
      { phone: '0910000005', role: Role.MOA_MANAGER, username: 'moa_manager' },
      { phone: '0910000055', role: Role.MOA_EXPERT, username: 'moa_expert' },
      { phone: '0910000006', role: Role.PC_ACCOUNTANT, username: 'pc_acc' },
      { phone: '0910000066', role: Role.PC_STOREMAN, username: 'pc_store' },
      { phone: '0910000007', role: Role.UNION_MEMBER, username: 'u_member' },
    ];

    const seededSpecificUsers = [];
    for (const u of specificUsers) {
      const user = await prisma.user.create({
        data: {
          fullName: `Specific ${u.role} User`,
          username: u.username,
          email: `${u.username}@fms.gov.et`,
          phoneNumber: u.phone,
          password: HASHED_PASSWORD,
          role: u.role,
          // Assign context based on role
          ...(u.role.includes('KEBELE') && { kebeleId: kebeles[0].id }),
          ...(u.role.includes('WOREDA') && { woredaId: woredas[0].id }),
          ...(u.role.includes('ZONE') && { zoneId: zones[0].id }),
          ...(u.role.includes('REGION') && { regionId: regions[0].id }),
          ...(u.role.includes('PC') && { pcId: pcs[0].id }),
          ...(u.role.includes('UNION') && { unionId: unions[0].id }),
          ...(u.role.includes('MOA') && {
            moaPosition: MoaPosition.EXPERT,
            moaRole: MoaRole.DATA,
            moaSector: MoaSector.INPUT_AND_INVESTMENT,
            moaLeadExecutive: MoaLeadExecutive.INPUT_LE,
          }),
        }
      });
      seededSpecificUsers.push(user);
    }

    // Add more random users to reach at least 20
    for (let i = 0; i < 10; i++) {
      const allowedRoles = Object.values(Role).filter(r => r !== Role.GUEST);
      const role = faker.helpers.arrayElement(allowedRoles);
      await prisma.user.create({
        data: {
          fullName: faker.person.fullName(),
          username: `user_${faker.string.numeric(5)}_${i}`,
          email: faker.internet.email(),
          phoneNumber: '09' + faker.string.numeric(8),
          password: HASHED_PASSWORD,
          role: role,
        }
      });
    }
    report.User = await prisma.user.count();

    // 6. Farmers
    console.log('👨‍🌾 Seeding farmers...');
    const farmers = [];
    for (let i = 0; i < 20; i++) {
      farmers.push(await prisma.farmer.create({
        data: {
          fullName: faker.person.fullName(),
          gender: faker.helpers.arrayElement(['MALE', 'FEMALE']),
          phoneNumber: '07' + faker.string.numeric(8) + i,
          address: faker.location.streetAddress(),
          farmAreaHectares: faker.number.float({ min: 0.5, max: 10, fractionDigits: 2 }),
          kebeleId: kebeles[i % kebeles.length].id,
          uniqueFarmerId: 'FARM-' + faker.string.numeric(6) + i
        }
      }));
    }
    report.Farmer = farmers.length;

    // 7. Demands & Sales
    console.log('📈 Seeding demands and sales...');
    for (let i = 0; i < 20; i++) {
      await prisma.farmerDemand.create({
        data: {
          farmerId: farmers[i % farmers.length].id,
          seasonId: seasons[i % seasons.length].id,
          cropTypeId: cropTypes[i % cropTypes.length].id,
          fertilizerTypeId: fertilizerTypes[i % fertilizerTypes.length].id,
          originalQuantity: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
          status: DemandStatus.APPROVED
        }
      });
    }
    report.FarmerDemand = 20;

    const pcAccountant = seededSpecificUsers.find(u => u.role === Role.PC_ACCOUNTANT);
    for (let i = 0; i < 20; i++) {
      await prisma.fertilizerSale.create({
        data: {
          farmerId: farmers[i % farmers.length].id,
          pcId: pcs[i % pcs.length].id,
          fertilizerTypeId: fertilizerTypes[i % fertilizerTypes.length].id,
          quantity: faker.number.float({ min: 0.5, max: 2, fractionDigits: 1 }),
          totalPrice: faker.number.float({ min: 1000, max: 5000, fractionDigits: 2 }),
          paymentMethod: faker.helpers.arrayElement(Object.values(PaymentMethod)),
          status: SaleStatus.DELIVERED,
          accountantId: pcAccountant?.id || (await prisma.user.findFirst())!.id,
        }
      });
    }
    report.FertilizerSale = 20;

    // 8. Shipping & Inventory
    console.log('🚢 Seeding shipping and inventory...');
    const lots = [];
    for (let i = 0; i < 20; i++) {
      lots.push(await prisma.shippingLot.create({
        data: {
          lotNumber: 6000 + i,
          fertilizerTypeId: fertilizerTypes[i % fertilizerTypes.length].id,
          totalQuantity: 1000,
          ureaAmount: 500,
          dapAmount: 500
        }
      }));
    }
    report.ShippingLot = lots.length;

    for (let i = 0; i < 20; i++) {
      await prisma.lotDispatch.create({
        data: {
          lotId: lots[i % lots.length].id,
          destinationId: destinations[i % destinations.length].id,
          quantity: 50
        }
      });
    }
    report.LotDispatch = 20;

    for (let i = 0; i < 20; i++) {
      await prisma.pCInventory.create({
        data: {
          pcId: pcs[i % pcs.length].id,
          fertilizerTypeId: fertilizerTypes[i % fertilizerTypes.length].id,
          quantity: 500,
        }
      });
    }
    report.PCInventory = 20;

    // 9. Warehouses & Subsidies
    console.log('🏠 Seeding warehouses and subsidies...');
    for (let i = 0; i < 20; i++) {
      await prisma.warehouse.create({
        data: {
          center: `Center ${i}`,
          destinationId: destinations[i % destinations.length].id,
          regionId: regions[i % regions.length].id,
          zoneId: zones[i % zones.length].id,
          woredaId: woredas[i % woredas.length].id,
          town: faker.location.city(),
          year: 2025,
          capacity: 5000,
          storeman: faker.person.fullName(),
          sex: 'MALE',
          education: 'Degree',
          mobile: '09' + faker.string.numeric(8)
        }
      });
    }
    report.Warehouse = 20;

    for (let i = 0; i < 20; i++) {
      await prisma.fertilizerSubsidy.create({
        data: {
          eid: `EID-EXT-${i}`,
          year: 2025,
          regionId: regions[i % regions.length].id,
          fertilizerTypeId: fertilizerTypes[i % fertilizerTypes.length].id,
          amountMT: 1000,
          amountQT: 10000,
          priceBefore: 5000,
          priceAfter: 3500,
          subsidyAmount: 1500
        }
      });
    }
    report.FertilizerSubsidy = 20;

    // 10. Lock History & Rates
    console.log('🔒 Seeding lock history and rates...');
    for (let i = 0; i < 20; i++) {
      await prisma.lockHistory.create({
        data: {
          level: faker.helpers.arrayElement(Object.values(LockingLevel)),
          regionId: regions[i % regions.length].id,
          isLocked: true,
          reason: faker.lorem.sentence(),
          overriddenById: seededSpecificUsers[0].id,
        }
      });
    }
    report.LockHistory = 20;

    for (let i = 0; i < 20; i++) {
      await prisma.cropFertilizerRate.create({
        data: {
          cropId: cropTypes[i % cropTypes.length].id,
          highUrea: 100,
          highDap: 50,
          mediumUrea: 75,
          mediumDap: 40,
          lowUrea: 50,
          lowDap: 30
        }
      });
    }
    report.CropFertilizerRate = 20;

    // Final Summary
    console.log('\n📊 Seeding Report:');
    console.table(report);
    console.log('\n✨ Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
