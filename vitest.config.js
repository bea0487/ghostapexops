import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    testTimeout: 30000,
    hookTimeout: 30000,
    css: false,
    include: ['tests/**/*.test.js'],
  },
  // Disable CSS processing for tests to avoid PostCSS/Tailwind dependency issues
  css: {
    modules: false,
  },
})
