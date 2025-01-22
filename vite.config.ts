import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from "@sentry/vite-plugin"
import { defineConfig as defineVitestConfig } from 'vitest/config'
import path from 'path'

// https://vitejs.dev/config/
export default defineVitestConfig(defineConfig({
  plugins: [react(), sentryVitePlugin({
    org: "none-665",
    project: "javascript-react"
  })],

  build: {
    sourcemap: true
  },
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
        'cypress/',          // Cypress E2E files
        '**/*.d.ts',         // Type definition files
        '**/*.config.*',     // e.g. postcss.config.js, tailwind.config.js, etc.
        '**/vite-env.d.ts',  // Vite env type file
        '**/vite.config.*',  // Vite config
        '**/eslint.config.*',
        'src/config/*',
        'src/lib/*',
      ],
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      inject: [path.resolve(__dirname, 'src/lib/polyfill.ts')]
    }
  }
}))