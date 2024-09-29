import { f16round, getFloat16, setFloat16 } from "@petamoriken/float16"
import { ReplayModel } from "../../proto/replay"
import { Game, GameInput } from "../game"

export function replayApplyTo(game: Game, replay: ReplayModel) {
    const replayFrames = replayFramesFromBytes(replay.frames)

    let accumulator = 0

    for (const frame of replayFrames) {
        accumulator += frame.diff

        const input = {
            rotation: accumulator,
            thrust: frame.thrust,
        }

        game.onUpdate(input)
    }

    return game.store
}

export class GameInputCompressor {
    private accumulated: number

    constructor() {
        this.accumulated = 0
    }

    reset() {
        this.accumulated = 0
    }

    compress(input: GameInput): GameInputCompressed {
        let changeRounded = f16round(input.rotation - this.accumulated)
        if (Math.abs(changeRounded) < GameInputCompressor.MINIMAL_CHANGE_TO_CAPTURE) {
            changeRounded = 0
        }

        this.accumulated += changeRounded
        input.rotation = this.accumulated

        return {
            rotationDelta: changeRounded,
            thrust: input.thrust,
        }
    }

    static MINIMAL_CHANGE_TO_CAPTURE = 0.0001
}

export interface GameInputCompressed {
    rotationDelta: number
    thrust: boolean
}

interface Packet {
    write: (view: DataView, offset: number) => number
    size: number
}

export function replayFramesToBytes(replayFrames: GameInputCompressed[]) {
    const packets = [...packRotations(replayFrames), ...packThrusts(replayFrames)]
    const packetsSize = packets.reduce((acc, packet) => acc + packet.size, 0)

    const u8 = new Uint8Array(packetsSize)
    const view = new DataView(u8.buffer)

    let offset = 0

    for (const packet of packets) {
        offset += packet.write(view, offset)
    }

    return u8
}

export function replayFramesFromBytes(bytes: Uint8Array) {
    const view = new DataView(
        bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    )

    const [diffs, offset] = unpackRotations(view, 0)
    const thrusts = unpackThrusts(view, offset)

    if (diffs.length !== thrusts.length) {
        throw new Error("diffs and thrusts length mismatch")
    }

    return diffs.map((diff, i) => ({
        diff,
        thrust: thrusts[i],
    }))
}

function packRotations(frames: GameInputCompressed[]): Packet[] {
    enum packDiffType {
        Zero = 0,
        NonZero = 1,
    }

    interface packDiffZero {
        type: packDiffType.Zero
        count: number
    }

    interface packDiffNonZero {
        type: packDiffType.NonZero
        value: number
    }

    type packDiff = packDiffZero | packDiffNonZero

    const packed: packDiff[] = []

    for (const item of frames) {
        const previous = packed.at(-1)
        const itemType = item.rotationDelta === 0 ? packDiffType.Zero : packDiffType.NonZero

        if (
            itemType === packDiffType.Zero &&
            previous &&
            previous.type === packDiffType.Zero &&
            previous.count < 255
        ) {
            previous.count++
        } else {
            if (itemType === packDiffType.Zero) {
                packed.push({
                    type: packDiffType.Zero,
                    count: 1,
                })
            } else {
                packed.push({
                    type: packDiffType.NonZero,
                    value: item.rotationDelta,
                })
            }
        }
    }

    const zerocount = packed.filter(ct => ct.type === packDiffType.Zero).length
    const nonzerocount = packed.filter(ct => ct.type === packDiffType.NonZero).length
    const uniquenonzerocount = new Set(
        packed
            .filter((ct): ct is packDiffNonZero => ct.type === packDiffType.NonZero)
            .map(ct => ct.value),
    ).size

    console.log("zerocount", zerocount)
    console.log("nonzerocount", nonzerocount)
    console.log("uniquenonzerocount", uniquenonzerocount)

    return [
        {
            write: (view, offset) => {
                view.setUint32(offset, packed.length, true)
                return 4
            },
            size: 4,
        },
        ...packed.map(
            (ct): Packet => ({
                write: (view, offset) => {
                    switch (ct.type) {
                        case packDiffType.Zero: {
                            view.setUint16(offset, 0)
                            view.setUint8(offset + 2, ct.count)
                            return 3
                        }
                        case packDiffType.NonZero: {
                            setFloat16(view, offset, ct.value, true)
                            return 2
                        }
                    }
                },
                size: ct.type === packDiffType.Zero ? 3 : 2,
            }),
        ),
    ]
}

function unpackRotations(view: DataView, offset: number) {
    const length = view.getUint32(offset, true)
    const diffs: number[] = []

    offset += 4

    for (let i = 0; i < length; i++) {
        const diff = getFloat16(view, offset, true)

        if (diff === 0) {
            const count = view.getUint8(offset + 2)

            for (let j = 0; j < count; j++) {
                diffs.push(0)
            }

            offset += 3
        } else {
            diffs.push(diff)

            offset += 2
        }
    }

    return [diffs, offset] as const
}

function packThrusts([first, ...remaining]: GameInputCompressed[]): Packet[] {
    interface packThrust {
        thrust: boolean
        count: number
    }

    const packed: packThrust[] = [
        {
            thrust: first.thrust,
            count: 1,
        },
    ]

    for (const item of remaining) {
        const previous = packed.at(-1)!

        if (previous.thrust === item.thrust && previous.count < 255) {
            previous.count++
        } else {
            packed.push({
                thrust: item.thrust,
                count: 1,
            })
        }
    }

    return [
        {
            write: (view, offset) => {
                view.setUint32(offset, packed.length, true)
                return 4
            },
            size: 4,
        },
        ...packed.map(
            (ct): Packet => ({
                write: (view, offset) => {
                    view.setUint8(offset, ct.thrust ? 1 : 0)
                    view.setUint8(offset + 1, ct.count)
                    return 2
                },
                size: 2,
            }),
        ),
    ]
}

function unpackThrusts(view: DataView, offset: number) {
    const length = view.getUint32(offset, true)
    const thrusts: boolean[] = []

    offset += 4

    for (let i = 0; i < length; i++) {
        const thrust = view.getUint8(offset) === 1
        const count = view.getUint8(offset + 1)

        for (let j = 0; j < count; j++) {
            thrusts.push(thrust)
        }

        offset += 2
    }

    return thrusts
}
