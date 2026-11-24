// Shared MongoDB connection for CLI scripts.
// Run scripts through npm (e.g. `npm run create-admin`) so .env is loaded via `node --env-file=.env`.
import mongoose from 'mongoose';
import dns from 'node:dns';

const dnsServers = process.env.MONGODB_DNS_SERVERS || '1.1.1.1';
if (dnsServers !== 'system') dns.setServers(dnsServers.split(',').map((s) => s.trim()).filter(Boolean));

export default async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set. Run this script via npm so .env is loaded (e.g. npm run create-admin).');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:');
    console.error(error.message);
    process.exit(1);
  }
}
