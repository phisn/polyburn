import { Canvas } from "@react-three/fiber"
import { Fragment, useEffect } from "react"
import { EntityType } from "runtime/proto/world"
import { Navbar } from "../../common/components/Navbar"
import { StopSvg } from "../../common/components/inline-svg/Stop"
import Game from "../../game/Game"
import { EventHandler } from "./EventHandler"
import { editorTunnel } from "./Tunnel"
import { Camera } from "./components/Camera"
import { Background } from "./components/background/Background"
import { GamemodeSelect } from "./components/gamemode/GamemodeSelect"
import { EditorNavbar } from "./components/navbar/Navbar"
import { Level } from "./entities/level/Level"
import { Rocket } from "./entities/rocket/Rocket"
import { Shape } from "./entities/shape/Shape"
import { EntityState } from "./models/EntityState"
import { exportModel } from "./models/exportModel"
import { importModelString } from "./models/importModel"
import { ProvideWorldStore, useEditorStore } from "./store/EditorStore"
import { ProvideEventStore } from "./store/EventStore"

export function Editor() {
    const mapRaw =
        "CscCCgZOb3JtYWwSvAIKCg2F65XBFTXTGkISKA2kcLrBFZfjFkIlAAAAwi1SuIlCNa5H+UE9H4X/QUUAAABATQAAAEASKA1SuMFBFZmRGkIlhetRQS3NzFJCNSlcp0I9zcxEQUUAAABATQAAAEASKA0AgEVCFfIboEElAAAoQi0K189BNaRw4UI9rkdZwUUAAABATQAAAEASKA171MBCFcubHcElmpm5Qi0K189BNY/CI0M9rkdZwUUAAABATQAAAEASLQ1syOFCFToytkEdVGuzOiWamblCLSlcZUI1XI8jQz3NzIhBRQAAAEBNAAAAQBItDR/lAUMVk9VNQh2fUDa1JaRw9UItexRsQjWF60FDPQAAlEFFAAAAQE0AAABAEigNw1UzQxVpqkFCJdejJEMtBW94QjXXo0JDPQVvAEJFAAAAQE0AAABACu4KCg1Ob3JtYWwgU2hhcGVzEtwKGt8GCtwGP4UAws3MNEGgEEAAZjYAAP///wB1PAAU////AF5PABT///8AyUtPxP///wAzSg3L////AMBJAcj///8AE0Umzf///wCMVAo5////AJNRpDr///8AVE0WVP///wD0vlZLAAD/AEPI7Bn///8AhcPlOAAA/wAFQZrF////ADS9F8f///8AJMIuwf///wC5xvvF////AOrJ1rf///8Ac8ikQP///wBAxfRF////AGkxi0n///8Aj0LxQgAA/wB1xWY9////AJ/HZAlQUP4AzcUBvQAA/wDwQFzE////ADDGR73///8As8eZPoiI8QBxxWQ3rKz/AFw3LMQAAP8AwkNRtP///wC2RKO4////AEhBe8EAAP8AS0WPPP///wAdSaSx////AMw/Ucj///8A7MBNxv///wDmxnG9////AELCFLr///8Aw8UOof///wAKxCg4AAD/ALg8OMDZ2fsA4j9NwP///wCkxB+/AADwAHGwrr54ePgAVERcwv///wAPwXbA////APW0H0EAAPgASLtnv////wALM67DJSX/AFJApL////8AZj4uwP///wBcu+HATU3/AIU7+8H///8AXMK8Lf///wB7wjM/AAD4AHDCx8D///8AFEH7wP///wAAvnvE////AOTGChL///8A6bncRP///wCAQddAAAD4AB/AxLH///8AIL9RPQAA+ACZwqvG////AOLCLkQAAPgAIcTrwP///wDtwQPH////AOLJbqz///8ALsR6QwAA+AD+x8zA////APtF90kyMv8AH7mZQCcn/wCNxHo8tbX/AIDAiETKyv8AXEAgSgAA+AClyAqS////AH9EG0n///8AS0ypRP///wAxSIK7MDToANjBdUf///8A58yjxP///wCByD1EMDToAIzCYMv///8AnMq3MzA06AC+QenF////ANzGT0T///8AtMFSR////wBzRb85lpj/AFJALEQwNOgAqMIpPjA06AAgyiCF////AAPEE77///8AzT4FSnN1/wAzxWFCMDToAA23PcKXl/8AGcLmQDA06ADMPUnJu77/AFrGxsL///8A1TRGSjA06ACKwik8MDToAE3Apcn///8Ar8SawP///wBsygqP////ABHI8z0wNOgAAABTzv///wAa9wMK9APNzJNCj8JlQP///wBmtly8////ABa2jsg2Nv8AO0SENwAA+ACkvrtEvLz/AG0uOEX///8A4UaHPv///wA+QlXFAAD4AApB2L4AAPgAeDLVRP///wATSHHAAAD4ADhA3EP///8As0MKvAAA8ADOPxM4AAD4AEjBTUD///8Arj5TP3B0+ACyKw9DaGz4ALm6eDz///8AKT4MSP///wDhPy5CAAD/APS/XEL///8A+EV6PwAA/wAdsXtBp6f/AGzEpEEAAP8AisfEuf///wDXwVJI////AJpEaUf///8AhUfxQP///wB7RA3FAAD/ANdBTzUAAP8AC8C9Rv///wBGQoVE////APRMpDz///8A7kS3yAAA/wDLR9HB////AFLHNscAAP8AR0HNwf///wDsvtLGAAD/AABE5kD///8AD0JIRv///wD0RNJA////AEVFqcD///8A3ESpwwAA/wAuwgtJ////AARBqEj///8ALUdbSf///wA01Hks////AHjCAL3///8AF8s5x////wC4vlPP////AME1O8f///8AhsIAPgAA+ABcxZXC7e3/AIrEpUMAAPgAjcbDxcvL/wBdQFzF////AEjI+8EAAOAAQ0GZvf///wAGN77AFRX/APlFXDz///8AikEzwkhI+ADcQmoy////AArNAgoHUmV2ZXJzZRLBAgoPDRydLkMVk5lFQh2z7Zk2EigNpHC6wRWX4xZCJQAAAMItAABMQjUAAEDBPR+F/0FFAAAAQE0AAABAEigNUrjBQRWZkRpCJR+FAMItZuaJQjUAAPpBPQAAAEJFAAAAQE0AAABAEigNAIBFQhXyG6BBJQAAUEEthetRQjWkcKdCPVK4TkFFAAAAQE0AAABAEigNe9TAQhXLmx3BJTQzKEItCtfPQTUeBeJCPa5HWcFFAAAAQE0AAABAEi0NbMjhQhU6MrZBHVRrszolmpm5Qi1SuNRBNVyPI0M9ZmZawUUAAABATQAAAEASLQ0f5QFDFZPVTUIdn1A2tSWk8LlCLXsUZUI1hSskQz0AAIZBRQAAAEBNAAAAQBIoDcNVM0MVaapBQiUAgPVCLQAAbEI1AABCQz0AAJRBRQAAAEBNAAAAQBIhCgZub3JtYWwSFwoNTm9ybWFsIFNoYXBlcwoGTm9ybWFsEiMKB1JldmVyc2USGAoNTm9ybWFsIFNoYXBlcwoHUmV2ZXJzZQ=="

    return (
        <ProvideWorldStore world={importModelString(mapRaw)}>
            <ProvideEventStore>
                <InnerEditor />
            </ProvideEventStore>
        </ProvideWorldStore>
    )
}

