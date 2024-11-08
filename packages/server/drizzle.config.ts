import type { Config } from "drizzle-kit"

export default {
    dialect: "sqlite",
    schema: "./src/**/*-model.ts",
    out: "./drizzle",
} satisfies Config
