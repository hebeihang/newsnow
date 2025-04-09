import type { NewsItem } from "@shared/types"
import { load } from "cheerio"
import { myFetch } from "#/utils/fetch"
import { defineSource } from "#/utils/source"
import { logger } from "#/utils/logger"

const metacritic = defineSource(async () => {
  try {
    const baseURL = "https://www.3dmgame.com"
    const url = `${baseURL}/original_40_1/`
    logger.info("正在获取3DM评测文章...", { url })

    const response = await myFetch(url, {
      retry: 3,
      retryDelay: 2000,
      headers: {
        Referer: "https://www.3dmgame.com/",
        Origin: "https://www.3dmgame.com",
      },
    }) as string

    // 验证响应内容
    if (!response || typeof response !== "string") {
      logger.error("获取3DM评测文章失败: 响应格式错误", {
        type: typeof response,
        length: response ? response.length : 0,
      })
      return []
    }

    // 检查响应是否包含预期的HTML内容
    if (!response.includes("listb selectpost")) {
      logger.error("获取3DM评测文章失败: 响应内容不符合预期", {
        preview: response.substring(0, 200),
      })
      return []
    }

    const $ = load(response)
    const news: NewsItem[] = []

    // 选择所有评测文章
    const items = $(".listb.selectpost")
    logger.info("找到评测文章数量:", { count: items.length })

    if (items.length === 0) {
      logger.error("未找到评测文章，HTML结构可能已改变", {
        availableClasses: $("[class]").map((_, el) => $(el).attr("class")).get().slice(0, 10),
      })
      return []
    }

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
        const time = timeRaw.replace(/<[^>]+>/g, "").trim()
        const score = $score.text().trim()
        const description = $desc.text().trim()

        if (!title || !url || !time) {
          logger.warn("跳过无效评测:", { title, url, time })
          return
        }

        const fullUrl = url.startsWith("http") ? url : `${baseURL}${url}`
        const parsedDate = new Date(time)

        if (Number.isNaN(parsedDate.getTime())) {
          logger.warn("无效的日期格式:", { time })
          return
        }

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
      } catch (err) {
        const error = err as Error
        logger.error("处理单个评测文章时出错:", {
          message: error.message,
          stack: error.stack,
        })
      }
    })

    logger.info("解析完成", {
      total: news.length,
      firstItem: news[0]
        ? {
            title: news[0].title,
            date: news[0].extra?.date ? new Date(news[0].extra.date).toISOString() : undefined,
          }
        : null,
    })
    return news
  } catch (err) {
    const error = err as Error
    logger.error("获取3DM评测文章时出错:", {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
    })
    return []
  }
})

export default {
  "3dm-metacritic": metacritic,
}
