// 使用 node 内置的 fetch API
import * as cheerio from "cheerio"
import type { NewsItem, Source } from "../../shared/types"

export const source: Source = {
  name: "Deconstructor of Fun",
  interval: 60 * 60 * 1000, // 1小时，单位毫秒
  color: "green",
  type: "dev",
  column: "world",
  home: "https://www.deconstructoroffun.com/blog",
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return response
      if (i === retries - 1) throw new Error(`HTTP error! status: ${response.status}`)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  throw new Error("Max retries reached")
}

export async function fetchNews(): Promise<NewsItem[]> {
  try {
    console.log("开始获取 Deconstructor of Fun 数据...")
    const res = await fetchWithRetry("https://www.deconstructoroffun.com/blog", {
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

    const html = await res.text()
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

    blogItems.each((_, el) => {
      try {
        const title = $(el).find(".entry-title").text().trim()
        const href = $(el).find(".entry-title a").attr("href")
        const url = href
          ? href.startsWith("http") ? href : `https://www.deconstructoroffun.com${href}`
          : ""
        const category = $(el).find(".blog-category").text().trim() || "Business"
        const date = $(el).find(".dt-published").attr("datetime") || ""
        const desc = $(el).find(".entry-excerpt p").text().trim()

        console.log("处理文章：", { title, url })

        if (title && url) {
          items.push({
            id: url,
            title,
            url,
            pubDate: date,
            extra: {
              info: category,
              hover: desc,
            },
          })
        } else {
          console.warn("文章缺少标题或URL：", { title, url })
        }
      } catch (itemErr) {
        console.error("处理单个文章时出错：", itemErr)
      }
    })

    if (items.length === 0) {
      console.error("未能成功解析任何文章")
      throw new Error("Failed to parse any articles")
    }

    console.log("成功解析文章数量：", items.length)
    return items
  } catch (err) {
    console.error("deconstructoroffun 抓取失败：", err instanceof Error ? err.stack : err)
    if (err instanceof Error) {
      console.error("错误详情：", {
        message: err.message,
        name: err.name,
        stack: err.stack,
      })
    }
    throw err // 向上抛出错误，让调用者处理
  }
}

export default {
  deconstructoroffun: fetchNews,
}
