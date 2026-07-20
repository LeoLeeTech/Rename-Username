/**
 * 文件说明：普通站点适配文件。定义当前站点的 URL 匹配、DOM 选择器、URL 归一化、扫描前后处理和站点专属逻辑。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import { $$, setStyle } from 'browser-extension-utils'
import styleText from 'data-text:./007-twitter.com.scss'
import { getTrimmedTitle } from 'utags-utils'

import { setUtags } from '../../utils/dom-utils'
import { setUtagsAttributes } from '../../utils/index'

export default (() => {
  const prefix = 'https://x.com/'
  const prefix2 = 'https://twitter.com/'

  return {
    matches: /x\.com|twitter\.com/,
    preProcess() {
      // profile header
      const elements = $$('[data-testid="UserName"] span')
      for (const element of elements) {
        const title = getTrimmedTitle(element)
        if (!title || !title.startsWith('@')) {
          continue
        }

        const key = prefix + title.slice(1)
        setUtagsAttributes(element, { key, type: 'user' })
      }
    },
    listNodesSelectors: [
      // feed
      '[data-testid="cellInnerDiv"]',
    ],
    conditionNodesSelectors: [
      // feed
      '[data-testid="cellInnerDiv"] [data-testid="User-Name"] a',
    ],
    validate(element: HTMLAnchorElement, href: string) {
      if (href.startsWith(prefix) || href.startsWith(prefix2)) {
        // Remove prefix
        const href2 = href.startsWith(prefix2) ? href.slice(20) : href.slice(14)
        if (/^\w+$/.test(href2)) {
          if (
            /^(home|explore|notifications|messages|tos|privacy)$/.test(href2)
          ) {
            return false
          }

          const textContent = element.textContent || ''
          if (!textContent.startsWith('@')) {
            return false
          }
          // console.log(href2)

          const parent = element.parentElement!
          setStyle(parent, { zIndex: '1' })

          const meta = { type: 'user' }
          setUtags(element, '', meta)

          return true
        }
      }

      return false
    },
    getStyle: () => styleText,
  }
})()
