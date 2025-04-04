import type { NewsItem } from "@shared/types"
import { load } from "cheerio"
import { myFetch } from "#/utils/fetch"
import { defineSource } from "#/utils/source"

const news = defineSource(async () => {
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
    const author = $(element).find(".archive__author").text().trim()
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
          hover: strapline,
          info: author || undefined,
        },
      })
    }
  })

  return news
})

export default {
  "gamesindustry-news": news,
} as const
