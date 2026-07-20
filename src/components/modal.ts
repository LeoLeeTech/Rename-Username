/**
 * 文件说明：页面内弹窗组件工厂。用于高级标签管理器、设置、导入导出等 content script 里的交互界面。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import {
  addClass,
  addElement,
  createElement,
  doc,
} from 'browser-extension-utils'
import { initFocusTrap } from 'focus-trap-lite'

export default function createModal(attributes?: Record<string, unknown>) {
  const div = createElement('div', {
    class: 'utags_modal',
    'data-utags_exclude': '',
  })

  const wrapper = addElement(div, 'div', {
    class: 'utags_modal_wrapper',
    'data-utags_exclude': '',
  })

  const content = addElement(wrapper, 'div', attributes)

  addClass(content, 'utags_modal_content')
  let removed = false
  return {
    remove() {
      if (!removed) {
        removed = true
        div.remove()
      }
    },
    append(element?: HTMLElement) {
      ;(element || doc.documentElement).append(div)
      initFocusTrap(div)
    },
    getContentElement() {
      return content
    },
  }
}
