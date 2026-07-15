# 介绍

Rename Username 是一个浏览器扩展, fork form [Utags](https://github.com/utags/utags)，用来把网页上的用户名替换成你自定义的名字。

- Edge 浏览器安装请点[这](https://microsoftedge.microsoft.com/addons/detail/rename/bnmaifnljjpjhegmbofiikpeaelfipdo)
- Chrome 浏览器安装请点[这](https://chromewebstore.google.com/detail/rename-username/opleppedpfapokehniododgoejhbekfb)

![](public/x.png)
![](public/github.png)
![](public/youtube.png)

# 支持网站

理论上支持所有网站, 并已针对以下网站专门适配

```
GitHub (github.com)
小红书 xiaohongshu (xiaohongshu.com)
抖音 (douyin.com)
B 站 Bilibili (www.bilibili.com)
豆瓣 (douban.com)
微博 (weibo.com, weibo.cn)
知乎 (zhihu.com)
掘金 (juejin.cn)
X(Twitter) (x.com / twitter.com)
Facebook (www.facebook.com)
YouTube (www.youtube.com)
Reddit (www.reddit.com)
TikTok (www.tiktok.com)
Instagram (www.instagram.com)
V2EX (www.v2ex.com)
Greasy Fork (greasyfork.org and sleazyfork.org)
Hacker News (news.ycombinator.com)
Lobsters (lobste.rs)
微信公众号 (mp.weixin.qq.com)
Threads (www.threads.com)
吾爱破解 (www.52pojie.cn)
少数派 (sspai.com)
今日热榜 Rebang.Today (rebang.today)
MyAnimeList (myanimelist.net)
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

这一节面向准备第一次阅读和修改代码的人。这个项目是一个基于 WXT 的浏览器插件，核心逻辑运行在 content script 中：插件把脚本注入到网页，扫描页面上的用户、帖子、视频、仓库等目标元素，然后在这些元素旁边插入 Rename Username 按钮。用户单击按钮后会打开输入弹窗，输入的新名字会保存到浏览器扩展本地存储。

## 目录

- `src/`：扩展源码
- `entrypoints/`：WXT 扩展入口
- `public/`：扩展静态资源
- `package.json`：WXT npm 脚本和依赖
- `wxt.config.ts`：WXT 配置和 manifest 基础信息

## 当前项目使用的技术栈

- TypeScript：项目主要源码语言。大部分业务文件都是 `.ts`，React 页面是 `.tsx`。
- React：用于插件 popup 页面和 options 页面，也就是浏览器工具栏弹窗和扩展选项页。
- WXT：浏览器插件开发框架。它负责识别 `entrypoints/` 下的 content、background、popup、options 入口，并生成 Chrome/Firefox 扩展产物。Edge 可以复用 Chrome MV3 产物。
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

- `entrypoints/`：WXT 入口目录。
  - `entrypoints/content.ts`：普通 isolated world content script 入口，加载 `src/content.ts`。
  - `entrypoints/shadow-root.content.ts`：main world content script 入口，负责 ShadowRoot 拦截逻辑。
  - `entrypoints/background.ts`：background service worker 入口，加载 `src/background.ts`。
  - `entrypoints/popup.html`、`entrypoints/options.html`：WXT HTML 入口，手动挂载 React 页面。
- `public/`：插件图标等静态资源。WXT 会原样复制到构建产物。
- `.output/`：WXT 构建输出目录。执行 `npm run build` 后生成，不建议手动改这里的文件。
- `.wxt/`：WXT 生成的类型和缓存目录。一般不用手动修改。
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
- ShadowRoot 相关入口已迁移到 `entrypoints/shadow-root.content.ts`，具体逻辑仍在 `src/modules/shadow-root.ts`。
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
- `package.json`：WXT npm scripts 和依赖。
- `wxt.config.ts`：WXT 配置、manifest 基础配置，以及兼容旧 `data-text:` SCSS 导入的 Vite 插件。
- `tsconfig.json`：TypeScript 编译配置。
