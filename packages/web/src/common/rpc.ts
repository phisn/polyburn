import { hc } from "hono/client"
import type { AppType } from "server/src/index"

const client = hc<AppType>("")
