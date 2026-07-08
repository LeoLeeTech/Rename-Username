/**
 * 插件弹窗页面：点击浏览器工具栏里的插件图标时显示。
 * 这里提供一个入口，把消息发给当前标签页的内容脚本，让内容脚本打开设置面板。
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
      <footer>
        Open Source on the{' '}
        <a href="https://github.com/LeoLeeTech/Rename-Username" target="_blank">
          LeoLeeTech/Rename
        </a>
      </footer>
    </div>
  )
}

export default IndexPopup
