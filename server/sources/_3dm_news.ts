import type { NewsItem } from "@shared/types"
import { load } from "cheerio"
import { parseRelativeDate } from "#/utils/date"
import { myFetch } from "#/utils/fetch"
import { defineSource } from "#/utils/source"

const quick = defineSource(async () => {
  const baseURL = "https://www.3dmgame.com"
  const url = `${baseURL}/news/`
  console.log("正在获取3DM新闻...")
  const response = await myFetch(url) as string
  console.log("获取到HTML响应，长度:", response.length)

  const $ = load(response)
  const news: NewsItem[] = []

  // 选择所有新闻项
  const $items = $(".Revision_list ul li.selectpost")
  console.log("找到新闻条目数:", $items.length)

  $items.each((_, el) => {
    const $el = $(el)
    const $title = $el.find(".text .bt")
    const $time = $el.find(".bq .time")
    const $desc = $el.find(".miaoshu")
    const $link = $el.find(".text .bt")
    const $category = $el.find(".bq .a")

    const title = $title.text().trim()
    const time = $time.text().trim()
    const description = $desc.text().trim()
    const url = $link.attr("href")
    const category = $category.text().trim()

    console.log("解析新闻:", {
      title,
      time,
      url,
      category,
      description: `${description.substring(0, 50)}...`,
    })

    if (title && url && time) {
      const fullUrl = url.startsWith("http") ? url : `${baseURL}${url}`
      const parsedDate = parseRelativeDate(time, "Asia/Shanghai")
      console.log("处理时间:", time, "转换后:", new Date(parsedDate.valueOf()).toISOString())

      news.push({
        url: fullUrl,
        title,
        id: url,
        extra: {
          date: parsedDate.valueOf(),
          hover: description,
          info: category || "游戏新闻",
        },
      })
    } else {
      console.log("跳过无效新闻:", { title, url, time })
    }
  })

  console.log("总共解析到新闻数:", news.length)
  if (news.length === 0) {
    console.log("警告: 没有解析到任何新闻!")
  }
  return news
})

export default {
  "3dm-news": quick,
}
