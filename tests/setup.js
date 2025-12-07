// Global test setup
process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:'; // Use in-memory database for tests
process.env.SESSION_SECRET = 'test-secret-key';
process.env.PAYSTACK_SECRET_KEY = 'sk_test_dummy';
process.env.PAYSTACK_PUBLIC_KEY = 'pk_test_dummy';
process.env.EMAIL_USER = 'test@test.com';
process.env.EMAIL_PASS = 'test-password';

// Silence console logs during tests unless debugging
if (!process.env.DEBUG_TESTS) {
    global.console = {
        ...console,
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
    };
}

// Setup global test timeout
jest.setTimeout(10000);

// Cleanup after each test
afterEach(() => {
    jest.clearAllMocks();
});
