import { sources } from "./sources"
import { typeSafeObjectEntries, typeSafeObjectFromEntries } from "./type.util"
import type { ColumnID, HiddenColumnID, Metadata, SourceID } from "./types"

export const columns = {
  china: {
    zh: "中国",
  },
  world: {
    zh: "国际",
  },
  tech: {
    zh: "科技",
  },
  jp: {
    zh: "日本",
  },
  ai: {
    zh: "AI",
  },
  finance: {
    zh: "财经",
  },
  focus: {
    zh: "关注",
  },
  realtime: {
    zh: "实时",
  },
  dev: {
    zh: "开发",
  },
  hottest: {
    zh: "最热",
  },
} as const

export const fixedColumnIds = ["focus", "dev", "hottest", "realtime"] as const satisfies Partial<ColumnID>[]
export const hiddenColumns = Object.keys(columns).filter(id => !fixedColumnIds.includes(id as any)) as HiddenColumnID[]

export const metadata: Metadata = typeSafeObjectFromEntries(typeSafeObjectEntries(columns).map(([k, v]) => {
  switch (k) {
    case "focus":
      return [k, {
        name: v.zh,
        sources: [] as SourceID[],
      }]
    case "hottest":
      return [k, {
        name: v.zh,
        sources: typeSafeObjectEntries(sources).filter(([, v]) => v.type === "hottest" && !v.redirect).map(([k]) => k),
      }]
    case "realtime":
      return [k, {
        name: v.zh,
        sources: typeSafeObjectEntries(sources).filter(([, v]) => v.type === "realtime" && !v.redirect).map(([k]) => k),
      }]
    case "dev":
      return [k, {
        name: v.zh,
        sources: typeSafeObjectEntries(sources).filter(([, v]) => v.type === "dev" && !v.redirect).map(([k]) => k),
      }]
    default:
      return [k, {
        name: v.zh,
        sources: typeSafeObjectEntries(sources).filter(([, v]) => v.column === k && !v.redirect).map(([k]) => k),
      }]
  }
}))
