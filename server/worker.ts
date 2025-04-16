import { Router } from "itty-router"
import type { IRequest } from "itty-router"

const router = Router()

// 处理预加载规则
router.get("/cdn-cgi/speculation", () => {
  return new Response(JSON.stringify({
    prefetch: [
      {
        source: "list",
        urls: ["/", "/realtime", "/history"],
      },
    ],
    prerender: [],
  }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=3600",
    },
  })
})

// 处理所有其他请求
router.all("*", () => new Response("404 Not Found", { status: 404 }))

export default {
  fetch: (request: Request, env: any, ctx: any) => router.handle(request as IRequest, env, ctx),
}
