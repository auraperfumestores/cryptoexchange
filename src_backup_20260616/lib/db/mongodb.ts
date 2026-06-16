import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // We don't throw at module load to allow the build to succeed
  // even when MONGODB_URI is absent. Each route that needs the DB
  // will throw with a clear message.
  // eslint-disable-next-line no-console
  console.warn('[mongodb] MONGODB_URI is not set — DB calls will fail at runtime.');
}

/**
 * Singleton mongoose connection. In dev with HMR, Next.js may reload
 * this file repeatedly; we cache the connection on `globalThis` to
 * avoid exhausting Mongo connection slots.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured. Set it in .env.local.');
  }

  const cached = global._mongoose;
  if (cached?.conn) return cached.conn;
  if (cached?.promise) return cached.promise;

  const promise = mongoose
    .connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    })
    .then((m) => m);

  global._mongoose = { conn: null, promise };
  try {
    const conn = await promise;
    global._mongoose = { conn, promise: null };
    return conn;
  } catch (err) {
    global._mongoose = { conn: null, promise: null };
    throw err;
  }
}

export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
