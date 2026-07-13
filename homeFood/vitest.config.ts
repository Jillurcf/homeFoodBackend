import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/*.test.{ts,tsx}',
      'app/**/*.test.{ts,tsx}',
    ],
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 10000,
    css: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
