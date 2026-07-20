/**
 * 文件说明：普通站点适配文件。定义当前站点的 URL 匹配、DOM 选择器、URL 归一化、扫描前后处理和站点专属逻辑。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import styleText from 'data-text:./015-52pojie.cn.scss'

import defaultSite from '../default'

export default (() => {
  return {
    // Discuz
    matches: /52pojie\.cn/,
    matchedNodesSelectors: [
      'a[href*="home.php?mod=space&uid="]',
      'a[href*="home.php?mod=space&username="]',
      // 'a[href*="thread-"]',
      // 'a[href*="forum-"]',
    ],
    excludeSelectors: [
      ...defaultSite.excludeSelectors,
      '#hd',
      '#pt',
      '#pgt',
      // 右边工具栏
      '#jz52top',
    ],
    getStyle: () => styleText,
  }
})()