function InnerEditor() {
    const running = useEditorStore(store => store.running)

    if (running) {
        return <GameInEditor />
    }

    return (
        <>
            <div className="relative h-max w-full grow">
                <div className="absolute bottom-0 left-0 right-0 top-0">
                    <Canvas className="" style={{}}>
                        <Camera />

                        <Entities />
                        <EventHandler />

                        <Background />
                    </Canvas>
                </div>

                <editorTunnel.Out />

                <EditorNavbar />
                <GamemodeSelect />
            </div>
        </>
    )
}

function GameInEditor() {
    const gamemode = useEditorStore(store => store.gamemode)

    const world = useEditorStore(store => store.state).world
    const worldModel = exportModel(world)

    const stop = useEditorStore(store => store.stop)

    if (gamemode === undefined) {
        useEffect(() => {
            stop()
        }, [])

        return null
    }

    return (
        <div className="absolute bottom-0 left-0 right-0 top-0 ">
            <Game world={worldModel} gamemode={gamemode.name} />

            <div
                className="absolute left-0 top-0 p-4"
                style={{
                    touchAction: "none",
                    userSelect: "none",

                    // Prevent canvas selection on ios
                    // https://github.com/playcanvas/editor/issues/160
                    WebkitTouchCallout: "none",
                    WebkitUserSelect: "none",
                    WebkitTapHighlightColor: "rgba(255,255,255,0)",
                }}
            >
                <Navbar>
                    <button
                        className="btn btn-square btn-ghost"
                        onClick={() => {
                            stop()
                        }}
                    >
                        <StopSvg width="16" height="16" />
                    </button>
                </Navbar>
            </div>
        </div>
    )
}

function Entities() {
    const entities = useEditorStore(store => store.state).world.entities
    const gamemode = useEditorStore(store => store.gamemode)?.groups ?? []

    return (
        <>
            {[...entities.entries()].filter(filterEntitiesInGamemode).map(([id, entity]) => (
                <Fragment key={id}>
                    {entity.type === EntityType.SHAPE && <Shape state={entity} />}
                    {entity.type === EntityType.ROCKET && <Rocket state={entity} />}
                    {entity.type === EntityType.LEVEL && <Level state={entity} />}
                </Fragment>
            ))}
        </>
    )

    function filterEntitiesInGamemode([, entity]: [number, EntityState]) {
        return entity.group === undefined || gamemode.includes(entity.group)
    }
}
