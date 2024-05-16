import { z } from "zod"

// limit of amount of positions to be received from the client
export const UPDATE_POSITIONS_EVERY_MS = 250
export const UPDATE_POSITIONS_COUNT = Math.floor(60 * (UPDATE_POSITIONS_EVERY_MS / 1000))

const frame = z.object({
    x: z.number(),
    y: z.number(),
    rotation: z.number(),
})

export type Frame = z.infer<typeof frame>

const framePacket = z.object({
    username: z.string(),
    frames: z.array(frame),
})

export type FramePacket = z.infer<typeof framePacket>

const otherUser = z.object({
    username: z.string(),
})

export type OtherUser = z.infer<typeof otherUser>

export const updateFromClient = z
    .object({
        type: z.literal("update"),
        frames: z.array(frame),
    })
    .strict()

export type UpdateFromClient = z.infer<typeof updateFromClient>

export const messageFromClient = updateFromClient
export type MessageFromClient = z.infer<typeof messageFromClient>

export const updateFromServer = z
    .object({
        type: z.literal("update"),
        framePackets: z.array(framePacket),
        usersConnected: z.array(otherUser),
        usersDisconnected: z.array(otherUser),
    })
    .strict()

export type UpdateFromServer = z.infer<typeof updateFromServer>

export const initializeFromServer = z
    .object({
        type: z.literal("initialize"),
        users: z.array(otherUser),
    })
    .strict()

export type InitializeFromServer = z.infer<typeof initializeFromServer>

export const messageFromServer = z.union([updateFromServer, initializeFromServer])
export type MessageFromServer = z.infer<typeof messageFromServer>
