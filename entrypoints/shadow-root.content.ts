import { interceptShadowDOM } from '../src/modules/shadow-root'

export default defineContentScript({
  matches: ['https://*/*', 'http://*/*'],
  runAt: 'document_start',
  allFrames: true,
  world: 'MAIN',
  globalName: false,
  main() {
    interceptShadowDOM()
  },
})
