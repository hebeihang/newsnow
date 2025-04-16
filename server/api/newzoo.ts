export default defineEventHandler(async (_event) => {
  console.log("正在获取 Newzoo 数据...")

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Referer": "https://newzoo.com/",
    "Cache-Control": "max-age=0",
    "Sec-Ch-Ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": "\"Windows\"",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
  }

  try {
    console.log("发起请求", { url: "https://newzoo.com/resources?type=all&tag=all", headers })
    const response = await $fetch("https://newzoo.com/resources?type=all&tag=all", {
      headers,
      retry: 3,
      retryDelay: 1000,
      onResponse({ response }) {
        console.log("收到响应", {
          status: response.status,
          headers: response.headers,
          size: response._data?.length,
        })
      },
      async onRequestError({ error }) {
        console.error("请求错误", error)
        throw error
      },
      async onResponseError({ response }) {
        console.error("响应错误", {
          status: response.status,
          error: response._data?.error || "Unknown error",
          data: response._data,
        })
        throw new Error(`HTTP ${response.status}`)
      },
    })

    return response
  } catch (error) {
    console.error("Failed to fetch data for newzoo:", error)
    throw error
  }
})
