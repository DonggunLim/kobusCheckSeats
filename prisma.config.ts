import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.local";
config({ path: envFile });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
