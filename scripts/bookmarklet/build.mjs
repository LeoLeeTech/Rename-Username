/**
 * 文件说明：bookmarklet 构建脚本。使用 esbuild 打包后，再用 bookmarkleter 转成可作为浏览器书签 URL 使用的脚本。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import fs from "node:fs"
import bookmarkleter from "bookmarkleter"
import * as esbuild from "esbuild"

import { getBuildOptions } from "../common.mjs"

const target = "bookmarklet"
const tag = "prod"

// TODO: add name and version to output
const config = JSON.parse(fs.readFileSync("package.json", "utf8"))

const buildOptions = {
  ...getBuildOptions(target, "prod"),
  minify: true,
  sourcemap: false,
  outfile: `build/${target}-${tag}/${config.name}.bookmarklet.link`,
}
buildOptions.alias = {
  ...buildOptions.alias,
  "browser-extension-storage": "browser-extension-storage/local-storage",
}

await esbuild.build(buildOptions)

const text = fs.readFileSync(buildOptions.outfile, "utf8")
const options = {
  urlencode: true,
  iife: false,
  mangleVars: true,
  transpile: true,
}
const bookmarklet = bookmarkleter(text, options)
fs.writeFileSync(buildOptions.outfile, bookmarklet)
