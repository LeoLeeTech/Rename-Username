/**
 * 文件说明：UTags UI 注册表。记录页面上已经创建的 .utags_ul 标签列表，避免重复插入，并支持统一隐藏、清理和刷新。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
const utagsElementMap = new WeakMap<HTMLElement, HTMLElement>()
const utagsUlSet = new Set<HTMLElement>()

export function registerElementUtagsUl(
  element: HTMLElement,
  ul: HTMLElement
): void {
  utagsElementMap.set(element, ul)
  utagsUlSet.add(ul)
}

export function getUtagsUl(element: HTMLElement): HTMLElement | undefined {
  return utagsElementMap.get(element)
}

export function unregisterElementUtagsUl(
  element: HTMLElement
): HTMLElement | undefined {
  const ul = utagsElementMap.get(element)
  if (ul) {
    utagsUlSet.delete(ul)
    utagsElementMap.delete(element)
  }

  return ul
}

export function ensureUtagsUlTracked(ul: HTMLElement): void {
  utagsUlSet.add(ul)
}

export function isUtagsUlTracked(ul: HTMLElement): boolean {
  return utagsUlSet.has(ul)
}

export function unregisterUtagsUl(ul: HTMLElement): void {
  utagsUlSet.delete(ul)
}

export function getAllRegisteredUtagsUls(): IterableIterator<HTMLElement> {
  return utagsUlSet.values()
}

export function getRegisteredUtagsUlCount(): number {
  return utagsUlSet.size
}

export function clearUtagsUlRegistry(): void {
  utagsUlSet.clear()
}
