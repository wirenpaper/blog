/** @type {import('jest').Config} */
const baseConfig = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@src/(.*)\\.js$": "<rootDir>/src/$1",
    "^@db/(.*)\\.js$": "<rootDir>/src/db/$1",
    "^@business/(.*)\\.js$": "<rootDir>/src/business/$1",
    "^@middleware/(.*)\\.js$": "<rootDir>/src/middleware/$1"
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: ["node_modules/(?!postgres)"],
};

export default baseConfig;
