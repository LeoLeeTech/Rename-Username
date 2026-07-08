# Rename Username Browser Extension

Rename Username 是一个浏览器扩展，用来把网页上的用户名替换成你自定义的新名字。当前仓库地址是 `https://github.com/LeoLeeTech/Rename`。

## 安装依赖

```bash
npm install .
```

## 开发

```bash
npm run dev:chrome
npm run dev:firefox
```

## 构建

```bash
npm run build:chrome
npm run build:firefox
npm run build:firefox-mv3
npm run package:edge
```

## 目录

- `src/`：扩展源码
- `scripts/`：构建后处理脚本
- `assets/`：扩展资源
- `package.json`：Plasmo 扩展配置和 npm 脚本

# 支持网站

```
V2EX (www.v2ex.com)
Greasy Fork (greasyfork.org and sleazyfork.org)
Hacker News (news.ycombinator.com)
Lobsters (lobste.rs)
GitHub (github.com)
Reddit (www.reddit.com)
X(Twitter) (x.com / twitter.com)
微信公众号 (mp.weixin.qq.com)
Instagram (www.instagram.com)
Threads (www.threads.com)
Facebook (www.facebook.com)
YouTube (www.youtube.com)
B 站 Bilibili (www.bilibili.com)
TikTok (www.tiktok.com)
吾爱破解 (www.52pojie.cn)
掘金 (juejin.cn)
知乎 (zhihu.com)
小红书 xiaohongshu (xiaohongshu.com)
微博 (weibo.com, weibo.cn)
少数派 (sspai.com)
抖音 (douyin.com)
今日热榜 Rebang.Today (rebang.today)
MyAnimeList (myanimelist.net)
豆瓣 (douban.com)
pixiv (www.pixiv.net)
LINUX DO (linux.do)
小众软件 (meta.appinn.net)
NGA (bbs.nga.cn, nga.178.com, ngabbs.com)
Keylol 其乐 (keylol.com)
Discourse (meta.discourse.org)
Open AI (community.openai.com)
Cloudflare (community.cloudflare.com)
```

# 开发者导览

这一节面向准备第一次阅读和修改代码的人。这个项目是一个基于 Plasmo 的浏览器插件，核心逻辑运行在 content script 中：插件把脚本注入到网页，扫描页面上的用户、帖子、视频、仓库等目标元素，然后在这些元素旁边插入 Rename Username 按钮。用户单击按钮后会打开输入弹窗，输入的新名字会保存到浏览器扩展本地存储。

## 当前项目使用的技术栈

- TypeScript：项目主要源码语言。大部分业务文件都是 `.ts`，React 页面是 `.tsx`。
- React：用于插件 popup 页面和 options 页面，也就是浏览器工具栏弹窗和扩展选项页。
- Plasmo：浏览器插件开发框架。它负责识别 `src/content.ts`、`src/background.ts`、`src/popup.tsx`、`src/options.tsx` 这些约定入口，并生成 Chrome/Firefox 扩展产物。Edge 可以复用 Chrome MV3 产物。
- WebExtension API：代码里会使用 `chrome` / `browser` 扩展 API，例如发送消息、读取当前标签页、background 通信、扩展本地存储等。
- Content Script：`src/content.ts` 是最重要的入口。它运行在网页上下文旁边，负责扫描 DOM、插入标签 UI、打开设置面板、响应用户点击。
- Background / Service Worker：`src/background.ts` 是后台脚本，目前主要作为 HTTP 请求代理，接收内容脚本消息后在后台执行 `fetch`。
- SCSS：`src/content.scss` 和各站点的 `.scss` 文件定义注入网页的按钮、弹窗和页面替换相关样式。
- browser-extension-i18n：多语言文案工具，文案文件在 `src/messages/`。
- browser-extension-settings：设置面板工具，`src/content.ts` 里通过 `initSettings` 生成站点设置界面。
- browser-extension-storage：扩展本地存储封装。重命名数据通过它保存到浏览器扩展 storage，而不是普通网页自己的 localStorage。
- browser-extension-utils：DOM 查询、事件绑定、菜单注册、工具函数等封装。
- utags-utils：URL 标准化、标签拆分、标题裁剪等通用工具。
- Sass：SCSS 编译依赖。
- npm-run-all：用于并行或串行执行 npm scripts，例如 `run-p dev:*`、`run-s build:*`。
- cross-env：让 npm scripts 里的环境变量写法兼容不同系统。
- TypeScript compiler：通过 `npm run typecheck` 执行 `tsc --noemit` 做类型检查。

## 浏览器插件相关概念

