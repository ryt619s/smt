/**
 * Admin Seeder Script
 * Creates an admin account in MongoDB
 * Run: npx ts-node src/scripts/seedAdmin.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import dns from 'dns';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';

// ── Admin Credentials (change before running) ──────────────────────────────
const ADMIN_EMAIL    = 'admin@smtecosystem.io';
const ADMIN_PASSWORD = 'Admin@SMT2025';
const ADMIN_NAME     = 'SMT Admin';
// ───────────────────────────────────────────────────────────────────────────

(async () => {
  console.log('\n==========================================');
  console.log('  SMT ECOSYSTEM — ADMIN SEEDER');
  console.log('==========================================');

  dns.setServers(['8.8.8.8', '1.1.1.1']);

  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ MongoDB Connected\n');

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      if (existing.role === 'admin') {
        console.log('ℹ️  Admin account already exists:');
        console.log('   Email:', ADMIN_EMAIL);
        console.log('   Role :', existing.role);
      } else {
        // Upgrade existing user to admin
        existing.role = 'admin';
        await existing.save();
        console.log('✅ Existing user upgraded to admin:', ADMIN_EMAIL);
      }
      await mongoose.disconnect();
      process.exit(0);
    }

    const passwordHash   = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const referralCode   = 'SMTADMIN01';

    const admin = new User({
      email:        ADMIN_EMAIL,
      passwordHash,
      name:         ADMIN_NAME,
      referralCode,
      role:         'admin',
      isVerified:   true,   // admin is pre-verified
      isBanned:     false,
    });

    await admin.save();

    console.log('✅ Admin account created successfully!\n');
    console.log('┌─────────────────────────────────────┐');
    console.log('│  ADMIN LOGIN CREDENTIALS             │');
    console.log('├─────────────────────────────────────┤');
    console.log(`│  URL      : http://localhost:3000/admin/login`);
    console.log(`│  Email    : ${ADMIN_EMAIL}`);
    console.log(`│  Password : ${ADMIN_PASSWORD}`);
    console.log('└─────────────────────────────────────┘');
    console.log('\n⚠️  Change your password after first login!\n');

  } catch (err: any) {
    console.error('❌ Seeder failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
