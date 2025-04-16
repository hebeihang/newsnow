import type { NewsItem } from "@shared/types"
import * as cheerio from "cheerio"
import { defineSource } from "#/utils/source"

export default defineSource(async () => {
  const baseURL = "https://indienova.com"
  const url = `${baseURL}/indie-game-development/`
  console.log("正在获取 IndieNova 开发文章数据...")

  const response = await fetch(url)
  const html = await response.text()
  console.log("获取到HTML响应，长度:", html.length)

  const $ = cheerio.load(html)
  const news: NewsItem[] = []

  // 选择所有文章项
  const $items = $(".article-panel")
  console.log("找到文章条目数:", $items.length)

  // 获取每个文章的详细信息
  $items.each((_, element) => {
    const $el = $(element)
    const $title = $el.find("h4 a")

    const title = $title.text().trim()
    const url = $title.attr("href")
    const description = $el.find("p").text().trim()

    if (title && url) {
      news.push({
        id: url,
        title,
        url: url.startsWith("http") ? url : `${baseURL}${url}`,
        extra: {
          hover: description,
        },
      })
    }
  })

  return news
})
