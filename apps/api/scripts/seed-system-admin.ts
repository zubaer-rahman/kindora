/**
 * Seed System Admin
 *
 * Creates the seed system administrator account for the Kindora platform.
 * Run once with: npx ts-node -e "require('./apps/api/scripts/seed-system-admin.ts')"
 * Or: pnpm --filter api exec ts-node scripts/seed-system-admin.ts
 *
 * The system admin email must end with .kindora.com
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.SYSTEM_ADMIN_EMAIL || 'admin@system.kindora.com';
const ADMIN_PASSWORD = process.env.SYSTEM_ADMIN_PASSWORD;
const ADMIN_NAME = process.env.SYSTEM_ADMIN_NAME || 'Kindora System Admin';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env');
  process.exit(1);
}

if (!ADMIN_PASSWORD) {
  console.error('❌ SYSTEM_ADMIN_PASSWORD is not set in .env');
  process.exit(1);
}

if (!ADMIN_EMAIL.endsWith('.kindora.com')) {
  console.error('❌ SYSTEM_ADMIN_EMAIL must end with .kindora.com');
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log('✅ Connected to MongoDB');

  // Inline User schema to avoid import resolution complexity in the script
  const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    provider: { type: String, default: 'credentials' },
    is_verified: { type: Boolean, default: true },
    is_blocked: { type: Boolean, default: false },
  }, { timestamps: true });

  const UserModel =
    (mongoose.models.user as mongoose.Model<any>) ||
    mongoose.model('user', UserSchema);

  const existing = await UserModel.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    console.log(`ℹ️  System admin already exists: ${ADMIN_EMAIL}`);
    console.log(`   Role: ${existing.role}`);
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD!, 10);

  await UserModel.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashed,
    role: 'system_admin',
    provider: 'credentials',
    is_verified: true,
    is_blocked: false,
  });

  console.log(`✅ System admin seeded successfully!`);
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Name:  ${ADMIN_NAME}`);
  console.log(`   Role:  system_admin`);
  console.log(`\n⚠️  Store the password safely — it will not be shown again.`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
