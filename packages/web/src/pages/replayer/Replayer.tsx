import { PresentationGameLoop } from "game-presentation/src/presentation-game-loop"
import { PresentationReplay } from "game-presentation/src/presentation-replay"
import { WorldConfig } from "game/proto/world"
import { GameOutputReplay } from "game/src/model/api"
import { base64ToBytes } from "game/src/model/utils"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { replayService } from "../../common/services/replay-service"
import { worldService } from "../../common/services/world-service"
import { useGlobalStore } from "../../common/store"

export function Replayer() {
    const navigate = useNavigate()
    const params = useParams()
    const newAlert = useGlobalStore(x => x.newAlert)

    if (params.replayId === undefined) {
        newAlert({
            message: "Replay not found",
            type: "error",
        })

        navigate("/")

        return
    }

    const replayId = params.replayId

    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    const [replayer, setReplayer] = useState<PresentationReplay | undefined>(undefined)
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    const [_gameloop, setGameloop] = useState<PresentationGameLoop | undefined>(undefined)

    async function setup() {
        if (replayer !== undefined) {
            return
        }

        const replayDTO = await replayService.get(replayId)

        const replayRequest = await fetch(replayDTO.replayUrl)
        const replay = await GameOutputReplay.decode(await replayRequest.bytes())

        const world = await worldService.get(replayDTO.worldname)

        if (world === undefined || world.model === undefined) {
            newAlert({
                message: "World not found",
                type: "error",
            })

            navigate("/")

            return
        }

        const worldConfig = WorldConfig.decode(base64ToBytes(world.model))

        if (world.gamemodes.every(x => x.name !== replayDTO.gamemode)) {
            newAlert({
                message: "World not found",
                type: "error",
            })

            navigate("/")

            return
        }

        const _replayer = new PresentationReplay({
            replay,
            gamemode: replayDTO.gamemode,
            world: worldConfig,
            worldname: replayDTO.worldname,
        })

        const gameLoop = new PresentationGameLoop(_replayer)
        gameLoop.start()

        setReplayer(_replayer)
        setGameloop(gameLoop)
    }

    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    useEffect(() => {
        setup().catch(e => {
            console.error(e)
            navigate("/")
        })
    }, [])

    if (replayer === undefined) {
        return <></>
    }

    return <ReplayCanvas replayer={replayer} />
}

export function ReplayCanvas(props: { replayer: PresentationReplay }) {
    const canvas = props.replayer.store.resources.get("renderer").domElement

    useEffect(() => {
        const root = document.getElementById("canvas-root")

        if (!root) {
            console.error("Canvas root not found")
            return
        }

        root.appendChild(canvas)

        canvas.style.height = "100%"
        canvas.style.width = "100%"
        canvas.style.overflow = "hidden"
        canvas.style.pointerEvents = "auto"
        canvas.style.touchAction = "none"
        canvas.style.userSelect = "none"

        canvas.className = "absolute inset-0 z-0 h-full w-full"

        return () => {
            root.removeChild(canvas)
        }
    }, [canvas])

    return <div id="canvas-root"></div>
}
