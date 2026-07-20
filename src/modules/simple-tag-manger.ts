/**
 * 文件说明：简单标签管理器。提供比高级标签管理器更轻量的页面内标签编辑能力；文件名中的 manger 是历史拼写遗留。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
export async function simplePrompt(message: string, value: string | undefined) {
  return prompt(message, value)
}
