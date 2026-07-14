import '../src/content'

export default defineContentScript({
  matches: ['https://*/*', 'http://*/*'],
  runAt: 'document_start',
  allFrames: true,
  main() {
    // The imported module owns the content-script startup flow.
  },
})
