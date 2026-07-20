/**
 * 文件说明：普通站点适配文件。定义当前站点的 URL 匹配、DOM 选择器、URL 归一化、扫描前后处理和站点专属逻辑。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import defaultSite from '../default'

export default (() => {
  return {
    matches: /lobste\.rs|dto\.pipecraft\.net|tilde\.news|journalduhacker\.net/,
    listNodesSelectors: [],
    conditionNodesSelectors: [],
    excludeSelectors: [
      ...defaultSite.excludeSelectors,
      '#nav',
      '#header',
      '#subnav',
      '.mobile_comments',
      '.description_present',
      '.morelink',
      '.user_tree',
      '.dropdown_parent',
      'a[href^="/login"]',
      'a[href^="/logout"]',
      'a[href^="/u#"]',
      'a[href$="/save"]',
      'a[href$="/hide"]',
      'a[href$="/suggest"]',
    ],
  }
})()
