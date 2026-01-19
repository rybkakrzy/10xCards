# Testing Guide for 10xCards

This directory contains E2E and unit tests for the 10xCards application.

## Prerequisites

1. **Node.js and npm** installed
2. **Local Supabase** instance running:
   ```bash
   npx supabase start
   ```
3. **Test environment** configured (`.env.test` file)

## Setup

1. Copy the example environment file:
   ```bash
   cp .env.test.example .env.test
   ```

2. Fill in your test credentials in `.env.test`:
   - Use the local Supabase URL and keys from `npx supabase status`
   - Create a test user in your local Supabase instance
   - Add the test user credentials to `E2E_USERNAME` and `E2E_PASSWORD`

3. Install dependencies:
   ```bash
   npm install
   ```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### E2E Tests Only
```bash
npm run test:e2e
```

### With UI
```bash
npm run test:ui          # Vitest UI
npm run test:e2e:ui      # Playwright UI
```

### With Coverage
```bash
npm run test:coverage
```

### Debug Mode
```bash
npm run test:e2e:debug
```

## Test Structure

```
tests/
├── e2e/                          # End-to-end tests
│   ├── manual-flashcard-creation.spec.ts
│   └── user-journey.spec.ts
├── unit/                         # Unit tests (component tests)
│   └── services/
├── fixtures/                     # Test data
│   └── testData.ts
└── setup/                        # Test setup files
    └── vitest.setup.ts
```

## Writing Tests

### E2E Tests
- Use `data-test-id` attributes for reliable element selection
- Test complete user flows (login → create → view → delete)
- Mock external APIs when necessary

### Unit Tests
- Test individual functions and components
- Use fixtures from `tests/fixtures/testData.ts`
- Mock Supabase client calls

## CI/CD

Tests run automatically in CI/CD pipelines:
- Unit tests run on every PR
- E2E tests run on main branch merges
- Coverage reports are generated and uploaded

## Troubleshooting

### Tests timing out
- Increase timeout in test files or config
- Check if dev server is running properly

### Login failures
- Verify test user exists in Supabase
- Check credentials in `.env.test`
- Ensure Supabase is running

### Element not found
- Add `data-test-id` attributes to components
- Use `page.waitForSelector()` for dynamic content
- Check if element is behind authentication
