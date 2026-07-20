/**
 * 文件说明：扩展选项页入口。当前提供链接列表、导入导出等外部页面入口。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
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
      <h1>小鱼标签 (UTags)</h1>
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
