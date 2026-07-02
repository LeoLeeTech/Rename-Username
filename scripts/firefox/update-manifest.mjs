// Firefox 构建后处理脚本：分别处理 MV2 和 MV3 产物的 manifest，清理空 CSS 和不需要的资源声明。
import fs from "node:fs"

function updateManifest(filePath) {
  if (!fs.existsSync(filePath)) {
    return
  }

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

updateManifest("build/firefox-mv2-prod/manifest.json")
updateManifest("build/firefox-mv3-prod/manifest.json")
