# Rename Username / UTags 浏览器插件代码说明

这个仓库是从 UTags 浏览器插件部分剥离出来的 Rename Username 项目。当前代码里很多命名、存储 key、CSS class、站点适配文件仍然沿用 `utags`，可以把它理解成“原 UTags 的链接/用户标签能力，被改造成用户名重命名插件的基础工程”。

## 一、项目技术栈

### 1. 浏览器插件框架：Plasmo

项目使用 [Plasmo](https://www.plasmo.com/) 作为浏览器扩展开发框架。

主要证据：

- `package.json` 依赖了 `plasmo`
- `src/content.ts` 导出了 `config: PlasmoCSConfig`
- `src/popup.tsx`、`src/options.tsx` 是 Plasmo 约定的弹窗页和设置页入口
- `.plasmo/` 是 Plasmo 生成的缓存、类型和静态模板目录

Plasmo 的作用：

- 生成 Chrome / Firefox 扩展的 `manifest.json`
- 编译 content script、background、popup、options
- 支持 `plasmo dev` 热更新调试
- 支持 `plasmo build` 打包扩展

### 2. 扩展规范：Chrome Manifest V3 + Firefox MV2/MV3

`package.json` 中的脚本同时支持：

- Chrome MV3：`plasmo dev`、`plasmo build`
- Firefox MV2：`plasmo dev --target=firefox-mv2`
- Firefox MV3：`plasmo dev --target=firefox-mv3`

`package.json` 的 `manifest` 字段声明了：

- `permissions: ["storage"]`：使用浏览器扩展存储
- `host_permissions: ["https://*/*", "http://*/*"]`：允许在所有网页上运行
- Firefox 的 `browser_specific_settings.gecko.id`

### 3. 前端 UI：React + TSX

项目使用 React 编写扩展弹窗页和设置页：

- `src/popup.tsx`：点击浏览器插件图标时打开的小弹窗
- `src/options.tsx`：扩展选项页

核心 content script 的页面内 UI 并不是 React 组件树，而是大量使用 DOM API 动态创建元素，例如：

- `src/components/tag.ts`
- `src/components/modal.ts`
- `src/modules/advanced-tag-manager.ts`

### 4. 主语言：TypeScript

源码主要是 TypeScript：

- `.ts`：业务逻辑、content script、background、站点适配、存储等
- `.tsx`：React 页面
- `.d.ts`：全局类型声明

`tsconfig.json` 继承 Plasmo 的基础配置，并配置了：

- `moduleResolution: "bundler"`
- 路径别名 `~* -> ./src/*`
- `strictNullChecks: true`

### 5. 样式：SCSS + data-text 导入

项目使用 Sass / SCSS：

- `src/content.scss`：content script 注入到页面的主要样式
- `src/sites/default.scss`：默认站点样式
- `src/sites/z001/*.scss`、`src/sites/z999/*.scss`：不同站点的适配样式

代码中常见：

```ts
import styleText from 'data-text:./default.scss'
```

这是 Plasmo / 构建脚本处理文本资源的方式，用来把 SCSS 编译后作为字符串注入页面。

### 6. 存储：browser-extension-storage

项目没有直接裸用 `chrome.storage` 保存业务数据，而是主要通过：

- `browser-extension-storage`
- `browser-extension-settings`

相关目录：

- `src/storage/bookmarks.ts`
- `src/storage/tags.ts`

虽然文件名还是 `bookmarks` / `tags`，但本质是“按 URL 保存用户自定义数据”的存储层。Rename Username 后续如果要保存“某个站点某个用户名对应的新名字”，大概率会改造这里的数据结构或复用这里的 URL/tag 存储机制。

### 7. 工具库

项目大量使用作者自己的通用库：

- `browser-extension-utils`：DOM 查询、事件监听、样式注入、菜单命令等工具
- `browser-extension-i18n`：多语言
- `browser-extension-settings`：设置面板
- `utags-utils`：标签拆分、标题清洗、URL 处理等 UTags 通用逻辑

### 8. 构建工具：Plasmo + esbuild + Sass

扩展本体由 Plasmo 构建。

另外项目还保留了 UTags 的多形态构建能力：

- userscript：油猴脚本
- bookmarklet：书签脚本
- module：普通 JS 模块

这些由 `scripts/` 下的 Node.js 脚本调用 `esbuild` 和 `sass` 完成。

### 9. 测试与代码质量：Vitest + jsdom + XO + Prettier

测试：

- `vitest.config.ts`
- `src/**/*.test.ts`
- 测试环境是 `jsdom`

代码质量：

- `xo.config.mjs`：XO / ESLint 风格检查
- `.prettierrc`：格式化配置
- `.editorconfig`：编辑器基础格式

常用命令：

```bash
npm run test
npm run lint
npm run dev
npm run build
```

## 二、项目根目录文件说明

### `package.json`

项目最重要的配置文件。

主要内容：

- 项目名称、版本、描述、多语言描述
- npm scripts
- dependencies / devDependencies
- Plasmo 使用的扩展 manifest 配置

重点脚本：

- `dev`：同时启动 Chrome、Firefox、userscript 相关开发任务
- `dev:chrome`：Chrome 扩展开发
- `dev:firefox`：Firefox MV2 开发
- `dev:firefox-mv3`：Firefox MV3 开发
- `build:chrome`：构建 Chrome MV3 扩展
- `build:firefox`：构建 Firefox MV2 扩展
- `build:firefox-mv3`：构建 Firefox MV3 扩展
- `build:userscript`：构建普通油猴脚本
- `build:userscript-no-adult`：构建不包含成人站点适配的油猴脚本
- `build:userscript-full`：构建 full 版本油猴脚本
- `test`：运行 Vitest 单测

### `package-lock.json`

npm 锁文件，记录当前依赖树的精确版本。

### `README.md`

项目说明文档。当前说明这是 Rename Username，是从 UTags fork 出来的浏览器扩展，用于把网页上的用户名替换成自定义名字。

### `develop.md`

当前文件，作为开发者理解项目结构和技术栈的说明文档。

### `tsconfig.json`

TypeScript 配置。继承 Plasmo 的 TS 基础配置，并开启 `strictNullChecks`。

### `vitest.config.ts`

Vitest 单测配置。

重点：

- 测试文件匹配 `src/**/*.test.ts`
- 使用 `jsdom` 模拟浏览器 DOM
- 自定义了一个 `data-text:` loader，让测试环境能处理 Plasmo 的文本导入

### `xo.config.mjs`

XO 代码规范配置，控制 TypeScript / JavaScript lint 规则。

### `.prettierrc` / `.prettierignore`

Prettier 格式化配置和忽略规则。

### `.editorconfig`

编辑器通用格式配置，例如缩进、换行等。

### `.gitignore`

Git 忽略规则。

### `LICENSE`

MIT License。

## 三、`src/` 源码目录

`src/` 是项目核心代码目录。

### `src/content.ts`

浏览器 content script 主入口，也是整个插件最核心的文件。

它会被注入到所有 `http` / `https` 页面：

```ts
export const config: PlasmoCSConfig = {
  run_at: 'document_start',
  matches: ['https://*/*', 'http://*/*'],
  all_frames: true,
}
```

主要职责：

- 初始化插件设置
- 加载多语言
- 判断当前网站是否启用
- 注册菜单命令
- 扫描页面 DOM
- 找出需要添加标签或重命名的目标节点
- 监听 DOM 变化，处理 SPA 页面动态更新
- 注入样式
- 初始化标签管理弹窗
- 初始化快速收藏星标功能
- 初始化访问过内容的标记功能
- 和外部 webapp 通信同步数据

可以把它理解成“页面里真正干活的总调度器”。

### `src/background.ts`

扩展后台脚本。

当前主要做一件事：接收 content script 发来的 `HTTP_REQUEST` 消息，然后在 background 里用 `fetch` 发请求，再把结果返回给 content script。

这么做的目的通常是：

- 绕过普通网页环境下的 CORS 限制
- 统一处理请求超时
- 利用扩展权限访问远程接口

相关消息类型：

- `HTTP_REQUEST`
- 返回 `success: true` 或 `success: false`

### `src/popup.tsx`

浏览器工具栏点击插件图标后显示的弹窗。

主要功能：

- 显示设置标题
- 提供“打开设置”的按钮
- 向当前 tab 的 content script 发送 `utags:show-settings`
- 提供跳转 `https://utags.link/` 的入口

### `src/options.tsx`

扩展选项页。

当前比较简单，主要显示：

- 标题
- 链接列表入口
- 导出 / 导入数据入口

### `src/content.scss`

content script 注入页面的全局样式。

负责页面上标签、弹窗、隐藏效果、访问过效果等 UI 的基础样式。

### `src/content-utils.ts`

content script 的辅助逻辑。

从导入关系看，主要负责：

- 构造需要展示的标签
- 判断节点更新后是否需要刷新 UTags

对应测试：

- `src/content-utils.test.ts`

### `src/global.d.ts`

全局类型声明。

通常用于声明浏览器扩展、userscript、全局变量、第三方模块等 TypeScript 无法自动识别的类型。

### `src/types.ts`

项目通用类型定义。

例如用户标签、元信息、站点适配中使用的扩展 HTMLElement 类型等。

## 四、`src/components/`

页面内 UI 小组件目录，不是 React 组件，而是原生 DOM 组件工厂。

### `src/components/tag.ts`

创建一个标签元素。

主要行为：

- 创建 `<a>` 元素
- 设置 `utags_text_tag` / `utags_emoji_tag` class
- 写入 `data-utags_tag`
- 默认链接到 `https://utags.link/#标签名`
- 支持只显示不跳转

### `src/components/modal.ts`

创建页面内弹窗。

主要用于高级标签管理器、设置、导入导出等页面内交互。

## 五、`src/contents/`

Plasmo 约定目录，通常用于 content script 或 main world script。

### `src/contents/shadow-root.ts`

与 Shadow DOM 相关的注入脚本。

它和下面这些文件配合：

- `src/modules/shadow-root.ts`
- `scripts/wrap-shadow-root.mjs`

作用是处理网页中使用 Shadow DOM 的场景，让插件能发现 shadow root 内部的内容并注入样式或扫描节点。

## 六、`src/messages/`

多语言文案目录。

### `src/messages/index.ts`

多语言入口。

主要负责：

- 按当前浏览器语言选择文案
- 导出 `i()` 翻译函数
- 提供可用语言列表
- 重置 i18n 状态

### `src/messages/*.ts`

各语言文案：

- `en.ts`
- `zh-cn.ts`
- `zh-hk.ts`
- `zh-tw.ts`
- `ja.ts`
- `ko.ts`
- `de.ts`
- `fr.ts`
- `es.ts`
- `it.ts`
- `pt.ts`
- `vi.ts`
- `ru.ts`

## 七、`src/modules/`

业务模块目录。这里是项目复杂逻辑最多的地方。

### `src/modules/advanced-tag-manager.ts`

高级标签管理器。

主要职责：

- 显示当前标签
- 显示置顶标签、常用标签、最近添加标签、emoji 标签
- 添加 / 删除标签
- 调用 `components/modal.ts` 创建弹窗
- 调用 `storage/tags.ts` 读取候选标签

对于 Rename Username 来说，这个模块可能会被改造成“用户名映射编辑器”。

### `src/modules/simple-tag-manger.ts`

简单标签管理器。

文件名里的 `manger` 应该是 `manager` 的拼写遗留问题。

通常用于比高级管理器更轻量的标签编辑场景。

### `src/modules/star-handler.ts`

快速星标功能。

主要用于给某些站点快速添加星级标签，例如 `★`、`★★`、`★★★`。

配套说明：

- `src/modules/star-handler.md`

### `src/modules/star-icon.ts`

星标图标相关逻辑或资源。

### `src/modules/utags-scanner.ts`

DOM 扫描引擎，是 content script 的核心底层能力之一。

主要职责：

- 扫描页面中匹配 `data-utags_link` 的元素
- 使用 `MutationObserver` 监听 DOM 变化
- 支持初始扫描和增量扫描
- 支持 Shadow DOM
- 避免插件自己修改 DOM 后造成无限循环
- 提供扫描统计信息

它维护了：

- `initialStack`：全量扫描任务
- `incrementalStack`：增量扫描任务
- `observer`：DOM 变化监听器
- `scannedShadowRoots`：已扫描的 ShadowRoot

对应测试：

- `src/modules/utags-scanner.test.ts`

### `src/modules/scanned-node-queue.ts`

扫描结果队列。

主要作用：

- 把扫描到的节点放入队列
- 分批处理，避免一次性处理大量 DOM 导致页面卡顿
- 提供启用 / 暂停处理的控制
- 支持队列空闲回调

对应测试：

- `src/modules/scanned-node-queue.test.ts`

### `src/modules/style-manager.ts`

样式管理器。

主要职责：

- 合并默认样式、站点样式、content 样式
- 注入到普通 document
- 注入到 ShadowRoot
- 当设置或站点变化时重建样式

对应测试：

- `src/modules/style-manager.test.ts`

### `src/modules/dom-reference-manager.ts`

DOM 引用管理。

主要用于把业务数据和具体 DOM 节点建立关联，例如：

- 某个元素当前绑定了哪些标签
- 某个元素对应的 UTags UI 节点
- 清理 DOM 引用，避免内存泄漏

### `src/modules/utags-registry.ts`

UTags UI 注册表。

主要负责记录页面上已经创建的 `.utags_ul` 标签列表，避免重复插入，也方便统一隐藏、清理或刷新。

### `src/modules/global-events.ts`

全局事件绑定。

主要处理：

- document 级点击、输入、快捷键等事件
- window 级事件
- ShadowRoot 内事件
- 隐藏页面区域里的所有 UTags UI

### `src/modules/menu-command-manager.ts`

菜单命令管理。

用于统一注册、更新、清理扩展菜单命令。content script 中“隐藏/显示所有标签”等功能会用到它。

### `src/modules/export-import.ts`

导入导出功能。

主要负责把当前存储里的标签 / 书签数据导出为文本，或从外部文本导入恢复。

### `src/modules/sync-adapter.ts`

和 UTags webapp 同步数据的适配层。

主要通过 `window.postMessage` 风格的消息协议和网页通信。

支持的消息包括：

- `PING`
- `DISCOVER_UTAGS_TARGETS`
- `GET_AUTH_STATUS`
- `GET_REMOTE_METADATA`
- `DOWNLOAD_DATA`
- `UPLOAD_DATA`

底层会调用：

- `serializeBookmarks()`
- `deserializeBookmarks()`

对应测试：

- `src/modules/sync-adapter.test.ts`

### `src/modules/webapp-bridge.ts`

content script 和 UTags 网页应用之间的桥接模块。

它和 `sync-adapter.ts` 一起用于让网页端发现扩展、读取扩展数据、上传同步数据等。

### `src/modules/visited.ts`

访问过内容的标记功能。

主要用于判断当前站点是否启用 visited 功能，并根据存储或设置给访问过的内容加样式。

### `src/modules/timer-manager.ts`

定时器管理。

主要用于统一创建、清理 `setTimeout` 等计时器，避免页面切换或脚本卸载后残留任务。

### `src/modules/shadow-root.ts`

Shadow DOM 拦截与事件通知。

配合 `utags-scanner.ts`，让插件能在网页创建 shadow root 时收到信号，然后补扫 shadow root 内部节点。

### `src/modules/debugging.ts`

调试辅助功能，例如注册调试快捷键、输出扫描状态等。

## 八、`src/sites/`

站点适配目录。这个目录决定“在哪些网站上，哪些 DOM 节点是用户名、帖子、视频、用户链接或可标记对象”。

### `src/sites/index.ts`

站点适配总入口。

主要职责：

- 导入所有站点配置
- 按当前 URL 匹配站点
- 合并默认规则和站点专属规则
- 提供 `getCanonicalUrl`
- 提供 `getListNodes`
- 提供 `scanDom`
- 提供 `postProcess`
- 更新匹配节点选择器

站点配置类型大致包括：

- `matches`：用正则匹配当前站点
- `listNodesSelectors`：列表容器选择器
- `conditionNodesSelectors`：条件节点选择器
- `matchedNodesSelectors`：真正要处理的节点选择器
- `validate`：进一步校验节点是否有效
- `excludeSelectors`：排除区域
- `validMediaSelectors`：有效媒体节点
- `getCanonicalUrl`：把不同形式 URL 归一化
- `getStyle`：站点专属样式
- `preProcess` / `postProcess`：扫描前后处理

### `src/sites/default.ts`

默认站点配置。

默认匹配所有页面：

- 处理 `[data-utags_link]`
- 去掉常见 UTM 参数
- 注入 `default.scss`

### `src/sites/default.scss`

默认站点样式。

### `src/sites/z001/`

普通站点适配目录。

每个站点通常有：

- `xxx.ts`：DOM 匹配规则、URL 归一化、前后处理逻辑
- `xxx.scss`：该站点专属样式

目前包括 GitHub、X/Twitter、YouTube、Reddit、Bilibili、小红书、抖音、豆瓣、微博、知乎、掘金、V2EX、Greasy Fork、Hacker News、Instagram、Facebook、TikTok、Pixiv、NGA、Discourse、Discuz 等。

对 Rename Username 最重要的是这些 `.ts` 文件，因为它们决定了“哪个 DOM 元素里的用户名需要被识别和替换”。

例子：

- `005-github.com.ts`：GitHub 站点适配
- `007-twitter.com.ts`：X / Twitter 站点适配
- `012-youtube.com.ts`：YouTube 站点适配
- `018-xiaohongshu.com.ts`：小红书站点适配
- `021-douyin.com.ts`：抖音站点适配

### `src/sites/z999/`

成人或敏感站点适配目录。

项目保留了 UTags 原项目的一些成人站点规则。`build:userscript-no-adult` 会构建不包含这些站点的 userscript 版本。

如果 Rename Username 不打算支持这些站点，可以后续删除或从构建入口里排除。

### `src/sites/*.test.ts`

站点适配相关测试。

包括：

- `index-meta.test.ts`
- `index-matched-nodes-selector.test.ts`
- `get-canonical-url.test.ts`

这些测试主要验证站点元信息、节点选择器和 URL 归一化逻辑。

### `src/sites/test-setup.ts`

站点测试初始化代码。

## 九、`src/storage/`

数据存储目录。

### `src/storage/bookmarks.ts`

核心数据存储文件。

虽然叫 bookmarks，但它保存的是“URL -> tags + meta”的业务数据。

主要能力：

- 创建空数据仓库
- 读取存储
- 写入存储
- 数据版本迁移
- URL map 缓存
- 序列化 / 反序列化
- 监听存储变化
- 保存标签和元信息

重要常量：

- `storageKey = 'extension.utags.urlmap'`
- `currentDatabaseVersion = 3`
- `DELETED_BOOKMARK_TAG = '._DELETED_'`

### `src/storage/tags.ts`

标签集合存储。

主要保存：

- 最近使用标签
- 最常用标签
- 最近添加标签
- 置顶标签
- emoji 标签

这些数据用于标签编辑弹窗里的候选列表。

### `src/storage/storage-test.ts`

测试辅助存储实现或测试初始化。

### `src/storage/*.test.ts`

存储层单测：

- `bookmarks.test.ts`
- `tags.test.ts`

## 十、`src/types/`

更细分的类型目录。

### `src/types/bookmarks.ts`

书签 / 标签数据结构相关类型。

例如：

- `BookmarkMetadata`
- `BookmarksData`
- `BookmarkTagsAndMetadata`

## 十一、`src/utils/`

通用工具目录。

### `src/utils/index.ts`

项目通用工具入口。

包含：

- 运行环境判断：Chrome 扩展、Firefox 扩展、userscript、production
- 标签排序
- 标签过滤
- 文本复制
- URL 参数删除
- DOM 清理
- 标题提取

### `src/utils/dom-utils.ts`

DOM 相关工具函数。

`utags-scanner.ts` 会用它判断一个节点是否是扫描目标。

### `src/utils/event-listener-manager.ts`

事件监听管理器。

用于统一注册和清理事件监听，降低页面切换、重复初始化时的内存泄漏风险。

### `src/utils/shadow-root-traverser.ts`

Shadow DOM 遍历工具。

用于穿透普通 DOM 和 Shadow DOM，辅助扫描和样式注入。

### `src/utils/console.ts`

控制台日志工具。

通常用于根据环境控制日志输出。

### `src/utils/atob.ts`

`atob` 相关兼容或包装工具。

### `src/utils/test/`

测试用 mock 工具。

包括：

- `mock-browser-extension-settings.ts`
- `mock-event-listener.ts`

### `src/utils/*.test.ts`

工具函数测试。

## 十二、`scripts/` 构建脚本目录

这个目录主要服务于 UTags 的多平台构建，不全是浏览器扩展必需。

### `scripts/common.mjs`

构建公共逻辑。

主要提供：

- `getBuildOptions()`
- esbuild 配置
- `data-text:` / `schemeImport` 资源导入插件
- Sass 编译为文本
- 开发服务器 watch / serve 工具

### `scripts/chrome/update-manifest.mjs`

Chrome 构建后处理脚本。

主要修改：

- 删除 `web_accessible_resources`
- 删除空的 `content_scripts[].css`

目标文件：

- `build/chrome-mv3-prod/manifest.json`

### `scripts/firefox/update-manifest.mjs`

Firefox 构建后处理脚本。

主要修改：

- 删除 `web_accessible_resources`
- 删除空的 `content_scripts[].css`

目标文件：

- `build/firefox-mv2-prod/manifest.json`
- `build/firefox-mv3-prod/manifest.json`

### `scripts/wrap-shadow-root.mjs`

构建后处理脚本。

主要作用：

- 找到构建目录中的 `shadow-root.*.js`
- 用 IIFE 包起来
- 避免脚本在页面环境中污染全局作用域或被重复包裹

### `scripts/userscript/`

油猴脚本构建目录。

主要文件：

- `build.mjs`：构建普通 userscript
- `build-no-adult.mjs`：构建不含成人站点的 userscript
- `build-full.mjs`：构建 full userscript
- `watch.mjs`：开发监听
- `banner.txt`：userscript 头部元信息模板
- `sync.sh`：同步脚本

### `scripts/bookmarklet/`

书签脚本构建目录。

主要文件：

- `build.mjs`
- `watch.mjs`

`build.mjs` 使用 `bookmarkleter` 把打包后的 JS 转成可以作为浏览器书签 URL 使用的 bookmarklet。

### `scripts/module/`

普通 JS 模块构建目录。

主要文件：

- `build.mjs`
- `watch.mjs`

会输出：

- `build/module-prod/utags.js`
- `build/module-prod/utags.min.js`

## 十三、`assets/`

项目静态资源目录。

当前主要是 README 展示图和图标：

- `icon.png`
- `github.png`
- `x.png`
- `youtube.png`

## 十四、`.plasmo/`

Plasmo 自动生成目录。

主要内容：

- `.plasmo/index.d.ts`：Plasmo 生成的类型声明
- `.plasmo/chrome-mv3.plasmo.manifest.json`：Plasmo 生成的 manifest 中间文件
- `.plasmo/static/`：Plasmo 的页面模板和运行时代码
- `.plasmo/gen-assets/`：根据图标生成的多尺寸扩展图标
- `.plasmo/cache/`：Parcel / Plasmo 构建缓存

这个目录一般不需要手动改。

## 十五、`build/`

构建产物目录。

当前能看到：

- `build/chrome-mv3-dev/`：Chrome MV3 开发构建产物
- `build/userscript-prod/`：普通 userscript 生产产物
- `build/userscript-staging/`：普通 userscript staging 产物
- `build/userscript-no-adult-prod/`：不含成人站点的 userscript 生产产物
- `build/userscript-no-adult-staging/`：不含成人站点的 userscript staging 产物
- `build/userscript-full-prod/`：full userscript 生产产物

这个目录是生成结果，不建议手动修改源逻辑。

## 十六、`.idea/`

JetBrains 系列 IDE 的项目配置目录。

例如 WebStorm / IntelliJ IDEA 的代码风格、项目配置等。

一般不是业务代码。

## 十七、核心运行流程

插件在网页里运行的大致流程如下：

1. 浏览器加载扩展。
2. Plasmo 根据 manifest 把 `src/content.ts` 注入到所有网页。
3. `content.ts` 在 `document_start` 执行，初始化设置、多语言、样式和事件。
4. `src/sites/index.ts` 根据当前网址找到对应站点配置。
5. 站点配置提供 DOM 选择器，告诉扫描器哪些节点代表用户、帖子、视频或链接。
6. `utags-scanner.ts` 扫描 DOM，并用 `MutationObserver` 监听后续变化。
7. 扫描结果进入 `scanned-node-queue.ts`，分批处理。
8. 处理节点时，代码从 `storage/bookmarks.ts` / `storage/tags.ts` 读取已有数据。
9. 页面内创建标签 UI，或根据业务逻辑更新目标 DOM。
10. `style-manager.ts` 把默认样式和站点样式注入页面。
11. 用户点击标签或菜单时，`advanced-tag-manager.ts` / `simple-tag-manger.ts` 打开编辑弹窗。
12. 用户修改后，数据写回浏览器扩展存储。
13. 如果网页是 UTags webapp，`sync-adapter.ts` / `webapp-bridge.ts` 可以和网页端同步数据。

## 十八、后续改 Rename Username 时最值得关注的文件

如果目标是把 UTags 真正改成 Rename Username，优先看这些文件：

### 1. 站点识别规则

- `src/sites/index.ts`
- `src/sites/z001/*.ts`

这些文件决定插件能在哪些网站识别用户名节点。

### 2. 页面扫描和动态更新

- `src/content.ts`
- `src/modules/utags-scanner.ts`
- `src/modules/scanned-node-queue.ts`

这些文件决定页面加载后和 SPA 更新后如何找到并处理节点。

### 3. 数据结构和存储

- `src/storage/bookmarks.ts`
- `src/storage/tags.ts`
- `src/types.ts`
- `src/types/bookmarks.ts`

如果要从“URL -> tags”改成“站点 + 原用户名 -> 新用户名”，这里需要重点调整。

### 4. 页面内编辑 UI

- `src/modules/advanced-tag-manager.ts`
- `src/modules/simple-tag-manger.ts`
- `src/components/modal.ts`
- `src/components/tag.ts`

这些可以改造成“输入原用户名 / 新用户名”的编辑界面。

### 5. 扩展弹窗和设置页

- `src/popup.tsx`
- `src/options.tsx`

这里适合放用户入口，例如“打开重命名列表”“导入导出规则”“当前网站启用/禁用”等。

### 6. 文案和品牌

- `package.json`
- `README.md`
- `src/messages/*.ts`
- `assets/`

这些地方还保留不少 UTags / Pipecraft 文案，正式发布 Rename Username 前需要统一替换。
