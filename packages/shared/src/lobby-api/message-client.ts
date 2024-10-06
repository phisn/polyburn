import { z } from "zod"
import { updateFrameDTO } from "./update-packet"

export const clientUpdateMessage = z
    .object({
        type: z.literal("update"),
        frames: z.array(updateFrameDTO),
    })
    .strict()
export type ClientUpdateMessage = z.infer<typeof clientUpdateMessage>

export const clientMessage = clientUpdateMessage
export type ClientMessage = z.infer<typeof clientMessage>
