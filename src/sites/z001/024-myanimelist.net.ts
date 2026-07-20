/**
 * 文件说明：普通站点适配文件。定义当前站点的 URL 匹配、DOM 选择器、URL 归一化、扫描前后处理和站点专属逻辑。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import styleText from 'data-text:./024-myanimelist.net.scss'

import defaultSite from '../default'

export default (() => {
  return {
    matches: /myanimelist\.net/,
    listNodesSelectors: [],
    conditionNodesSelectors: [],
    excludeSelectors: [
      ...defaultSite.excludeSelectors,
      '#headerSmall',
      '#menu',
      '#nav',
      '.header',
      '#status-menu',
      'a[href^="/sns/register/"]',
      'a[href^="/logout"]',
      'a[href*="/membership?"]',
      'a[href*="/login.php"]',
      'a[href*="/register.php"]',
      'a[href*="/dbchanges.php"]',
      'a[href*="/editprofile.php"]',
      'a[href*="go=write"]',
      'a[href^="/ownlist/anime/add?"]',
      '[class*="btn-"]',
      '[class*="icon-"]',
      '[rel*="sponsored"]',
    ],
    getStyle: () => styleText,
  }
})()
