import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { WorldModel } from "runtime/proto/world"
import { base64ToBytes } from "runtime/src/model/base64-to-bytes"
import { useAppStore } from "../../common/store/app-store"
import { trpc } from "../../common/trpc/trpc"
import { FinishedPopup } from "./FinishedPopup"
import { PlayStoreProvider } from "./PlayStoreProvider"
import { usePlayStore } from "./play-store"

export function Play() {
    return (
        <ProvidePlayStoreFromParams>
            <>
                <FinishedPopup />
                <GameCanvas />
                <GameSettings />
            </>
        </ProvidePlayStoreFromParams>
    )
}

function GameSettings() {
    const [resume, stop, _reset] = usePlayStore(x => [x.resume, x.stop, x.reset])

    useEffect(() => {
        resume()

        return () => {
            stop()
        }
    }, [resume, stop])

    return <></>
}

/*
export function Play() {
    const gameRef = useRef<Game | null>(null)
    const [finished, setFinished] = useState(false)

    const hooks: GameHooks = useMemo(() => {
        return {
            onFinished: () => {
                setFinished(true)
            },

            onUserJoined: () => {},
            onUserLeft: () => {},

            onConnected: () => {},
            onDisconnected: () => {},
        }
    }, [])

    return (
        <>
            {gameRef.current && finished && <FinishedPopup runtime={gameRef.current.runtime} />}

            <PlayParamterLoader>
                {props => (
                    <GameWrapper
                        ref={gameRef}
                        worldname={props.worldname}
                        gamemode={props.gamemode}
                        model={props.world}
                        hooks={hooks}
                    />
                )}
            </PlayParamterLoader>
        </>
    )
}
*/

export function GameCanvas() {
    const canvas = usePlayStore(x => x.getCanvas())

    useEffect(() => {
        console.log("Setting up new canvas")

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

export function ProvidePlayStoreFromParams(props: { children: JSX.Element }) {
    return (
        <PlayParamterLoader>
            {inner => <PlayStoreProvider {...inner}>{props.children}</PlayStoreProvider>}
        </PlayParamterLoader>
    )
}

export function PlayParamterLoader(props: {
    children: (props: { model: WorldModel; worldname: string; gamemode: string }) => JSX.Element
}) {
    const navigate = useNavigate()
    const params = useParams()
    const hasHydrated = useAppStore(x => x.hasHydrated())

    if (!params.world || !params.gamemode) {
        console.error("World or gamemode not found in params")

        navigate("/")
        return undefined
    }

    const worldQuery = trpc.world.get.useQuery({ names: [params.world] })

    if (!hasHydrated) {
        console.error("User has not been hydrated")
        return undefined
    } else {
        console.log("User has been hydrated")
    }

    if (worldQuery.isLoading) {
        console.log("Loading world")
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
        console.log(worldView.model)
        console.log(`Gamemodes: ${worldView.gamemodes.map(x => x.name).join(", ")}`)
        console.error(`Gamemode ${params.gamemode} not found in world ${worldView.id}`)

        navigate("/")
        return null
    }

    const model = WorldModel.decode(base64ToBytes(worldView.model))

    return props.children({
        model,
        worldname: params.world,
        gamemode: params.gamemode,
    })
}
