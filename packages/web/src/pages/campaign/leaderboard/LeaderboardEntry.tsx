import { WorldLeaderboardEntry } from "shared/src/worker-api/world-leaderboard"
import { Ticks } from "../../../components/common/Ticks"
import { Clock } from "../../../components/common/svg/Clock"
import { PlayCircle } from "../../../components/common/svg/PlayCircle"
import { Skull } from "../../../components/common/svg/Skull"
import { Star } from "../../../components/common/svg/Star"
import { Sword } from "../../../components/common/svg/Sword"
import { SwordFilled } from "../../../components/common/svg/SwordFilled"

export function LeaderboardEntry(props: { entry: WorldLeaderboardEntry }) {
    const placeColorings: Record<number, any> = {
        1: {
            place: "text-xl text-yellow-500",
            root: "bg-yellow-500 bg-opacity-10",
            icon: "text-yellow-500",
            statsText: "text-yellow-500",
        },
        2: {
            place: "text-xl text-gray-400",
            root: "bg-gray-400 bg-opacity-10",
            icon: "text-gray-400",
            statsText: "text-gray-400",
        },
        3: {
            place: "text-xl text-orange-500",
            root: "bg-orange-500 bg-opacity-10",
            icon: "text-orange-500",
            statsText: "text-orange-500",
        },
    }

    const placeColoring = placeColorings[props.entry.place ?? 0]

    return (
        <>
            <div className={"flex h-[4.5rem] w-full items-center " + placeColoring?.root}>
                <div className={"flex w-24 justify-center " + placeColoring?.place}>
                    <div>{props.entry?.place}</div>
                </div>
                <div>
                    <div className="text-lg">{props.entry.username}</div>
                    <LeaderboardEntryStats
                        entry={props.entry}
                        iconClassName={placeColoring?.icon}
                        textClassName={placeColoring?.statsText}
                    />
                </div>
                <div className="flex w-full justify-end space-x-1 pr-4">
                    <button className="btn btn-ghost btn-square">
                        <PlayCircle width="24" height="24" className={placeColoring?.icon} />
                    </button>
                    <button className="btn btn-ghost btn-square">
                        {placeColoring?.icon ? (
                            <SwordFilled width="24" height="24" className={placeColoring?.icon} />
                        ) : (
                            <Sword width="24" height="24" className={placeColoring?.icon} />
                        )}
                    </button>
                </div>
            </div>
        </>
    )
}

function LeaderboardEntryStats(props: {
    entry: WorldLeaderboardEntry
    iconClassName?: string
    textClassName?: string
}) {
    return (
        <div className="flex text-sm text-gray-400">
            <div className="flex w-24 items-center space-x-1">
                <Clock width="12" height="12" className={props.iconClassName} />
                <Ticks value={props.entry.ticks} className={props.textClassName} />
            </div>
            {props.entry.deaths === 0 && (
                <div className="flex items-center space-x-1">
                    <Star width="12" height="12" className={props.iconClassName} />
                </div>
            )}

            {props.entry.deaths > 0 && (
                <div className="flex items-center space-x-1">
                    <Skull width="12" height="12" className={props.iconClassName} />
                    <div className={props.textClassName}>{props.entry.deaths}</div>
                </div>
            )}
        </div>
    )
}
