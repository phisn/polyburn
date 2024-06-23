import { z } from "zod"

export const Frame = z.object({
    x: z.number(),
    y: z.number(),
    rotation: z.number(),
})

export type Frame = z.infer<typeof Frame>

export const FramePacket = z.object({
    username: z.string(),
    frames: z.array(Frame),
})

export type FramePacket = z.infer<typeof FramePacket>
