module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'routes/**/*.js',
        'utils/**/*.js',
        'server.js',
        '!**/node_modules/**',
        '!**/tests/**'
    ],
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50
        }
    },
    verbose: true,
    testTimeout: 10000,
    // Ignore node_modules and test database
    testPathIgnorePatterns: ['/node_modules/'],
    // Clear mocks between tests
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true
};
