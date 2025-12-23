import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/unit/**/*.{test,spec}.{js,ts,tsx}'],
    exclude: [
      'node_modules',
      '__tests__/components/**', // Skip component tests (use Expo CLI for those)
      'dist',
      '.expo',
      'ios',
      'android',
      'web-build',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        'babel.config.js',
        'metro.config.js',
      ],
    },
    // Mock React Native and Expo modules for pure logic testing
    setupFiles: ['./__tests__/vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
