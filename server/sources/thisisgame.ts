import type { NewsItem } from "@shared/types"
import { load } from "cheerio"
import { myFetch } from "#/utils/fetch"
import { defineSource } from "#/utils/source"

const news = defineSource(async () => {
  const baseURL = "https://www.thisisgame.com"
  const url = `${baseURL}/webzine/news/nboard/4/?category=2`
  const response = await myFetch(url) as any
  const $ = load(response)
  const newsItems: NewsItem[] = []

  $(".article-info").each((_, element) => {
    const title = $(element).find(".subject a").text().trim()
    const link = $(element).find(".subject a").attr("href")
    const subtitle = $(element).find(".subtitle a").text().trim()
    const pubDate = $(element).find(".date").text().trim()

    if (title && link) {
      let fullLink = link
      if (!link.startsWith("http")) {
        fullLink = `${baseURL}/webzine/news/nboard/4/${link}`
      }

      newsItems.push({
        id: link,
        title,
        url: fullLink,
        pubDate,
        extra: {
          info: subtitle,
        },
      })
    }
  })

  return newsItems
})

export default {
  "thisisgame-news": news,
}
