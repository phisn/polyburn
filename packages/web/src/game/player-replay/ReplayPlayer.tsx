import { useMemo, useRef } from "react"
import { ReplayModel } from "runtime/proto/replay"
import { WorldModel } from "runtime/proto/world"
import { replayFramesFromBytes } from "runtime/src/model/replay/replay"
import { newWebappRuntime } from "../runtime-extension/webapp-runtime"
import { RuntimePlayer } from "../runtime-player/RuntimePlayer"
import { withCanvas } from "../runtime-player/WithCanvas"

export const ReplayPlayer = withCanvas(function ReplayPlayer(props: {
    replay: ReplayModel
    world: WorldModel
    name: string
    gamemode: string
}) {
    const stack = newWebappRuntime({
        world: props.world,
        name: props.name,
        gamemode: props.gamemode,
    })

    const frames = replayFramesFromBytes(props.replay.frames)
    const replayIndexRef = useRef(0)
    const replayRotation = useRef(0)

    const update = useMemo(
        () => () => {
            if (replayIndexRef.current >= frames.length) {
                return
            }

            replayRotation.current += frames[replayIndexRef.current].diff

            stack.step({
                rotation: replayRotation.current,
                thrust: frames[replayIndexRef.current].thrust,
            })

            replayIndexRef.current++
        },
        [stack, frames],
    )

    return <RuntimePlayer update={update} stack={stack} />
})
