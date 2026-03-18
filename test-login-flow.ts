
import 'dotenv/config';
import { loginUser } from './src/services/auth.service.js';

async function testLogin() {
  const phoneNumber = '0983408540';
  const password = 'password123';
  
  console.log(`Testing login for ${phoneNumber} with ${password}...`);
  try {
    const result = await loginUser(phoneNumber, password);
    console.log('✅ Login successful!');
    console.log('User Role:', result.role);
    console.log('Full Name:', result.fullName);
  } catch (error: any) {
    console.log('❌ Login failed:', error.message);
  }
}

testLogin();
