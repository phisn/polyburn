import { z } from "zod"
import { Frame } from "./frame-packet"

export const clientUpdateMessage = z
    .object({
        type: z.literal("update"),
        frames: z.array(Frame),
    })
    .strict()
export type ClientUpdateMessage = z.infer<typeof clientUpdateMessage>

export const clientMessage = clientUpdateMessage
export type ClientMessage = z.infer<typeof clientMessage>
