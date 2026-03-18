
import bcrypt from 'bcryptjs';
import prisma from './src/config/prisma.js';
import fs from 'fs';
import path from 'path';

async function resetAllPasswords() {
  const newPassword = 'password123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  console.log(`🚀 Resetting passwords to "${newPassword}" for ALL users...`);
  
  try {
    // 1. Update ALL users at once
    const updateCount = await prisma.user.updateMany({
      data: {
        password: hashedPassword
      }
    });
    console.log(`✅ Updated ${updateCount.count} users in the database.`);

    // 2. Fetch all users to create the credentials list
    const allUsers = await prisma.user.findMany({
      select: {
        fullName: true,
        username: true,
        phoneNumber: true,
        role: true,
        email: true
      },
      orderBy: {
        role: 'asc'
      }
    });

    const userList = allUsers.map(user => ({
      ...user,
      password: newPassword
    }));

    // 3. Write to JSON file
    const filePath = path.resolve('users_credentials.json');
    fs.writeFileSync(filePath, JSON.stringify(userList, null, 2));
    console.log(`📄 Credentials saved to: ${filePath}`);

    // 4. Verify some specific roles (sample one per role level)
    const roleLevels = ['SUPER_ADMIN', 'MOA_MANAGER', 'REGION_MANAGER', 'ZONE_MANAGER', 'WOREDA_MANAGER', 'KEBELE_MANAGER'];
    console.log('\n🔍 Verification summary:');
    for (const role of roleLevels) {
      const user = allUsers.find(u => u.role === role);
      if (user) {
        console.log(`- Role: ${role.padEnd(15)} | Username: ${user.username.padEnd(20)} | Phone: ${user.phoneNumber}`);
      } else {
        console.log(`- Role: ${role.padEnd(15)} | ❌ No user found for this role.`);
      }
    }

  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAllPasswords();
