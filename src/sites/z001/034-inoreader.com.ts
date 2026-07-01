import { $, $$, doc, hasClass, setAttribute } from 'browser-extension-utils'
import styleText from 'data-text:./034-inoreader.com.scss'
import { getTrimmedTitle } from 'utags-utils'

import { setUtags } from '../../utils/dom-utils'
import { setUtagsAttributes } from '../../utils/index'
import defaultSite from '../default'

export default (() => {
  const prefix = location.origin + '/'

  function getArticleUrl(url: string) {
    if (url.startsWith(prefix)) {
      const href2 = url.slice(prefix.length).toLowerCase()
      if (/^article\/\w+(-[^?#]*)?([?#].*)?$/.test(href2)) {
        return prefix + href2.replace(/^(article\/\w+)-.*/, '$1')
      }
    }

    return undefined
  }

  return {
    matches: /\w+\.inoreader\.com/,
    preProcess() {
      const key = getArticleUrl(location.href)
      if (key) {
        const element = $('.article_full_contents div.article_title')
        if (element) {
          setUtagsAttributes(element, { key, type: 'article' })
        }
      }
    },
    validate(element: HTMLAnchorElement, href: string) {
      if (!href.startsWith(prefix)) {
        return true
      }

      if (element.closest('#search_content .featured_category')) {
        element.dataset.utags_position_selector = 'span'
      }

      const key = getArticleUrl(href)
      if (key) {
        const title = getTrimmedTitle(element)
        if (!title) {
          return false
        }

        const meta = { type: 'article', title }
        setUtags(element, key, meta)
        setAttribute(element, 'data-utags', element.dataset.utags || '')

        if (element.closest('.search_feed_article')) {
          element.dataset.utags_position_selector = 'h6'
        }

        return true
      }

      return true
    },
    excludeSelectors: [
      ...defaultSite.excludeSelectors,
      '#side-nav',
      'a[href^="/preferences"]',
      'a[href^="/upgrade"]',
      'a[href^="/login"]',
      'a[href^="/signup"]',
      'a[href^="/sign_up"]',
      'a[href^="/forgot-password"]',
      '#preference-section-content',
      '#preference-section-settings',
      '.inno_tabs_tab',
      '.profile_checklist',
      '.gadget_overview_feed_title',
      '.header_name',
    ],
    postProcess() {
      const isDarkMode = hasClass(doc.body, 'theme_dark')
      doc.documentElement.dataset.utags_darkmode = isDarkMode ? '1' : '0'
    },
    getStyle: () => styleText,
  }
})()
