import { $, $$, doc, hasClass, setAttribute } from 'browser-extension-utils'
import { getTrimmedTitle } from 'utags-utils'

import { addVisited, setVisitedAvailable } from '../../modules/visited'
import { setUtags } from '../../utils/dom-utils'
import { setUtagsAttributes } from '../../utils/index'
import defaultSite from '../default'
import styleText from './040-2libra.com.scss?inline'

export default (() => {
  const prefix = location.origin + '/'

  function getPostUrl(url: string, exact = false) {
    if (url.startsWith(prefix)) {
      const href2 = url.slice(prefix.length)
      if (exact) {
        if (/^(post|post-flat)(?:\/[\w-]+){2}$/.test(href2)) {
          return (
            prefix +
            href2.replace(/^(post|post-flat)\/([\w-]+\/[\w-]+).*/, 'post/$2')
          )
        }
      } else if (/^(post|post-flat)(?:\/[\w-]+){2}/.test(href2)) {
        return (
          prefix +
          href2.replace(/^(post|post-flat)\/([\w-]+\/[\w-]+).*/, 'post/$2')
        )
      }
    }

    return undefined
  }

  function getUserProfileUrl(url: string, exact = false) {
    if (url.startsWith(prefix)) {
      const href2 = url.slice(prefix.length)
      if (exact) {
        if (/^user\/[\w-%]+(\/(post)?)?$/.test(href2)) {
          return prefix + href2.replace(/^(user\/[\w-%]+).*/, '$1/post')
        }
      } else if (/^user\/[\w-%]+/.test(href2)) {
        return prefix + href2.replace(/^(user\/[\w-%]+).*/, '$1/post')
      }
    }

    return undefined
  }

  return {
    matches: /2libra\.com/,
    preProcess() {
      setVisitedAvailable(true)

      {
        const key = getPostUrl(location.href)
        if (key) {
          const element = $('[data-main-left] h1')
          if (element) {
            const title = getTrimmedTitle(element)
            if (title) {
              setUtagsAttributes(element, { key, type: 'post' })
              addVisited(key)

              const commentElements = $$('article[id]')
              for (const element of commentElements) {
                const id = element.id.replace('comment-', '')
                const target = $('time', element)
                if (!id || !target) {
                  continue
                }

                const commentkey = `${key}?commentId=${id}`
                const formattedTitle = `回复 >> ${title}`
                const description = getTrimmedTitle(
                  $('section div', element) || element
                )
                const formattedDescription =
                  description.length > 1000
                    ? description.slice(0, 1000)
                    : description
                setUtagsAttributes(target, {
                  key: commentkey,
                  title: formattedTitle,
                  description: formattedDescription,
                  type: 'comment',
                })
              }
            }
          }
        }
      }

      {
        const key = getUserProfileUrl(location.href)
        if (key) {
          // User profile header
          const element = $('[data-main-left] span.font-bold.text-xl')
          if (element) {
            setUtagsAttributes(element, { key, type: 'user' })
          }
        }
      }
    },
    validate(element: HTMLAnchorElement, href: string) {
      if (!href.startsWith(prefix)) {
        return true
      }

      let key = getPostUrl(href, true)
      if (key) {
        const title = getTrimmedTitle(element)
        if (!title) {
          return false
        }

        if (title === '最后回复') {
          return false
        }

        // 动态 > 回复数量图标
        if ($('svg', element) && /\d+/.test(title)) {
          return false
        }

        const meta = { type: 'post', title }
        setUtags(element, key, meta)
        setAttribute(element, 'data-utags', element.dataset.utags || '')

        return true
      }

      key = getUserProfileUrl(href)
      if (key) {
        const title = getTrimmedTitle(element)
        if (!title) {
          return false
        }

        // 帖子列表 > 作者
        if (element.matches('[data-main-left] ul.card li div.truncate > a')) {
          element.dataset.utags_target_selector =
            '[data-main-left] ul.card li div.truncate'
        }

        const meta = { type: 'user', title }
        setUtags(element, key, meta)
        setAttribute(element, 'data-utags', element.dataset.utags || '')

        return true
      }

      return true
    },
    excludeSelectors: [
      ...defaultSite.excludeSelectors,
      '.node-parent-tabs',
      '.tabs',
      '.breadcrumbs',
      // 热榜标签，分页
      '.join',
      '.btn',
      'a[href^="/coins"]',
      'a[href^="/notifications"]',
      'a[href^="/post/hot/"]',
      'a[href$="/history"]',
      'a[href^="/auth"]',
      // 通知页面
      'input[type="checkbox"] + div',
      // 用户卡片
      '[role="dialog"]',
    ],
    postProcess() {
      const theme = doc.documentElement.dataset.theme || ''
      const isDarkMode = [
        'dark',
        'forest',
        'synthwave',
        'halloween',
        'black',
        'luxury',
        'dracula',
        'business',
        'night',
        'coffee',
      ].includes(theme)
      doc.documentElement.dataset.utags_darkmode = isDarkMode ? '1' : '0'
    },
    getStyle: () => styleText,
  }
})()
