import { readFileSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import { compileString } from 'sass'
import { defineConfig } from 'wxt'

const dataTextPrefix = '\0legacy-data-text:'

export default defineConfig({
  manifest: {
    name: 'Rename Username',
    description:
      'Rename usernames on websites and keep custom names locally in your browser.',
    permissions: ['storage'],
    host_permissions: ['https://*/*', 'http://*/*'],
    icons: {
      16: 'icon.png',
      32: 'icon.png',
      48: 'icon.png',
      128: 'icon.png',
    },
  },
  vite: (env) => ({
    define: {
      'process.env.PLASMO_TAG': JSON.stringify(
        env.mode === 'production' ? 'prod' : env.mode
      ),
      'process.env.PLASMO_TARGET': JSON.stringify(
        `${env.browser}-mv${env.manifestVersion}`
      ),
    },
    plugins: [
      {
        name: 'legacy-data-text',
        enforce: 'pre',
        resolveId(source, importer) {
          if (!source.startsWith('data-text:')) {
            return
          }

          const request = source.slice('data-text:'.length)
          const absolutePath = isAbsolute(request)
            ? request
            : resolve(importer ? dirname(importer) : process.cwd(), request)

          return (
            dataTextPrefix + Buffer.from(absolutePath).toString('base64url')
          )
        },
        load(id) {
          if (!id.startsWith(dataTextPrefix)) {
            return
          }

          const filePath = Buffer.from(
            id.slice(dataTextPrefix.length),
            'base64url'
          ).toString()
          const source = readFileSync(filePath, 'utf8')
          const text = filePath.endsWith('.scss')
            ? compileString(source, {
                url: new URL(`file://${filePath}`),
              }).css
            : source

          return `export default ${JSON.stringify(text)}`
        },
      },
    ],
  }),
})
