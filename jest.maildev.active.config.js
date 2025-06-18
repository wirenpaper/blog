import baseConfig from './jest.base.config.js';

/** @type {import('jest').Config} */
const config = {
  ...baseConfig,
  testMatch: ["**/*.maildev.active.test.ts"],
  setupFiles: ["dotenv/config"]
};

export default config;
