// E:\web\newsnow\server\plugins\init.ts

import metacriticSource from "../sources/_3dm_metacritic"
import newsSource from "../sources/_3dm_news"
import gamebizSource from "../sources/gamebiz"
import krSource from "../sources/_36kr"

const INTERVAL = 1000 * 60 * 10 // 每 10 分钟

export default defineNitroPlugin(() => {
  // 初始抓取
  console.log("[插件启动] 执行一次初始抓取")
  metacriticSource["3dm-metacritic"]?.()
  newsSource["3dm-news"]?.()
  gamebizSource["gamebiz-news"]?.()
  krSource["36kr"]?.()

  // 定时任务
  setInterval(() => {
    console.log("[定时抓取] 3dm-metacritic")
    metacriticSource["3dm-metacritic"]?.()
  }, INTERVAL)

  setInterval(() => {
    console.log("[定时抓取] 3dm-news")
    newsSource["3dm-news"]?.()
  }, INTERVAL)

  setInterval(() => {
    console.log("[定时抓取] gamebiz-news")
    gamebizSource["gamebiz-news"]?.()
  }, INTERVAL)

  setInterval(() => {
    console.log("[定时抓取] 36kr")
    krSource["36kr"]?.()
  }, INTERVAL)
})
