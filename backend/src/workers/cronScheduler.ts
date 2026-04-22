import cron from 'node-cron';
import { distributeMiningRewards } from './cron';

export const startCronJobs = () => {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Executing daily dynamic reward distribution...');
    await distributeMiningRewards();
  });

  // Example: Run every 5 minutes for easier testing (commented out by default)
  // cron.schedule('*/5 * * * *', async () => {
  //   console.log('[CRON] Executing test reward distribution...');
  //   await distributeMiningRewards();
  // });

  console.log('Cron scheduler initialized.');
};
