/**
 * 文件说明：Chrome 构建后处理脚本。修改 build/chrome-mv3-prod/manifest.json，删除不需要的 web_accessible_resources 和空 css 字段。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import fs from "node:fs"

const filePath = "build/chrome-mv3-prod/manifest.json"
const manifest = JSON.parse(fs.readFileSync(filePath, "utf8"))

delete manifest.web_accessible_resources

if (manifest.content_scripts) {
  for (const script of manifest.content_scripts) {
    if (script.css && script.css.length === 0) {
      delete script.css
    }
  }
}

fs.writeFileSync(filePath, JSON.stringify(manifest))
