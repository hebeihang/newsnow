import type { NewsItem } from "@shared/types"
import * as cheerio from "cheerio"
import { defineSource } from "#/utils/source"

export default defineSource(async () => {
  const baseURL = "https://newzoo.com"
  const url = `${baseURL}/resources?type=all&tag=all`
  console.log("正在获取 Newzoo 数据...")

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
      "Cache-Control": "max-age=0",
    },
  })

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

  return news
})
