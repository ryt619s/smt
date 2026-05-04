/**
 * Brevo Email Delivery Test
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
  console.log('  BREVO EMAIL DELIVERY TEST');
  console.log('========================================');
  console.log('BREVO_SMTP_USER :', process.env.BREVO_SMTP_USER || '❌ NOT SET');
  console.log('BREVO_SENDER_EMAIL :', process.env.BREVO_SENDER_EMAIL || '❌ NOT SET');
  console.log('Recipient       :', recipient);
  console.log('========================================\n');

  await sendOTPEmail(recipient, '472819', 'Registration');

  console.log('Test complete.');
  console.log('If you see ✅ above, check your inbox (and spam).');
  console.log('\n⚠️  NOTE: Ensure the sender email is verified in your Brevo Dashboard.\n');
  process.exit(0);
})();
