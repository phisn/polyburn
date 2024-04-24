import { useNavigate, useParams } from "react-router-dom"
import { WorldModel } from "runtime/proto/world"
import { base64ToBytes } from "runtime/src/model/base64-to-bytes"
import { trpc } from "../../common/trpc/trpc"
import { GameWithCanvasHooked } from "./GameHooked"

export function Play() {
    const navigate = useNavigate()
    const params = useParams()

    if (!params.world || !params.gamemode) {
        console.error("World or gamemode not found in params")

        navigate("/")
        return undefined
    }

    const worldQuery = trpc.world.get.useQuery({ names: [params.world] })

    if (worldQuery.isLoading) {
        return undefined
    }

    if (worldQuery.data === undefined) {
        if (worldQuery.isError) {
            console.error(`Failed to fetch world ${params.world}: ${worldQuery.error.message}`)
        }

        navigate("/")
        return null
    }

    const [world] = worldQuery.data

    if (world.gamemodes.every(gamemode => gamemode.name !== params.gamemode)) {
        console.error(`Gamemode ${params.gamemode} not found in world ${world.id}`)

        navigate("/")
        return null
    }

    return (
        <GameWithCanvasHooked
            worldname={params.world}
            gamemode={params.gamemode}
            model={WorldModel.decode(base64ToBytes(world.model))}
        />
    )
}
