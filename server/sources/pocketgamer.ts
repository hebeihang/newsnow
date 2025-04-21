import type { NewsItem } from "@shared/types"
import { load } from "cheerio"
import { myFetch } from "#/utils/fetch"
import { defineSource } from "#/utils/source"

const news = defineSource(async () => {
  const baseURL = "https://www.pocketgamer.biz"
  const url = `${baseURL}/news/`
  const response = await myFetch(url) as any
  const $ = load(response)
  const news: NewsItem[] = []

  $(".txt").each((_, element) => {
    const $el = $(element)
    const title = $el.find("h1").text().trim()
    const date = $el.find("time").attr("datetime") || $el.find("time").text().trim()
    const category = $el.find(".cat").text().trim()
    const excerpt = $el.find(".strap").text().trim()

    // 获取链接（通常需要从父级或外层a标签获取，如果有的话）
    let link = ""
    const $parentA = $el.closest("a")
    if ($parentA.length) {
      link = $parentA.attr("href") || ""
    }
    // 或者根据实际结构获取链接

    if (title && link) {
      let fullLink = link
      if (!link.startsWith("http")) {
        fullLink = `https://www.pocketgamer.biz${link.startsWith("/") ? link : `/${link}`}`
      }

      news.push({
        id: link,
        title,
        url: fullLink,
        pubDate: date,
        extra: {
          hover: excerpt,
          info: category,
        },
      })
    }
  })

  return news
})

export default {
  "pocketgamer-news": news,
} as const
