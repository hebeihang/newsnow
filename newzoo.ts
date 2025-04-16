export function extractNewzooArticleInfo(html: string) {
  // 提取标题
  const titleMatch = html.match(/<h2[^>]*>.*?<a[^>]*title="([^"]+)".*?<\/a>/s)
  const title = titleMatch ? titleMatch[1].replace(/&amp;/g, "&") : ""

  // 提取日期
  const dateMatch = html.match(/<time[^>]*>.*?<span[^>]*>([^<]+)<\/span>/s)
  const date = dateMatch ? dateMatch[1].trim() : ""

  // 提取类别
  const categories: string[] = []
  const categoryRegex = /<li[^>]*id="pill--[^"]*">([^<]+)<\/li>/g
  let categoryMatch = categoryRegex.exec(html)
  while (categoryMatch !== null) {
    categories.push(categoryMatch[1].replace(/&amp;/g, "&").trim())
    categoryMatch = categoryRegex.exec(html)
  }

  return {
    title,
    date,
    categories,
  }
}
