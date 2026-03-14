const { PrismaClient } = require('@prisma/client');

// Force the client to use standard library settings
const prisma = new PrismaClient({
  __internal: {
    engine: {
      type: 'library'
    }
  }
});

async function main() {
  console.log('--- Database Seed Start ---');

  // We create everything in a single transaction to ensure it works
  const result = await prisma.region.create({
    data: {
      name: 'Addis Ababa',
      zones: {
        create: {
          name: 'Zone 01',
          woredas: {
            create: {
              name: 'Woreda 01',
              kebeles: {
                create: {
                  name: 'Kebele 01',
                },
              },
            },
          },
        },
      },
    },
    include: {
      zones: {
        include: {
          woredas: {
            include: {
              kebeles: true
            }
          }
        }
      }
    }
  });

  const kebele = result.zones[0].woredas[0].kebeles[0];
  console.log('✅ Success! Data Created.');
  console.log('---------------------------');
  console.log('YOUR KEBELE ID IS:');
  console.log(kebele.id);
  console.log('---------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seed Failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });