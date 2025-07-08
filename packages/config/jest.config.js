module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/src/$1',
  },
}
