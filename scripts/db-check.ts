import { config as loadEnv } from "dotenv";
loadEnv({ path: [".env.local", ".env"] });
import { connectDB, dbPing, isConnected, isDatabaseConfigured } from "../src/lib/db";
import { Client, Invoice, Proposal, User } from "../src/lib/models";

async function main() {
  if (!isDatabaseConfigured()) {
    console.error("\n❌ MONGODB_URI is not set. Create a .env.local file with:\n  MONGODB_URI=mongodb://localhost:27017/clientflow\n");
    process.exit(1);
  }

  const result = await dbPing();
  console.log(`✓ Ping OK — database: ${result.database} (state: ${result.state})`);

  const a = await connectDB();
  const b = await connectDB();
  console.log(`✓ Singleton: ${a === b} (same connection instance, no duplicates)`);

  const [users, clients, proposals, invoices] = await Promise.all([
    User.countDocuments(),
    Client.countDocuments(),
    Proposal.countDocuments(),
    Invoice.countDocuments(),
  ]);
  console.log(`✓ Queries OK — users: ${users} · clients: ${clients} · proposals: ${proposals} · invoices: ${invoices}`);
  console.log(`✓ Connected: ${isConnected()}`);

  await a.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("✗ Database check failed:", err);
  process.exit(1);
});