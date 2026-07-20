/**
 * 文件说明：成人或敏感站点适配文件。定义该站点的匹配规则、DOM 选择器、URL 归一化和扫描处理逻辑。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import { $, $$ } from 'browser-extension-utils'
import styleText from 'data-text:./003-panda.chai99ka.moe.scss'
import { getTrimmedTitle } from 'utags-utils'

import { setUtags } from '../../utils/dom-utils'
import { setUtagsAttributes } from '../../utils/index'
import defaultSite from '../default'

export default (() => {
  const prefix = 'https://panda.chaika.moe/'

  function getPostUrl(url: string, exact = false) {
    if (url.startsWith(prefix)) {
      const href2 = url.slice(25)
      if (exact) {
        if (/^archive\/\d+\/(\?.*)?$/.test(href2)) {
          return prefix + href2.replace(/^(archive\/\d+\/).*/, '$1')
        }
      } else if (/^archive\/\d+\//.test(href2)) {
        return prefix + href2.replace(/^(archive\/\d+\/).*/, '$1')
      }
    }

    return undefined
  }

  return {
    matches: /panda\.chaika\.moe/,
    preProcess() {
      const key = getPostUrl(location.href)
      if (key) {
        // post title
        const element = $('h5')
        if (element) {
          setUtagsAttributes(element, { key, type: 'post' })
        }
      }

      // https://panda.chaika.moe/?view=cover
      for (const element of $$('.gallery a.cover') as HTMLAnchorElement[]) {
        const key = element.href
        const titleElement = $('.cover-title', element)
        if (titleElement) {
          setUtagsAttributes(titleElement, { key, type: 'post' })
        }
      }

      // https://panda.chaika.moe/?view=extended
      for (const element of $$(
        '.td-extended > a[href^="/archive/"]'
      ) as HTMLAnchorElement[]) {
        const key = element.href
        const titleElement = $('h5', element.parentElement!.parentElement!)
        if (titleElement) {
          setUtagsAttributes(titleElement, { key, type: 'post' })
        }
      }
    },
    excludeSelectors: [
      ...defaultSite.excludeSelectors,
      '.navbar',
      'th',
      '.pagination',
      '.btn',
      '.caption',
    ],
    getStyle: () => styleText,
  }
})()
