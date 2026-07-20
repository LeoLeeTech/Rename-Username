/**
 * 文件说明：项目通用类型定义，包含用户标签、元信息、站点适配中使用的扩展 HTMLElement 等类型。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
export type UserTag = {
  key: string
  meta?: UserTagMeta
  originalKey?: string
}

export type UserTagMeta = {
  title?: string
  type?: string
  description?: string
}

export type RecentTag = {
  tag: string
  score: number
}

// eslint-disable-next-line @typescript-eslint/no-restricted-types
export type NullOrUndefined = null | undefined

export type UtagsHTMLElement = {
  href?: string
} & HTMLElement

// Global interface extensions
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElement {
    utags?: UserTag
  }
}
