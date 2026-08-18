import mongoose from "mongoose";

type MongoCache = {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
};

const globalForMongo = globalThis as typeof globalThis & {
  __clientFlowLiteMongo?: MongoCache;
  __clientFlowLiteShutdown?: boolean;
};

const cached: MongoCache = globalForMongo.__clientFlowLiteMongo ?? { conn: null, promise: null };
globalForMongo.__clientFlowLiteMongo = cached;

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("MONGODB_URI is not configured. Add it to .env and run `npm run seed`.");
    this.name = "DatabaseNotConfiguredError";
  }
}

export function isDatabaseConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

function connectionOptions(): mongoose.ConnectOptions {
  const production = process.env.NODE_ENV === "production";
  return {
    serverSelectionTimeoutMS: 8_000,
    connectTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    maxPoolSize: 20,
    minPoolSize: 0,
    retryWrites: true,
    family: 4,
    autoIndex: !production,
    bufferCommands: !production,
    ...(process.env.MONGODB_DB ? { dbName: process.env.MONGODB_DB } : {}),
  };
}

function attachConnectionHandlers(conn: mongoose.Connection) {
  if (conn.listeners("connected").length > 0) return;

  conn.on("connected", () => {
    console.log(`[db] connected — database: ${conn.name}`);
  });
  conn.on("disconnected", () => {
    console.warn("[db] disconnected");
  });
  conn.on("reconnected", () => {
    console.log("[db] reconnected");
  });
  conn.on("error", (err) => {
    console.error("[db] error:", err instanceof Error ? err.message : err);
  });
}

function registerGracefulShutdown() {
  if (globalForMongo.__clientFlowLiteShutdown) return;
  globalForMongo.__clientFlowLiteShutdown = true;

  const close = () => {
    if (cached.conn) {
      console.log("[db] closing connection");
      void cached.conn.close();
    }
  };

  process.on("SIGTERM", close);
  process.on("SIGINT", close);
}

export async function connectDB(): Promise<mongoose.Connection> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new DatabaseNotConfiguredError();

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, connectionOptions()).then((m) => {
      const conn = m.connection;
      attachConnectionHandlers(conn);
      return conn;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  registerGracefulShutdown();
  return cached.conn;
}

export function isConnected() {
  return cached.conn?.readyState === 1;
}

export async function dbPing() {
  const conn = await connectDB();
  const db = conn.db;
  if (!db) throw new Error("MongoDB connection has no active database handle");
  await db.admin().command({ ping: 1 });
  return { database: conn.name, state: conn.readyState };
}

export function modelReady() {
  return Boolean(process.env.MONGODB_URI);
}