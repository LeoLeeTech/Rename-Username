/**
 * 内容脚本入口：这是浏览器插件注入到网页里的主程序。
 * 它负责初始化设置、扫描页面 DOM、把标签按钮插入到目标元素旁边、
 * 绑定点击/滚动/菜单命令等页面事件，并把各个功能模块串起来。
 */
import { getPrefferedLocale } from 'browser-extension-i18n'
import {
  getSettingsValue,
  initSettings,
  showSettings,
  type SettingsTable,
} from 'browser-extension-settings'
import {
  $,
  $$,
  addClass,
  addElement,
  addEventListener,
  addStyle,
  createElement,
  createHTML,
  doc,
  getAttribute,
  getOffsetPosition,
  hasClass,
  registerMenuCommand,
  removeClass,
  runWhenBodyExists,
  runWhenHeadExists,
  setAttribute,
  setStyle,
  throttle,
  type RegisterMenuCommandOptions,
} from 'browser-extension-utils'
import polyfillRequestIdleCallback from 'browser-extension-utils/request-idle-callback-polyfill'
import type { PlasmoCSConfig } from 'plasmo'

import {
  buildTagsForDisplay,
  shouldUpdateUtagsWhenNodeUpdated,
} from './content-utils'
import { getAvailableLocales, i, resetI18n } from './messages'
import { clearTagManagerCache } from './modules/advanced-tag-manager'
import { registerDebuggingHotkey } from './modules/debugging'
import { clearDomReferences } from './modules/dom-reference-manager'
import { outputData } from './modules/export-import'
import {
  bindDocumentEvents,
  bindWindowEvents,
  hideAllUtagsInArea,
} from './modules/global-events'
import { createMenuCommandManager } from './modules/menu-command-manager'
import {
  configureQueueEmptyCallback,
  configureScannedNodeProcessingBlocker,
  configureScannedNodeProcessor,
  enqueueScannedNode,
  enqueueScannedNodes,
  setScannedNodeProcessingEnabled,
  type ScannedNode,
} from './modules/scanned-node-queue'
import { initStarHandler, toggleStarHandler } from './modules/star-handler'
import {
  ensureCombinedStyleForDocument,
  rebuildAndApplyCombinedStyle,
} from './modules/style-manager'
import { destroySyncAdapter, initSyncAdapter } from './modules/sync-adapter'
import { clearAllTimers, createTimeout } from './modules/timer-manager'
import {
  clearUtagsUlRegistry,
  ensureUtagsUlTracked,
  getAllRegisteredUtagsUls,
  getRegisteredUtagsUlCount,
  getUtagsUl,
  registerElementUtagsUl,
  unregisterElementUtagsUl,
  unregisterUtagsUl,
} from './modules/utags-registry'
import {
  addVisitedValueChangeListener,
  clearVisitedCache,
  isAvailableOnCurrentSite,
  onSettingsChange as visitedOnSettingsChange,
} from './modules/visited'
import { setupWebappBridge } from './modules/webapp-bridge'
import {
  getCanonicalUrl,
  isScannerBusy,
  postProcess,
  scanDom,
  updateMatchedNodesSelector,
  type ScanDomOptions,
} from './sites/index'
import {
  addNewNameValueChangeListener,
  clearCachedUrlMap,
  getNewName,
  initBookmarksStore,
} from './storage/bookmarks'
import type { UserTag, UserTagMeta } from './types'
import { generateUtagsId } from './utils'
import { setupConsole } from './utils/console.js'
import { EventListenerManager } from './utils/event-listener-manager'

export const config: PlasmoCSConfig = {
  run_at: 'document_start',
  matches: ['https://*/*', 'http://*/*'],

  all_frames: true,
}

if (
  // eslint-disable-next-line n/prefer-global/process
  process.env.PLASMO_TARGET === 'chrome-mv3' ||
  // eslint-disable-next-line n/prefer-global/process
  process.env.PLASMO_TARGET === 'firefox-mv2'
) {
  // Receive popup trigger to show settings in the content context
  const runtime =
    (globalThis as any).chrome?.runtime ?? (globalThis as any).browser?.runtime
  runtime?.onMessage?.addListener((message: any) => {
    if (message?.type === 'utags:show-settings') {
      void showSettings()
    }
  })
}

const EXCLUDED_SUBFRAME_HOSTS = new Set([
  'challenges.cloudflare.com',
  'accounts.google.com',
])

const host = location.host

const eventManager = new EventListenerManager()

// Store menu id for hide/unhide all tags command
let hideAllTagsMenuId: string | number | undefined
let customRuleTextAreaElem: undefined | HTMLTextAreaElement

// Helper to check whether all tags are currently hidden
function isAllTagsHidden(): boolean {
  return hasClass(doc.documentElement, 'utags_hide_all_tags')
}

// Click handler to toggle class and refresh menu title
async function onClickHideAllTags() {
  const isHidden = isAllTagsHidden()
  const toggle = (element: HTMLElement) => {
    if (isHidden) {
      removeClass(element, 'utags_hide_all_tags')
    } else {
      addClass(element, 'utags_hide_all_tags')
    }
  }

  toggle(doc.documentElement)

  const iframes = doc.querySelectorAll('iframe')
  for (const iframe of iframes) {
    try {
      const iframeDoc = iframe.contentDocument
      if (iframeDoc) {
        toggle(iframeDoc.documentElement)
      }
    } catch {
      // ignore
    }
  }

  if (isHidden) {
    displayTagsThrottled()
  }

  await registerOrUpdateHideAllTagsMenu()
}

// Register or update the hide/unhide all tags menu command
async function registerOrUpdateHideAllTagsMenu() {
  const title = `🙈 ${isAllTagsHidden() ? i('menu.unhideAllTags') : i('menu.hideAllTags')}`
  const options: RegisterMenuCommandOptions = {}
  if (hideAllTagsMenuId === undefined) {
    hideAllTagsMenuId = await registerMenuCommand(
      title,
      onClickHideAllTags,
      options
    )
  } else {
    options.id = String(hideAllTagsMenuId)
    await registerMenuCommand(title, onClickHideAllTags, options)
  }
}

