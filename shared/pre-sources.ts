import process from "node:process"
import type { OriginSource, Source, SourceID } from "@shared/types"
import { Interval } from "./consts"
import { typeSafeObjectFromEntries } from "./type.util"

const Time = {
  Test: 1,
  Realtime: 2 * 60 * 1000,
  Fast: 5 * 60 * 1000,
  Default: Interval, // 10min
  Common: 30 * 60 * 1000,
  Slow: 60 * 60 * 1000,
}

export const originSources = {
  "v2ex": {
    name: "V2EX",
    color: "slate",
    home: "https://v2ex.com/",
    disable: true,
    sub: {
      share: {
        title: "最新分享",
        column: "tech",
      },
    },
  },
  "3dm": {
    name: "3DM",
    type: "realtime",
    column: "china",
    color: "blue",
    home: "https://www.3dmgame.com",
    sub: {
      news: {
        title: "新闻",
      },
      metacritic: {
        title: "评测",
      },
    },
  },
  "zhihu": {
    name: "知乎",
    type: "hottest",
    column: "china",
    color: "blue",
    home: "https://www.zhihu.com",
    disable: true,
  },
  "weibo": {
    name: "微博",
    title: "实时热搜",
    type: "hottest",
    column: "china",
    color: "red",
    interval: Time.Realtime,
    home: "https://weibo.com",
    disable: true,
  },
  "zaobao": {
    name: "联合早报",
    interval: Time.Common,
    type: "realtime",
    column: "world",
    color: "red",
    desc: "来自第三方网站: 早晨报",
    home: "https://www.zaobao.com",
    disable: true,
  },
  "coolapk": {
    name: "酷安",
    type: "hottest",
    column: "tech",
    color: "green",
    title: "今日最热",
    home: "https://coolapk.com",
    disable: true,
  },
  "wallstreetcn": {
    name: "华尔街见闻",
    color: "blue",
    column: "finance",
    home: "https://wallstreetcn.com/",
    disable: true,
    sub: {
      flash: {
        type: "realtime",
        interval: Time.Fast,
        title: "实时快讯",
      },
      news: {
        title: "最新资讯",
        interval: Time.Common,
      },
      hot: {
        title: "最热文章",
        type: "hottest",
        interval: Time.Common,
      },
    },
  },
  "36kr": {
    name: "36氪",
    type: "realtime",
    color: "blue",
    disable: true,
    home: "https://36kr.com",
    column: "tech",
    sub: {
      news: {
        title: "快讯",
      },
    },
  },
  "douyin": {
    name: "抖音",
    type: "hottest",
    column: "china",
    color: "gray",
    home: "https://www.douyin.com",
    disable: true,
  },
  "hupu": {
    name: "虎扑",
    disable: true,
    home: "https://hupu.com",
  },
  "tieba": {
    name: "百度贴吧",
    title: "热议",
    column: "china",
    type: "hottest",
    color: "blue",
    home: "https://tieba.baidu.com",
    disable: true,
  },
  "toutiao": {
    name: "今日头条",
    type: "hottest",
    column: "china",
    color: "red",
    home: "https://www.toutiao.com",
    disable: true,
  },
  "ithome": {
    name: "IT之家",
    color: "red",
    column: "tech",
    type: "realtime",
    home: "https://www.ithome.com",
    disable: true,
  },
  "thepaper": {
    name: "澎湃新闻",
    interval: Time.Common,
    type: "hottest",
    column: "china",
    title: "热榜",
    color: "gray",
    home: "https://www.thepaper.cn",
    disable: true,
  },
  "sputniknews": {
    name: "卫星通讯社",
    color: "orange",
    disable: true,
    column: "world",
    home: "https://sputniknews.cn",
  },
  "cankaoxiaoxi": {
    name: "参考消息",
    color: "red",
    column: "world",
    interval: Time.Common,
    home: "https://china.cankaoxiaoxi.com",
    disable: true,
  },
  "cls": {
    name: "财联社",
    color: "red",
    column: "finance",
    home: "https://www.cls.cn",
    disable: true,
    sub: {
      telegraph: {
        title: "电报",
        interval: Time.Fast,
        type: "realtime",
      },
      depth: {
        title: "深度",
      },
      hot: {
        title: "热门",
        type: "hottest",
      },
    },
  },
  "xueqiu": {
    name: "雪球",
    color: "blue",
    home: "https://xueqiu.com",
    column: "finance",
    disable: true,
    sub: {
      hotstock: {
        title: "热门股票",
        interval: Time.Realtime,
        type: "hottest",
      },
    },
  },
  "gelonghui": {
    name: "格隆汇",
    color: "blue",
    title: "事件",
    column: "finance",
    type: "realtime",
    interval: Time.Realtime,
    home: "https://www.gelonghui.com",
    disable: true,
  },
  "fastbull": {
    name: "法布财经",
    color: "emerald",
    home: "https://www.fastbull.cn",
    column: "finance",
    disable: true,
    sub: {
      express: {
        title: "快讯",
        type: "realtime",
        interval: Time.Realtime,
      },
      news: {
        title: "头条",
        interval: Time.Common,
      },
    },
  },
  "solidot": {
    name: "Solidot",
    color: "teal",
    column: "tech",
    home: "https://solidot.org",
    interval: Time.Slow,
    disable: true,
  },
  "hackernews": {
    name: "Hacker News",
    color: "orange",
    column: "tech",
    type: "hottest",
    home: "https://news.ycombinator.com/",
    disable: true,
  },
  "producthunt": {
    name: "Product Hunt",
    color: "red",
    column: "tech",
    type: "hottest",
    home: "https://www.producthunt.com/",
    disable: true,
  },
  "gamesindustry": {
    name: "GIBiz",
    color: "blue",
    column: "world",
    type: "realtime",
    home: "https://www.gamesindustry.biz",
    sub: {
      news: {
        title: "产业新闻",
        interval: Time.Fast,
      },
    },
  },
  "github": {
    name: "Github",
    color: "gray",
    home: "https://github.com/",
    column: "tech",
    disable: true,
    sub: {
      "trending-today": {
        title: "Today",
        type: "hottest",
      },
    },
  },
  "bilibili": {
    name: "哔哩哔哩",
    color: "blue",
    home: "https://www.bilibili.com",
    disable: true,
    sub: {
      "hot-search": {
        title: "热搜",
        column: "china",
        type: "hottest",
      },
    },
  },
  "kuaishou": {
    name: "快手",
    type: "hottest",
    column: "china",
    color: "gray",
    home: "https://www.kuaishou.com",
    disable: true,
  },
  "kaopu": {
    name: "靠谱新闻",
    column: "world",
    color: "gray",
    interval: Time.Common,
    desc: "不一定靠谱，多看多思考",
    home: "https://kaopu.news/",
    disable: true,
  },
  "jin10": {
    name: "金十数据",
    column: "finance",
    color: "blue",
    type: "realtime",
    home: "https://www.jin10.com",
    disable: true,
  },
  "baidu": {
    name: "百度热搜",
    column: "china",
    color: "blue",
    type: "hottest",
    home: "https://www.baidu.com",
  },
  "linuxdo": {
    name: "LinuxDo",
    type: "realtime",
    column: "tech",
    color: "slate",
    home: "https://linux.do",
    disable: true,
  },
  "gamebiz": {
    name: "GameBiz",
    type: "realtime",
    column: "jp",
    color: "blue",
    home: "https://gamebiz.jp/",
    sub: {
      news: {
        title: "日本产业新闻",
        interval: Time.Default,
      },
    },
  },
  "gamedeveloper": {
    name: "GameDev",
    type: "realtime",
    column: "world",
    color: "blue",
    home: "https://www.gamedeveloper.com",
    sub: {
      news: {
        title: "开发新闻",
        interval: Time.Default,
      },
    },
  },
  "thisisgame": {
    name: "ThisIsGame",
    type: "realtime",
    column: "world",
    color: "blue",
    home: "https://www.thisisgame.com",
    sub: {
      news: {
        title: "韩国游戏新闻",
        interval: Time.Default,
      },
    },
  },
  "indienova": {
    name: "IndieNova",
    column: "china",
    color: "violet",
    home: "https://indienova.com",
    sub: {
      recent: {
        title: "独立游戏",
        type: "realtime",
      },
      article: {
        title: "文章",
        disable: true,
      },
      development: {
        title: "开发",
        type: "dev",
      },
    },
  },
  "famitsu_rank": {
    name: "Famitsu",
    type: "dev",
    column: "jp",
    color: "blue",
    home: "https://www.famitsu.com",
    title: "游戏销量榜",
    interval: Time.Default,
  },
} as const satisfies Record<string, OriginSource>

export function genSources() {
  const _: [SourceID, Source][] = []

  Object.entries(originSources).forEach(([id, source]: [any, OriginSource]) => {
    const parent = {
      name: source.name,
      type: source.type,
      disable: source.disable,
      desc: source.desc,
      column: source.column,
      home: source.home,
      color: source.color ?? "primary",
      interval: source.interval ?? Time.Default,
    }
    if (source.sub && Object.keys(source.sub).length) {
      Object.entries(source.sub).forEach(([subId, subSource], i) => {
        if (i === 0) {
          _.push([id, {
            redirect: `${id}-${subId}`,
            ...parent,
            ...subSource,
          }] as [any, Source])
        }
        _.push([`${id}-${subId}`, { ...parent, ...subSource }] as [any, Source])
      })
    } else {
      _.push([id, {
        title: source.title,
        ...parent,
      }])
    }
  })

  return typeSafeObjectFromEntries(_.filter(([_, v]) => {
    if (v.disable === "cf" && process.env.CF_PAGES) {
      return false
    } else if (v.disable === true) {
      return false
    } else {
      return true
    }
  }))
}

export interface PreSource {
  name: string
  type: string
  column: string
  home: string
  color: string
  interval: number
  title?: string
  path?: string
  redirect?: string
}
