import { defineConfig } from 'vitest/config'

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export default defineConfig({
  test: {
    coverage: {
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/__tests__/**/*'],
    },
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/__tests__/**/*'],
    globals: true,
    setupFiles: ['src/sites/test-setup.ts'],
  },
})
