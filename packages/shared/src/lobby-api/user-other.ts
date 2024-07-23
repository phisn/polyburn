import { z } from "zod"

export const UserOther = z.object({
    username: z.string(),
})

export type UserOther = z.infer<typeof UserOther>
