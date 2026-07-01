import { $, $$, doc, hasClass, setAttribute } from 'browser-extension-utils'
import styleText from 'data-text:./035-zhipin.com.scss'
import { getTrimmedTitle } from 'utags-utils'

import { addVisited, setVisitedAvailable } from '../../modules/visited'
import { setUtags } from '../../utils/dom-utils'
import { getUtagsTitle, setUtagsAttributes } from '../../utils/index'
import defaultSite from '../default'

export default (() => {
  const prefix = 'https://www.zhipin.com/'

  function getCanonicalUrl(url: string) {
    if (url.includes(prefix)) {
      return url.replace(/[?#].*/, '')
    }

    return url
  }

  // c1234 city 城市
  // p1234 position 职位
  // i1234 industry 行业
  // 公司
  // https://www.zhipin.com/gongsi/a72bbdb7528f5ad41HNy3dy_E1U~.html
  // https://www.zhipin.com/gongsi/d5ea5c20699f80fd1Hx62927EVo~.html
  // 公司职位
  // https://www.zhipin.com/gongsi/job/a72bbdb7528f5ad41HNy3dy_E1U~.html
  // 公司职位子分类
  // https://www.zhipin.com/gongsi/job/100000/a72bbdb7528f5ad41HNy3dy_E1U~.html
  // 行业
  // https://www.zhipin.com/i100021/
  // 城市
  // https://www.zhipin.com/c101010100/
  // 职位
  // https://www.zhipin.com/p130108/
  // https://www.zhipin.com/c101010100-p130108/
  // 职位详细页
  // https://www.zhipin.com/job_detail/450a03cbaad5df561XF52tW_E1pV.html
  function getCompanyUrl(url: string) {
    if (url.startsWith(prefix)) {
      const href2 = url.slice(prefix.length)
      if (/^gongsi\/[\w-~]+\.html/.test(href2)) {
        return prefix + href2.replace(/^(gongsi\/[\w-~]+\.html).*/, '$1')
      }
    }

    return undefined
  }

  function getJobDetailUrl(url: string) {
    if (url.startsWith(prefix)) {
      const href2 = url.slice(prefix.length)
      if (/^job_detail\/[\w-~]+\.html/.test(href2)) {
        return prefix + href2.replace(/^(job_detail\/[\w-~]+\.html).*/, '$1')
      }
    }

    return undefined
  }

  return {
    matches: /www\.zhipin\.com/,
    preProcess() {
      setVisitedAvailable(true)

      for (const element of $$(
        '.info-company div[data-url],.similar-job-list .similar-job-company[data-url]'
      ) as HTMLAnchorElement[]) {
        if (element.dataset.url) {
          element.href =
            location.origin + element.dataset.url.replace('/job/', '/')
          element.dataset.utags_node_type = 'link'
        }
      }

      let key = getCompanyUrl(location.href)
      if (key) {
        const element = $('.company-banner h1')
        if (element) {
          const title = element.childNodes[0].textContent!.trim()
          if (title) {
            setUtagsAttributes(element, { key, title, type: 'company' })
          }
        }
      }

      key = getJobDetailUrl(location.href)
      if (key) {
        let element = $('.job-banner .info-primary .name')
        if (element) {
          setUtagsAttributes(element, { key, type: 'job-detail' })
          addVisited(key)
        }

        element = $('.smallbanner .company-info .name')
        if (element) {
          setUtagsAttributes(element, { key, type: 'job-detail' })
          addVisited(key)
        }
      }
    },
    matchedNodesSelectors: [
      ...defaultSite.matchedNodesSelectors,
      // 没有 A 标签的公司名
      '.info-company div[data-url]',
      // 相似职位, 没有 A 标签的公司名
      '.similar-job-list .similar-job-company[data-url]',
    ],
    validate(element: HTMLAnchorElement, href: string) {
      if (!href) {
        return false
      }

      if (!href.startsWith(prefix)) {
        return true
      }

      if (element.closest('.common-tab-box')) {
        element.dataset.utags_ul_type = 'ol'
      }

      let key = getCompanyUrl(href)
      if (key) {
        // .name -> 首页 > 精选职位/热招职位
        // .company-info-top h3-> 首页 > 热门企业
        // .card-desc .title -> https://www.zhipin.com/rank/b2800/
        // h4 -> https://www.zhipin.com/gongsi/_zzz_c101010100/
        const titleElement = $(
          '.name,.company-info-top h3,.card-desc .title,h4',
          element
        )
        const title = getUtagsTitle(titleElement || element)
        if (!title) {
          return false
        }

        const meta = { type: 'company', title }
        setUtags(element, key, meta)
        setAttribute(element, 'data-utags', element.dataset.utags || '')
        if (element.closest('.sub-li-bottom a.user-info')) {
          element.dataset.utags_position_selector = 'a > p'
        } else if (element.closest('.company-search a.company-info')) {
          element.dataset.utags_position_selector = 'h4'
        }

        return true
      }

      key = getJobDetailUrl(href)
      if (key) {
        // a.about-info u.h -> https://www.zhipin.com/gongsi/_zzz_c101010100/
        const titleElement = $(
          '.job-title .job-name,.job-info-top,.info-primary .name b,.info-job,.similar-job-info,.sub-li-top,a.about-info u.h',
          element
        )
        let title = getTrimmedTitle(titleElement || element)
        if (!title) {
          return false
        }

        title = title.replace(' 在线 ', '')
        const meta = { type: 'job-detail', title }
        setUtags(element, key, meta)
        setAttribute(element, 'data-utags', element.dataset.utags || '')
        element.dataset.utags_position_selector =
          '.job-title .job-name,.info-primary .name b,.info-job,.similar-job-info,.sub-li-top,a.about-info u.h'

        return true
      }

      return true
    },
    excludeSelectors: [
      ...defaultSite.excludeSelectors,
      '#header',
      // 查看全部
      '.look-all',
      // 查看更多信息
      '.more-job-btn',
      // 查看更多职位
      '.look-more',
      // 查看全部n个职位
      '.all-jobs-hot',
      // 查看所有职位
      '.view-more',
      // 查看所有职位
      '.link-more',
      // 更多相似职位
      'h3:not(.company-name):not(.name)',
      // 职位对比
      '.compare-btn',
      // 职位对比
      '.job_pk',
      // 热门职位
      '.search-hot',
      // 筛选
      '.filter-box',
      '.sign-form',
      '.login-card-wrapper',
      '.login-entry-page',
      '.btn',
      '.footer-icon',
      '.company-tab',
      '.school-type-box',
      '.search-condition-wrapper',
      '.filter-select-box',
      'a[href*="/web/geek/job"]',
      // 分页
      '.page',
    ],
    postProcess() {
      const isDarkMode = hasClass(doc.body, 'theme_dark')
      doc.documentElement.dataset.utags_darkmode = isDarkMode ? '1' : '0'
    },
    getStyle: () => styleText,
    getCanonicalUrl,
  }
})()
