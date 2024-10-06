import type { Config } from "drizzle-kit"

export default {
    schema: "./src/*",
    out: "./src/model/drizzle",
} satisfies Config
