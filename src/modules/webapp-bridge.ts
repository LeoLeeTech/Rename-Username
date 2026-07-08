/**
 * Webapp 桥接模块：监听页面发来的 HTTP_REQUEST/PING 等 postMessage 消息。
 * 对需要跨域的请求，它会转发给 background 脚本执行，再把结果回传给网页。
 */

// Webapp 桥接消息的数据类型定义。
type HttpRequestPayload = {
  method: string
  url: string
  headers?: Record<string, string>
  body?: string
  timeout?: number
}

type HttpRequestMessage = {
  type: 'HTTP_REQUEST'
  source: 'utags-webapp'
  id: string
  payload: HttpRequestPayload
}

type PingMessage = {
  type: 'PING'
  source: 'utags-webapp'
  id: string
}

type WebappMessage = HttpRequestMessage | PingMessage

type HttpResponseData = {
  ok: boolean
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
}

type HttpResponseMessage = {
  type: 'HTTP_RESPONSE'
  source: 'utags-extension'
  id: string
  payload: HttpResponseData
}

type HttpErrorMessage = {
  type: 'HTTP_ERROR'
  source: 'utags-extension'
  id: string
  payload: {
    error: string
    details?: any
  }
}

type PongMessage = {
  type: 'PONG'
  source: 'utags-extension'
  id: string
}

type ExtensionMessage = HttpResponseMessage | HttpErrorMessage | PongMessage

type BackgroundResponse = {
  success: boolean
  data?: HttpResponseData
  error?: string
  details?: any
}

/**
 * Handle HTTP request message from webapp
 * @param {HttpRequestMessage} message - The HTTP request message
 * @param {MessageEvent} event - The message event
 */
function handleHttpRequest(
  message: HttpRequestMessage,
  event: MessageEvent
): void {
  handleHttpRequestExtension(message, event)
}

/**
 * Handle HTTP request message from webapp
 * @param {HttpRequestMessage} message - The HTTP request message
 * @param {MessageEvent} event - The message event
 */
function handleHttpRequestExtension(
  message: HttpRequestMessage,
  event: MessageEvent
): void {
  const { id, payload } = message
  const { method, url } = payload

  console.log(`[Rename Extension] Processing HTTP request: ${method} ${url}`)

  // Forward request to background script
  chrome.runtime
    .sendMessage({
      type: 'HTTP_REQUEST',
      id,
      payload,
    })
    // eslint-disable-next-line promise/prefer-await-to-then
    .then((response: BackgroundResponse) => {
      if (response.success) {
        sendHttpResponse(id, response.data!, event)
      } else {
        sendHttpError(id, response.error!, event, response.details)
      }
    })
    // eslint-disable-next-line promise/prefer-await-to-then
    .catch((error: unknown) => {
      console.error(
        '[Rename Extension] Error communicating with background script:',
        error
      )
      sendHttpError(id, 'Extension communication error', event, error)
    })
}

/**
 * Handle HTTP request message from webapp
 * @param {HttpRequestMessage} message - The HTTP request message
 * @param {MessageEvent} event - The message event
 */
/**
 * Send HTTP response back to webapp
 * @param {string} requestId - The original request ID
 * @param {HttpResponseData} responseData - The response data
 * @param {MessageEvent} event - The message event
 */
function sendHttpResponse(
  requestId: string,
  responseData: HttpResponseData,
  event: MessageEvent
): void {
  const responseMessage: HttpResponseMessage = {
    type: 'HTTP_RESPONSE',
    source: 'utags-extension',
    id: requestId,
    payload: responseData,
  }

  if (event.source) {
    event.source.postMessage(responseMessage, { targetOrigin: event.origin })
  }
}

/**
 * Send HTTP error back to webapp
 * @param {string} requestId - The original request ID
 * @param {string} error - The error message
 * @param {MessageEvent} event - The message event
 * @param {any} details - Additional error details
 */
function sendHttpError(
  requestId: string,
  error: string,
  event: MessageEvent,
  details?: any
): void {
  const errorMessage: HttpErrorMessage = {
    type: 'HTTP_ERROR',
    source: 'utags-extension',
    id: requestId,
    payload: {
      error,

      details,
    },
  }

  if (event.source) {
    event.source.postMessage(errorMessage, { targetOrigin: event.origin })
  }
}

/**
 * Handle ping message from webapp
 * @param {PingMessage} message - The ping message
 * @param {MessageEvent} event - The message event
 */
function handlePing(message: PingMessage, event: MessageEvent): void {
  console.log('[Rename Extension] Received ping, sending pong')

  const pongMessage: PongMessage = {
    type: 'PONG',
    source: 'utags-extension',
    id: message.id,
  }

  if (event.source) {
    event.source.postMessage(pongMessage, { targetOrigin: event.origin })
  }
}

/**
 * Message listener for webapp communication
 */
function messageListener(event: MessageEvent): void {
  // Security check: only accept messages from the same origin
  if (event.origin !== globalThis.location.origin) {
    return
  }

  const message: HttpRequestMessage | PingMessage | undefined = event.data as
    HttpRequestMessage | PingMessage | undefined
  try {
    // Validate message structure
    if (
      !message ||
      typeof message !== 'object' ||
      !message.type ||
      !message.id
    ) {
      return
    }

    // Only handle messages from webapp
    if (message.source !== 'utags-webapp') {
      return
    }

    console.log(`[Rename Extension] Received message:`, message.type)

    switch (message.type) {
      case 'PING': {
        handlePing(message, event)
        break
      }

      case 'HTTP_REQUEST': {
        handleHttpRequest(message, event)
        break
      }

      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      default: {
        // @ts-expect-error log invalid types
        console.log(`[Rename Extension] Unknown message type: ${message.type}`)
      }
    }
  } catch (error) {
    console.error('[Rename Extension] Error handling message:', error)
    // Send error response if we have a valid message with ID
    if (message && message.id) {
      sendHttpError(
        message.id,
        error instanceof Error ? error.message : String(error),
        event,
        {
          context: 'messageListener',
          messageType: message.type,
        }
      )
    }
  }
}

export function setupWebappBridge(): void {
  // Setup message listener
  window.addEventListener('message', messageListener)
  // Announce extension availability
  console.log('[Rename Extension] ready for HTTP proxy requests')
}

// Optional: Send a ready signal to webapp
// Note: This uses window.postMessage as it's not a response to a specific message
// setTimeout(() => {
//   const readyMessage = {
//     type: 'EXTENSION_READY',
//     source: 'utags-extension',
//     id: `ready-${Date.now()}`,
//     payload: {
//       name: 'Rename HTTP Proxy Extension',
//       version: '1.0.0',
//     },
//   }
//   window.postMessage(readyMessage, '*')
// }, 100)
