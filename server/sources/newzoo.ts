import puppeteer from "puppeteer"
import { defineSource } from "#/utils/source"

const news = defineSource(async () => {
  const baseURL = "https://newzoo.com"
  const url = `${baseURL}/resources?type=all&tag=all`
  console.log("正在获取 Newzoo 数据...")

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    console.log("正在打开新页面...")
    const page = await browser.newPage()

    // 设置更真实的浏览器环境
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
    await page.setViewport({ width: 1920, height: 1080 })

    // 设置请求拦截
    await page.setRequestInterception(true)
    page.on("request", (request) => {
      if (["image", "stylesheet", "font"].includes(request.resourceType()))
        request.abort()
      else
        request.continue()
    })

    console.log("正在访问 Newzoo...")
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    })

    // 等待文章列表加载
    await page.waitForSelector("article", { timeout: 30000 })

    console.log("正在提取文章信息...")
    interface ArticleInfo {
      title: string
      url: string
      date: string
      categories: string[]
      desc: string
    }

    const articles = await page.evaluate(() => {
      const items = document.querySelectorAll("article")
      return Array.from(items).map((article: Element) => {
        const titleElement = article.querySelector("h2 a")
        const dateElement = article.querySelector("time span")
        const categoryElements = article.querySelectorAll("li[id^=\"pill--\"]")
        const descElement = article.querySelector(".card--post--content--excerpt")

        const title = titleElement?.getAttribute("title") || ""
        const url = titleElement?.getAttribute("href") || ""
        const date = dateElement?.textContent?.trim() || ""
        const categories = Array.from(categoryElements).map((el: Element) => el.textContent?.trim() || "")
        const desc = descElement?.textContent?.trim() || ""

        return { title, url, date, categories, desc }
      })
    }) as ArticleInfo[]

    console.log("成功获取文章列表:", articles.length)

    return articles.map(article => ({
      id: article.url,
      title: article.title,
      url: article.url.startsWith("http") ? article.url : `${baseURL}${article.url}`,
      pubDate: article.date,
      extra: {
        info: article.categories.join(", "),
        hover: article.desc,
      },
    }))
  } catch (error) {
    console.error("获取 Newzoo 数据失败:", error)
    throw error
  } finally {
    await browser.close()
    console.log("浏览器已关闭")
  }
})

export default {
  newzoo: news,
}
