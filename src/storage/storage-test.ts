/**
 * 文件说明：存储测试辅助文件，用于单元测试中模拟或初始化浏览器扩展存储行为。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import {
  addValueChangeListener,
  deleteValue,
  getValue,
  removeValueChangeListener,
  runStorageTests,
  setValue,
} from 'browser-extension-storage'

export function storageTest() {
  // @ts-expect-error check if running in main frame
  if (globalThis !== top) {
    return
  }

  // 运行测试
  void runStorageTests(
    {
      getValue,
      setValue,
      deleteValue,
      addValueChangeListener,
      removeValueChangeListener,
    },
    console.log
    // eslint-disable-next-line promise/prefer-await-to-then
  ).then((passed) => {
    if (passed) {
      console.log('所有存储测试通过！')
    } else {
      console.error('存储测试失败，请检查日志。')
    }
  })
}
