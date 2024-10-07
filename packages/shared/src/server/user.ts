import { z } from "zod"

export const userDTO = z.object({
    username: z.string(),
})

export type UserDTO = z.infer<typeof userDTO>
