// 使用 node 内置的 fetch API
import * as cheerio from "cheerio"
import type { NewsItem, Source } from "../../shared/types"
import { defineSource } from "#/utils/source"

// 添加日期转换函数
function formatDateToChinese(dateStr: string): string {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}年${month}月${day}日`
}

export const source: Source = {
  name: "Deconstructor of Fun",
  interval: 60 * 60 * 1000, // 1小时，单位毫秒
  color: "green",
  type: "dev",
  column: "world",
  home: "https://www.deconstructoroffun.com/blog",
}

const BASE_URL = "https://www.deconstructoroffun.com"

export default defineSource(async () => {
  console.log("正在获取 Deconstructor of Fun 数据...")
  const response = await fetch(`${BASE_URL}/blog`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
      "Cache-Control": "max-age=0",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
    },
  })

  const html = await response.text()
  console.log("成功获取页面内容，长度：", html.length)

  if (!html || html.length < 100) {
    console.error("获取到的页面内容异常，长度过短")
    throw new Error("Invalid HTML content")
  }

  const $ = cheerio.load(html)
  const items: NewsItem[] = []

  const blogItems = $("article.entry")
  console.log("找到博客条目数量：", blogItems.length)

  if (blogItems.length === 0) {
    console.error("未找到任何博客条目，可能网站结构已更改")
    throw new Error("No blog items found")
  }

  blogItems.each((_, element) => {
    const $el = $(element)
    const title = $el.find("h2.entry-title a").text().trim()
    const link = $el.find("h2.entry-title a").attr("href")
    const dateStr = $el.find("time.entry-date").attr("datetime") || $el.find("time.entry-date").text().trim()
    const excerpt = $el.find(".entry-content p").first().text().trim()

    // 获取文章分类
    const categories: string[] = []
    $el.find(".blog-category").each((_, el) => {
      categories.push($(el).text().trim())
    })
    const category = categories.join("、") || "Business"

    if (title && link) {
      // 移除任何现有的域名部分，只保留路径
      const cleanLink = link.replace(/^https?:\/\/[^/]+/, "")
      const url = `${BASE_URL}${cleanLink.startsWith("/") ? cleanLink : `/${cleanLink}`}`

      items.push({
        id: url,
        title,
        url,
        pubDate: formatDateToChinese(dateStr), // 使用转换后的中文日期
        extra: {
          hover: excerpt,
          info: category,
        },
      })
    }
  })

  return items
})
