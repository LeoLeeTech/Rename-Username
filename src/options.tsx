/**
 * 插件选项页：浏览器扩展详情页里的 options 页面。
 * 当前只放了少量跳转链接；真正的站点设置面板由内容脚本通过 browser-extension-settings 渲染。
 */
function IndexOptions() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        width: '500px',
      }}>
      <h1>Rename</h1>
      <ul
        style={{
          display: 'flex',
          flexDirection: 'column',
          listStyleType: 'none',
          padding: 16,
        }}>
        <li>
          <a href="https://utags.link/" target="_blank">
            链接列表
          </a>
        </li>
        <li>
          <a href="https://utags.link/" target="_blank">
            导出数据/导入数据
          </a>
        </li>
      </ul>
      <footer>
        Made with ❤️ by{' '}
        <a href="https://www.pipecraft.net/" target="_blank">
          Pipecraft
        </a>
      </footer>
    </div>
  )
}

export default IndexOptions
