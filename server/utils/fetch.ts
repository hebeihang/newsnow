import { $fetch } from "ofetch"

export const myFetch = $fetch.create({
  headers: {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  },
  timeout: 10000,
  retry: 5,
  retryDelay: 1000,
  onResponseError({ response }) {
    if (response.status >= 500 || response.status === 506) {
      throw new Error(`HTTP Error: ${response.status}`)
    }
  },
  onRequest({ options }) {
    // 在 Cloudflare Workers 中，需要设置特定的请求头
    const headers = new Headers(options.headers)
    headers.set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
    headers.set("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8")
    headers.set("Cache-Control", "no-cache")
    headers.set("Pragma", "no-cache")
    options.headers = headers
  },
  onResponse({ response }) {
    // 确保响应是字符串类型
    if (typeof response._data === "string") {
      return response._data
    }
    return response._data
  },
})
