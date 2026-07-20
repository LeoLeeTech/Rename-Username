/**
 * 文件说明：普通 JS 模块开发监听脚本。监听源码变化并持续重新构建 module 产物。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import fs from "node:fs"

import { getBuildOptions, runDevServer } from "../common.mjs"

const target = "module"
const tag = "dev"

const buildOptions = getBuildOptions(target, tag)
buildOptions.alias = {
  ...buildOptions.alias,
  "browser-extension-storage": "browser-extension-storage/local-storage",
}

const { port } = await runDevServer(buildOptions, target, tag)

const code = `<script>
(function () {
  "use strict";

  const script = document.createElement("script");
  script.src = "http://localhost:${port}/content.js";
  script.async = true;
  script.defer = true;
  document.body.append(script);

  new EventSource("http://localhost:${port}/esbuild").addEventListener(
    "change",
    () => {
      location.reload();
    }
  );
})();
</script>`

const html = `<html>
  <head>
    <title>Install Extension - target: ${target}</title>
  </head>
  <body>
    <p>Add this code to the HTML file</p>
    <textarea
      style="width: 100%; height: 80%; padding: 10px; box-sizing: border-box">
${code}
    </textarea>
    <script>
      document.querySelector("textarea").select();
    </script>
    ${code}
  </body>
</html>
`

fs.writeFileSync(`build/${target}-${tag}/index.html`, html)
