import process from "node:process"
import { SignJWT } from "jose"
import { UserTable } from "#/database/user"

export default defineEventHandler(async (event) => {
  try {
    const db = useDatabase()
    const userTable = db ? new UserTable(db) : undefined
    if (!userTable) {
      logger.error("Database not initialized")
      throw new Error("db is not defined")
    }
    if (process.env.INIT_TABLE !== "false") {
      logger.info("Initializing user table...")
      await userTable.init()
    }

    logger.info("Getting GitHub access token...")
    const response: {
      access_token: string
      token_type: string
      scope: string
    } = await myFetch(
      `https://github.com/login/oauth/access_token`,
      {
        method: "POST",
        body: {
          client_id: process.env.G_CLIENT_ID,
          client_secret: process.env.G_CLIENT_SECRET,
          code: getQuery(event).code,
        },
        headers: {
          accept: "application/json",
        },
      },
    )
    logger.info("Successfully got GitHub access token")

    logger.info("Fetching GitHub user info...")
    const userInfo: {
      id: number
      name: string
      avatar_url: string
      email: string
      notification_email: string
    } = await myFetch(`https://api.github.com/user`, {
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `token ${response.access_token}`,
        "User-Agent": "NewsNow App",
      },
    })
    logger.info("Successfully got GitHub user info")

    const userID = String(userInfo.id)
    logger.info(`Adding/updating user ${userID}...`)
    await userTable.addUser(userID, userInfo.notification_email || userInfo.email, "github")

    logger.info("Generating JWT token...")
    const jwtToken = await new SignJWT({
      id: userID,
      type: "github",
    })
      .setExpirationTime("60d")
      .setProtectedHeader({ alg: "HS256" })
      .sign(new TextEncoder().encode(process.env.JWT_SECRET!))
    logger.info("Successfully generated JWT token")

    const params = new URLSearchParams({
      login: "github",
      jwt: jwtToken,
      user: JSON.stringify({
        avatar: userInfo.avatar_url,
        name: userInfo.name,
      }),
    })
    logger.info("Redirecting to home page...")
    return sendRedirect(event, `/?${params.toString()}`)
  } catch (error) {
    logger.error("GitHub OAuth error:", error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : "Internal Server Error",
    })
  }
})
