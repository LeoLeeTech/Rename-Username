/**
 * 文件说明：站点适配测试初始化文件，用于给站点规则相关单元测试准备共同的测试环境。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import { vi } from 'vitest'

if (!globalThis.requestIdleCallback) {
  globalThis.requestIdleCallback = vi.fn((cb) => {
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => 50,
      })
    }, 0)
  }) as any
  globalThis.cancelIdleCallback = vi.fn((id: number) => {
    clearTimeout(id)
  }) as any
}
