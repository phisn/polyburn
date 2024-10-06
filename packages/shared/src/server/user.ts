import { z } from "zod"

export const currentUserDTO = z.object({
    username: z.string(),
})

export type CurrentUserDTO = z.infer<typeof currentUserDTO>
