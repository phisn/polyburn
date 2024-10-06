import { z } from "zod"
import { lobbyUserDTO } from "./lobby-api"
import { updatePacketDTO } from "./update-packet"

export const serverUpdateMessage = z
    .object({
        type: z.literal("update"),
        framePackets: z.array(updatePacketDTO),
        usersConnected: z.array(lobbyUserDTO),
        usersDisconnected: z.array(lobbyUserDTO),
    })
    .strict()
export type ServerUpdateMessage = z.infer<typeof serverUpdateMessage>

export const initializeMessage = z
    .object({
        type: z.literal("initialize"),
        users: z.array(lobbyUserDTO),
    })
    .strict()
export type InitializeMessage = z.infer<typeof initializeMessage>

export const serverMessage = z.union([serverUpdateMessage, initializeMessage])
export type ServerMessage = z.infer<typeof serverMessage>
