import { z } from "zod"

export const otherUser = z.object({
    username: z.string(),
})

export type OtherUser = z.infer<typeof otherUser>
