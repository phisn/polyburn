import { f16round, getFloat16, setFloat16 } from "@petamoriken/float16"
import { ReplayModel } from "../../proto/replay"
import { GameInput } from "../game"
import { Point } from "./utils"

export interface ReplayFrame {
    position: Point
    rotation: number
    thrust: boolean
}

export function encodeReplayFrames(replayFrames: ReplayFrame[]): Buffer {
    const packets = [
        ...packFloats(replayFrames.map(x => x.position.x)),
        ...packFloats(replayFrames.map(x => x.position.y)),
        ...packFloats(replayFrames.map(x => x.rotation)),
        ...packThrusts(replayFrames.map(x => x.thrust)),
    ]

    const packetsSize = packets.reduce((acc, x) => acc + x.size, 0)

    const buffer = Buffer.alloc(packetsSize)
    const view = new DataView(buffer.buffer)

    let offset = 0

    for (const packet of packets) {
        packet.write(view, offset)
        offset += packet.size
    }

    return buffer
}

export function decodeReplayFrames(buffer: Buffer): ReplayFrame[] {
    const view = new DataView(buffer.buffer)

    const [x, offset0] = unpackFloats(view, 0)
    const [y, offset1] = unpackFloats(view, offset0)
    const [rotation, offset2] = unpackFloats(view, offset1)
    const [thrust, _] = unpackThrusts(view, offset2)

    const frames: ReplayFrame[] = []

    for (let i = 0; i < x.length; ++i) {
        frames.push({
            position: {
                x: x[i],
                y: y[i],
            },
            rotation: rotation[i],
            thrust: thrust[i],
        })
    }

    return frames
}

function packFloats(floats: number[]): Packet[] {
    return [
        {
            write: (view, offset) => {
                view.setUint32(offset, floats.length, true)
            },
            size: 4,
        },
        {
            write: (view, offset) => {
                for (let i = 0; i < floats.length; i++) {
                    view.setFloat32(offset + i * 4, floats[i])
                }
            },
            size: floats.length * 4,
        },
    ]
}

function unpackFloats(view: DataView, offset: number): [number[], number] {
    const size = view.getUint32(offset)
    const result: number[] = []

    offset += 4

    for (let i = 0; i < size; ++i) {
        result.push(view.getFloat32(offset))
        offset += 4
    }

    return [result, offset]
}

export function applyReplay(replay: ReplayModel, onUpdate: (input: GameInput) => void) {
    const replayDeltaInputs = decodeInputCompressed(replay.deltaInputs)

    let accumulator = 0

    for (const replayDeltaInput of replayDeltaInputs) {
        accumulator += replayDeltaInput.rotationDelta

        const input = {
            rotation: accumulator,
            thrust: replayDeltaInput.thrust,
        }

        onUpdate(input)
    }
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

export interface Packet {
    write: (view: DataView, offset: number) => void
    size: number
}

export function encodeInputCompressed(replayFrames: GameInputCompressed[]) {
    const packets = [
        ...packRotations(replayFrames),
        ...packThrusts(replayFrames.map(x => x.thrust)),
    ]

    const packetsSize = packets.reduce((acc, packet) => acc + packet.size, 0)

    const u8 = new Uint8Array(packetsSize)
    const view = new DataView(u8.buffer)

    let offset = 0

    for (const packet of packets) {
        packet.write(view, offset)
        offset += packet.size
    }

    return u8
}

export function decodeInputCompressed(bytes: Uint8Array): GameInputCompressed[] {
    const view = new DataView(
        bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    )

    const [rotationDeltas, offset] = unpackRotations(view, 0)
    const [thrusts, _] = unpackThrusts(view, offset)

    if (rotationDeltas.length !== thrusts.length) {
        throw new Error("diffs and thrusts length mismatch")
    }

    const gameInputs: GameInputCompressed[] = []

    for (let i = 0; i < rotationDeltas.length; ++i) {
        gameInputs.push({
            rotationDelta: rotationDeltas[i],
            thrust: thrusts[i],
        })
    }

    return gameInputs
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

    return [
        {
            write: (view, offset) => {
                view.setUint32(offset, packed.length, true)
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
                            return
                        }
                        case packDiffType.NonZero: {
                            setFloat16(view, offset, ct.value, true)
                            return
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
    const rotationDeltas: number[] = []

    offset += 4

    for (let i = 0; i < length; i++) {
        const rotationDelta = getFloat16(view, offset, true)

        if (rotationDelta === 0) {
            const count = view.getUint8(offset + 2)

            for (let j = 0; j < count; j++) {
                rotationDeltas.push(0)
            }

            offset += 3
        } else {
            rotationDeltas.push(rotationDelta)

            offset += 2
        }
    }

    return [rotationDeltas, offset] as const
}

export function packThrusts([first, ...remaining]: boolean[]): Packet[] {
    interface packThrust {
        thrust: boolean
        count: number
    }

    const packed: packThrust[] = [
        {
            thrust: first,
            count: 1,
        },
    ]

    for (const item of remaining) {
        const previous = packed.at(-1)!

        if (previous.thrust === item && previous.count < 255) {
            previous.count++
        } else {
            packed.push({
                thrust: item,
                count: 1,
            })
        }
    }

    return [
        {
            write: (view, offset) => {
                view.setUint32(offset, packed.length, true)
            },
            size: 4,
        },
        ...packed.map(
            (ct): Packet => ({
                write: (view, offset) => {
                    view.setUint8(offset, ct.thrust ? 1 : 0)
                    view.setUint8(offset + 1, ct.count)
                },
                size: 2,
            }),
        ),
    ]
}

export function unpackThrusts(view: DataView, offset: number): [boolean[], number] {
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

    return [thrusts, offset]
}
