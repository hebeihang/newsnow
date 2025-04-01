import type { NewsItem } from "@shared/types"
import { load } from "cheerio"

const quick = defineSource(async () => {
  const baseURL = "https://www.gamesindustry.biz"
  const url = `${baseURL}/archive/news`
  const response = await myFetch(url) as any
  const $ = load(response)
  const news: NewsItem[] = []

  $(".archive__item").each((_, element) => {
    const title = $(element).find(".archive__title").text().trim()
    const linkElement = $(element).find(".archive__title a")
    const link = linkElement.attr("href")
    const publishedAt = $(element).find(".archive__date").text().trim()
    const _author = $(element).find(".archive__author").text().trim()
    const strapline = $(element).find(".archive__strapline").text().trim()

    if (title && link) {
      let fullLink = link
      if (!link.startsWith("http")) {
        fullLink = `${baseURL}${link.startsWith("/") ? link : `/${link}`}`
      }

      news.push({
        id: link,
        title,
        url: fullLink,
        pubDate: publishedAt,
        extra: {
          info: strapline,
          hover: strapline,
        },
      })
    }
  })

  return news
})

export default {
  "gamesindustry": quick,
  "gamesindustry-quick": quick,
} as const
