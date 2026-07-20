/**
 * 文件说明：多语言文案入口。负责选择当前语言、导出 i() 翻译函数、提供可用语言列表并支持重置 i18n 状态。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import { getPrefferedLocale, initAvailableLocales, initI18n } from 'browser-extension-i18n'

import messagesDe from './de'
import messagesEn from './en'
import messagesEs from './es'
import messagesFr from './fr'
import messagesIt from './it'
import messagesJa from './ja'
import messagesKo from './ko'
import messagesPt from './pt'
import messagesRu from './ru'
import messagesVi from './vi'
import messagesZh from './zh-cn'
import messagesZhHk from './zh-hk'
import messagesZhTw from './zh-tw'

export const availableLocales = /** @type {const} */ [
  'en',
  'zh',
  // 'zh-cn'
  'zh-hk',
  'zh-tw',
  'ja',
  'ko',
  'de',
  'fr',
  'es',
  'it',
  'pt',
  'ru',
  'vi',
]

initAvailableLocales(availableLocales)

// console.log('[utags] prefferedLocale:', getPrefferedLocale())
export const localeMap = {
  zh: messagesZh,
  'zh-cn': messagesZh,
  en: messagesEn,
  ru: messagesRu,
  'zh-hk': messagesZhHk,
  'zh-tw': messagesZhTw,
  ja: messagesJa,
  ko: messagesKo,
  de: messagesDe,
  fr: messagesFr,
  es: messagesEs,
  it: messagesIt,
  pt: messagesPt,
  vi: messagesVi,
}

// eslint-disable-next-line import-x/no-mutable-exports
export let i = initI18n(localeMap, getPrefferedLocale())

export function resetI18n(locale?: string) {
  // console.log('[utags] prefferedLocale:', getPrefferedLocale(), 'locale:', locale)
  i = initI18n(localeMap, locale || getPrefferedLocale())
}

/**
 * Get the list of currently available locales.
 *
 * @returns Array of available locale strings
 * @example
 *   const locales = getAvailableLocales();
 *   console.log('Supported languages:', locales);
 */
export function getAvailableLocales(): readonly string[] {
  return availableLocales
}
