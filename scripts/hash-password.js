const bcrypt = require('bcryptjs');

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hash-password.js <password>');
  process.exit(1);
}

// Generate hash
const hash = bcrypt.hashSync(password, 10);

console.log('\n=== Password Hash Generated ===\n');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nUse this SQL to create your admin user:\n');
console.log(`INSERT INTO users (email, password, name, role)
VALUES (
  'admin@example.com',
  '${hash}',
  'Admin User',
  'admin'
);`);
console.log('\n');
