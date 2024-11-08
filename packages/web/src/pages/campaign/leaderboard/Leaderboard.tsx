import { useEffect, useState } from "react"
import { GamemodeDTO, WorldDTO } from "shared/src/server/world"
import { ExReplaySummaryDTO, replayService } from "../../../common/services/replay-service"
import { DraggableList } from "../../../components/common/DraggableList"
import { LeaderboardEntry } from "./LeaderboardEntry"

export function Leaderboard(props: {
    world: WorldDTO
    gamemode: GamemodeDTO
    closeDialog: () => void
}) {
    const [replays, setReplays] = useState<ExReplaySummaryDTO[]>()

    useEffect(() => {
        replayService.list(props.world.worldname, props.gamemode.name).then(replays => {
            setReplays(replays)
        })
    }, [props.world.worldname, props.gamemode.name])

    if (replays === undefined) {
        return (
            <LeaderboardContainer className="overflow-hidden">
                <div className="flex w-full justify-center space-x-4 p-8">
                    <div className="text-sm">Loading</div> <div className="loading" />
                </div>
            </LeaderboardContainer>
        )
    }

    if (replays.length === 0) {
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
                length={replays.length}
                className="overflow-hidden rounded-xl"
                onSwipeHorizontal={() => {
                    props.closeDialog()
                }}
            >
                {index => <LeaderboardEntry replaySummary={replays[index]} key={index} />}
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
