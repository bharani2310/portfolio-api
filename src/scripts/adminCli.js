/**
 * Usage:
 *   node src/scripts/adminCli.js create "Alex Carter" alex@example.com "StrongPass123!"
 *   node src/scripts/adminCli.js reset-password alex@example.com "NewStrongPass456!"
 *
 * Or via npm scripts:
 *   npm run admin:create -- "Alex Carter" alex@example.com "StrongPass123!"
 *   npm run admin:reset-password -- alex@example.com "NewStrongPass456!"
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Admin from '../models/Admin.js';

async function run() {
  const [, , command, ...args] = process.argv;

  if (!['create', 'reset-password'].includes(command)) {
    console.log('Usage:');
    console.log('  node src/scripts/adminCli.js create "<name>" <email> <password>');
    console.log('  node src/scripts/adminCli.js reset-password <email> <newPassword>');
    process.exit(1);
  }

  await connectDB();

  if (command === 'create') {
    const [name, email, password] = args;
    if (!name || !email || !password) {
      console.log('Missing arguments. Usage: create "<name>" <email> <password>');
      process.exit(1);
    }

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log(`An admin with email ${email} already exists.`);
      process.exit(1);
    }

    const passwordHash = await Admin.hashPassword(password);
    await Admin.create({ name, email, passwordHash });
    console.log(`Admin created: ${email}`);
  }

  if (command === 'reset-password') {
    const [email, newPassword] = args;
    if (!email || !newPassword) {
      console.log('Missing arguments. Usage: reset-password <email> <newPassword>');
      process.exit(1);
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      console.log(`No admin found with email ${email}`);
      process.exit(1);
    }

    admin.passwordHash = await Admin.hashPassword(newPassword);
    await admin.save();
    console.log(`Password reset for ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