const isEnabledByDefault = () => {
  if (host.includes('www.bilibili.com')) {
    return false
  }

  return true
}

const isQuickStarAvailable = () => {
  if (
    host === 'linux.do' ||
    host === 'idcflare.com' ||
    // FIXME: 临时关闭 youtube.com 的快速收藏功能
    // host.includes('youtube.com') ||
    host.includes('pornhub.com')
  ) {
    return true
  }

  return false
}

const getSettingsTable = (): SettingsTable => {
  let groupNumber = 1

  return {
    [`enableCurrentSite_${host}`]: {
      title: i('settings.enableCurrentSite'),
      defaultValue: true,
    },

    ...(isQuickStarAvailable()
      ? {
          [`enableQuickStar_${host}`]: {
            title: i('settings.enableQuickStar'),
            defaultValue: true,
            group: ++groupNumber,
          },
        }
      : {}),

    [`useVisitedFunction_${host}`]: {
      title: i('settings.useVisitedFunction'),
      defaultValue: false,
      group: ++groupNumber,
    },
    [`displayEffectOfTheVisitedContent_${host}`]: {
      title: i('settings.displayEffectOfTheVisitedContent'),
      type: 'select',
      // 默认值：中
      defaultValue: '2',
      options: {
        [i('settings.displayEffectOfTheVisitedContent.recordingonly')]: '0',
        [i('settings.displayEffectOfTheVisitedContent.showtagonly')]: '1',
        [i('settings.displayEffectOfTheVisitedContent.changecolor')]: '4',
        [i('settings.displayEffectOfTheVisitedContent.translucent')]: '2',
      },
      group: groupNumber,
    },

    [`enableCustomRule_${host}`]: {
      title: i('settings.enableCurrentSiteCustomRule'),
      defaultValue: false,
      group: ++groupNumber,
    },
    [`customRuleValue_${host}`]: {
      title: i('settings.customRuleValue'),
      defaultValue: '',
      placeholder: `.content a[href]
#main a[href]`,
      type: 'textarea',
      group: groupNumber,
    },

  }
}

// Styles are centrally managed by style-manager now

function updateDocumentElementAttributes() {
  {
    const newValue =
      getSettingsValue<string>(`displayEffectOfTheVisitedContent_${host}`) || ''
    if (newValue !== doc.documentElement.dataset.utagsVisited) {
      doc.documentElement.dataset.utagsVisited = newValue
    }
  }

  {
    const newValue = getSettingsValue(`enableCurrentSite_${host}`)
      ? host
      : 'off'
    if (newValue !== doc.documentElement.dataset.utags) {
      doc.documentElement.dataset.utags = newValue
    }
  }
}

