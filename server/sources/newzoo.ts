import type { NewsItem } from "@shared/types"
import * as cheerio from "cheerio"
import { defineSource } from "#/utils/source"

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export default defineSource(async () => {
  const baseURL = "https://newzoo.com"
  const url = `${baseURL}/resources?type=all&tag=all`
  console.log("正在获取 Newzoo 数据...")

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Cache-Control": "max-age=0",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
  }

  let retries = 3
  let lastError: Error | null = null

  while (retries > 0) {
    try {
      await sleep(1000) // 添加1秒延迟
      const response = await fetch(url, { headers })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const html = await response.text()
      console.log("获取到HTML响应，长度:", html.length)

      const $ = cheerio.load(html)
      const news: NewsItem[] = []

      // 选择所有文章项
      $("article").each((_, element) => {
        const $el = $(element)
        const titleElement = $el.find("h2 a")
        const dateElement = $el.find("time span")
        const categoryElements = $el.find("li[id^=\"pill--\"]")

        const title = titleElement.attr("title") || ""
        const url = titleElement.attr("href") || ""
        const date = dateElement.text().trim()
        const categories = categoryElements.map((_, el) => $(el).text().trim()).get()
        const desc = $el.find(".card--post--content--excerpt").text().trim()

        if (title && url) {
          news.push({
            id: url,
            title,
            url: url.startsWith("http") ? url : `${baseURL}${url}`,
            pubDate: date,
            extra: {
              info: categories.join(", "),
              hover: desc,
            },
          })
        }
      })

      if (news.length === 0) {
        throw new Error("没有找到任何新闻数据")
      }

      return news
    } catch (error) {
      lastError = error as Error
      console.error(`获取Newzoo数据失败，剩余重试次数: ${retries - 1}`, error)
      retries--
      if (retries > 0) {
        await sleep(2000) // 失败后等待2秒再重试
      }
    }
  }

  throw lastError || new Error("获取Newzoo数据失败")
})
