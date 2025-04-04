import type { NewsItem } from "@shared/types"
import { load } from "cheerio"
import { myFetch } from "#/utils/fetch"
import { defineSource } from "#/utils/source"

const article = defineSource(async () => {
  const baseURL = "https://indienova.com"
  const url = `${baseURL}/indie-game-news/`
  console.log("正在获取 IndieNova 文章数据...")

  const response = await myFetch(url) as string
  console.log("获取到HTML响应，长度:", response.length)

  const $ = load(response)
  const news: NewsItem[] = []

  // 修改选择器
  const $items = $(".article-panel")
  console.log("找到文章条目数:", $items.length)

  // 获取每个文章的详细信息
  for (const el of $items.toArray()) {
    const $el = $(el)
    const $title = $el.find("h4 a")

    const title = $title.text().trim()
    const url = $title.attr("href")
    const description = $el.find("p").text().trim()

    if (title && url) {
      const fullUrl = url.startsWith("http") ? url : `${baseURL}${url}`

      try {
        // 获取文章详情页面
        console.log("获取文章详情:", fullUrl)
        const detailResponse = await myFetch(fullUrl) as string
        const $detail = load(detailResponse)

        // 获取文章内容
        const $content = $detail("article .entry-content")
        const fullDescription = $content.text().trim()

        // 获取文章分类
        const categories: string[] = []
        $detail(".entry-meta .cat-links a").each((_, el) => {
          categories.push($(el).text().trim())
        })
        const category = categories.join("、") || "独立游戏"

        // 获取发布日期
        const dateText = $detail(".entry-meta time").attr("datetime")
        const date = dateText ? new Date(dateText) : new Date()

        news.push({
          url: fullUrl,
          title,
          id: url,
          extra: {
            date: date.valueOf(),
            hover: description || fullDescription.substring(0, 200) || "暂无描述",
            info: category,
          },
        })
      } catch (error) {
        console.error("处理文章详情失败:", fullUrl, error)
      }
    } else {
      console.log("跳过无效文章:", { title, url })
    }
  }

  console.log("总共解析到文章数:", news.length)
  if (news.length === 0) {
    console.log("警告: 没有解析到任何文章!")
  }
  return news
})

const development = defineSource(async () => {
  const baseURL = "https://indienova.com"
  const url = `${baseURL}/indie-game-development/`
  console.log("正在获取 IndieNova 开发文章数据...")

  const response = await myFetch(url) as string
  console.log("获取到HTML响应，长度:", response.length)

  const $ = load(response)
  const news: NewsItem[] = []

  // 选择所有文章项
  const $items = $(".article-panel")
  console.log("找到文章条目数:", $items.length)

  // 获取每个文章的详细信息
  for (const el of $items.toArray()) {
    const $el = $(el)
    const $title = $el.find("h4 a")

    const title = $title.text().trim()
    const url = $title.attr("href")
    const description = $el.find("p").text().trim()

    if (title && url) {
      const fullUrl = url.startsWith("http") ? url : `${baseURL}${url}`

      try {
        // 获取文章详情页面
        console.log("获取文章详情:", fullUrl)
        const detailResponse = await myFetch(fullUrl) as string
        const $detail = load(detailResponse)

        // 获取文章内容
        const $content = $detail("article .entry-content")
        const fullDescription = $content.text().trim()

        // 获取文章分类
        const categories: string[] = []
        $detail(".entry-meta .cat-links a").each((_, el) => {
          categories.push($(el).text().trim())
        })
        const category = categories.join("、") || "独立游戏"

        // 获取发布日期
        const dateText = $detail(".entry-meta time").attr("datetime")
        const date = dateText ? new Date(dateText) : new Date()

        news.push({
          url: fullUrl,
          title,
          id: url,
          extra: {
            date: date.valueOf(),
            hover: description || fullDescription.substring(0, 200) || "暂无描述",
            info: category,
          },
        })
      } catch (error) {
        console.error("处理文章详情失败:", fullUrl, error)
      }
    } else {
      console.log("跳过无效文章:", { title, url })
    }
  }

  return news
})

export default {
  "indienova-article": article,
  "indienova-development": development,
}
