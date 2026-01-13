import '@testing-library/jest-dom';

(import.meta as any).env = {
  ...(import.meta as any).env,
  VITE_API_BASE_URL: 'http://localhost:3000',
  VITE_PUBLIC_KEY: 'pub_test',
};
