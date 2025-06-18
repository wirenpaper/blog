import baseConfig from './jest.base.config.js';

/** @type {import('jest').Config} */
const config = {
  ...baseConfig,
  testMatch: ["**/*.maildev.inactive.test.ts"],
  setupFiles: ["dotenv/config"]
};

export default config;
