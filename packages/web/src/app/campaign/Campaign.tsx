import { useState, useTransition } from "react"
import { WorldModel } from "runtime/proto/world"
import { Navbar } from "../../common/components/Navbar"
import { StopSvg } from "../../common/components/inline-svg/Stop"
import Game from "../../game/Game"
import { GamemodeStats } from "./Gamemode"
import { GamemodeModal } from "./GamemodeModal"
import { WorldInfo } from "./World"
import { WorldSelection } from "./WorldSelection"

export function Campaign() {
    const worlds: WorldInfo[] = [
        {
            raw: "CscCCgZOb3JtYWwSvAIKCg2F65XBFTXTGkISKA2kcLrBFZfjFkIlAAAAwi1SuIlCNa5H+UE9H4X/QUUAAABATQAAAEASKA1SuMFBFZmRGkIlhetRQS3NzFJCNSlcp0I9zcxEQUUAAABATQAAAEASKA0AgEVCFfIboEElAAAoQi0K189BNaRw4UI9rkdZwUUAAABATQAAAEASKA171MBCFcubHcElmpm5Qi0K189BNY/CI0M9rkdZwUUAAABATQAAAEASLQ1syOFCFToytkEdVGuzOiWamblCLSlcZUI1XI8jQz3NzIhBRQAAAEBNAAAAQBItDR/lAUMVk9VNQh2fUDa1JaRw9UItexRsQjWF60FDPQAAlEFFAAAAQE0AAABAEigNw1UzQxVpqkFCJdejJEMtBW94QjXXo0JDPQVvAEJFAAAAQE0AAABACu4KCg1Ob3JtYWwgU2hhcGVzEtwKGt8GCtwGP4UAws3MNEGgEEAAZjYAAP///wB1PAAU////AF5PABT///8AyUtPxP///wAzSg3L////AMBJAcj///8AE0Umzf///wCMVAo5////AKNRpDr///8ANE0WVP///wD0vlZL////AEPI7Bn///8AhcPlOP///wAFQZrF////ADS9F8f///8AJMIuwf///wC5xvvF////AOrJ1rf///8Ac8ikQP///wBAxfRF////AGkxi0n///8Aj0LxQv///wB1xWY9////AJ/HZAn///8AzcUBvf///wDwQFzE////ADDGR73///8As8eZPv///wBxxWQ3////AFw3LMT///8AwkNRtP///wC2RKO4////AEhBe8H///8AS0WPPP///wAdSaSx////AMw/Ucj///8A7MBNxv///wDmxnG9////AELCFLr///8Aw8UOof///wAKxCg4////ALg8OMD///8A4j9NwP///wCkxB+/AADwAHGwrr54ePgAVERcwv///wAPwXbA////APW0H0EAAPgASLtnv////wALM67DJSX/AFJApL////8AZj4uwP///wBcu+HATU3/AIU7+8H///8AXMK8Lf///wB7wjM/AAD4AHDCx8D///8AFEH7wP///wAAvnvE////AOTGChL///8A6bncRP///wCAQddAAAD4AB/AxLH///8AIL9RPQAA+ACZwqvG////AOLCLkQAAPgAIcTrwP///wDtwQPH////AOLJbqz///8ALsR6QwAA+AD+x8zA////APtF90kyMv8AH7mZQCcn/wCNxHo8tbX/AIDAiETKyv8AXEAgSgAA+AClyAqS////AH9EG0n///8AS0ypRP///wAxSIK7MDToANjBdUf///8A58yjxP///wCByD1EMDToAIzCYMv///8AnMq3MzA06AC+QenF////ANzGT0T///8AtMFSR////wBzRb85lpj/AFJALEQwNOgAqMIpPjA06AAgyiCF////AAPEE77///8AzT4FSnN1/wAzxWFCMDToAA23PcKXl/8AGcLmQDA06ADMPUnJu77/AFrGxsL///8A1TRGSjA06ACKwik8MDToAE3Apcn///8Ar8SawP///wBsygqP////ABHI8z0wNOgAAABTzv///wAa9wMK9APNzJNCj8JlQP///wBmtly8////ABa2jsg2Nv8AO0SENwAA+ACkvrtEvLz/AG0uOEX///8A4UaHPv///wA+QlXFAAD4AApB2L4AAPgAeDLVRP///wATSHHAAAD4ADhA3EP///8As0MKvAAA8ADOPxM4AAD4AEjBTUD///8Arj5TP3B0+ACyKw9DaGz4ALm6eDz///8AKT4MSP///wDhPy5C////APS/XEL///8A+EV6P////wAdsXtB////AGzEpEH///8AisfEuf///wDXwVJI////AJpEaUf///8AhUfxQP///wB7RA3F////ANdBTzX///8AC8C9Rv///wBGQoVE////APRMpDz///8A7kS3yP///wDLR9HB////AFLHNsf///8AR0HNwf///wDsvtLG////AABE5kD///8AD0JIRv///wD0RNJA////AEVFqcD///8A3ESpw////wAuwgtJ////AARBqEj///8ALUdbSf///wA01Hks////AHjCAL3///8AF8s5x////wC4vlPP////AME1O8f///8AhsIAPgAA+ABcxZXC7e3/AIrEpUMAAPgAjcbDxcvL/wBdQFzF////AEjI+8EAAOAAQ0GZvf///wAGN77AFRX/APlFXDz///8AikEzwkhI+ADcQmoy////AArNAgoHUmV2ZXJzZRLBAgoPDRydLkMVk5lFQh2z7Zk2EigNpHC6wRWX4xZCJQAAAMItAABMQjUAAEDBPR+F/0FFAAAAQE0AAABAEigNUrjBQRWZkRpCJR+FAMItZuaJQjUAAPpBPQAAAEJFAAAAQE0AAABAEigNAIBFQhXyG6BBJQAAUEEthetRQjWkcKdCPVK4TkFFAAAAQE0AAABAEigNe9TAQhXLmx3BJTQzKEItCtfPQTUeBeJCPa5HWcFFAAAAQE0AAABAEi0NbMjhQhU6MrZBHVRrszolmpm5Qi1SuNRBNVyPI0M9ZmZawUUAAABATQAAAEASLQ0f5QFDFZPVTUIdn1A2tSWk8LlCLXsUZUI1hSskQz0AAIZBRQAAAEBNAAAAQBIoDcNVM0MVaapBQiUAgPVCLQAAbEI1AABCQz0AAJRBRQAAAEBNAAAAQBIhCgZub3JtYWwSFwoNTm9ybWFsIFNoYXBlcwoGTm9ybWFsEiMKB1JldmVyc2USGAoNTm9ybWFsIFNoYXBlcwoHUmV2ZXJzZQ==",
            name: "Map 1",
            maxProgress: 3,
            progress: { modes: 2 },
        },
        { raw: "", name: "Map 2", maxProgress: 3 },
        { raw: "", name: "Map 3", maxProgress: 3 },
        { raw: "", name: "Map 3", maxProgress: 3 },
        { raw: "", name: "Map 3", maxProgress: 3 },
    ]

    const [worldSelected, setWorldSelected] = useState<WorldInfo | undefined>()
    const [gamemodeSelected, setGamemodeSelected] = useState<string>()

    function onWorldSelected(name: WorldInfo | undefined) {
        setWorldSelected(name)
        setGamemodeSelected(undefined)

        window.scrollTo(0, 0)
    }

    function onGamemodeSelected(gamemode: GamemodeStats) {
        startTransition(() => {
            setGamemodeSelected(gamemode.name)
        })
    }

    const [isPending, startTransition] = useTransition()

    if (worldSelected && gamemodeSelected) {
        const map = WorldModel.decode(
            Uint8Array.from(atob(worldSelected.raw), c => c.charCodeAt(0)),
        )

        return (
            <div className="absolute inset-0 ">
                <Game world={map} gamemode="Reverse" />

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
                                setGamemodeSelected(undefined)
                                setWorldSelected(undefined)
                            }}
                        >
                            <StopSvg width="16" height="16" />
                        </button>
                    </Navbar>
                </div>
            </div>
        )
    }

    return (
        <>
            <WorldSelection worlds={worlds} onSelected={world => onWorldSelected(world)} />
            <GamemodeModal
                openWithWorld={worldSelected}
                onSelected={gamemode => onGamemodeSelected(gamemode)}
                onCancel={() => onWorldSelected(undefined)}
            />
        </>
    )
}
