import baseConfig from './jest.base.config.js';

/** @type {import('jest').Config} */
const config = {
  ...baseConfig,
  testMatch: ["**/__tests__/**/*.test.ts"],
  testPathIgnorePatterns: [
    ".*\\.int\\.test\\.ts$",
    ".*\\.e2e\\.test\\.ts$",
    ".*\\.maildev\\.active\\.test\\.ts",
    ".*\\.maildev\\.inactive\\.test\\.ts"
  ]
};

export default config;
