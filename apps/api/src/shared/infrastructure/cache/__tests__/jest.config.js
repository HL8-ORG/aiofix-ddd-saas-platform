module.exports = {
  displayName: 'Cache Infrastructure Tests',
  testMatch: [
    '<rootDir>/__tests__/**/*.spec.ts',
  ],
  collectCoverageFrom: [
    '<rootDir>/../**/*.ts',
    '!<rootDir>/../**/*.d.ts',
    '!<rootDir>/../**/index.ts',
    '!<rootDir>/../**/examples/**',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: [
    '<rootDir>/test-setup.ts',
  ],
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: [
    'ts',
    'js',
    'json',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/../$1',
  },
  testTimeout: 10000,
  verbose: true,
}
