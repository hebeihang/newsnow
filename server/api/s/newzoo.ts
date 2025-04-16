import puppeteer from "puppeteer"

export default defineEventHandler(async (_event) => {
  console.log("正在启动浏览器...")
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
    await page.goto("https://newzoo.com/resources?type=all&tag=all", {
      waitUntil: "networkidle0",
      timeout: 30000,
    })

    // 等待文章列表加载
    await page.waitForSelector("article", { timeout: 30000 })

    console.log("正在提取文章信息...")
    const articles = await page.evaluate(() => {
      const items = document.querySelectorAll("article")
      return Array.from(items, (article) => {
        const titleElement = article.querySelector("h2 a")
        const dateElement = article.querySelector("time span")
        const categoryElements = article.querySelectorAll("li[id^=\"pill--\"]")

        return {
          title: titleElement?.getAttribute("title") || "",
          date: dateElement?.textContent?.trim() || "",
          categories: Array.from(categoryElements, el => el.textContent?.trim() || ""),
        }
      })
    })

    console.log("成功获取文章列表:", articles.length)
    return articles
  } catch (error) {
    console.error("获取 Newzoo 数据失败:", error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : "获取数据失败",
    })
  } finally {
    await browser.close()
    console.log("浏览器已关闭")
  }
})
