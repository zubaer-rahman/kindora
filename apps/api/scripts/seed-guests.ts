/**
 * Seed Guests
 *
 * Creates the seed guest accounts for the Kindora platform.
 * Run once with: npx ts-node -e "require('./apps/api/scripts/seed-guests.ts')"
 * Or: pnpm --filter api exec ts-node scripts/seed-guests.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env');
  process.exit(1);
}

const GUEST_PASSWORD = 'guestpassword';

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log('✅ Connected to MongoDB');

  // Inline User schema
  const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    provider: { type: String, default: 'credentials' },
    is_verified: { type: Boolean, default: true },
    is_blocked: { type: Boolean, default: false },
    volunteer_profile: { type: mongoose.Schema.Types.ObjectId },
    organization_profile: { type: mongoose.Schema.Types.ObjectId },
  }, { timestamps: true });

  const UserModel =
    (mongoose.models.user as mongoose.Model<any>) ||
    mongoose.model('user', UserSchema);

  // Inline VolunteerProfile schema
  const VolunteerProfileSchema = new mongoose.Schema({
    bio: String,
    interested_on: [String],
    interested_categories: [String],
    phone_number: String,
    student_type: String,
    is_currently_studying: String,
    non_student_type: String,
  }, { timestamps: true });

  const VolunteerProfileModel =
    (mongoose.models.volunteer_profile as mongoose.Model<any>) ||
    mongoose.model('volunteer_profile', VolunteerProfileSchema);

  // Inline OrganizationProfile schema
  const OrganizationProfileSchema = new mongoose.Schema({
    title: String,
    contact_email: String,
    phone_number: String,
    bio: String,
    type: String,
    opportunity_types: [String],
    required_skills: [String],
  }, { timestamps: true });

  const OrganizationProfileModel =
    (mongoose.models.organization_profile as mongoose.Model<any>) ||
    mongoose.model('organization_profile', OrganizationProfileSchema);

  const hashed = await bcrypt.hash(GUEST_PASSWORD, 10);

  // --- Seed Guest Organisation ---
  const orgEmail = 'guest_org@kindora.com';
  let orgUser = await UserModel.findOne({ email: orgEmail });
  
  if (!orgUser) {
    console.log('Creating Guest Organisation...');
    const orgProfile = await OrganizationProfileModel.create({
      title: 'Guest Organisation',
      contact_email: orgEmail,
      phone_number: '1234567890',
      bio: 'This is a pre-configured guest organisation for interviews and testing.',
      type: 'ngo',
      opportunity_types: ['Mentorship'],
      required_skills: ['Communication'],
    });

    orgUser = await UserModel.create({
      name: 'Guest Organisation',
      email: orgEmail,
      password: hashed,
      role: 'organisation',
      provider: 'credentials',
      is_verified: true,
      is_blocked: false,
      organization_profile: orgProfile._id,
    });
    console.log(`✅ Guest Organisation created: ${orgEmail}`);
  } else {
    console.log(`ℹ️  Guest Organisation already exists: ${orgEmail}`);
  }

  // --- Seed Guest Volunteer ---
  const volEmail = 'guest_vol@kindora.com';
  let volUser = await UserModel.findOne({ email: volEmail });

  if (!volUser) {
    console.log('Creating Guest Volunteer...');
    const volProfile = await VolunteerProfileModel.create({
      bio: 'This is a pre-configured guest volunteer for interviews and testing.',
      interested_on: ['Development', 'Design'],
      interested_categories: ['Education'],
      phone_number: '0987654321',
      student_type: 'no',
      is_currently_studying: 'no',
      non_student_type: 'general_public',
    });

    volUser = await UserModel.create({
      name: 'Guest Volunteer',
      email: volEmail,
      password: hashed,
      role: 'volunteer',
      provider: 'credentials',
      is_verified: true,
      is_blocked: false,
      volunteer_profile: volProfile._id,
    });
    console.log(`✅ Guest Volunteer created: ${volEmail}`);
  } else {
    console.log(`ℹ️  Guest Volunteer already exists: ${volEmail}`);
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`Password for both accounts: ${GUEST_PASSWORD}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
