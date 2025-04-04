import type { NewsItem } from "@shared/types"
import { load } from "cheerio"
import { myFetch } from "#/utils/fetch"
import { defineSource } from "#/utils/source"

const metacritic = defineSource(async () => {
  try {
    const baseURL = "https://www.3dmgame.com"
    const url = `${baseURL}/original_40_1/`
    console.log("正在获取3DM评测文章...", url)

    const response = await myFetch(url) as string
    console.log("获取到HTML响应，长度:", response.length)

    const $ = load(response)
    const news: NewsItem[] = []

    // 选择所有评测文章
    const items = $(".listb.selectpost")
    console.log("找到评测文章数量:", items.length)

    items.each((_, el) => {
      try {
        const $el = $(el)
        const $title = $el.find(".a_bt.selectarcpost")
        const $time = $el.find(".time")
        const $score = $el.find(".font")
        const $desc = $el.find(".p p")

        const title = $title.text().trim()
        const url = $title.attr("href")
        const timeRaw = $time.text().trim()
        // 移除时间字符串中的<i></i>标签
        const time = timeRaw.replace(/<[^>]+>/g, "").trim()
        const score = $score.text().trim()
        const description = $desc.text().trim()

        console.log("解析评测:", {
          title,
          time,
          url,
          score,
          description: description.substring(0, 50),
        })

        if (title && url && time) {
          const fullUrl = url.startsWith("http") ? url : `${baseURL}${url}`
          const parsedDate = new Date(time)
          console.log("解析时间:", time, "->", parsedDate.toISOString())

          news.push({
            url: fullUrl,
            title,
            id: url,
            extra: {
              date: parsedDate.valueOf(),
              hover: description,
              info: score ? `评分：${score}` : "评测",
            },
          })
        } else {
          console.log("跳过无效评测:", { title, url, time })
        }
      } catch (error) {
        console.error("处理单个评测文章时出错:", error)
      }
    })

    console.log("总共解析到评测文章数:", news.length)
    if (news.length === 0) {
      console.log("警告: 没有解析到任何评测文章!")
    }
    return news
  } catch (error) {
    console.error("获取3DM评测文章时出错:", error)
    return []
  }
})

export default {
  "3dm-metacritic": metacritic,
}
