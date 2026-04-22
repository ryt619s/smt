import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('[DB FATAL] MONGO_URI is not set in .env file');
    process.exit(1);
  }

  console.log('[DB] Attempting to connect to MongoDB Atlas...');
  console.log('[DB] URI:', mongoUri.replace(/:([^@]+)@/, ':****@')); // hide password

  // Force Node.js to use Google DNS — fixes ECONNREFUSED on IPv6-only WiFi adapters
  dns.setServers(['8.8.8.8', '1.1.1.1']);

  try {
    await mongoose.connect(mongoUri);
    console.log('[DB] ✅ MongoDB Connected Successfully');
    console.log('[DB] Connection State:', mongoose.connection.readyState); // 1 = connected
    console.log('[DB] Database Name:', mongoose.connection.name);
  } catch (error: any) {
    console.error('[DB] ❌ MongoDB Connection Failed');
    console.error('[DB] Error Code:', error.code);
    console.error('[DB] Error Message:', error.message);
    process.exit(1); // stop server — DB is required
  }
};

export default connectDB;
