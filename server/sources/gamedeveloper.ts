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

    if (title && link) {
      // 从 URL 中提取子文件夹名
      const folderMatch = link.match(/gamedeveloper\.com\/([^/]+)\//)
      const folder = folderMatch ? folderMatch[1] : undefined

      news.push({
        id: link,
        title,
        url: link,
        pubDate,
        extra: {
          hover: description,
          info: folder,
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
