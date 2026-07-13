# 介绍

Rename Username 是一个浏览器扩展，用来把网页上的用户名替换成你自定义的名字。

- Edge 浏览器安装请点[这](https://microsoftedge.microsoft.com/addons/detail/rename/bnmaifnljjpjhegmbofiikpeaelfipdo) 
- Chrome 浏览器安装请点[这](https://chromewebstore.google.com/detail/rename-username/opleppedpfapokehniododgoejhbekfb)

![](assets/x.png)
![](assets/github.png)
![](assets/youtube.png)

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

这一节只介绍继续开发最常用的内容：怎么把项目跑起来、主要文件分别做什么、以及如何给一个新网站的文章/用户/标题加入适配规则。

## 1. 怎么运行项目

先安装依赖：

```bash
npm install .
```

Chrome 本地开发：

```bash
npm run dev:chrome
```

命令启动后，Plasmo 会生成开发版扩展。打开 Chrome 的扩展管理页：

```text
chrome://extensions/
```

开启“开发者模式”，点击“加载已解压的扩展程序”，选择 Plasmo 输出的开发目录。之后修改代码时，终端会自动重新构建；如果页面效果没有变化，先在扩展管理页点“重新加载”，再刷新目标网页。

Firefox 本地开发：

```bash
npm run dev:firefox
```

类型检查：

```bash
npm run typecheck
```

构建发布包：

```bash
npm run build:chrome
npm run package:chrome
npm run package:edge
npm run build:firefox
npm run package:firefox
```

常用产物位置：

- `build/chrome-mv3-prod/`：Chrome MV3 解压目录。
- `build/chrome-mv3-prod.zip`：Chrome 商店上传包。
- `build/edge-mv3-prod.zip`：Edge 商店上传包，复用 Chrome MV3 包。
- `build/firefox-mv2-prod.zip`：Firefox 上传包。

开发时最常看的页面：

- 插件弹窗：点击浏览器工具栏里的扩展图标。
- 设置面板：点击弹窗里的“设置”，或者页面中的 Rename 按钮弹窗底部“设置”。
- 扩展存储：Chrome DevTools 的 Application 面板里查看 Extension Storage。

## 2. 各文件作用

- `package.json`：项目元信息、npm scripts、依赖、Plasmo manifest 基础配置。插件名称、描述、权限、Firefox `gecko.id` 都主要从这里进入最终 manifest。
- `README.md`：项目说明文档。
- `assets/`：图片资源和商店截图等静态文件。
- `build/`：构建产物目录，不手动改这里的代码。
- `scripts/`：构建后处理脚本。
- `scripts/chrome/update-manifest.mjs`：Chrome 构建后清理 manifest。
- `scripts/firefox/update-manifest.mjs`：Firefox 构建后清理 manifest。
- `scripts/wrap-shadow-root.mjs`：构建后包装 ShadowRoot 脚本，避免污染页面全局。

- `src/content.ts`：最重要的入口文件。它是 content script，负责初始化设置、扫描页面、渲染 Rename 按钮、替换页面文本、绑定全局事件。
- `src/background.ts`：后台脚本。用于处理内容脚本发来的后台请求。
- `src/popup.tsx`：浏览器工具栏弹窗页面。
- `src/options.tsx`：扩展 options 页面。
- `src/content.scss`：注入网页的全局样式，包括 Rename 按钮、弹窗、候选列表等。
- `src/content-utils.ts`：把 DOM 节点和存储数据转换成展示需要的数据。
- `src/global.d.ts`：全局类型声明。
- `src/types.ts`：轻量业务类型。

- `src/components/modal.ts`：弹窗容器构造。
- `src/components/tag.ts`：旧标签元素构造，目前仍有部分历史代码会用到。

- `src/messages/`：多语言文案。
- `src/messages/index.ts`：i18n 初始化入口。
- `src/messages/zh-cn.ts`、`src/messages/en.ts` 等：具体语言文案。

- `src/modules/advanced-tag-manager.ts`：点击 Rename 按钮后打开的输入弹窗。
- `src/modules/simple-tag-manger.ts`：简单输入模式弹窗。
- `src/modules/global-events.ts`：全局事件中心，处理点击 Rename 按钮、打开弹窗、保存新名字。
- `src/modules/utags-scanner.ts`：DOM 扫描器，监听页面变化并找出候选节点。
- `src/modules/scanned-node-queue.ts`：扫描队列，避免页面变化太频繁时反复处理同一批节点。
- `src/modules/utags-registry.ts`：记录页面元素和 Rename UI 的对应关系。
- `src/modules/dom-reference-manager.ts`：用 WeakMap 保存 DOM 元素对应的 key/meta。
- `src/modules/style-manager.ts`：组合并注入全局样式和站点样式。
- `src/modules/shadow-root.ts`：处理 Shadow DOM。
- `src/modules/visited.ts`：已访问标记逻辑，历史功能仍在代码中。
- `src/modules/menu-command-manager.ts`：浏览器/userscript 菜单命令管理。
- `src/modules/star-handler.ts`、`src/modules/star-icon.ts`：快速星标历史功能相关逻辑。
- `src/modules/export-import.ts`：导入导出相关桥接逻辑。
- `src/modules/sync-adapter.ts`：和外部 webapp 同步数据的桥接层。
- `src/modules/webapp-bridge.ts`：页面和 background 之间的请求桥接。
- `src/modules/timer-manager.ts`：统一管理 timeout/interval，方便清理。

- `src/storage/bookmarks.ts`：主数据存储模块。核心数据保存在 `extension.utags.urlmap`，结构是 URL 到 `{ newName, meta }` 的映射。
- `src/storage/tags.ts`：最近使用、常用候选名称的统计逻辑。
- `src/types/bookmarks.ts`：主存储数据类型定义。

- `src/sites/index.ts`：站点适配总入口。它会根据当前域名选择具体站点配置；没有命中特定网站时走默认规则。
- `src/sites/default.ts`：默认站点规则，主要扫描普通链接。
- `src/sites/none.ts`：空站点配置。
- `src/sites/z001/`：常规网站适配文件，例如 GitHub、YouTube、V2EX。
- `src/sites/z999/`：另一组网站适配文件。

- `src/utils/index.ts`：通用工具函数。
- `src/utils/dom-utils.ts`：给 DOM 元素写入 `data-utags_*` 属性的工具。
- `src/utils/event-listener-manager.ts`：集中管理事件监听。
- `src/utils/shadow-root-traverser.ts`：遍历普通 DOM 和 Shadow DOM。
- `src/utils/console.ts`：控制台封装。

## 3. 如何加入一个新文章

这里的“加入一个新文章”，本质是让某个网站里的文章标题、作者、帖子链接等元素被 Rename 识别出来。适配时要做三件事：找到元素、给它一个稳定 key、给它一个可读 title。

默认规则会扫描普通 `a[href]`。如果一个网站的文章标题本身就是正常链接，可能不用写代码也能工作。但现代网站经常有特殊 DOM、相对链接、动态渲染、嵌套结构或需要只匹配某一类链接，这时就要新增站点适配。

新增站点适配的大致步骤：

1. 在 `src/sites/z001/` 下新增一个文件，例如：

```text
src/sites/z001/043-eleduck.com.ts
```

2. 参考已有站点文件写一个配置。最小结构通常包含：

```ts
import defaultSite from '../default'

export default (() => {
  return {
    matches: /eleduck\.com/,
    matchedNodesSelectors: [
      ...defaultSite.matchedNodesSelectors,
      '.post-title a[href]',
    ],
    validate(element: HTMLElement, href: string) {
      return href.includes('/posts/')
    },
    excludeSelectors: [...defaultSite.excludeSelectors],
  }
})()
```

3. 如果目标元素不是 `a[href]`，需要在站点适配的 `preProcess` 里给元素补 `data-utags_link` 和 `data-utags_title`。例如：

```ts
preProcess() {
  for (const element of document.querySelectorAll('.post-title')) {
    const link = element.querySelector('a[href]') as HTMLAnchorElement | null
    if (!link) continue

    element.setAttribute('data-utags_link', link.href)
    element.setAttribute('data-utags_title', link.textContent?.trim() || '')
  }
}
```

4. 在 `src/sites/index.ts` 里导入并加入 `sites` 列表：

```ts
import eleduck from './z001/043-eleduck.com'

const sites: Site[] = [
  eleduck,
  // ...
]
```

5. 如果按钮位置或页面布局不对，再新增同名样式文件，例如：

```text
src/sites/z001/043-eleduck.com.scss
```

然后在站点配置里引入并返回：

```ts
import styleText from 'data-text:./043-eleduck.com.scss'

getStyle: () => styleText
```

6. 启动开发环境测试：

```bash
npm run dev:chrome
```

打开目标页面，确认三件事：

- 鼠标移到目标标题/作者附近时，Rename 按钮能出现。
- 点击按钮能打开输入弹窗。
- 保存后刷新页面，新名字仍然能显示。

调试时常用的浏览器控制台检查：

```js
document.querySelectorAll('a[href]').length
document.querySelector('.post-title a')?.href
document.querySelector('.post-title a')?.textContent
```

如果默认链接规则能选中元素，但插件没有显示按钮，重点检查：当前网站是否启用、元素是否被 `excludeSelectors` 排除、`href` 是否能变成合法 URL、`textContent` 是否为空。

# 是从 utags 仓库 fork 的
utags 地址: https://github.com/utags/utags
Rename Username 是基于 `utags/utags` 仓库 fork 并改造出来的浏览器扩展。当前项目保留了一部分历史命名、数据 key 和内部模块名，例如 `utags_*`、`extension.utags.urlmap`，这是为了减少迁移风险和保持已有逻辑稳定。
