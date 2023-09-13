import { useMemo, useRef } from "react"
import { ReplayModel } from "runtime/proto/replay"
import { WorldModel } from "runtime/proto/world"
import { replayFramesFromBytes } from "runtime/src/model/replay/Replay"
import { GameCanvas } from "../runtime-runner/GameCanvas"
import { newWebappRuntime } from "../runtime-webapp/WebappRuntime"

export function ReplayRunner(props: {
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
            replayRotation.current += frames[replayIndexRef.current].diff

            stack.step({
                rotation: replayRotation.current,
                thrust: frames[replayIndexRef.current].thrust,
            })

            replayIndexRef.current++
        },
        [stack, frames],
    )

    return <GameCanvas update={update} stack={stack} />
}
