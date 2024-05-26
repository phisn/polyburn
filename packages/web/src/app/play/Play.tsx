import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { WorldModel } from "runtime/proto/world"
import { base64ToBytes } from "runtime/src/model/base64-to-bytes"
import { useAppStore } from "../../common/storage/app-store"
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
    const hasHydrated = useAppStore(x => x.hasUserLoaded)

    if (!params.world || !params.gamemode) {
        console.error("World or gamemode not found in params")

        navigate("/")
        return undefined
    }

    //const worldQuery = trpc.world.get.useQuery({ names: [params.world] })

    const worldQuery = {
        isLoading: false,
        data: [
            {
                id: params.world,
                model: "CscCCgZOb3JtYWwSvAIKCg2F65XBFTXTGkISKA2kcLrBFZfjFkIlAAAAwi1SuIlCNa5H+UE9H4X/QUUAAABATQAAAEASKA1SuMFBFZmRGkIlhetRQS3NzFJCNSlcp0I9zcxEQUUAAABATQAAAEASKA0AgEVCFfIboEElAAAoQi0K189BNaRw4UI9rkdZwUUAAABATQAAAEASKA171MBCFcubHcElmpm5Qi0K189BNY/CI0M9rkdZwUUAAABATQAAAEASLQ1syOFCFToytkEdVGuzOiWamblCLSlcZUI1XI8jQz3NzIhBRQAAAEBNAAAAQBItDR/lAUMVk9VNQh2fUDa1JaRw9UItexRsQjWF60FDPQAAlEFFAAAAQE0AAABAEigNw1UzQxVpqkFCJdejJEMtBW94QjXXo0JDPQVvAEJFAAAAQE0AAABACu4KCg1Ob3JtYWwgU2hhcGVzEtwKGt8GCtwGP4UAws3MNEGgEEAAZjYAAP///wB1PAAU////AF5PABT///8AyUtPxP///wAzSg3L////AMBJAcj///8AE0Umzf///wCMVAo5////AJNRpDr///8AVE0WVP///wD0vlZLAAD/AEPI7Bn///8AhcPlOAAA/wAFQZrF////ADS9F8f///8AJMIuwf///wC5xvvF////AOrJ1rf///8Ac8ikQP///wBAxfRF////AGkxi0n///8Aj0LxQgAA/wB1xWY9////AJ/HZAlQUP4AzcUBvQAA/wDwQFzE////ADDGR73///8As8eZPoiI8QBxxWQ3rKz/AFw3LMQAAP8AwkNRtP///wC2RKO4////AEhBe8EAAP8AS0WPPP///wAdSaSx////AMw/Ucj///8A7MBNxv///wDmxnG9////AELCFLr///8Aw8UOof///wAKxCg4AAD/ALg8OMDZ2fsA4j9NwP///wCkxB+/AADwAHGwrr54ePgAVERcwv///wAPwXbA////APW0H0EAAPgASLtnv////wALM67DJSX/AFJApL////8AZj4uwP///wBcu+HATU3/AIU7+8H///8AXMK8Lf///wB7wjM/AAD4AHDCx8D///8AFEH7wP///wAAvnvE////AOTGChL///8A6bncRP///wCAQddAAAD4AB/AxLH///8AIL9RPQAA+ACZwqvG////AOLCLkQAAPgAIcTrwP///wDtwQPH////AOLJbqz///8ALsR6QwAA+AD+x8zA////APtF90kyMv8AH7mZQCcn/wCNxHo8tbX/AIDAiETKyv8AXEAgSgAA+AClyAqS////AH9EG0n///8AS0ypRP///wAxSIK7MDToANjBdUf///8A58yjxP///wCByD1EMDToAIzCYMv///8AnMq3MzA06AC+QenF////ANzGT0T///8AtMFSR////wBzRb85lpj/AFJALEQwNOgAqMIpPjA06AAgyiCF////AAPEE77///8AzT4FSnN1/wAzxWFCMDToAA23PcKXl/8AGcLmQDA06ADMPUnJu77/AFrGxsL///8A1TRGSjA06ACKwik8MDToAE3Apcn///8Ar8SawP///wBsygqP////ABHI8z0wNOgAAABTzv///wAa9wMK9APNzJNCj8JlQP///wBmtly8////ABa2jsg2Nv8AO0SENwAA+ACkvrtEvLz/AG0uOEX///8A4UaHPv///wA+QlXFAAD4AApB2L4AAPgAeDLVRP///wATSHHAAAD4ADhA3EP///8As0MKvAAA8ADOPxM4AAD4AEjBTUD///8Arj5TP3B0+ACyKw9DaGz4ALm6eDz///8AKT4MSP///wDhPy5CAAD/APS/XEL///8A+EV6PwAA/wAdsXtBp6f/AGzEpEEAAP8AisfEuf///wDXwVJI////AJpEaUf///8AhUfxQP///wB7RA3FAAD/ANdBTzUAAP8AC8C9Rv///wBGQoVE////APRMpDz///8A7kS3yAAA/wDLR9HB////AFLHNscAAP8AR0HNwf///wDsvtLGAAD/AABE5kD///8AD0JIRv///wD0RNJA////AEVFqcD///8A3ESpwwAA/wAuwgtJ////AARBqEj///8ALUdbSf///wA01Hks////AHjCAL3///8AF8s5x////wC4vlPP////AME1O8f///8AhsIAPgAA+ABcxZXC7e3/AIrEpUMAAPgAjcbDxcvL/wBdQFzF////AEjI+8EAAOAAQ0GZvf///wAGN77AFRX/APlFXDz///8AikEzwkhI+ADcQmoy////AArNAgoHUmV2ZXJzZRLBAgoPDRydLkMVk5lFQh2z7Zk2EigNpHC6wRWX4xZCJQAAAMItAABMQjUAAEDBPR+F/0FFAAAAQE0AAABAEigNUrjBQRWZkRpCJR+FAMItZuaJQjUAAPpBPQAAAEJFAAAAQE0AAABAEigNAIBFQhXyG6BBJQAAUEEthetRQjWkcKdCPVK4TkFFAAAAQE0AAABAEigNe9TAQhXLmx3BJTQzKEItCtfPQTUeBeJCPa5HWcFFAAAAQE0AAABAEi0NbMjhQhU6MrZBHVRrszolmpm5Qi1SuNRBNVyPI0M9ZmZawUUAAABATQAAAEASLQ0f5QFDFZPVTUIdn1A2tSWk8LlCLXsUZUI1hSskQz0AAIZBRQAAAEBNAAAAQBIoDcNVM0MVaapBQiUAgPVCLQAAbEI1AABCQz0AAJRBRQAAAEBNAAAAQBIhCgZOb3JtYWwSFwoNTm9ybWFsIFNoYXBlcwoGTm9ybWFsEiMKB1JldmVyc2USGAoNTm9ybWFsIFNoYXBlcwoHUmV2ZXJzZQ==",
                gamemodes: [{ name: "Normal" }],
            },
        ],
        isError: false,
        error: { message: "" },
    }

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
