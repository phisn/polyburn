import { useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { WorldModel } from "runtime/proto/world"
import { base64ToBytes } from "runtime/src/model/base64-to-bytes"
import { Game } from "web-game/src/game/game"
import { GameLoop } from "web-game/src/game/game-loop"
import { GameHooks } from "web-game/src/game/game-settings"
import { useAppStore } from "../../common/storage/app-store"
import { trpc } from "../../common/trpc/trpc"

export function Play() {
    return (
        <PlayParamterLoader>
            {props => (
                <GameWrapper
                    worldname={props.worldname}
                    gamemode={props.gamemode}
                    model={props.world}
                />
            )}
        </PlayParamterLoader>
    )
}

export function GameWrapper(props: {
    worldname: string
    gamemode: string
    model: WorldModel
    hooks?: GameHooks
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const gameLoopRef = useRef<GameLoop | null>(null)

    useEffect(() => {
        if (gameLoopRef.current) {
            return
        }

        const state = useAppStore.getState()
        let lobby

        if (state.jwt && state.user) {
            lobby = {
                host: new URL(import.meta.env.VITE_SERVER_URL).host,
                username: state.user.username,
                token: state.jwt,
            }
        }

        gameLoopRef.current = new GameLoop(
            new Game({
                instanceType: "play",

                worldname: props.worldname,
                world: props.model,
                gamemode: props.gamemode,

                hooks: props.hooks,
                lobby: lobby,

                canvas: canvasRef.current!,
            }),
        )

        gameLoopRef.current.start()

        return () => {
            gameLoopRef.current?.stop()
            gameLoopRef.current?.getGame().dispose()
            gameLoopRef.current = null
        }
    }, [props.worldname, props.model, props.gamemode, props.hooks])

    return (
        <canvas
            style={{
                position: "relative",
                height: "100%",
                width: "100%",
                overflow: "hidden",
                pointerEvents: "auto",
                touchAction: "none",
                WebkitUserSelect: "none",
            }}
            className="absolute inset-0 z-0 h-full w-full select-none"
            ref={canvasRef}
        />
    )
}

export function PlayParamterLoader(props: {
    children: (props: { world: WorldModel; worldname: string; gamemode: string }) => JSX.Element
}) {
    const navigate = useNavigate()
    const params = useParams()
    const hasHydrated = useAppStore(x => x.hasUserLoaded)

    if (!params.world || !params.gamemode) {
        console.error("World or gamemode not found in params")

        navigate("/")
        return undefined
    }

    const worldQuery = trpc.world.get.useQuery({ names: [params.world] })

    if (!hasHydrated) {
        return undefined
    }

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

    const [worldView] = worldQuery.data

    if (worldView.gamemodes.every(gamemode => gamemode.name !== params.gamemode)) {
        console.error(`Gamemode ${params.gamemode} not found in world ${worldView.id}`)

        navigate("/")
        return null
    }

    const world = WorldModel.decode(base64ToBytes(worldView.model))

    return props.children({
        world,
        worldname: params.world,
        gamemode: params.gamemode,
    })
}
