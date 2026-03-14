import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. MANUALLY find and parse the .env file to be 100% sure
const envPath = path.resolve(__dirname, '../.env');
let dbUrl = process.env.DATABASE_URL;

if (!dbUrl && fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  const match = envFile.match(/DATABASE_URL=["']?(.+?)["']?(\s|$)/);
  if (match) dbUrl = match[1];
}

if (!dbUrl) {
  // Fallback to the URL we've been using if the file read fails
  dbUrl = "postgresql://neondb_owner:npg_hCkF8itsWl4w@ep-snowy-water-ancuacgt-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";
}

// 2. Instantiate with the only property Prisma 7 recognizes for manual URLs
const prisma = new PrismaClient({
  // Use 'as any' because Prisma's TS definitions for v7 can be finicky
  datasourceUrl: dbUrl
} as any);

async function main() {
  console.log("🚀 Executing 'God Mode' Super Admin creation...");
  
  const email = 'supa@fms.gov.et';
  const hashedPassword = await bcrypt.hash('SuperSecurePassword123!', 10);

  try {
    const admin = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        fullName: 'System Administrator',
        username: 'superadmin',
        phoneNumber: '0900000000',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    });

    console.log(`✅ Success! Super Admin created: ${admin.email}`);
  } catch (error) {
    console.error("❌ Database Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
