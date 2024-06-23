import { z } from "zod"
import { Frame, FramePacket } from "./frame-packet"
import { UserOther } from "./user-other"

// limit of amount of positions to be received from the client
export const UPDATE_POSITIONS_EVERY_MS = 250
export const UPDATE_POSITIONS_COUNT = Math.floor(60 * (UPDATE_POSITIONS_EVERY_MS / 1000))

export const updateFromClient = z
    .object({
        type: z.literal("update"),
        frames: z.array(Frame),
    })
    .strict()

export type UpdateFromClient = z.infer<typeof updateFromClient>

export const messageFromClient = updateFromClient
export type MessageFromClient = z.infer<typeof messageFromClient>

export const updateFromServer = z
    .object({
        type: z.literal("update"),
        framePackets: z.array(FramePacket),
        usersConnected: z.array(UserOther),
        usersDisconnected: z.array(UserOther),
    })
    .strict()

export type UpdateFromServer = z.infer<typeof updateFromServer>

export const initializeFromServer = z
    .object({
        type: z.literal("initialize"),
        users: z.array(UserOther),
    })
    .strict()

export type InitializeFromServer = z.infer<typeof initializeFromServer>

export const messageFromServer = z.union([updateFromServer, initializeFromServer])
export type MessageFromServer = z.infer<typeof messageFromServer>
