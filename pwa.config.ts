import process from "node:process"
import type { VitePWAOptions } from "vite-plugin-pwa"
import { VitePWA } from "vite-plugin-pwa"

const pwaOption: Partial<VitePWAOptions> = {
  includeAssets: ["icon.svg", "apple-touch-icon.png"],
  filename: "swx.js",
  registerType: "autoUpdate", // ✅ 自动更新 SW
  manifest: {
    name: "GameTrend",
    short_name: "GameTrend",
    description: "优雅的游戏资讯聚合网站",
    theme_color: "#F14D42",
    icons: [
      {
        src: "pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },
  workbox: {
    navigateFallbackDenylist: [/^\/api/],
    cleanupOutdatedCaches: true, // ✅ 清理旧缓存
  },
  devOptions: {
    enabled: process.env.SW_DEV === "true", // ✅ 只在 SW_DEV=true 时启用 PWA
    type: "module",
    navigateFallback: "index.html",
  },
}

export default function pwa() {
  return VitePWA(pwaOption)
}
