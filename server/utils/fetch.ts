import { $fetch } from "ofetch"
import { logger } from "./logger"

export const myFetch = $fetch.create({
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "cross-site",
    "Sec-Fetch-User": "?1",
    "DNT": "1",
    "Sec-CH-UA": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
    "Sec-CH-UA-Mobile": "?0",
    "Sec-CH-UA-Platform": "\"Windows\"",
  },
  timeout: 20000,
  retry: 3,
  retryDelay: 3000,
  onRequest({ options, request }) {
    if (request.toString().includes("3dmgame.com")) {
      const headers = new Headers(options.headers)
      headers.set("Referer", "https://www.3dmgame.com/")
      headers.set("Origin", "https://www.3dmgame.com")
      options.headers = Object.fromEntries(headers.entries())
    }
    logger.info("发起请求", {
      url: request,
      headers: options.headers,
    })
  },
  onRequestError({ error, request }) {
    logger.error("请求错误", {
      url: request,
      error: error?.message || "Unknown error",
      stack: error?.stack,
    })
  },
  onResponse({ response }) {
    logger.info("收到响应", {
      status: response.status,
      headers: response.headers,
      size: response._data?.length,
    })
    if (typeof response._data === "string") {
      return response._data
    }
    return response._data
  },
  onResponseError({ response, error }) {
    logger.error("响应错误", {
      status: response.status,
      error: error?.message || "Unknown error",
      data: response._data,
    })
    if (response.status >= 500 || response.status === 506) {
      throw new Error(`HTTP Error: ${response.status}`)
    }
  },
})
