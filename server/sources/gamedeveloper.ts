import type { NewsItem } from "@shared/types"
import { load } from "cheerio"

const quick = defineSource(async () => {
  const baseURL = "https://www.gamedeveloper.com"
  const url = `${baseURL}/rss.xml`
  const response = await myFetch(url) as any
  const $ = load(response, { xmlMode: true })
  const news: NewsItem[] = []

  $("item").each((_, element) => {
    const title = $(element).find("title").text().trim()
    const link = $(element).find("link").text().trim()
    const pubDate = $(element).find("pubDate").text().trim()
    const description = $(element).find("description").text().trim()
    const creator = $(element).find("dc\\:creator").text().trim()

    if (title && link) {
      news.push({
        id: link,
        title,
        url: link,
        pubDate,
        extra: {
          hover: description,
          info: creator || undefined,
        },
      })
    }
  })

  return news
})

export default defineSource({
  "gamedeveloper": quick,
  "gamedeveloper-quick": quick,
})
