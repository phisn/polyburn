import type { Config } from "drizzle-kit"

export default {
    schema: "./src/**/*-model.ts",
    out: "./drizzle",
} satisfies Config
