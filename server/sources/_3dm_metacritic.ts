import type { NewsItem } from "@shared/types"
import { load } from "cheerio"
import { myFetch } from "#/utils/fetch"
import { defineSource } from "#/utils/source"
import { logger } from "#/utils/logger"

interface FetchOptions {
  retry?: number
  retryDelay?: number
  headers?: Record<string, string>
}

async function fetchWithFallback(url: string, options: FetchOptions = {}) {
  try {
    // 尝试直接获取
    const response = await myFetch(url, options)
    return response
  } catch (err) {
    const error = err as Error
    logger.warn("直接获取失败，尝试备用方法", { error: error.message })

    // 尝试使用移动版页面
    try {
      const mobileUrl = url.replace("www.", "m.")
      logger.info("尝试访问移动版页面", { url: mobileUrl })
      const response = await myFetch(mobileUrl, {
        ...options,
        headers: {
          ...(options.headers || {}),
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        },
      })
      return response
    } catch (err) {
      const mobileError = err as Error
      logger.error("移动版页面获取失败", { error: mobileError.message })
      throw error // 抛出原始错误
    }
  }
}

const metacritic = defineSource(async () => {
  try {
    const baseURL = "https://www.3dmgame.com"
    const url = `${baseURL}/original_40_1/`
    logger.info("正在获取3DM评测文章...", { url })

    const response = await fetchWithFallback(url, {
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
    if (!response.includes("listb selectpost") && !response.includes("original_list")) {
      logger.error("获取3DM评测文章失败: 响应内容不符合预期", {
        preview: response.substring(0, 200),
      })
      return []
    }

    const $ = load(response)
    const news: NewsItem[] = []

    // 尝试不同的选择器
    const items = $(".listb.selectpost, .original_list")
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
        // 支持多个可能的选择器
        const $title = $el.find(".a_bt.selectarcpost, .bt a")
        const $time = $el.find(".time, .time_box")
        const $score = $el.find(".font, .score")
        const $desc = $el.find(".p p, .text_box")

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
        let parsedDate: Date

        try {
          // 尝试解析多种日期格式
          if (time.includes("前") || time.includes("天") || time.includes("小时")) {
            // 处理相对时间
            const now = new Date()
            if (time.includes("天前")) {
              const days = Number.parseInt(time)
              parsedDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
            } else if (time.includes("小时前")) {
              const hours = Number.parseInt(time)
              parsedDate = new Date(now.getTime() - hours * 60 * 60 * 1000)
            } else {
              parsedDate = now
            }
          } else {
            parsedDate = new Date(time)
          }

          if (Number.isNaN(parsedDate.getTime())) {
            logger.warn("无效的日期格式:", { time })
            return
          }
        } catch (err) {
          const error = err as Error
          logger.warn("日期解析失败:", { time, error: error.message })
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
