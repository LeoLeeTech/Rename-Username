/**
 * 后台脚本：运行在浏览器插件的 background/service worker 环境。
 * 当前主要用于接收内容脚本发来的 HTTP_REQUEST 消息，在扩展后台执行 fetch，
 * 从而给页面侧的 webapp bridge 提供跨域请求代理能力，并记录请求统计。
 */

// HTTP 代理消息的数据类型定义。
type HttpRequestPayload = {
  method: string
  url: string
  headers?: Record<string, string>
  body?: string
  timeout?: number
}

type HttpRequestMessage = {
  type: 'HTTP_REQUEST'
  id: string
  payload: HttpRequestPayload
}

type HttpResponseData = {
  ok: boolean
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
}

type HttpSuccessResponse = {
  success: true
  data: HttpResponseData
}

type HttpErrorResponse = {
  success: false
  error: string
  details?: {
    name?: string
    message?: string
    stack?: string
  }
}

type HttpResponse = HttpSuccessResponse | HttpErrorResponse

type StorageData = Record<string, number>

console.log('Rename Username HTTP Proxy extension background script loaded')

// Storage keys

const STORAGE_KEYS = {
  REQUEST_COUNT: 'utags_request_count',

  LAST_ACTIVITY: 'utags_last_activity',
} as const

/**
 * Update request statistics
 */
async function updateStatistics() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.REQUEST_COUNT])
    const currentCount = (result[STORAGE_KEYS.REQUEST_COUNT] as number) || 0

    await chrome.storage.local.set({
      [STORAGE_KEYS.REQUEST_COUNT]: currentCount + 1,
      [STORAGE_KEYS.LAST_ACTIVITY]: Date.now(),
    })

    console.log(
      `[Rename Username Extension Background] Request count updated: ${currentCount + 1}`
    )
  } catch (error) {
    console.error(
      '[Rename Username Extension Background] Error updating statistics:',
      error
    )
  }
}

/**
 * Handle HTTP request from content script
 * @param {HttpRequestMessage} request - The HTTP request details
 * @returns {Promise<HttpResponse>} Response object
 */
async function handleHttpRequest(
  request: HttpRequestMessage
): Promise<HttpResponse> {
  // Update statistics
  // await updateStatistics()
  const { method, url, headers, body, timeout } = request.payload

  console.log(
    `[Rename Username Extension Background] Processing HTTP request: ${method} ${url}`
  )

  try {
    // Create AbortController for timeout handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, timeout || 30_000)

    // Make the actual HTTP request
    const response = await fetch(url, {
      method,
      headers: headers || {},
      body,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Parse response headers
    const responseHeaders = {}
    for (const [key, value] of response.headers.entries()) {
      responseHeaders[key] = value
    }

    // Get response body
    const responseBody = await response.text()

    console.log(
      `[Rename Username Extension Background] HTTP request successful: ${response.status}`
    )

    return {
      success: true,
      data: {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
      },
    }
  } catch (error) {
    console.error(`[Rename Username Extension Background] HTTP request failed:`, error)

    let errorMessage = 'Network error'
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout'
    } else if (error.message) {
      errorMessage = error.message as string
    }

    return {
      success: false,
      error: errorMessage,
      details: {
        name: error.name as string,
        message: error.message as string,
        stack: error.stack as string,
      },
    }
  }
}

/**
 * Message listener for content script communication
 */
chrome.runtime.onMessage.addListener(
  (
    message: HttpRequestMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: HttpResponse) => void
  ) => {
    console.log(`[Rename Username Extension Background] Received message:`, message.type)

    if (message.type === 'HTTP_REQUEST') {
      // Handle HTTP request asynchronously
      handleHttpRequest(message)
        // eslint-disable-next-line promise/prefer-await-to-then
        .then((response) => {
          sendResponse(response)
        })
        // eslint-disable-next-line promise/prefer-await-to-then
        .catch((error: unknown) => {
          console.error(
            '[Rename Username Extension Background] Error handling HTTP request:',
            error
          )
          sendResponse({
            success: false,
            error: 'Internal extension error',
            details: error as Error,
          })
        })

      // Return true to indicate we will send a response asynchronously
      return true
    }

    // Handle other message types if needed
    console.log(
      `[Rename Username Extension Background] Unknown message type: ${message.type as string}`
    )
    sendResponse({ success: false, error: 'Unknown message type' })
  }
)

/**
 * Extension installation/startup handler
 */
chrome.runtime.onInstalled.addListener(
  (details: chrome.runtime.InstalledDetails) => {
    console.log(
      '[Rename Username Extension Background] Extension installed/updated:',
      details.reason
    )

    if (details.reason === 'install') {
      console.log('[Rename Username Extension Background] First time installation')
    } else if (details.reason === 'update') {
      console.log('[Rename Username Extension Background] Extension updated')
    }
  }
)

/**
 * Extension startup handler
 */
chrome.runtime.onStartup.addListener(() => {
  console.log('[Rename Username Extension Background] Extension started')
})

console.log('[Rename Username Extension Background] Background script ready')
