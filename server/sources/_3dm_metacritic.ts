import type { NewsItem } from "@shared/types"
import { load } from "cheerio"
import { myFetch } from "#/utils/fetch"
import { defineSource } from "#/utils/source"

interface FetchOptions {
  retry?: number
  retryDelay?: number
  headers?: Record<string, string>
}

async function fetchWithFallback(url: string, options: FetchOptions = {}) {
  try {
    console.log("开始获取3DM评测文章", { url, options })
    // 尝试直接获取
    const response = await myFetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    })
    console.log("成功获取3DM评测文章", { url, responseLength: response?.length })
    return response
  } catch (err) {
    const error = err as Error
    console.error("直接获取失败", { url, error: error.message, stack: error.stack })

    // 尝试使用移动版页面
    const mobileUrl = url.replace("www.", "m.")
    try {
      console.log("尝试访问移动版页面", { url: mobileUrl })
      const response = await myFetch(mobileUrl, {
        ...options,
        headers: {
          ...(options.headers || {}),
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        },
      })
      console.log("成功获取移动版页面", { url: mobileUrl, responseLength: response?.length })
      return response
    } catch (err) {
      const mobileError = err as Error
      console.error("移动版页面获取失败", { url: mobileUrl, error: mobileError.message, stack: mobileError.stack })
      throw error // 抛出原始错误
    }
  }
}

const metacritic = defineSource(async () => {
  try {
    const baseURL = "https://www.3dmgame.com"
    const url = `${baseURL}/original_40_1/`
    console.log("正在获取3DM评测文章...", { url })

    const response = await fetchWithFallback(url, {
      retry: 3,
      retryDelay: 2000,
      headers: {
        "Referer": "https://www.3dmgame.com/",
        "Origin": "https://www.3dmgame.com",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
    }) as string

    // 验证响应内容
    if (!response || typeof response !== "string") {
      console.error("获取3DM评测文章失败: 响应格式错误", {
        type: typeof response,
        length: response ? response.length : 0,
      })
      return []
    }

    // 记录响应内容的前200个字符，用于调试
    console.log("响应内容预览:", {
      preview: response.substring(0, 200),
    })

    const $ = load(response)
    const news: NewsItem[] = []

    // 更新选择器以适应新的HTML结构
    const items = $(".selectpost, .original_list, .list_box, .news-item, .news_list li")
    console.log("找到评测文章数量:", { count: items.length })

    if (items.length === 0) {
      console.error("未找到评测文章，HTML结构可能已改变", {
        availableClasses: $("[class]").map((_, el) => $(el).attr("class")).get().slice(0, 10),
      })
      // 记录完整的HTML结构
      console.error("完整HTML结构:", {
        html: $.html(),
      })
      return []
    }

    items.each((_, el) => {
      try {
        const $el = $(el)
        // 更新选择器以适应新的HTML结构
        const $title = $el.find("a[title], .bt a, h3 a, .tit a, .news_tit a")
        const $time = $el.find(".time, .time_box, .date, .news_time")
        const $score = $el.find(".font, .score, .rating, .news_score")
        const $desc = $el.find(".p p, .text_box, .desc, .news_desc")

        const title = $title.text().trim()
        const url = $title.attr("href")
        const timeRaw = $time.text().trim()
        const time = timeRaw.replace(/<[^>]+>/g, "").trim()
        const score = $score.text().trim()
        const description = $desc.text().trim()

        console.log("解析文章信息", {
          title,
          url,
          time,
          score,
          description: description.substring(0, 50),
        })

        if (!title || !url || !time) {
          console.warn("跳过无效评测:", { title, url, time })
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
            console.warn("无效的日期格式:", { time })
            return
          }
        } catch (err) {
          const error = err as Error
          console.warn("日期解析失败:", { time, error: error.message })
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
        console.error("处理单个评测文章时出错:", {
          message: error.message,
          stack: error.stack,
        })
      }
    })

    console.log("解析完成", {
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
    console.error("获取3DM评测文章时出错:", {
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
