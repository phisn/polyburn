import { eq, sql } from "drizzle-orm"
import { DrizzleD1Database } from "drizzle-orm/d1"
import { Context } from "hono"
import { Environment } from "../../env"
import { users } from "../user/user-model"
import { replays } from "./replay-model"

export class ReplayService {
    private db: DrizzleD1Database

    constructor(private c: Context<Environment>) {
        this.db = c.get("db")
    }

    get replays() {
        return this.db
            .select({
                ...replays._.columns,
                rank: sql<number>`
                ROW_NUMBER() OVER (
                    PARTITION BY ${replays.worldname}, ${replays.gamemode} 
                    ORDER BY ${replays.ticks} ASC
                )`,
                username: users.username,
            })
            .from(replays)
            .innerJoin(users, eq(users.id, replays.userId))
    }
}
