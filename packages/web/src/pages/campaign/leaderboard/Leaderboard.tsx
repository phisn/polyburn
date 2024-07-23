import { GamemodeInfo } from "shared/src/worker-api/gamemode-info"
import { WorldInfo } from "shared/src/worker-api/world-info"
import { trpc } from "../../../common/trpc/trpc"
import { DraggableList } from "../../../components/common/DraggableList"
import { LeaderboardEntry } from "./LeaderboardEntry"

export function Leaderboard(props: {
    world: WorldInfo
    gamemode: GamemodeInfo
    closeDialog: () => void
}) {
    const { data: replays } = trpc.replay.list.useQuery({
        world: props.world.id.name,
        gamemode: props.gamemode.name,
    })

    if (replays === undefined) {
        return (
            <LeaderboardContainer className="overflow-hidden">
                <div className="flex w-full justify-center space-x-4 p-8">
                    <div className="text-sm">Loading</div> <div className="loading" />
                </div>
            </LeaderboardContainer>
        )
    }

    /*
    replays.entries[0].deaths = 0

    for (let i = replays.entries.length; i < 50; ++i) {
        replays.entries.push({
            leaderboardId: i,
            place: i + 1,
            username: "Anonymous",
            ticks: replays.entries[i - 1].ticks + Math.round(Math.random() * 1000),
            deaths: replays.entries[i - 1].deaths + Math.round(Math.random() * 5),
        })
    }
    */

    if (replays.entries.length === 0) {
        return (
            <LeaderboardContainer className="overflow-hidden">
                <div className="flex w-full justify-center p-8">
                    <div className="text-center text-sm">
                        Be the first to complete this gamemode and get your name on the leaderboard!
                    </div>
                </div>
            </LeaderboardContainer>
        )
    }

    return (
        <LeaderboardContainer>
            <DraggableList
                length={replays.entries.length}
                className="overflow-hidden rounded-xl"
                onSwipeHorizontal={() => {
                    props.closeDialog()
                }}
            >
                {index => <LeaderboardEntry entry={replays.entries[index]} key={index} />}
            </DraggableList>
        </LeaderboardContainer>
    )
}

function LeaderboardContainer(props: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={
                "font-outfit bg-base-300 border-base-100 flex h-full w-full flex-col rounded-2xl border " +
                props.className
            }
        >
            {props.children}
        </div>
    )
}
