/**
 * 文件说明：Vitest 单元测试配置。使用 jsdom 模拟浏览器 DOM，并提供 data-text: loader，方便测试 Plasmo 文本资源导入。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Enable test coverage
    coverage: {
      provider: 'v8',
      enabled: false,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/__tests__/**/*'],
    },
    // Only run tests in src directory
    include: ['src/**/*.test.ts', 'src/**/__tests__/**/*'],
    // Setup test environment
    environment: 'jsdom',
  },
  plugins: [
    {
      name: 'plasmo-data-text-loader',
      resolveId(id: string) {
        if (id.startsWith('data-text:')) {
          return id
        }
      },
      load(id: string) {
        if (id.startsWith('data-text:')) {
          return `export default ''`
        }
      },
    },
  ],
})
