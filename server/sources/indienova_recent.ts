import type { NewsItem } from "@shared/types"

import { load } from "cheerio"

import { parseRelativeDate } from "#/utils/date"

import { myFetch } from "#/utils/fetch"

import { defineSource } from "#/utils/source"

const recent = defineSource(async () => {
  const baseURL = "https://indienova.com"

  const url = `${baseURL}/gamedb/recent/all/p/1`

  console.log("正在获取 IndieNova 新游数据...")

  const response = await myFetch(url) as string

  console.log("获取到HTML响应，长度:", response.length)

  const $ = load(response)

  const news: NewsItem[] = []

  // 选择所有游戏项

  const $items = $(".related-game")

  console.log("找到游戏条目数:", $items.length)

  // 获取每个游戏的详细信息

  for (const el of $items.toArray()) {
    const $el = $(el)

    const $title = $el.find("span").contents().filter((_, el) => el.type === "text")

    const $link = $el.find("a")

    const title = $title.text().trim()

    const url = $link.attr("href")

    if (title && url) {
      const fullUrl = url.startsWith("http") ? url : `${baseURL}${url}`

      // 获取游戏详情页面

      console.log("获取游戏详情:", fullUrl)

      const detailResponse = await myFetch(fullUrl) as string

      const $detail = load(detailResponse)

      // 获取发布日期

      const pubDateText = $detail(".gamedb-release").text().trim().replace(/[()]/g, "")

      const pubDate = pubDateText ? parseRelativeDate(pubDateText, "Asia/Shanghai") : new Date()

      // 获取游戏描述

      let description = ""

      const $featureBox = $detail(".feature-box")

      if ($featureBox.length) {
        description = $featureBox.find("p").first().text().trim()
      } else {
        const $article = $detail(".row article")

        $article.find("#showHiddenText").remove()

        description = $article.text().trim()
      }

      // 获取游戏类别

      const categories: string[] = []

      $detail("a[href*=\"/gamedb/genre/\"]").each((_, el) => {
        categories.push($(el).text().trim())
      })

      const category = categories.join("、") || "独立游戏"

      news.push({

        url: fullUrl,

        title,

        id: url,

        extra: {

          date: pubDate.valueOf(),

          hover: description || "无",

          info: category,

        },

      })
    } else {
      console.log("跳过无效游戏:", { title, url })
    }
  }

  console.log("总共解析到游戏数:", news.length)

  if (news.length === 0) {
    console.log("警告: 没有解析到任何游戏!")
  }

  return news
})

export default {

  "indienova-recent": recent,

}
