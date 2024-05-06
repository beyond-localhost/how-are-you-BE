import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/domain/schema.ts",
  out: "./drizzle",
  strict: true,
});
