import { PrismaClient, Role, DemandStatus, LockingLevel, PaymentMethod, SaleStatus, MoaPosition, MoaRole, MoaSector, MoaLeadExecutive } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const SEED_PASSWORD = 'Password123!';
const HASHED_PASSWORD = await bcrypt.hash(SEED_PASSWORD, 10);

async function main() {
  console.log('🚀 Starting comprehensive database seeding...');
  const report: any = {};

  try {
    // 1. Clear existing data (Order matters due to FK constraints)
    console.log('🧹 Cleaning existing data...');
    await prisma.lockHistory.deleteMany();
    await prisma.cropFertilizerRate.deleteMany();
    await prisma.fertilizerSubsidy.deleteMany();
    await prisma.warehouse.deleteMany();
    await prisma.fertilizerSale.deleteMany();
    await prisma.pCInventory.deleteMany();
    await prisma.lotDispatch.deleteMany();
    await prisma.shippingLot.deleteMany();
    await prisma.farmerDemand.deleteMany();
    await prisma.farmer.deleteMany();
    await prisma.user.deleteMany();
    await prisma.pC.deleteMany();
    await prisma.destination.deleteMany();
    await prisma.union.deleteMany();
    await prisma.section.deleteMany();
    await prisma.kebele.deleteMany();
    await prisma.woreda.deleteMany();
    await prisma.zone.deleteMany();
    await prisma.regionalFlag.deleteMany();
    await prisma.region.deleteMany();
    await prisma.federalFlag.deleteMany();
    await prisma.federal.deleteMany();
    await prisma.season.deleteMany();
    await prisma.cropType.deleteMany();
    await prisma.cropCategory.deleteMany();
    await prisma.fertilizerType.deleteMany();

    // 2. Reference Data
    console.log('📦 Seeding reference data...');
    const fertilizerTypes = await Promise.all(['UREA', 'DAP', 'NPS', 'NPSB'].map(name => 
      prisma.fertilizerType.create({ data: { name } })
    ));
    report.FertilizerType = fertilizerTypes.length;

    const seasons = await Promise.all(['Meher 2025', 'Belg 2025', 'Irrigation 2025'].map(name => 
      prisma.season.create({ data: { name } })
    ));
    report.Season = seasons.length;

    const cropCategories = await Promise.all(['Cereals', 'Legumes', 'Oilseeds'].map(name => 
      prisma.cropCategory.create({ data: { name } })
    ));
    report.CropCategory = cropCategories.length;

    const cropTypes = [];
    for (const cat of cropCategories) {
      for (let i = 0; i < 4; i++) {
        cropTypes.push(await prisma.cropType.create({
          data: {
            name: `${cat.name} Type ${i + 1}`,
            categoryId: cat.id
          }
        }));
      }
    }
    report.CropType = cropTypes.length;

    // 3. Administrative Hierarchy
    console.log('🏛️ Seeding administrative hierarchy...');
    const federal = await prisma.federal.create({ data: { name: 'Ethiopia Federal' } });
    report.Federal = 1;

    const regions = [];
    for (let i = 0; i < 10; i++) {
      regions.push(await prisma.region.create({
        data: {
          name: faker.location.state() + ' Region ' + i,
          code: `REG-${i}`
        }
      }));
    }
    report.Region = regions.length;

    const zones = [];
    for (const region of regions) {
      for (let i = 0; i < 2; i++) {
        zones.push(await prisma.zone.create({
          data: {
            name: faker.location.city() + ' Zone',
            regionId: region.id
          }
        }));
      }
    }
    report.Zone = zones.length;

    const woredas = [];
    for (const zone of zones) {
      for (let i = 0; i < 2; i++) {
        woredas.push(await prisma.woreda.create({
          data: {
            name: faker.location.county() + ' Woreda',
            zoneId: zone.id
          }
        }));
      }
    }
    report.Woreda = woredas.length;

    const kebeles = [];
    for (const woreda of woredas) {
      for (let i = 0; i < 2; i++) {
        kebeles.push(await prisma.kebele.create({
          data: {
            name: 'Kebele ' + faker.string.numeric(3),
            woredaId: woreda.id
          }
        }));
      }
    }
    report.Kebele = kebeles.length;

    const sections = [];
    for (const kebele of kebeles.slice(0, 10)) {
      sections.push(await prisma.section.create({
        data: {
          name: 'Section ' + faker.string.alpha(1).toUpperCase(),
          kebeleId: kebele.id
        }
      }));
    }
    report.Section = sections.length;

    // 4. Supply Chain
    console.log('🚚 Seeding supply chain...');
    const unions = [];
    for (const region of regions) {
      unions.push(await prisma.union.create({
        data: {
          name: faker.company.name() + ' Union',
          regionId: region.id
        }
      }));
    }
    report.Union = unions.length;

    const destinations = [];
    for (const union of unions) {
      for (let i = 0; i < 2; i++) {
        destinations.push(await prisma.destination.create({
          data: {
            name: faker.location.city() + ' Port',
            unionId: union.id
          }
        }));
      }
    }
    report.Destination = destinations.length;

    const pcs = [];
    for (let i = 0; i < Math.min(kebeles.length, destinations.length); i++) {
      const pc = await prisma.pC.create({
        data: {
          name: faker.company.name() + ' PC',
          destinationId: destinations[i].id,
          kebeleId: kebeles[i].id
        }
      });
      pcs.push(pc);
    }
    report.PC = pcs.length;

    // 5. Users (13 per role)
    console.log('👥 Seeding users (13 per role)...');
    const roles = Object.values(Role);
    const seededUsers = [];
    for (const role of roles) {
      for (let i = 0; i < 13; i++) {
        const username = `${role.toLowerCase()}_user_${i + 1}`;
        const user = await prisma.user.create({
          data: {
            fullName: faker.person.fullName(),
            username,
            email: `${username}@fms.gov.et`,
            phoneNumber: '09' + faker.string.numeric(8),
            password: HASHED_PASSWORD,
            role,
            // Assign some context if applicable
            ...(role.includes('KEBELE') && { kebeleId: faker.helpers.arrayElement(kebeles).id }),
            ...(role.includes('WOREDA') && { woredaId: faker.helpers.arrayElement(woredas).id }),
            ...(role.includes('ZONE') && { zoneId: faker.helpers.arrayElement(zones).id }),
            ...(role.includes('REGION') && { regionId: faker.helpers.arrayElement(regions).id }),
            ...(role.includes('UNION') && { unionId: faker.helpers.arrayElement(unions).id }),
            ...(role.includes('PC') && { pcId: faker.helpers.arrayElement(pcs).id }),
            ...(role.includes('MOA') && { 
              moaPosition: MoaPosition.EXPERT,
              moaRole: MoaRole.DATA,
              moaSector: MoaSector.INPUT_AND_INVESTMENT,
              moaLeadExecutive: MoaLeadExecutive.INPUT_LE
            }),
          }
        });
        seededUsers.push({ username, role });
      }
    }
    report.User = seededUsers.length;

    // 6. Farmers
    console.log('👨‍🌾 Seeding farmers...');
    const farmers = [];
    for (let i = 0; i < 50; i++) {
      farmers.push(await prisma.farmer.create({
        data: {
          fullName: faker.person.fullName(),
          gender: faker.helpers.arrayElement(['MALE', 'FEMALE']),
          phoneNumber: '07' + faker.string.numeric(8),
          address: faker.location.streetAddress(),
          farmAreaHectares: faker.number.float({ min: 0.5, max: 10, fractionDigits: 2 }),
          kebeleId: faker.helpers.arrayElement(kebeles).id,
          uniqueFarmerId: 'FARM-' + faker.string.numeric(6)
        }
      }));
    }
    report.Farmer = farmers.length;

    // 7. Demands & Sales
    console.log('📈 Seeding demands and sales...');
    for (const farmer of farmers.slice(0, 30)) {
      await prisma.farmerDemand.create({
        data: {
          farmerId: farmer.id,
          seasonId: faker.helpers.arrayElement(seasons).id,
          cropTypeId: faker.helpers.arrayElement(cropTypes).id,
          fertilizerTypeId: faker.helpers.arrayElement(fertilizerTypes).id,
          originalQuantity: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
          status: DemandStatus.APPROVED
        }
      });
    }
    report.FarmerDemand = 30;

    for (const pc of pcs.slice(0, 10)) {
      await prisma.fertilizerSale.create({
        data: {
          farmerId: faker.helpers.arrayElement(farmers).id,
          pcId: pc.id,
          fertilizerTypeId: faker.helpers.arrayElement(fertilizerTypes).id,
          quantity: 2.0,
          totalPrice: 5000,
          paymentMethod: PaymentMethod.CASH,
          status: SaleStatus.DELIVERED,
          accountantId: seededUsers.find(u => u.role === Role.PC_ACCOUNTANT)?.username ? (await prisma.user.findUnique({ where: { username: seededUsers.find(u => u.role === Role.PC_ACCOUNTANT)!.username } }))!.id : (await prisma.user.findFirst())!.id
        }
      });
    }
    report.FertilizerSale = 10;

    // 8. Shipping & Logistics
    console.log('🚢 Seeding shipping lots and dispatches...');
    const lots = [];
    for (let i = 0; i < 10; i++) {
      lots.push(await prisma.shippingLot.create({
        data: {
          lotNumber: 1000 + i,
          fertilizerTypeId: faker.helpers.arrayElement(fertilizerTypes).id,
          totalQuantity: 1000,
          ureaAmount: 600,
          dapAmount: 400
        }
      }));
    }
    report.ShippingLot = lots.length;

    for (const lot of lots) {
      await prisma.lotDispatch.create({
        data: {
          lotId: lot.id,
          destinationId: faker.helpers.arrayElement(destinations).id,
          quantity: 100
        }
      });
    }
    report.LotDispatch = lots.length;

    // 9. Warehouses & Subsidies
    console.log('🏠 Seeding warehouses and subsidies...');
    for (let i = 0; i < 10; i++) {
      await prisma.warehouse.create({
        data: {
          center: faker.location.city() + ' Center',
          destinationId: faker.helpers.arrayElement(destinations).id,
          regionId: faker.helpers.arrayElement(regions).id,
          zoneId: faker.helpers.arrayElement(zones).id,
          woredaId: faker.helpers.arrayElement(woredas).id,
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
    report.Warehouse = 10;

    for (const region of regions.slice(0, 10)) {
      await prisma.fertilizerSubsidy.create({
        data: {
          eid: 'EID-' + faker.string.numeric(5),
          year: 2025,
          regionId: region.id,
          fertilizerTypeId: faker.helpers.arrayElement(fertilizerTypes).id,
          amountMT: 1000,
          amountQT: 10000,
          priceBefore: 4500,
          priceAfter: 3200,
          subsidyAmount: 1300
        }
      });
    }
    report.FertilizerSubsidy = 10;

    // 10. Verification Mechanism
    console.log('🔍 Verifying seeded users login...');
    const loginTests = [];
    const testUsers = seededUsers.filter((_, index) => index % 13 === 0); // Test one user per role to save time
    
    for (const testUser of testUsers) {
      const user = await prisma.user.findUnique({ where: { username: testUser.username } });
      if (user) {
        const isMatch = await bcrypt.compare(SEED_PASSWORD, user.password);
        loginTests.push({
          role: testUser.role,
          username: testUser.username,
          status: isMatch ? '✅ PASSED' : '❌ FAILED'
        });
      }
    }

    // Final Report
    console.log('\n📊 Seeding Report:');
    console.table(report);
    console.log('\n🔐 Login Verification (Sample per Role):');
    console.table(loginTests);

    console.log('\n✨ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
