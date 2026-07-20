/**
 * 文件说明：普通站点适配文件。定义当前站点的 URL 匹配、DOM 选择器、URL 归一化、扫描前后处理和站点专属逻辑。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import styleText from 'data-text:../default.scss'

import { deleteUrlParameters } from '../../utils'

export default (() => {
  return {
    matches: /utags\.pipecraft\.net/,
    matchedNodesSelectors: ['[data-utags_primary_link]', '[data-utags_link]'],
    validate(element: HTMLElement) {
      return true
    },
    excludeSelectors: [
      // ".browser_extension_settings_container",
      // ".utags_text_tag",
      // "a a",
      // 'a[href^="javascript:"]',
      // 'a[href="#"]',
      // 'a[href=""]',
    ],
    getCanonicalUrl: (url: string) =>
      deleteUrlParameters(url, [
        // common useless parameters
        'utm_campaign',
        'utm_source',
        'utm_medium',
      ]),
    getStyle: () => styleText,
  }
})()
