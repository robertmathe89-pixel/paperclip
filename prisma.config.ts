import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use DIRECT_URL (session pooler, port 5432) for migrations.
    // Falls back to DATABASE_URL (transaction pooler, port 6543).
    // Note: Supabase free plan blocks direct DB connections from external IPs;
    // use the session pooler host (aws-0-*.pooler.supabase.com:5432) instead.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"] ?? process.env["POSTGRES_URL"],
  },
});
