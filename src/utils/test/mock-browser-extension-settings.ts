/**
 * 文件说明：browser-extension-settings 的测试 mock，用于在单元测试中替代真实扩展设置环境。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import { vi } from 'vitest'

// Define settings types
type SettingsKey = 'pinnedTags' | 'emojiTags'
type SettingsValue = string
type SettingsData = Partial<Record<SettingsKey, SettingsValue>>

// Mock storage for tests with initial empty strings
const mockSettingsStorage: SettingsData = {}

export default function mockBrowserExtensionSettings() {
  // Mock browser-extension-settings module
  vi.mock('browser-extension-settings', () => ({
    getSettingsValue: vi
      .fn()
      .mockImplementation(
        async (key: string) => mockSettingsStorage[key as SettingsKey]
      ),
    setSettingsValue: vi
      .fn()
      .mockImplementation(async (key: string, value: unknown) => {
        mockSettingsStorage[key as SettingsKey] = value as SettingsValue
      }),
  }))
}
