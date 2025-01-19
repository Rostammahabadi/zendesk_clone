import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      all: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'cypress/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/vite-env.d.ts',
        '**/vite.config.*',
        '**/eslint.config.*',
        'src/config/*',
        'src/lib/*',
      ],
    },
  }
}) 