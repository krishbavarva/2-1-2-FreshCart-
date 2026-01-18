# Testing Guide

This project includes comprehensive testing setup with multiple test types.

## 🧪 Test Types

1. **Unit Tests** - Test individual functions/components in isolation
2. **Integration Tests** - Test API endpoints and component interactions
3. **E2E Tests** - Test full user flows with Playwright
4. **Performance Tests** - Test API response times and load handling

## 📁 Test Structure

```
backend/
  tests/
    unit/          # Unit tests for individual functions
    integration/   # API integration tests
    performance/   # Performance and load tests

frontend/
  tests/
    unit/          # React component unit tests
    integration/   # Component integration tests
    e2e/           # End-to-end tests (Playwright)
    setup.js       # Test configuration
```

## 🚀 Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run performance tests
npm run test:performance

# Run with coverage
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## 📊 Test Coverage

View coverage reports:
- **Backend**: `backend/coverage/`
- **Frontend**: `frontend/coverage/`

## 🔧 Test Configuration

### Backend (Mocha + Chai)
- Test framework: Mocha
- Assertion library: Chai
- HTTP testing: Supertest
- Coverage: NYC

### Frontend (Vitest)
- Test framework: Vitest
- React testing: @testing-library/react
- E2E testing: Playwright
- Coverage: Vitest built-in

## 📝 Writing Tests

### Backend Unit Test Example

```javascript
import { describe, it } from 'mocha';
import { expect } from 'chai';

describe('My Function', () => {
  it('should do something', () => {
    const result = myFunction();
    expect(result).to.equal(expectedValue);
  });
});
```

### Frontend Component Test Example

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## 🎯 GitHub Actions

Tests run automatically on:
- Push to `main` or `master`
- Pull requests

View results in GitHub Actions tab.

## 📚 Test Best Practices

1. **Unit Tests**: Test one thing at a time
2. **Integration Tests**: Test real API calls with test database
3. **E2E Tests**: Test critical user flows
4. **Performance Tests**: Ensure APIs respond quickly
5. **Coverage**: Aim for >80% code coverage

## 🐛 Debugging Tests

### Backend
```bash
# Run with verbose output
npm test -- --reporter spec

# Run specific test file
npm test -- tests/unit/auth.test.js
```

### Frontend
```bash
# Run with UI for debugging
npm run test:ui

# Run specific test file
npm test -- tests/unit/ProductCard.test.jsx
```

## ✅ Test Checklist

- [x] Unit tests for backend functions
- [x] Integration tests for API endpoints
- [x] Unit tests for React components
- [x] Integration tests for component interactions
- [x] E2E tests for critical flows
- [x] Performance tests for API
- [x] GitHub Actions CI/CD setup

---

**Happy Testing!** 🧪

