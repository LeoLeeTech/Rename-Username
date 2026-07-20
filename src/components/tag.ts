/**
 * 文件说明：页面内标签元素工厂。创建带 utags_text_tag / utags_emoji_tag class 和 data-utags_tag 数据的标签链接或纯展示元素。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import { createElement } from 'browser-extension-utils'

export default function createTag(
  tagName: string,
  options: Record<string, any>
) {
  const a = createElement('a', {
    title: tagName,
    class: options.isEmoji
      ? 'utags_text_tag utags_emoji_tag'
      : 'utags_text_tag',
    'data-utags_exclude': '',
  })

  if (options.enableSelect) {
    a.textContent = tagName
    a.dataset.utags_tag_selectable = '1'
  }

  a.dataset.utags_tag = tagName

  if (!options.noLink) {
    a.setAttribute('href', 'https://utags.link/#' + encodeURIComponent(tagName))
    a.setAttribute('target', '_blank')
  }

  return a
}
