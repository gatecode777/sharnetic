import 'server-only';
import mongoose from 'mongoose';
import dns from 'node:dns';
// Register all models so populate() works in every route bundle.
import './models';

// Same DNS override the old Express backend used, so MongoDB Atlas SRV records
// resolve reliably on networks with flaky default DNS.
// Override with MONGODB_DNS_SERVERS="8.8.8.8,1.1.1.1" or disable with MONGODB_DNS_SERVERS="system".
const dnsServers = process.env.MONGODB_DNS_SERVERS || '1.1.1.1';
if (dnsServers !== 'system') {
  try {
    dns.setServers(dnsServers.split(',').map((s) => s.trim()).filter(Boolean));
  } catch (err) {
    console.error('Invalid MONGODB_DNS_SERVERS value:', err.message);
  }
}

// Cache the connection across hot reloads (dev) and across invocations (serverless).
const cached = globalThis.__finoxisMongoose || (globalThis.__finoxisMongoose = { conn: null, promise: null });

export default async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined. Add it to your .env file.');
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI)
      .then((m) => {
        console.log('✅ MongoDB Connected');
        return m;
      })
      .catch((error) => {
        console.error('❌ MongoDB Connection Failed:');
        console.error(error.message);
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
