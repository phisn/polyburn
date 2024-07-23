import { z } from "zod"

export const UserMe = z.object({
    username: z.string(),
})

export type UserMe = z.infer<typeof UserMe>