function onSettingsChange() {
  updateDocumentElementAttributes()

  const locale = getSettingsValue<string>('locale') || getPrefferedLocale()
  resetI18n(locale)

  if (getSettingsValue(`enableCustomRule_${host}`)) {
    const selectorRaw =
      getSettingsValue<string>(`customRuleValue_${host}`) || ''
    const selector = selectorRaw
      .split(/[\n\r]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .join(', ')

    let isValid = true
    if (selector) {
      try {
        document.querySelector(selector)
      } catch {
        isValid = false
      }
    }

    if (customRuleTextAreaElem) {
      if (isValid) {
        customRuleTextAreaElem.style.borderColor = ''
        customRuleTextAreaElem.style.outline = ''
      } else {
        customRuleTextAreaElem.style.borderColor = 'red'
        customRuleTextAreaElem.style.outline = 'red'
        console.log('Invalid selector:', selector)
      }
    }

    if (isValid) {
      updateMatchedNodesSelector(selector)
    }
  } else {
    updateMatchedNodesSelector('')
  }

  rebuildAndApplyCombinedStyle()
  if (getSettingsValue(`enableCurrentSite_${host}`)) {
    displayTagsThrottled()
  }
}

// For debug
const DEBUG = true

/**
 * Append a link to the current page at the end of the document body
 * @returns A cleanup function that removes the appended link
 */
function appendCurrentPageLink(options?: {
  href?: string
  title?: string
  description?: string
}): () => void {
  options = options || {}
  const containerId = 'utags_current_page_link_container'

  // Check if container already exists
  const existingContainer = $('#' + containerId)
  if (existingContainer) {
    return () => {
      if (existingContainer.parentNode) {
        existingContainer.remove()
      }
    }
  }

  // Create the container div
  const containerElement = document.createElement('div')
  containerElement.id = containerId

  // Create the anchor element
  const linkElement = document.createElement('a')
  linkElement.href = options.href || location.href
  // Use options.title if provided, otherwise use document.title
  linkElement.textContent = options.title || document.title
  linkElement.id = 'utags_current_page_link'
  linkElement.dataset.utags_link = ''

  // Add description to dataset if provided
  if (options.description) {
    // TODO: read from description tag, but don't overwrite exsiting value
    linkElement.dataset.utags_description = options.description
  }

  // Append link to container
  containerElement.append(linkElement)

  // Append container to the end of document body
  document.body.append(containerElement)

  // Return cleanup function
  return () => {
    if (containerElement.parentNode) {
      containerElement.remove()
    }
  }
}

function showCurrentPageLinkUtagsPrompt(
  tag?: string,
  remove = false,
  options?: {
    href?: string
    title?: string
    description?: string
  }
) {
  const cleanUp = appendCurrentPageLink(options)
  createTimeout(() => {
    const element = $('#utags_current_page_link + ul.utags_ul button')!
    if (element) {
      if (tag) {
        if (remove) {
          if (element.dataset.utags_new_name === tag) {
            element.dataset.utags_new_name = ''
          }
        } else if (element.dataset.utags_new_name !== tag) {
          element.dataset.utags_new_name = tag
        }
      }

      element.click()
    } else {
      showCurrentPageLinkUtagsPrompt(tag, remove)
    }
  }, 10)
  createTimeout(() => {
    cleanUp()
  }, 1000)
}

// Initialize menu command manager
const menuCommandManager = createMenuCommandManager(
  () => {
    showCurrentPageLinkUtagsPrompt()
  },
  (tag: string, remove: boolean) => {
    showCurrentPageLinkUtagsPrompt(tag, remove)
  }
)

/**
 * Update menu command for adding tags to current page
 */
async function updateAddTagsToCurrentPageMenuCommand() {
  const key = getCanonicalUrl(location.href)
  if (!key) {
    return
  }

  const object = getNewName(key)
  const newName = object.newName || ''
  const currentNames = newName ? [newName] : []

  await menuCommandManager.updateMenuCommand(currentNames)
  await menuCommandManager.updateQuickTagMenuCommands(currentNames)
}

const scrollBoundElements = new WeakSet<HTMLElement>()
let isScrolling = false

function handleScroll() {
  if (!isScrolling) {
    requestAnimationFrame(() => {
      updateTagPositionForAllTargets()
      isScrolling = false
    })
    isScrolling = true
  }
}

function bindScrollEvent(element: HTMLElement) {
  let parent = element.parentElement
  while (parent) {
    const style = getComputedStyle(parent)
    const overflowY = style.overflowY
    const overflowX = style.overflowX
    if (
      (overflowY === 'auto' ||
        overflowY === 'scroll' ||
        overflowX === 'auto' ||
        overflowX === 'scroll') &&
      !scrollBoundElements.has(parent)
    ) {
      parent.addEventListener('scroll', handleScroll, { passive: true })
      scrollBoundElements.add(parent)
    }

    parent = parent.parentElement
  }

  if (!scrollBoundElements.has(globalThis.document.documentElement)) {
    window.addEventListener('scroll', handleScroll, { passive: true })
    scrollBoundElements.add(globalThis.document.documentElement)
  }
}

let lastScannerResult: ScannedNode[] = []
const utagsMouseoverBoundElements = new WeakSet<HTMLElement>()

function ensureUtagsMouseoverHandler(element: HTMLElement) {
  if (utagsMouseoverBoundElements.has(element)) {
    return
  }

  utagsMouseoverBoundElements.add(element)

  if (element.dataset.utags_absolute) {
    addEventListener(element, 'mouseover', (event) => {
      const target = event.currentTarget as HTMLElement | undefined
      if (!target) {
        return
      }

      const utagsUl = getUtagsUl(target)
      if (utagsUl) {
        updateTagPosition(target)
        addClass(utagsUl, 'utags_ul_active')
      }
    })
    addEventListener(element, 'mouseout', (event) => {
      const target = event.currentTarget as HTMLElement | undefined
      if (!target) {
        return
      }

      const utagsUl = getUtagsUl(target)
      if (utagsUl) {
        removeClass(utagsUl, 'utags_ul_active')
      }
    })
    return
  }

  addEventListener(element, 'mouseover', (event) => {
    const target = event.currentTarget as HTMLElement | undefined
    if (!target) {
      return
    }

    updateTagPosition(target)
  })
}

function getUtagsTargetElementByElement(element: HTMLElement): HTMLElement {
  if (element.dataset.utags_target_selector) {
    return (
      $(element.dataset.utags_target_selector, element) ||
      element.closest(element.dataset.utags_target_selector) ||
      element
    )
  }

  return element
}

function appendUtagsToElement(
  element: HTMLElement,
  utagsUl: HTMLElement | undefined
) {
  if (!utagsUl) {
    return
  }

  const target = getUtagsTargetElementByElement(element)
  if (!(target instanceof HTMLAnchorElement)) {
    setAttribute(target, 'data-utags_node_type', 'link')
  }

  target.after(utagsUl)
}

function replaceElementTextWithNewName(element: HTMLElement, newName: string) {
  const target = getUtagsTargetElementByElement(element)
  if (target.dataset.utags_original_text === undefined) {
    target.dataset.utags_original_text = target.textContent || ''
  }

  target.textContent = newName || target.dataset.utags_original_text || ''
}

function appendNewNameToPage(
  element: HTMLElement,
  key: string,
  newName: string,
  meta: UserTagMeta | undefined
) {
  let utagsId = element.dataset.utags_id
  if (!utagsId) {
    utagsId = generateUtagsId()
    element.dataset.utags_id = utagsId
  }

  ensureUtagsMouseoverHandler(element)

  const existingUtagsUl = getUtagsUl(element)

  if (existingUtagsUl) {
    if (
      hasClass(existingUtagsUl, 'utags_ul') &&
      element.dataset.utags === newName &&
      key === getAttribute(existingUtagsUl, 'data-utags_key')
    ) {
      replaceElementTextWithNewName(element, newName)
      if (!existingUtagsUl.isConnected) {
        appendUtagsToElement(element, existingUtagsUl)
        ensureUtagsUlTracked(existingUtagsUl)
      }

      return
    }

    unregisterUtagsUl(existingUtagsUl)
    existingUtagsUl.remove()
  }

  // console.debug('appendTagsToPage', utagsId, element)

  // On some websites, using the `UL` tag will affect the selectors of the original website.
  // For example: https://www.zhipin.com/
  const tagName = element.dataset.utags_ul_type === 'ol' ? 'ol' : 'ul'
  const utagsUl = createElement(tagName, {
    class: newName ? 'utags_ul utags_ul_1' : 'utags_ul utags_ul_0',
    'data-utags_key': key,
    'data-utags_exclude': '',
  })
  let li = createElement('li', { class: 'utags_li', 'data-utags_exclude': '' })

  const a = createElement('button', {
    type: 'button',
    // href: "",
    // tabindex: "0",
    title: 'Rename username',
    'data-utags_tag': '🏷️',
    'data-utags_key': key,
    'data-utags_new_name': newName,
    'data-utags_meta': meta ? JSON.stringify(meta) : '',
    'data-utags_exclude': '',
    class: newName
      ? 'utags_text_tag utags_captain_tag2'
      : 'utags_text_tag utags_captain_tag',
  })
  const svg = `<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1782953328874" class="icon" viewBox="0 0 1126 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3175" xmlns:xlink="http://www.w3.org/1999/xlink" width="219.921875" height="200"><path d="M0 844.800045a563.199859 179.199955 0 1 0 1126.399718 0 563.199859 179.199955 0 1 0-1126.399718 0Z" fill="#3E4CA6" p-id="3176"></path><path d="M876.082981 793.600058c0 70.681582-140.083165 127.999968-312.883122 127.999968S250.316737 864.28164 250.316737 793.600058a1825.765944 1825.765944 0 0 1 59.315186-287.948728c11.007997-40.55039 83.148779-1.2032 96.639975-42.36799 12.313597-37.606391-70.169582-57.420786-9.574397-210.534347C446.054288 128.000224 497.484676 0.000256 563.199859 0.000256c34.559991 0 297.625526-0.9984 394.905501 156.902361 26.700793 43.315189 51.046387 153.599962 19.148796 151.526362-27.238393-1.8176-25.113594-136.268766-129.177568-136.268766-67.788783 0-128.895968 6.860798-100.070375 94.438376 9.574398 29.055993 19.635195 78.00318 31.487992 107.391974 12.799997 31.718392-31.615992 37.913591-27.110393 52.633586 5.299199 17.279996 51.455987 32.588792 56.319986 49.715188A1947.161113 1947.161113 0 0 1 876.082981 793.600058z" fill="#4C5DBA" p-id="3177"></path><path d="M563.199859 768.000064c-136.934366 0-253.004737-36.044791-295.423926-86.169578A818.738995 818.738995 0 0 0 250.316737 793.600058c0 70.681582 140.083165 127.999968 312.883122 127.999968s312.883122-57.318386 312.883122-127.999968a815.180596 815.180596 0 0 0-17.459196-111.769572C816.230196 731.955273 700.134225 768.000064 563.199859 768.000064z" fill="#B154C1" p-id="3178"></path><path d="M614.399846 921.600026h-102.399974a51.199987 51.199987 0 0 1-51.199987-51.199988v-76.79998a51.199987 51.199987 0 0 1 51.199987-51.199988h102.399974a51.199987 51.199987 0 0 1 51.199988 51.199988v76.79998a51.199987 51.199987 0 0 1-51.199988 51.199988z m-102.399974-153.599962a25.599994 25.599994 0 0 0-25.599994 25.599994v76.79998a25.599994 25.599994 0 0 0 25.599994 25.599994h102.399974a25.599994 25.599994 0 0 0 25.599994-25.599994v-76.79998a25.599994 25.599994 0 0 0-25.599994-25.599994z" fill="#FFC107" p-id="3179"></path><path d="M563.199859 819.200051h102.399975v25.599994h-102.399975z" fill="#FFC107" p-id="3180"></path><path d="M665.599834 819.200051h-102.399975v25.599994h102.399975v-25.599994z" fill="#FFC107" p-id="3181"></path></svg>`
  a.innerHTML = createHTML(svg)

  li.append(a)
  utagsUl.append(li)

  registerElementUtagsUl(element, utagsUl)
  utagsUl.dataset.utags_id = utagsId
  if (element.dataset.utags_absolute) {
    const container =
      $('#utags_absolute_ul_container') ||
      addElement(document.documentElement, 'div', {
        id: 'utags_absolute_ul_container',
      })
    if (container) {
      container.append(utagsUl)
      utagsUl.dataset.utags_absolute_target_id = element.id || utagsId

      bindScrollEvent(element)
    }
  } else {
    appendUtagsToElement(element, utagsUl)
  }

  replaceElementTextWithNewName(element, newName)
  setAttribute(element, 'data-utags', newName)
  /* Fix v2ex polish start */
  // 为了防止阻塞渲染页面，延迟执行
  // 20260327: 删掉此逻辑
  // createTimeout(() => {
  //   const style = getComputedStyle(element)
  //   const zIndex = style.zIndex
  //   if (zIndex && zIndex !== 'auto') {
  //     setStyle(utagsUl, { zIndex })
  //   }
  // }, 200)
  /* Fix v2ex polish end */
}

/**
 * Clean utags elements after SPA web apps re-rendered.
 * works on these sites
 * - youtube
 *
 * Fix mp.weixin.qq.com issue, 有推荐阅读, 往期推荐内容时，utags_ul 和子元素的 class 都会被清空。https://github.com/utags/utags/issues/29
 */
function cleanUnusedUtags() {
  for (const utagsUl of getAllRegisteredUtagsUls()) {
    if (!utagsUl.isConnected) {
      // SPA page navigated, utags_ul is removed from DOM
      console.warn(
        'cleanUnusedUtags 1',
        utagsUl.dataset.utags_id,
        utagsUl.dataset.utags_key
      )

      if (utagsUl.dataset.utags_absolute_target_id) {
        const target = document.getElementById(
          utagsUl.dataset.utags_absolute_target_id
        )
        if (target && target.dataset.utags_original_margin_right) {
          target.style.marginRight =
            target.dataset.utags_original_margin_right + 'px'
          delete target.dataset.utags_original_margin_right
        }
      }

      unregisterUtagsUl(utagsUl)
      continue
    }

    const element = utagsUl.previousSibling as HTMLElement
    if (element) {
      if (element.hasAttribute('data-utags')) {
        const currentUtagsUl = getUtagsUl(element)
        if (currentUtagsUl === utagsUl) {
          continue
        }
        // else keep currentUtagsUl as it's a new utagsUl for this element
      } else {
        unregisterElementUtagsUl(element)
      }
    }

    console.warn(
      'cleanUnusedUtags 2',
      utagsUl.dataset.utags_id,
      utagsUl.dataset.utags_key
    )

    if (utagsUl.dataset.utags_absolute_target_id) {
      const target = document.getElementById(
        utagsUl.dataset.utags_absolute_target_id
      )
      if (target && target.dataset.utags_original_margin_right) {
        target.style.marginRight =
          target.dataset.utags_original_margin_right + 'px'
        delete target.dataset.utags_original_margin_right
      }
    }

    unregisterUtagsUl(utagsUl)
    utagsUl.remove()
  }
}

function processNodeForDisplay(node: HTMLElement) {
  const result = buildTagsForDisplay(node)
  if (!result) {
    return
  }

  const { key, newName, meta } = result

  appendNewNameToPage(node, key, newName, meta)
}

configureScannedNodeProcessor(processNodeForDisplay)
configureQueueEmptyCallback(displayTags)
configureScannedNodeProcessingBlocker(isScannerBusy)

async function displayTags() {
  if (isAllTagsHidden()) {
    return
  }

  if (DEBUG) {
    console.debug('start of displayTags')
  }

  // cleanUnusedUtags()

  updateTagPositionForAllTaggedTargets()

  postProcess()

  if (DEBUG) {
    console.debug('end of displayTags')
  }
}

const displayTagsThrottled = throttle(displayTags, 500)

async function initStorage() {
  await initBookmarksStore()
  await initSyncAdapter()

  ensureCombinedStyleForDocument()

  // Enable queue-based processing only after storage is fully initialized.
  // This ensures that tag data is available when processing scanned nodes.
  setScannedNodeProcessingEnabled(!doc.hidden)

  eventManager.addEventListener(doc, 'visibilitychange', () => {
    setScannedNodeProcessingEnabled(!doc.hidden)
  })

  const onStorageChange = () => {
    console.log('Storage updated, hidden -', doc.hidden)
    if (!doc.hidden && lastScannerResult.length > 0) {
      console.log('Start re-display tags')
      // Re-queue all scanned nodes so they can be re-rendered with latest data.
      enqueueScannedNodes(lastScannerResult)
    }

    // Update memu commands
    void updateAddTagsToCurrentPageMenuCommand()
  }

  addNewNameValueChangeListener(onStorageChange)
  addVisitedValueChangeListener(onStorageChange)
}

function getOutermostOffsetParent(
  element1: HTMLElement,
  element2: HTMLElement
): HTMLElement | undefined {
  if (
    !(element1 instanceof HTMLElement) ||
    !(element2 instanceof HTMLElement)
  ) {
    throw new TypeError('Both arguments must be valid HTMLElements.')
  }

  const offsetParent1 = element1.offsetParent as HTMLElement
  const offsetParent2 = element2.offsetParent as HTMLElement

  if (offsetParent1 && offsetParent2) {
    if (offsetParent1.contains(offsetParent2)) {
      return offsetParent1
    }

    if (offsetParent2.contains(offsetParent1)) {
      return offsetParent2
    }

    return undefined
  }

  return offsetParent1 || offsetParent2
}

function getMaxOffsetLeft(
  offsetParent: HTMLElement | undefined,
  utagsUl: HTMLElement,
  utagsSizeFix: number
) {
  let maxOffsetRight: number

  if (offsetParent && offsetParent.offsetWidth > 0) {
    // X轴 scroll 时计算正确
    if (offsetParent === utagsUl.offsetParent) {
      maxOffsetRight = offsetParent.offsetWidth
    } else {
      maxOffsetRight =
        offsetParent.offsetWidth -
        getOffsetPosition(utagsUl.offsetParent as HTMLElement, offsetParent)
          .left
    }
  } else {
    // X轴 scroll 时会计算错误
    maxOffsetRight =
      document.body.offsetWidth -
      getOffsetPosition(utagsUl.offsetParent as HTMLElement).left -
      2
  }

  return maxOffsetRight - utagsUl.clientWidth - utagsSizeFix
}

// position: fixed -> offsetParent = null
// position: static -> offsetParent = TD element or the ancestor element whitch has postion: (relative|absolute|fixed|sticky) or document.body
// position: (relative|absolute|fixed|sticky) -> offsetParent = the ancestor element whitch has postion: (relative|absolute|fixed|sticky) or document.body
// display: contents -> offsetParent = null, offsetWith = 0, offsetLeft = 0, offsetTop = 0

function updateTagPosition(element: HTMLElement) {
  const utagsUl = getUtagsUl(element)

  if (!utagsUl || !hasClass(utagsUl, 'utags_ul')) {
    return
  }

  // Update margin to occupy space
  if (element.dataset.utags_absolute) {
    const width = utagsUl.offsetWidth
    if (width > 0) {
      // If we haven't stored the original margin yet, store it
      if (!element.dataset.utags_original_margin_right) {
        const style = getComputedStyle(element)
        const marginRight = Number.parseFloat(style.marginRight) || 0
        element.dataset.utags_original_margin_right = String(marginRight)
      }

      const originalMargin = Number.parseFloat(
        element.dataset.utags_original_margin_right
      )
      let currentMargin = originalMargin
      if (element.style.marginRight) {
        currentMargin = Number.parseFloat(element.style.marginRight)
      }

      const newMargin = originalMargin + width + 5 // Add 5px spacing

      // Only update if changed significantly (avoid layout thrashing loop)
      if (Math.abs(currentMargin - newMargin) > 1) {
        element.style.marginRight = newMargin + 'px'
      }
    }
  } else {
    // Ensure `utagsUl` stays immediately after the target element, even if new nodes were inserted between them.
    const previousElementSibling = utagsUl.previousElementSibling
    const targetElement = getUtagsTargetElementByElement(element)
    if (previousElementSibling !== targetElement) {
      appendUtagsToElement(element, utagsUl)
      ensureUtagsUlTracked(utagsUl)
    }
  }

  if (!utagsUl.isConnected) {
    appendUtagsToElement(element, utagsUl)
    ensureUtagsUlTracked(utagsUl)
  }

  if (!utagsUl.offsetParent && !utagsUl.offsetHeight && !utagsUl.offsetWidth) {
    return
  }

  const style = getComputedStyle(utagsUl)
  if (style.position !== 'absolute') {
    return
  }

  if (element.dataset.utags_target_selector) {
    element =
      $(element.dataset.utags_target_selector, element) ||
      element.closest(element.dataset.utags_target_selector) ||
      element
  } else if (element.dataset.utags_position_selector) {
    element =
      $(element.dataset.utags_position_selector, element) ||
      element.closest(element.dataset.utags_position_selector) ||
      element
  }

  element.dataset.utags_fit_content = '1'

  // 22 is the size of captain tag
  const utagsSizeFix = hasClass(utagsUl, 'utags_ul_0') ? 22 : 0

  const offsetParent =
    element.offsetParent === utagsUl.offsetParent
      ? (element.offsetParent as HTMLElement)
      : getOutermostOffsetParent(element, utagsUl)

  const offset = getOffsetPosition(element, offsetParent! || doc.body)

  if (offsetParent !== utagsUl.offsetParent) {
    const offset2 = getOffsetPosition(
      utagsUl.offsetParent as HTMLElement,
      offsetParent! || doc.body
    )

    offset.top -= offset2.top
    offset.left -= offset2.left
  }

  // For debug
  // if (1) {
  //   const style = getComputedStyle(element)
  //   element.dataset.offsetWidth = String(element.offsetWidth)
  //   element.dataset.clientWidth = String(element.clientWidth)
  //   element.dataset.offsetHeight = String(element.offsetHeight)
  //   element.dataset.clientHeight = String(element.clientHeight)
  //   element.dataset.offsetLeft = String(element.offsetLeft)
  //   element.dataset.offsetTop = String(element.offsetTop)
  //   element.dataset.offsetLeft2 = String(offset.left)
  //   element.dataset.offsetTop2 = String(offset.top)
  //   element.dataset.offsetParent = element.offsetParent?.outerHTML.replaceAll(
  //     />[\s\S]*/gm,
  //     ">"
  //   )
  //   element.dataset.display = style.display
  //   utags.dataset.offsetParent = utags.offsetParent?.outerHTML.replaceAll(
  //     />[\s\S]*/gm,
  //     ">"
  //   )
  // }

  // element is hidden
  if (!element.offsetWidth && !element.clientWidth) {
    utagsUl.style.top = '-9999px'
    return
  }

  // version 6
  const objectPosition = style.objectPosition

  switch (objectPosition) {
    // left-center
    case '-100% 50%': {
      utagsUl.style.left =
        Math.max(offset.left - utagsUl.clientWidth - utagsSizeFix, 0) + 'px'
      utagsUl.style.top =
        offset.top +
        ((element.clientHeight || element.offsetHeight) -
          utagsUl.clientHeight -
          utagsSizeFix) /
          2 +
        'px'
      break
    }

    // left-top
    case '0% -100%': {
      utagsUl.style.left = offset.left + 'px'
      utagsUl.style.top =
        offset.top - utagsUl.clientHeight - utagsSizeFix + 'px'
      break
    }

    // left-top
    case '0% 0%': {
      utagsUl.style.left = offset.left + 'px'
      utagsUl.style.top = offset.top + 'px'
      break
    }

    // left-bottom
    case '0% 100%': {
      utagsUl.style.left = offset.left + 'px'
      utagsUl.style.top =
        offset.top +
        (element.clientHeight || element.offsetHeight) -
        utagsUl.clientHeight -
        utagsSizeFix +
        'px'
      break
    }

    // left-bottom, out of element box
    case '0% 200%': {
      utagsUl.style.left = offset.left + 'px'
      utagsUl.style.top =
        offset.top + (element.clientHeight || element.offsetHeight) + 'px'
      break
    }

    // right-top
    case '100% -100%': {
      utagsUl.style.left =
        offset.left +
        (element.clientWidth || element.offsetWidth) -
        utagsUl.clientWidth -
        utagsSizeFix +
        'px'
      utagsUl.style.top =
        offset.top - utagsUl.clientHeight - utagsSizeFix + 'px'
      break
    }

    // right-top
    case '100% 0%': {
      let offsetLeft =
        (element.clientWidth || element.offsetWidth) -
        utagsUl.clientWidth -
        utagsSizeFix
      if (offsetLeft < 100) {
        offsetLeft = element.clientWidth || element.offsetWidth
      }

      utagsUl.style.left =
        Math.min(
          offset.left + offsetLeft,
          getMaxOffsetLeft(offsetParent, utagsUl, utagsSizeFix)
        ) + 'px'
      utagsUl.style.top = offset.top + 'px'
      break
    }

    // right-center
    case '100% 50%': {
      let offsetLeft =
        (element.clientWidth || element.offsetWidth) -
        utagsUl.clientWidth -
        utagsSizeFix
      if (offsetLeft < 100) {
        offsetLeft = element.clientWidth || element.offsetWidth
      }

      utagsUl.style.left =
        Math.min(
          offset.left + offsetLeft,
          getMaxOffsetLeft(offsetParent, utagsUl, utagsSizeFix)
        ) + 'px'
      utagsUl.style.top =
        offset.top +
        ((element.clientHeight || element.offsetHeight) -
          utagsUl.clientHeight -
          utagsSizeFix) /
          2 +
        'px'
      break
    }

    // right-bottom
    case '100% 100%': {
      let offsetLeft =
        (element.clientWidth || element.offsetWidth) -
        utagsUl.clientWidth -
        utagsSizeFix
      if (offsetLeft < 100) {
        offsetLeft = element.clientWidth || element.offsetWidth
      }

      utagsUl.style.left =
        Math.min(
          offset.left + offsetLeft,
          getMaxOffsetLeft(offsetParent, utagsUl, utagsSizeFix)
        ) + 'px'
      utagsUl.style.top =
        offset.top +
        (element.clientHeight || element.offsetHeight) -
        utagsUl.clientHeight -
        utagsSizeFix +
        'px'
      break
    }

    // right-bottom, out of element box
    case '100% 200%': {
      utagsUl.style.left =
        offset.left +
        (element.clientWidth || element.offsetWidth) -
        utagsUl.clientWidth -
        utagsSizeFix +
        'px'
      utagsUl.style.top =
        offset.top + (element.clientHeight || element.offsetHeight) + 'px'
      break
    }

    // right-top, out of element box
    case '200% 0%': {
      utagsUl.style.left =
        Math.min(
          offset.left + (element.clientWidth || element.offsetWidth),
          getMaxOffsetLeft(offsetParent, utagsUl, utagsSizeFix)
        ) + 'px'
      utagsUl.style.top = offset.top + 'px'
      break
    }

    // right-center, out of element box
    case '200% 50%': {
      utagsUl.style.left =
        Math.min(
          offset.left + (element.clientWidth || element.offsetWidth),
          getMaxOffsetLeft(offsetParent, utagsUl, utagsSizeFix)
        ) + 'px'
      utagsUl.style.top =
        offset.top +
        ((element.clientHeight || element.offsetHeight) -
          utagsUl.clientHeight -
          utagsSizeFix) /
          2 +
        'px'
      break
    }

    // right-bottom, out of element box
    case '200% 100%': {
      utagsUl.style.left =
        Math.min(
          offset.left + (element.clientWidth || element.offsetWidth),
          getMaxOffsetLeft(offsetParent, utagsUl, utagsSizeFix)
        ) + 'px'
      utagsUl.style.top =
        offset.top +
        (element.clientHeight || element.offsetHeight) -
        utagsUl.clientHeight -
        utagsSizeFix +
        'px'
      break
    }

    default: {
      break
    }
  }

  element.dataset.utags_fit_content = '0'
}

const tagPositionUpdateQueue: HTMLElement[] = []
const tagPositionUpdateSet = new Set<HTMLElement>()
let isProcessingTagPositionQueue = false

function takeTagPositionTargetFromQueue() {
  const target = tagPositionUpdateQueue.shift()
  if (target) {
    tagPositionUpdateSet.delete(target)
  }

  return target
}

function hasTagPositionTargetsInQueue() {
  return tagPositionUpdateQueue.length > 0
}

function processTagPositionUpdatesIdle(deadline: IdleDeadline) {
  while (
    deadline.timeRemaining() > 1 &&
    !doc.hidden &&
    hasTagPositionTargetsInQueue()
  ) {
    const target = takeTagPositionTargetFromQueue()
    if (!target) {
      break
    }

    if (!target.isConnected) {
      continue
    }

    updateTagPosition(target)
  }

  if (hasTagPositionTargetsInQueue()) {
    requestIdleCallback(processTagPositionUpdatesIdle)
    return
  }

  isProcessingTagPositionQueue = false
}

function scheduleTagPositionUpdates() {
  if (isProcessingTagPositionQueue || !hasTagPositionTargetsInQueue()) {
    return
  }

  isProcessingTagPositionQueue = true
  requestIdleCallback(processTagPositionUpdatesIdle)
}

function enqueueTagPositionUpdate(target: HTMLElement) {
  if (tagPositionUpdateSet.has(target)) {
    return
  }

  tagPositionUpdateSet.add(target)
  tagPositionUpdateQueue.push(target)
  scheduleTagPositionUpdates()
}

function updateTagPositionForAllTargets() {
  if (lastScannerResult.length === 0) {
    return
  }

  for (const target of lastScannerResult) {
    enqueueTagPositionUpdate(target)
  }
}

function updateTagPositionForAllTaggedTargets() {
  if (lastScannerResult.length === 0) {
    return
  }

  for (const target of lastScannerResult) {
    if (!target.dataset.utags) {
      continue
    }

    enqueueTagPositionUpdate(target)
  }
}

function checkVimiumHint() {
  if ($('#vimium-hint-marker-container,#vimiumHintMarkerContainer')) {
    addClass(doc.body, 'utags_show_all')
    if (!hasClass(doc.documentElement, 'utags_vimium_hint')) {
      addClass(doc.documentElement, 'utags_vimium_hint')
      updateTagPositionForAllTargets()
    }
  } else if (hasClass(doc.documentElement, 'utags_vimium_hint')) {
    removeClass(doc.documentElement, 'utags_vimium_hint')
    hideAllUtagsInArea()
  }
}

async function main() {
  await initSettings(() => {
    const settingsTable = getSettingsTable()
    return {
      id: 'utags',
      title: i('settings.title'),
      footer: `
    <p>${i('settings.information')}</p>
    <p>
    <a href="https://github.com/LeoLeeTech/Rename/issues" target="_blank">
    ${i('settings.report')}
    </a></p>
    <p>Open Source on the 
        <a href="https://github.com/LeoLeeTech/Rename" target="_blank">
          LeoLeeTech/Rename
        </a></p>`,
      settingsTable,
      availableLocales: getAvailableLocales(),
      async onValueChange() {
        visitedOnSettingsChange()
        onSettingsChange()
      },
      onViewUpdate(settingsMainView) {
        let item: HTMLElement | undefined = $(
          `[data-key="useVisitedFunction_${host}"]`,
          settingsMainView
        )

        if (!isAvailableOnCurrentSite() && item) {
          item.style.display = 'none'
          item.parentElement!.style.display = 'none'
        }

        item = $(
          `[data-key="displayEffectOfTheVisitedContent_${host}"]`,
          settingsMainView
        )
        if (item) {
          item.style.display = getSettingsValue(`useVisitedFunction_${host}`)
            ? 'flex'
            : 'none'
        }

        item = $(`[data-key="customRuleValue_${host}"]`, settingsMainView)
        if (item) {
          customRuleTextAreaElem = item as HTMLTextAreaElement
          // FIXME: data-key should on the parent element of textarea
          item.parentElement!.style.display = getSettingsValue(
            `enableCustomRule_${host}`
          )
            ? 'block'
            : 'none'
        }
      },
    }
  })

  if (!getSettingsValue(`enableCurrentSite_${host}`)) {
    return
  }

  setupWebappBridge()

  // Register bookmark list menu command for userscript
  await registerMenuCommand(`🔖 ${i('menu.bookmarkList')}`, () => {
    // Open https://utags.link/ in new tab or focus existing tab
    const url = 'https://utags.link/'

    // For userscript environment, simply open in new tab
    window.open(url, 'utags_bookmarks')
  })

  // Register hide/unhide all tags menu command for userscript (with dynamic title)
  await registerOrUpdateHideAllTagsMenu()

  // Initialize the star handler with required dependencies
  // initStarHandler(showCurrentPageLinkUtagsPrompt)

  await initStorage()

  visitedOnSettingsChange()
  onSettingsChange()

  setTimeout(outputData, 1)

  await updateAddTagsToCurrentPageMenuCommand()

  bindDocumentEvents(eventManager)
  bindWindowEvents(eventManager)

  // For SPA navigation
  let lastLocation = location.href
  eventManager.addEventListener(globalThis, 'locationchange', () => {
    if (lastLocation === location.href) {
      return
    }

    lastLocation = location.href
    void updateAddTagsToCurrentPageMenuCommand()
  })

  // Add cleanup mechanism for page unload
  const cleanup = () => {
    eventManager.removeAllEventListeners()
    observer.disconnect()
    // Clear global variables
    clearUtagsUlRegistry()
    // Clear cached data to free memory
    clearCachedUrlMap()
    clearVisitedCache()
    clearTagManagerCache()
    // Clear DOM references to prevent memory leaks from circular references
    clearDomReferences()
    // Clear all managed timers to prevent memory leaks
    clearAllTimers()
  }

  // Listen for page unload events
  // FIXME: issue on safari
  // eventManager.addEventListener(globalThis, 'beforeunload', cleanup)
  // eventManager.addEventListener(globalThis, 'pagehide', cleanup)
  // TODO: re-init on page show event for Safari

  const monitoredAttributes = new Set([
    'href',
    'data-utags_link',
    'data-utags_title',
    'data-utags_type',
    'data-utags_exclude',
  ])

  // eslint-disable-next-line @typescript-eslint/no-restricted-types
  function isMonitoredAttribute(attributeName: string | null | undefined) {
    return attributeName && monitoredAttributes.has(attributeName)
  }

  const observer = new MutationObserver(async (mutationsList) => {
    // console.debug('mutation', Date.now(), mutationsList)
    let shouldUpdate = false
    for (const mutationRecord of mutationsList) {
      if (
        mutationRecord.type === 'attributes' &&
        isMonitoredAttribute(mutationRecord.attributeName)
      ) {
        shouldUpdate = true
        break
      }

      if (shouldUpdateUtagsWhenNodeUpdated(mutationRecord.addedNodes)) {
        shouldUpdate = true
        break
      }

      if (shouldUpdateUtagsWhenNodeUpdated(mutationRecord.removedNodes)) {
        shouldUpdate = true
        break
      }
    }

    // console.debug('shouldUpdate', shouldUpdate)

    if (shouldUpdate) {
      // Clean up immediately. Some app like tictok re-render while mouse over something
      // cleanUnusedUtags()
      // displayTagsThrottled()
    }

    checkVimiumHint()
  })

  // runWhenBodyExists(() => {
  //   displayTagsThrottled()
  //   observer.observe(doc.body, {
  //     childList: true,
  //     subtree: true,
  //     attributeFilter: [
  //       'href',
  //       'data-utags_link',
  //       'data-utags_title',
  //       'data-utags_type',
  //       'data-utags_exclude',
  //     ],
  //   })
  // })

  const documentElementObserver = new MutationObserver((mutationsList) => {
    for (const mutationRecord of mutationsList) {
      if (mutationRecord.type === 'attributes') {
        updateDocumentElementAttributes()
        break
      }
    }

    // Re-apply combined style when style element have been removed
    ensureCombinedStyleForDocument()
    checkVimiumHint()
  })

  documentElementObserver.observe(doc.documentElement, {
    attributes: true,
    childList: true,
  })

  // To fix issues on reddit, add mouseover event
  // addEventListener(doc, 'mouseover', (event: Event) => {
  //   const target = event.target as HTMLElement
  //   if (
  //     target &&
  //     (target.tagName === 'A' || target.dataset.utags !== undefined)
  //   ) {
  //     displayTagsThrottled()
  //   }
  // })

  // For debug
  // eslint-disable-next-line n/prefer-global/process
  if (process.env.PLASMO_TAG === 'dev') {
    registerDebuggingHotkey()
  }
}

if (
  document.contentType === 'text/html' &&
  doc.documentElement.dataset.utags === undefined &&
  (globalThis === (top as unknown as typeof globalThis) ||
    !EXCLUDED_SUBFRAME_HOSTS.has(host))
) {
  // Set host for CSS selector. See 042-discuz.scss.
  doc.documentElement.dataset.utags = host

  polyfillRequestIdleCallback()
  setupConsole()

  scanDom({
    onNodeMatched(node) {
      enqueueScannedNode(node)
    },
    onScanCompleted(nodes) {
      console.debug('Scan completed', nodes.length)
      lastScannerResult = nodes
    },
  })

  console.log('Start init ContentScript', host, location.href)

  void main()
}
