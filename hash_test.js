import bcrypt from 'bcryptjs';

const testPassword = 'Password123!';

async function hashAndCompare() {
  const hashed = await bcrypt.hash(testPassword, 10);
  console.log('Generated Hash:', hashed);

  const storedHash = '$2b$10$IiHH0.Wml4GBu2N5wC7ogeeaai8fH1HvDbvuX6RktbuMU34eOKsHi'; // From seed script
  const isMatch = await bcrypt.compare(testPassword, storedHash);
  console.log('Comparison with stored hash:', isMatch);
}

hashAndCompare();