/**
 * 文件说明：Plasmo content/main-world 侧的 Shadow DOM 辅助脚本。配合 shadow-root 模块和构建后 IIFE 包装，让插件能发现并处理 shadow root 内部内容。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import type { PlasmoCSConfig } from 'plasmo'

import { interceptShadowDOM } from '../modules/shadow-root'

export const config: PlasmoCSConfig = {
  run_at: 'document_start',
  matches: ['https://*/*', 'http://*/*'],
  all_frames: true,
  world: 'MAIN',
}

// For extension
interceptShadowDOM()
