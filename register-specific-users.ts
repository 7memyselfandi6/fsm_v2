import bcrypt from 'bcryptjs';
import prisma from './src/config/prisma.js';
import fs from 'fs';
import path from 'path';

async function registerUsers() {
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const usersToRegister = [
    { phoneNumber: '0910000000', role: 'SUPER_ADMIN', fullName: 'Super Admin User', username: 'superadmin_custom' },
    { phoneNumber: '0910000001', role: 'KEBELE_MANAGER', fullName: 'Kebele Manager User', username: 'kebele_manager_custom', kebeleId: '207f2bfa-d499-45ad-8726-921f1a3fa5a9' },
    { phoneNumber: '0910000011', role: 'KEBELE_DA', fullName: 'Kebele DA User', username: 'kebele_da_custom', kebeleId: '207f2bfa-d499-45ad-8726-921f1a3fa5a9' },
    { phoneNumber: '0910000002', role: 'WOREDA_MANAGER', fullName: 'Woreda Manager User', username: 'woreda_manager_custom', woredaId: 'e1eb0bc3-0381-4308-b175-e9a869241915' },
    { phoneNumber: '0910000022', role: 'WOREDA_EXPERT', fullName: 'Woreda Expert User', username: 'woreda_expert_custom', woredaId: 'e1eb0bc3-0381-4308-b175-e9a869241915' },
    { phoneNumber: '0910000003', role: 'ZONE_MANAGER', fullName: 'Zone Manager User', username: 'zone_manager_custom', zoneId: '2c24d2e4-2bed-4c6a-b3d4-e4f231b772d6' },
    { phoneNumber: '0910000033', role: 'ZONE_EXPERT', fullName: 'Zone Expert User', username: 'zone_expert_custom', zoneId: '2c24d2e4-2bed-4c6a-b3d4-e4f231b772d6' },
    { phoneNumber: '0910000004', role: 'REGION_MANAGER', fullName: 'Region Manager User', username: 'region_manager_custom', regionId: '4cc1992a-7da3-4e9c-aec9-211544e98bce' },
    { phoneNumber: '0910000044', role: 'REGION_EXPERT', fullName: 'Region Expert User', username: 'region_expert_custom', regionId: '4cc1992a-7da3-4e9c-aec9-211544e98bce' },
    { phoneNumber: '0910000005', role: 'MOA_MANAGER', fullName: 'MOA Manager User', username: 'moa_manager_custom' },
    { phoneNumber: '0910000055', role: 'MOA_EXPERT', fullName: 'MOA Expert User', username: 'moa_expert_custom' },
    { phoneNumber: '0910000006', role: 'PC_ACCOUNTANT', fullName: 'PC Accountant User', username: 'pc_accountant_custom', pcId: 'eea6181e-ba73-4a58-9f54-12868ba65b10' },
    { phoneNumber: '0910000066', role: 'PC_STOREMAN', fullName: 'PC Storeman User', username: 'pc_storeman_custom', pcId: 'eea6181e-ba73-4a58-9f54-12868ba65b10' },
    { phoneNumber: '0910000007', role: 'UNION_MEMBER', fullName: 'Union Member User', username: 'union_member_custom', unionId: 'cf2176bf-7226-4ada-b723-c09c1036c96f' },
  ];

  console.log('🚀 Registering specific users...');
  const payloads = [];

  for (const userData of usersToRegister) {
    const { phoneNumber, role, fullName, username, ...rest } = userData;
    const email = `${username}@fms.gov.et`;

    const user = await prisma.user.upsert({
      where: { phoneNumber },
      update: {
        role: role as any,
        password: hashedPassword,
        fullName,
        username,
        email,
        ...rest
      },
      create: {
        phoneNumber,
        role: role as any,
        password: hashedPassword,
        fullName,
        username,
        email,
        ...rest
      }
    });

    console.log(`✅ User registered: ${fullName} (${role})`);

    payloads.push({
      role,
      registrationPayload: {
        fullName,
        username,
        email,
        phoneNumber,
        password,
        role,
        ...rest
      },
      loginPayload: {
        phoneNumber,
        password
      }
    });
  }

  const jsonPath = path.resolve('registered_users_payloads.json');
  fs.writeFileSync(jsonPath, JSON.stringify(payloads, null, 2));
  console.log(`\n📄 All payloads saved to: ${jsonPath}`);

  await prisma.$disconnect();
}

registerUsers();
