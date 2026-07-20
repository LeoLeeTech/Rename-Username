/**
 * 文件说明：普通站点适配文件。定义当前站点的 URL 匹配、DOM 选择器、URL 归一化、扫描前后处理和站点专属逻辑。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import { $ } from 'browser-extension-utils'
import { getTrimmedTitle } from 'utags-utils'

import { setUtags } from '../../utils/dom-utils'
import { setUtagsAttributes } from '../../utils/index'

export default (() => {
  function getCanonicalUrl(url: string) {
    if (url.startsWith('http://mp.weixin.qq.com')) {
      url = url.replace(/^http:/, 'https:')
    }

    if (url.startsWith('https://mp.weixin.qq.com/s/')) {
      url = url.replace(/(\/s\/[\w-]+).*/, '$1')
    }

    if (url.startsWith('https://mp.weixin.qq.com/') && url.includes('#')) {
      url = url.replace(/#.*/, '')
    }

    return url
  }

  return {
    matches: /mp\.weixin\.qq\.com/,
    preProcess() {
      const element = $('h1.rich_media_title')
      if (element) {
        const title = getTrimmedTitle(element)
        if (title) {
          const key = getCanonicalUrl(location.href)
          setUtagsAttributes(element, { key, type: 'article' })
        }
      }
    },
    getCanonicalUrl,
  }
})()
