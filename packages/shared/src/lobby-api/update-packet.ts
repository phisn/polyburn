import { z } from "zod"

export const updateFrameDTO = z.object({
    x: z.number(),
    y: z.number(),
    rotation: z.number(),
})

export type UpdateFrameDTO = z.infer<typeof updateFrameDTO>

export const updatePacketDTO = z.object({
    username: z.string(),
    frames: z.array(updateFrameDTO),
})

export type UpdatePacketDTO = z.infer<typeof updatePacketDTO>
