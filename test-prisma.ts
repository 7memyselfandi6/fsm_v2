
import "dotenv/config";
import prisma from './src/config/prisma.js';

async function test() {
  try {
    const user = await prisma.user.findFirst();
    if (user) {
      console.log('Found user:', user.id);
      const uniqueUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          fullName: true,
          username: true,
          email: true,
          role: true,
          regionId: true,
          zoneId: true,
          woredaId: true,
          kebeleId: true,
          pcId: true,
          unionId: true,
        },
      });
      console.log('Unique user fetch successful:', uniqueUser?.id);
    } else {
      console.log('No users found to test with.');
    }
  } catch (error) {
    console.error('Error during prisma.user.findUnique():', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
