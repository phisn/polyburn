import { z } from "zod"
import { FramePacket } from "./frame-packet"
import { otherUser } from "./other-user"

export const serverUpdateMessage = z
    .object({
        type: z.literal("update"),
        framePackets: z.array(FramePacket),
        usersConnected: z.array(otherUser),
        usersDisconnected: z.array(otherUser),
    })
    .strict()
export type ServerUpdateMessage = z.infer<typeof serverUpdateMessage>

export const initializeMessage = z
    .object({
        type: z.literal("initialize"),
        users: z.array(otherUser),
    })
    .strict()
export type InitializeMessage = z.infer<typeof initializeMessage>

export const serverMessage = z.union([serverUpdateMessage, initializeMessage])
export type ServerMessage = z.infer<typeof serverMessage>
