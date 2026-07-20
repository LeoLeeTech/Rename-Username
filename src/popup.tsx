/**
 * 文件说明：浏览器工具栏弹窗入口。提供打开当前页面内设置面板的按钮，并放置跳转到 UTags 链接列表的入口。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import { i } from './messages'

function IndexPopup() {
  const openSettings = () => {
    const api: any = (globalThis as any).chrome ?? (globalThis as any).browser
    try {
      if (api?.tabs?.query && api?.tabs?.sendMessage) {
        api.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
          const tabId = tabs?.[0]?.id
          if (tabId) {
            api.tabs.sendMessage(tabId, { type: 'utags:show-settings' })
            try {
              window.close()
            } catch {}
          }
        })
      }
    } catch {
      // ignore
    }

    // Fallback: close popup even if messaging is unavailable
    try {
      window.close()
    } catch {}
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: 16,
        width: '300px',
      }}>
      <h1>{i('settings.title')}</h1>
      <button
        onClick={openSettings}
        style={{ marginTop: 8, marginBottom: 20, width: '100%' }}>
        {i('prompt.settings')}
      </button>
      <ul
        style={{
          display: 'flex',
          flexDirection: 'column',
          listStyleType: 'none',
          padding: 16,
        }}>
      </ul>
      <footer>
        Made with ❤️ by{' '}
        <a href="https://github.com/LeoLeeTech" target="_blank">
          李吉磊 Leo Lee
        </a>
      </footer>
    </div>
  )
}

export default IndexPopup