- Manifest：浏览器插件的声明文件，最终会出现在 `build/*/manifest.json`。项目没有手写完整 manifest，而是主要通过 `package.json` 的 `manifest` 字段和 Plasmo 入口文件生成。
- Content script：注入网页的脚本。它可以读写网页 DOM，所以本项目的文本替换和点击交互基本都在 content script 侧完成。
- Background script：后台脚本。适合做跨域请求、长期消息处理、扩展级状态处理。Chrome MV3 中它通常是 service worker。
- Popup：点击浏览器工具栏插件图标时出现的小窗口，对应 `src/popup.tsx`。
- Options page：扩展详情页里的选项页面，对应 `src/options.tsx`。
- Extension storage：扩展自己的本地存储，不等同于某个网页的 `window.localStorage`。本项目主数据保存在 `extension.utags.urlmap`。
- Web page localStorage：网页域名自己的 localStorage。本项目目前会在网页 localStorage 中使用 `utags_visited` 记录已访问链接。

## 数据结构概览

主数据 key 是 `extension.utags.urlmap`，由 `src/storage/bookmarks.ts` 读写。当前重命名数据结构是：

```json
{
  "data": {
    "https://example.com/page": {
      "newName": "自定义新名字",
      "meta": {
        "title": "Example Page",
        "type": "post",
        "created": 1751356800000,
        "updated": 1751356900000
      }
    }
  },
  "meta": {
    "databaseVersion": 3,
    "extensionVersion": "0.14.2",
    "created": 1751356800000,
    "updated": 1751356900000
  }
}
```

注意：`newName` 是单个字符串，不再做逗号分割。

其他本地数据：

- `extension.utags.recenttags`：最近新增标签的原始统计数组。
- `extension.utags.mostusedtags`：最常用标签列表。
- `extension.utags.recentaddedtags`：最近添加的标签列表。
- `extension.utags.sync_metadata`：和 webapp 同步时使用的元数据。
- `extension.utags.extension_id`：同步适配器生成的本扩展实例 ID。
- `utags_visited`：保存在网页 localStorage 中，用于当前网站的已访问标记。

## 文件夹作用

- `assets/`：插件图标等静态资源。Plasmo 会把图标处理成不同尺寸并放入构建产物。
- `build/`：构建输出目录。执行 `npm run build:chrome` 或 Firefox 构建命令后生成，不建议手动改这里的文件。
- `.plasmo/`：Plasmo 的生成文件和缓存目录。一般不用手动修改。
- `scripts/`：构建后处理脚本。
  - `scripts/common.mjs`：构建脚本公共工具。
  - `scripts/wrap-shadow-root.mjs`：把构建后的 ShadowRoot 脚本包进 IIFE，避免污染页面全局。
- `scripts/chrome/`：Chrome 产物的 manifest 后处理脚本。
  - `scripts/chrome/update-manifest.mjs`：Chrome 构建后清理 manifest。
- `scripts/firefox/`：Firefox MV2/MV3 产物的 manifest 后处理脚本。
  - `scripts/firefox/update-manifest.mjs`：Firefox MV2/MV3 构建后清理 manifest。
- `src/`：插件源码主目录。
- `src/content.ts`：内容脚本主入口。初始化设置、扫描 DOM、替换页面文本、绑定菜单和页面事件，是阅读业务逻辑的第一站。
  - `src/background.ts`：后台脚本。接收 HTTP 请求消息并在扩展后台执行 `fetch`，同时记录请求计数。
  - `src/popup.tsx`：工具栏弹窗。当前主要负责给当前页面发送 `utags:show-settings` 消息来打开设置。
  - `src/options.tsx`：扩展选项页。当前是简单入口页面，真正复杂设置在内容脚本渲染的设置面板里。
- `src/content.scss`：注入网页的全局样式。Rename Username 按钮、弹窗、候选列表、已访问标记等样式都在这里。
  - `src/content-utils.ts`：内容脚本辅助逻辑。负责判断 DOM 变化是否要重新扫描，以及把存储数据转成展示数据。
  - `src/types.ts`：更轻量的全局业务类型，例如 `UserTag`、`UserTagMeta`。
  - `src/global.d.ts`：全局类型声明。给浏览器、userscript 或第三方全局变量补 TypeScript 类型。
- `src/components/`：小型 UI 构造函数，例如弹窗容器和标签元素。
  - `src/components/modal.ts`：创建标签输入弹窗的基础 DOM 结构。
  - `src/components/tag.ts`：创建单个标签元素。
- `src/contents/`：Plasmo 特殊入口或辅助内容脚本，目前用于 ShadowRoot 相关逻辑。
- `src/messages/`：多语言文案。`index.ts` 负责加载各语言文件并初始化 i18n。
  - `src/messages/index.ts`：i18n 初始化入口。
  - `src/messages/zh-cn.ts`、`src/messages/en.ts` 等：各语言文案。
- `src/modules/`：可复用业务模块。大部分标签编辑、扫描、同步、样式、事件绑定逻辑都在这里。
  - `src/modules/advanced-tag-manager.ts`：单击 Rename Username 按钮后出现的高级输入弹窗。
