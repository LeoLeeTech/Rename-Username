/**
 * 文件说明：事件监听测试 mock，用于验证事件注册、触发和清理逻辑。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import { vi } from 'vitest'

/**
 * Creates mock event listener functions with a callback to track handlers.
 * @param onAddListener - Callback function to handle event listener registration
 * @returns Object containing mock addEventListener and removeEventListener functions
 */
export function mockEventListener(
  onAddListener: (event: string, handler: any) => void
) {
  const eventHandlers = new Map<string, Set<any>>()

  const addEventListener = vi.fn((event: string, handler: any) => {
    if (!eventHandlers.has(event)) {
      eventHandlers.set(event, new Set())
    }

    eventHandlers.get(event)?.add(handler)
    onAddListener(event, handler)
  })

  const removeEventListener = vi.fn((event: string, handler: any) => {
    eventHandlers.get(event)?.delete(handler)
  })

  return {
    addEventListener,
    removeEventListener,
    eventHandlers,
  }
}
