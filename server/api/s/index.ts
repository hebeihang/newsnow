import type { SourceID, SourceResponse } from "@shared/types"
import { getters } from "#/getters"
import { getCacheTable } from "#/database/cache"
import type { CacheInfo } from "#/types"

export default defineEventHandler(async (event): Promise<SourceResponse> => {
  try {
    const query = getQuery(event)
    const latest = query.latest !== undefined && query.latest !== "false"
    let id = query.id as SourceID

    if (!id) {
      throw createError({
        statusCode: 400,
        message: "Missing source id",
      })
    }

    const isValid = (id: SourceID) => !sources[id] || !getters[id]

    if (isValid(id)) {
      const redirectID = sources?.[id]?.redirect
      if (redirectID) id = redirectID
      if (isValid(id)) {
        throw createError({
          statusCode: 404,
          message: `Invalid source id: ${id}`,
        })
      }
    }

    const cacheTable = await getCacheTable()
    const now = Date.now()
    let cache: CacheInfo | undefined

    if (cacheTable) {
      try {
        cache = await cacheTable.get(id)
      } catch (e) {
        logger.error(`Failed to get cache for ${id}:`, e)
      }
    }

    if (cache) {
      if (now - cache.updated < sources[id].interval) {
        return {
          status: "success",
          id,
          updatedTime: now,
          items: cache.items,
        }
      }

      if (now - cache.updated < TTL) {
        if (!latest || (!event.context.disabledLogin && !event.context.user)) {
          return {
            status: "cache",
            id,
            updatedTime: cache.updated,
            items: cache.items,
          }
        }
      }
    }

    try {
      const newData = (await getters[id]()).slice(0, 30)
      if (cacheTable && newData.length) {
        try {
          if (event.context.waitUntil) {
            event.context.waitUntil(cacheTable.set(id, newData))
          } else {
            await cacheTable.set(id, newData)
          }
        } catch (e) {
          logger.error(`Failed to set cache for ${id}:`, e)
        }
      }
      logger.success(`Successfully fetched latest data for ${id}`)
      return {
        status: "success",
        id,
        updatedTime: now,
        items: newData,
      }
    } catch (e) {
      logger.error(`Failed to fetch data for ${id}:`, e)
      if (cache) {
        return {
          status: "cache",
          id,
          updatedTime: cache.updated,
          items: cache.items,
        }
      }
      throw e
    }
  } catch (e: any) {
    logger.error("API error:", e)
    if (e.statusCode) {
      throw e
    }
    throw createError({
      statusCode: 500,
      message: e instanceof Error ? e.message : "Internal Server Error",
    })
  }
})