- `src/modules/simple-tag-manger.ts`：简单输入模式的弹窗。
  - `src/modules/global-events.ts`：全局事件中心。处理点击 Rename Username 按钮、保存新名字、history 变化、触摸设备交互等。
  - `src/modules/utags-scanner.ts`：底层 DOM 扫描器。监听页面 DOM 变化并找出候选节点。
  - `src/modules/scanned-node-queue.ts`：扫描结果队列。控制节点处理节奏，避免频繁 DOM 更新造成混乱。
  - `src/modules/utags-registry.ts`：记录元素和已创建标签 UI 的对应关系，方便更新和清理。
  - `src/modules/dom-reference-manager.ts`：用 WeakMap 保存 DOM 元素和标签元数据的关系。
  - `src/modules/style-manager.ts`：组合通用样式和站点样式，并注入 document / ShadowRoot。
  - `src/modules/shadow-root.ts`：处理 Shadow DOM 场景，让插件能在 Web Components 内工作。
  - `src/modules/visited.ts`：已访问标记功能。读写网页 localStorage 的 `utags_visited`。
  - `src/modules/menu-command-manager.ts`：菜单命令管理。负责注册添加/修改标签和快捷标签菜单。
  - `src/modules/star-handler.ts`：快速星标功能的统一处理逻辑。
  - `src/modules/star-icon.ts`：生成星标按钮 SVG。
  - `src/modules/export-import.ts`：导入导出相关桥接逻辑。
  - `src/modules/sync-adapter.ts`：和 webapp 同步本地数据的 postMessage 适配层。
  - `src/modules/webapp-bridge.ts`：页面和 background 之间的 HTTP 请求桥接。
  - `src/modules/debugging.ts`：调试快捷键和调试辅助逻辑。
  - `src/modules/timer-manager.ts`：统一管理 timeout/interval，便于页面卸载时清理。
- `src/sites/`：不同网站的适配规则。每个 `.ts` 文件描述一个网站如何提取 key、title、type 等信息；对应 `.scss` 文件处理该网站的样式微调。
  - `src/sites/index.ts`：站点适配总入口。根据当前域名选择具体网站配置。
  - `src/sites/default.ts`：默认站点适配规则。
  - `src/sites/none.ts`：无适配或禁用适配时使用。
- `src/sites/z001/`：常规站点适配集合。
  - `src/sites/z001/*.ts`：具体网站适配文件。例如 GitHub、YouTube、V2EX 等。
  - `src/sites/z001/*.scss`：具体网站的样式修正。
- `src/sites/z999/`：另一组站点适配集合，命名上用于区分站点分组。
- `src/storage/`：本地存储读写逻辑。
- `src/storage/bookmarks.ts`：主数据存储模块。读写 `extension.utags.urlmap`，保存 URL 到 newName/meta 的映射。
- `src/storage/tags.ts`：名称统计模块。维护最近使用和常用名称。
- `src/types/`：较复杂的业务类型定义。
  - `src/types/bookmarks.ts`：书签和标签数据结构类型定义。想改存储结构时通常要先看这里。
- `src/utils/`：通用工具函数、DOM 工具、事件管理器、控制台包装等。
  - `src/utils/index.ts`：通用工具集合，例如标签排序、数据规范化、DOM 清理、星级标签判断。
  - `src/utils/dom-utils.ts`：把标签 key/meta 写到 DOM 元素或从 DOM 元素取回。
  - `src/utils/event-listener-manager.ts`：集中登记事件监听，便于统一移除。
  - `src/utils/shadow-root-traverser.ts`：遍历普通 DOM 和 Shadow DOM。
  - `src/utils/console.ts`：控制台输出封装。
  - `src/utils/atob.ts`：base64 解码兼容工具。
- `package.json`：Plasmo 扩展配置、npm scripts、依赖和 manifest 基础配置。
- `tsconfig.json`：TypeScript 编译配置。

## 代码阅读路线

1. 先看 `package.json`，理解 npm scripts 和 Plasmo 入口。
2. 再看 `src/content.ts`，理解插件怎么初始化、扫描页面和替换文本。
3. 看 `src/modules/global-events.ts`，理解单击 Rename Username 按钮后如何打开弹窗和保存数据。
4. 看 `src/modules/advanced-tag-manager.ts`，理解新名字输入弹窗 UI。
5. 看 `src/storage/bookmarks.ts` 和 `src/types/bookmarks.ts`，理解存储结构。
6. 看 `src/sites/index.ts` 和一个具体站点文件，例如 `src/sites/z001/005-github.com.ts`，理解如何新增网站适配。
7. 最后看 `src/content.scss` 和站点 `.scss`，理解样式如何注入到网页。

## 新增一个网站适配的大致步骤

1. 在 `src/sites/z001/` 下新增一个 `xxx-example.com.ts`。
2. 按已有站点文件的格式导出配置，至少提供 `matches` 和 `list` 逻辑。
3. 在逻辑里找到页面中的目标 DOM 元素，计算稳定的 `key`，再设置 `meta.title`、`meta.type` 等信息。
4. 如需样式修正，新增同名 `.scss`，并在站点配置里返回样式文本。
5. 在 `src/sites/index.ts` 里确认该站点配置会被加载。
6. 执行 `npm run dev:chrome`，在目标网站上测试 Rename Username 按钮是否出现、点击是否能保存。
