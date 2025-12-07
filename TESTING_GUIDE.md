# KDIH Website - Testing Guide

## Overview

This testing suite provides comprehensive automated tests for the KDIH website to ensure stability and prevent regressions.

## Test Structure

```
tests/
├── setup.js                 # Global test configuration
├── fixtures/
│   └── testData.js         # Test data fixtures
├── unit/                   # Unit tests (future)
├── integration/            # API integration tests
│   ├── auth.test.js       # Authentication tests
│   ├── courses.test.js    # Courses API tests
│   ├── events.test.js     # Events API tests
│   ├── coworking.test.js  # Coworking API tests
│   ├── payments.test.js   # Payments API tests
│   ├── member.test.js     # Member portal tests
│   └── general.test.js    # General endpoints tests
└── e2e/                    # End-to-end tests (future)
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Integration tests only
npm run test:integration

# Unit tests only (when added)
npm run test:unit

# E2E tests only (when added)
npm run test:e2e
```

### Watch Mode
```bash
npm run test:watch
```

### Verbose Output
```bash
npm run test:verbose
```

## Test Coverage

After running tests, view the coverage report:
```bash
open coverage/lcov-report/index.html
```

## Current Test Coverage

### Integration Tests

#### ✅ Authentication (`auth.test.js`)
- Admin login (success/failure)
- Invalid credentials handling
- Logout functionality
- Session checking

#### ✅ Courses (`courses.test.js`)
- List all courses
- Get course by ID
- Course enrollment
- Validation errors

#### ✅ Events (`events.test.js`)
- List all events
- Upcoming events filtering
- Event registration
- Validation errors

#### ✅ Coworking (`coworking.test.js`)
- Check desk availability
- Member registration
- Desk booking
- Validation errors

#### ✅ Payments (`payments.test.js`)
- Payment initialization
- Payment verification
- Webhook handling
- Error handling

#### ✅ Member Portal (`member.test.js`)
- Member registration
- Duplicate email handling
- Password validation
- Session management

#### ✅ General Endpoints (`general.test.js`)
- Health check
- Services listing
- Statistics
- Contact form
- Certificate verification
- 404 handling

## Writing New Tests

### Example Integration Test

```javascript
const request = require('supertest');
const app = require('../../server');

describe('My Feature API', () => {
  it('should do something', async () => {
    const response = await request(app)
      .get('/api/my-endpoint');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });
});
```

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Use Fixtures**: Reuse test data from `fixtures/testData.js`
3. **Clean Up**: Tests automatically reset between runs
4. **Test Edge Cases**: Include error scenarios
5. **Meaningful Names**: Use descriptive test names

## Environment

Tests run in isolated environment:
- Database: In-memory SQLite (`:memory:`)
- Environment: `test`
- Logs: Suppressed (unless `DEBUG_TESTS=true`)

## Continuous Integration

### Future: GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

## Troubleshooting

### Tests Timing Out
Increase timeout in `jest.config.js`:
```javascript
testTimeout: 15000 // 15 seconds
```

### Database Errors
Ensure test database is properly isolated:
```javascript
process.env.DB_PATH = ':memory:';
```

### Enable Debug Logs
```bash
DEBUG_TESTS=true npm test
```

## Next Steps

- [ ] Add unit tests for utility functions
- [ ] Add E2E tests for complete user flows
- [ ] Integrate with CI/CD pipeline
- [ ] Set up automated test runs on PR
- [ ] Add performance testing
- [ ] Add security testing (OWASP)

## Test Statistics

- **Total Test Files**: 7
- **Total Tests**: ~40+
- **Coverage Target**: >70%
- **Test Execution Time**: <30s

---

**Remember**: Always run tests before deploying to production!
