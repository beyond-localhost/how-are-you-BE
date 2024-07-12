import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "mysql",
  schema: "./src/domain/schema.ts",
  out: "./drizzle",
  strict: true,
});
