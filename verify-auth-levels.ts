
import 'dotenv/config';
import { loginUser } from './src/services/auth.service.js';

async function verifyAuthLevels() {
  const password = 'password123';
  
  // These are the phones from the previous reset output
  const testCases = [
    { role: 'SUPER_ADMIN', phone: '0941060518' },
    { role: 'MOA_MANAGER', phone: '0965530648' },
    { role: 'REGION_MANAGER', phone: '0995774192' },
    { role: 'ZONE_MANAGER', phone: '0903762782' },
    { role: 'WOREDA_MANAGER', phone: '0925918743' },
    { role: 'KEBELE_MANAGER', phone: '0910988641' }
  ];

  console.log('🧪 Starting multi-level authentication verification...\n');

  for (const tc of testCases) {
    console.log(`Testing [${tc.role}] with phone ${tc.phone}...`);
    try {
      const result = await loginUser(tc.phone, password);
      console.log(`✅ Success: ${result.fullName} (${result.role}) authenticated successfully.\n`);
    } catch (error: any) {
      console.log(`❌ Failed: Authentication failed for role ${tc.role}. Error: ${error.message}\n`);
    }
  }
}

verifyAuthLevels();
