/**
 * 文件说明：普通站点适配文件。定义当前站点的 URL 匹配、DOM 选择器、URL 归一化、扫描前后处理和站点专属逻辑。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import { deleteUrlParameters } from '../../utils'
import defaultSite from '../default'

export default (() => {
  function getCanonicalUrl(url: string) {
    if (url.includes('douban.com')) {
      return deleteUrlParameters(url, [
        'ref',
        'dcs',
        'dcm',
        'from',
        'from_',
        'dt_time_source',
        'target_user_id',
        '_dtcc',
        '_i',
      ])
    }

    return url
  }

  return {
    matches: /douban\.com/,
    listNodesSelectors: [],
    conditionNodesSelectors: [],
    excludeSelectors: [
      ...defaultSite.excludeSelectors,
      '.tabs',
      'a[href*="/accounts/login?"]',
      'a[href*="/passport/login?"]',
      'a[href*="/register?"]',
    ],
    getCanonicalUrl,
  }
})()
