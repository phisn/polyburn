import { decode, encode, EncoderOptions } from "@msgpack/msgpack"
import { SafeParseReturnType, z } from "zod"
import { Point, Transform } from "./utils"

export const gameInputSchema = z.object({
    rotation: z.number(),
    thrust: z.boolean(),
})

export type GameInput = z.infer<typeof gameInputSchema>

export const gameInputReplaySchema = z.object({
    version: z.literal(1),
    frames: gameInputSchema,
})

export type GameInputReplay = z.infer<typeof gameInputReplaySchema>

export const GameInputReplay = {
    encoderOptions: {
        forceFloat32: true,
    } satisfies EncoderOptions,

    decode(value: Uint8Array): SafeParseReturnType<unknown, GameInputReplay> {
        return gameInputReplaySchema.safeParse(decode(value, this.encoderOptions))
    },
    encode(value: GameInputReplay): Uint8Array {
        return encode(value, this.encoderOptions)
    },
}

export interface GameOutputEventsRaw {
    onFinish?: { deaths: number; ticks: number }
    onLevelCaptureChange?: { level: number; started: boolean }
    onLevelCaptured?: { level: number }
    onRocketCollision?: { contactPoint: Point; normal: Point; speed: number }
    onRocketDeath?: { contactPoint: Point; normal: Point }
}

export type GameOutputEvents = {
    [K in keyof GameOutputEventsRaw]-?: () => Required<GameOutputEventsRaw>[K]
}

export interface GameOutput extends GameOutputEventsRaw {
    thrust: boolean
    transform: Transform
    velocity: Point
}

export interface GameOutputReplay {
    version: 1
    frames: GameOutput[]
}

export const GameOutputReplay = {
    encoderOptions: {
        forceFloat32: true,
    } satisfies EncoderOptions,

    async decode(value: Uint8Array): Promise<GameOutputReplay> {
        const decompressed = await new Response(
            new ReadableStream({
                start(x) {
                    x.enqueue(value)
                    x.close()
                },
            }).pipeThrough(new DecompressionStream("gzip")),
        ).bytes()

        return decode(decompressed, this.encoderOptions) as GameOutputReplay
    },
    async encode(value: GameOutputReplay): Promise<Uint8Array> {
        const encoded = encode(value, this.encoderOptions)

        return await new Response(
            new ReadableStream({
                start(x) {
                    x.enqueue(encoded)
                    x.close()
                },
            }).pipeThrough(new CompressionStream("gzip")),
        ).bytes()
    },
}
