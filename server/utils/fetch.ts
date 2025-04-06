import { $fetch } from "ofetch"

export const myFetch = $fetch.create({
  headers: {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  },
  timeout: 10000,
  retry: 5,
  retryDelay: 1000,
  onResponseError({ response }) {
    if (response.status >= 500 || response.status === 506) {
      throw new Error(`HTTP Error: ${response.status}`)
    }
  },
})
