/**
 * 文件说明：普通站点适配文件。定义当前站点的 URL 匹配、DOM 选择器、URL 归一化、扫描前后处理和站点专属逻辑。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import { $, $$ } from 'browser-extension-utils'
import styleText from 'data-text:./009-instagram.com.scss'

import { setUtags } from '../../utils/dom-utils'
import defaultSite from '../default'

export default (() => {
  return {
    matches: /instagram\.com/,
    validate(element: HTMLAnchorElement, href: string) {
      if (href.startsWith('https://www.instagram.com/')) {
        // Remove "https://www.instagram.com/"
        const href2 = href.slice(26)
        if (/^[\w.]+\/$/.test(href2)) {
          // console.log(href2)
          if (/^(explore|reels)\/$/.test(href2)) {
            return false
          }

          if ($('div span', element)) {
            element.dataset.utags_node_type = 'notag_relative'
          }

          const meta = { type: 'user' }
          setUtags(element, '', meta)

          return true
        }
      }

      return false
    },
    excludeSelectors: [...defaultSite.excludeSelectors],
    getStyle: () => styleText,
  }
})()
