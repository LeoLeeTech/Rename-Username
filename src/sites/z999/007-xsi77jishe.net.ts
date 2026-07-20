/**
 * 文件说明：成人或敏感站点适配文件。定义该站点的匹配规则、DOM 选择器、URL 归一化和扫描处理逻辑。
 *
 * 该注释同步自 develop.md，方便打开单个文件时快速理解职责。
 */
import { s1j1 } from '../../utils/atob'
import { Discuz } from '../z001/042-discuz'

const discuz = new Discuz({
  matchesPatternValue: /xs[i1]jishe\.\w+|s[j1]s47\.\w+|s[j1]slt\.cc/,
  normalizeDomainFn(url: string) {
    return url.replace(
      /^https:\/\/(xs[i1]jishe\.\w+|s[j1]s47\.\w+|s[j1]slt\.cc)/,
      `https://x${s1j1}she.net`
    )
  },
  validateDefaultReturnValue: false,
})

export default discuz
