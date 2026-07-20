/**
 * 文件说明：Firefox 构建后处理脚本。修改 Firefox MV2/MV3 manifest，删除不需要的 web_accessible_resources 和空 css 字段。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import fs from "node:fs"

const filePath = "build/firefox-mv2-prod/manifest.json"
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

{
  const filePath = "build/firefox-mv3-prod/manifest.json"
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
}
