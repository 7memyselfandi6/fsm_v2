const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Fertilizer Management System...');

  // 1. Create the hierarchy in one nested command
  const kebele = await prisma.kebele.create({
    data: {
      id: "kb-001",
      name: "Kebele 01",
      woreda: {
        create: {
          id: "wd-001",
          name: "Woreda 01",
          zone: {
            create: {
              id: "zn-001",
              name: "Zone 01",
              region: {
                create: {
                  id: "rg-001",
                  name: "Addis Ababa"
                }
              }
            }
          }
        }
      }
    }
  });

  console.log('✅ Success! Hierarchy created.');
  console.log('Use this ID for Postman:', kebele.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });