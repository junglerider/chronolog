module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ["test", "src"],
  collectCoverageFrom: ["src/**/*.ts"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};