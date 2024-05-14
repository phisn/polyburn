import { z } from "zod"

// limit of amount of positions to be received from the client
export const UPDATE_POSITIONS_EVERY_MS = 500
export const UPDATE_POSITIONS_COUNT = Math.floor(60 * (UPDATE_POSITIONS_EVERY_MS / 1000))

const positions = z.array(
    z.object({
        x: z.number(),
        y: z.number(),
    }),
)

const positionsPacket = z.object({
    username: z.string(),
    positions,
})

export type PositionsPacket = z.infer<typeof positionsPacket>

const user = z.object({
    username: z.string(),
})

export const updateFromClient = z
    .object({
        type: z.literal("clientUpdate"),
        positions,
    })
    .strict()

export type UpdateFromClient = z.infer<typeof updateFromClient>

export const messageFromClient = updateFromClient
export type MessageFromClient = z.infer<typeof messageFromClient>

export const updateFromServer = z
    .object({
        type: z.literal("serverUpdate"),
        positionPackets: z.array(positionsPacket),
        usersConnected: z.array(user),
        usersDisconnected: z.array(user),
    })
    .strict()

export type UpdateFromServer = z.infer<typeof updateFromServer>

export const messageFromServer = updateFromServer
export type MessageFromServer = z.infer<typeof messageFromServer>
