
import bcrypt from 'bcryptjs';
async function test() {
  const hash = '$2b$10$fQCGHyGq6TR2sklSB9Zv6eEOx7zBI98PYmRtTJ17GVEklzJyG.qnm';
  const p1 = 'password123';
  const p2 = 'Password123!';
  console.log('Testing hash:', hash);
  console.log(`Match with "${p1}":`, await bcrypt.compare(p1, hash));
  console.log(`Match with "${p2}":`, await bcrypt.compare(p2, hash));
}
test();
