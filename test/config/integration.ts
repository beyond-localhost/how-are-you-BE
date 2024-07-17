import { mergeConfig, defineConfig } from "vitest/config";
import unitTestConfig from "./unit";
export default mergeConfig(
  unitTestConfig,
  defineConfig({
    test: {
      include: ["./src/**/*.test.ts"],
      exclude: ["./src/**/*.spec.ts"],
      globalSetup: ["./test/config/setup-integration.ts"],
      testTimeout: 10000,
    },
  }),
);
