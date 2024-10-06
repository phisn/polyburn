import { integer, sqliteTable } from "drizzle-orm/sqlite-core"

export const logs = sqliteTable("logs", {
    id: integer("id").primaryKey({
        autoIncrement: true,
    }),

    userid: integer("userid").notNull(),
    time: integer("time").notNull(),
})
