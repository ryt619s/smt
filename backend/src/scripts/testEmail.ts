/**
 * Resend Email Delivery Test
 * 
 * Usage:
 *   npx ts-node src/scripts/testEmail.ts your@email.com
 */
import dotenv from 'dotenv';
dotenv.config();

import { sendOTPEmail } from '../services/emailService';

const recipient = process.argv[2];

if (!recipient || !recipient.includes('@')) {
  console.error('\n❌ Please provide a real email address:');
  console.error('   npx ts-node src/scripts/testEmail.ts your@email.com\n');
  process.exit(1);
}

(async () => {
  console.log('\n========================================');
  console.log('  RESEND EMAIL DELIVERY TEST');
  console.log('========================================');
  console.log('RESEND_API_KEY :', process.env.RESEND_API_KEY
    ? `re_****${process.env.RESEND_API_KEY.slice(-6)}`
    : '❌ NOT SET — add to .env!');
  console.log('RESEND_FROM    :', process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev (default)');
  console.log('Recipient      :', recipient);
  console.log('========================================\n');

  await sendOTPEmail(recipient, '472819', 'Registration');

  console.log('Test complete.');
  console.log('If you see ✅ above, check your inbox (and spam).');
  console.log('\n⚠️  NOTE: Without a verified domain, Resend only delivers');
  console.log('   to the email address registered in your Resend account.');
  console.log('   → Sign up at resend.com, verify your domain to send to anyone.\n');
  process.exit(0);
})();
