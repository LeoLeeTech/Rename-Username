/**
 * 文件说明：默认站点配置。匹配所有页面，默认处理 data-utags_link 节点，清理常见 UTM 参数，并提供默认样式。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import styleText from 'data-text:./default.scss'

import { deleteUrlParameters } from '../utils'

export default (() => {
  return {
    matches: /.*/,
    matchedNodesSelectors: ['[data-utags_link]'],
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
