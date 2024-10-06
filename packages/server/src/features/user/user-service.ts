import { eq } from "drizzle-orm"
import { DrizzleD1Database } from "drizzle-orm/d1"
import { Context } from "hono"
import { Environment } from "../../env"
import { User, users } from "./user-model"

export class UserService {
    private db: DrizzleD1Database

    constructor(private c: Context<Environment>) {
        this.db = c.get("db")
    }

    async getAuthenticated(): Promise<User | undefined> {
        const userId = this.c.get("userId")

        if (userId === undefined) {
            return undefined
        }

        const [user] = await this.db.select().from(users).where(eq(users.id, userId))
        return user
    }
}
