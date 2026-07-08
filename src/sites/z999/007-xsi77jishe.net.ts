import { SIJI_DOMAIN_PART } from '../../utils/domain-parts'
import { Discuz } from '../z001/042-discuz'

const discuz = new Discuz({
  matchesPatternValue: /xs[i1]jishe\.\w+|s[j1]s47\.\w+|s[j1]slt\.cc/,
  normalizeDomainFn(url: string) {
    return url.replace(
      /^https:\/\/(xs[i1]jishe\.\w+|s[j1]s47\.\w+|s[j1]slt\.cc)/,
      `https://x${SIJI_DOMAIN_PART}she.net`
    )
  },
  validateDefaultReturnValue: false,
})

export default discuz
