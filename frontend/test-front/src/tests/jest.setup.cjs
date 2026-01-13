require('@testing-library/jest-dom');

// Provide fake env values for tests
globalThis.__VITE_ENV__ = {
  VITE_API_BASE_URL: 'http://localhost:3000',
  VITE_PUBLIC_KEY: 'pub_test',
};
