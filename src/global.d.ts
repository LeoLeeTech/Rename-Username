declare module 'css:*' {
  const cssText: string
  export default cssText
}

declare const unsafeWindow: (Window & typeof globalThis) | undefined

declare function GM_registerMenuCommand(
  caption: string,
  onClick: () => void,
  optionsOrAccessKey?:
    | string
    | {
        id?: string | number
        accessKey?: string
        autoClose?: boolean
        title?: string
      }
): number
