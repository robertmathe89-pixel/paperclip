import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL is the non-pooled connection required for migrations.
    // DATABASE_URL is the transaction pooler used at runtime.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"] ?? process.env["POSTGRES_URL_NON_POOLING"],
  },
});
