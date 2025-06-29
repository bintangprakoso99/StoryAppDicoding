module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/scripts/$1",
    "^@styles/(.*)$": "<rootDir>/styles/$1",
    "^@public/(.*)$": "<rootDir>/public/$1",
  },
  collectCoverageFrom: ["scripts/**/*.js", "!scripts/main.js", "!**/node_modules/**", "!**/dist/**"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  moduleFileExtensions: ["js", "json"],
  verbose: true,
}
