/**
 * 文件说明：普通 JS 模块构建脚本。输出未压缩和压缩的 module 版本，并使用 local-storage 适配存储。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import fs from "node:fs"
import * as esbuild from "esbuild"

import { getBuildOptions } from "../common.mjs"

const target = "module"
const tag = "prod"

// TODO: add name and version to output
const config = JSON.parse(fs.readFileSync("package.json", "utf8"))

const buildOptions = {
  ...getBuildOptions(target, "prod"),
  minify: false,
  sourcemap: false,
  outfile: `build/${target}-${tag}/${config.name}.js`,
}
buildOptions.alias = {
  ...buildOptions.alias,
  "browser-extension-storage": "browser-extension-storage/local-storage",
}

await esbuild.build(buildOptions)

let text = fs.readFileSync(buildOptions.outfile, "utf8")
// Remove all commenets staret with '// '
text = text.replaceAll(/^\s*\/\/ [^=@].*$/gm, "")
text = text.replaceAll(/\n+/gm, "\n")

fs.writeFileSync(buildOptions.outfile, text)

await esbuild.build({
  ...buildOptions,
  minify: true,
  sourcemap: true,
  outfile: `build/${target}-${tag}/${config.name}.min.js`,
})
