interface GameData {
  ranking: string
  platform: string
  title: string
  weeklySales: string
  totalSales: string
}

export default defineSource(async () => {
  const rawData = await myFetch("https://www.famitsu.com/ranking/game-sales")

  // 提取日期
  const dateMatch = rawData.match(/"gameSalesRankingData":\{"title":"([^"]+)"/)
  const date = dateMatch ? dateMatch[1].split("～")[1] : ""

  // 提取游戏数据
  const games: GameData[] = []
  const rankingMatches = rawData.matchAll(/<div class="GameSalesRankingCard_ranking[^>]+>(\d+)<\/div>/g)
  const platformMatches = rawData.matchAll(/<div class="GameSalesRankingCard_platform[^>]+>([^<]+)<\/div>/g)
  const titleMatches = rawData.matchAll(/<div class="GameSalesRankingCard_title[^>]+>([^<]+)<\/div>/g)
  const salesMatches = rawData.matchAll(/<p class="GameSalesRankingCard_salesCount[^>]+>([^<]+)<span/g)
  const totalSalesMatches = rawData.matchAll(/<p class="GameSalesRankingCard_hideInsideColumn[^>]+><span>累計: <\/span>([^<]+)<span/g)

  for (const [_, ranking] of rankingMatches) {
    const platform = platformMatches.next().value?.[1] || ""
    const title = titleMatches.next().value?.[1] || ""
    const weeklySales = salesMatches.next().value?.[1] || ""
    const totalSales = totalSalesMatches.next().value?.[1] || ""

    games.push({
      ranking,
      platform,
      title,
      weeklySales,
      totalSales,
    })
  }

  return games.map(game => ({
    id: `${game.platform}-${game.title}`,
    title: `${game.ranking}|${game.platform}|${game.title}`,
    url: "https://www.famitsu.com/ranking/game-sales",
    extra: {
      info: `周销量：${game.weeklySales}本|累计：${game.totalSales}本`,
      date,
    },
  }))
})
