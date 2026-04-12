import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Vercel-Supabase integration provides POSTGRES_URL_NON_POOLING (direct connection)
    // which is required for migrations. Fall back to pooler or generic DATABASE_URL.
    url: process.env["POSTGRES_URL_NON_POOLING"] ?? process.env["DATABASE_URL"] ?? process.env["POSTGRES_URL"],
  },
});
