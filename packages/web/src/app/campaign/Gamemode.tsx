import { LockedSvg } from "../../common/components/inline-svg/Locked"
import { TrophySvg } from "../../common/components/inline-svg/Trophy"
import { UnlockedSvg } from "../../common/components/inline-svg/Unlocked"

type Rank = "Diamond" | "Platinum" | "Gold" | "Silver" | "Bronze" | "Iron"

export interface GamemodeStats {
    name: string
    rank?: GamemodeRankProps
    locked?: boolean
}

interface GamemodeProps extends GamemodeStats {
    onClick: () => void
}

interface GamemodeRankProps {
    rank: Rank
    time: string
    position: number
}

export function Gamemode(props: GamemodeProps) {
    return (
        <div
            className={`relative mx-auto w-full rounded-2xl ${props.rank && "pb-6"}`}
            onClick={e => e.stopPropagation()}
        >
            {props.locked && (
                <div className="relative z-10 flex overflow-hidden rounded-2xl border border-zinc-600">
                    <div className="join bg-base-300 w-full transform-gpu blur">
                        <div className="join-item hxs:p-6 w-full p-4 px-6 text-left">
                            {props.name}
                        </div>
                        <div className="join-item hxs:p-6 p-4 px-6">
                            <TrophySvg className="rounded-r-none" width="24" height="24" />
                        </div>
                    </div>
                </div>
            )}

            {!props.locked && (
                <div className="join bg-base-300 relative z-10 flex rounded-2xl border border-zinc-600">
                    <button
                        className="join-item hover:bg-base-100 hxs:p-6 w-full p-4 px-6 text-left outline-none transition active:bg-slate-600"
                        onClick={() => props.onClick()}
                    >
                        {props.name}
                    </button>
                    <button className="join-item hover:bg-base-100 hxs:p-6 p-4 px-6 transition active:bg-slate-600">
                        <TrophySvg className="rounded-r-none" width="24" height="24" />
                    </button>
                </div>
            )}

            {props.locked && <LockedOverlay />}
            {props.rank && <RankInfo {...props.rank} />}
        </div>
    )
}

function LockedOverlay() {
    return (
        <div className="group absolute inset-0 z-20 flex rounded-2xl">
            <div className="flex w-full items-center justify-center group-hover:hidden">
                <div className="mr-2">Locked</div>
                <LockedSvg width="24" height="24" />
            </div>
            <div className="hidden w-full select-none items-center p-6 group-hover:flex">
                <UnlockedSvg width="24" height="24" />
                <div className="ml-2">Beat the previous gamemode!</div>
            </div>
        </div>
    )
}

function RankInfo(props: GamemodeRankProps) {
    const colorMap = {
        Diamond: {
            color: "bg-cyan-400",
            hover: "hover:bg-cyan-500",
            click: "active:bg-cyan-600",
        },
        Platinum: { color: "bg-gray-200", hover: "", click: "" },
        Gold: {
            color: "bg-yellow-500",
            hover: "hover:bg-yellow-600",
            click: "active:bg-yellow-700",
        },
        Silver: { color: "bg-gray-300", hover: "", click: "" },
        Bronze: { color: "bg-orange-500", hover: "", click: "" },
        Iron: { color: "bg-gray-500", hover: "", click: "" },
    }

    const color = colorMap[props.rank ?? "Iron"].color
    const colorHover = colorMap[props.rank ?? "Iron"].hover
    const colorClick = colorMap[props.rank ?? "Iron"].click

    return (
        <div
            // margin of one pixel to prevent the border shining through
            className={`absolute inset-0 m-[1px] flex items-end rounded-2xl rounded-t-3xl hover:cursor-pointer ${color} ${colorHover} ${colorClick}`}
        >
            <div
                className={
                    "grid h-6 w-full grid-cols-3 items-center justify-between px-6 text-left text-sm text-black"
                }
            >
                <div>{props.rank}</div>
                <div className="flex justify-center">{props.time}</div>
                <div className="flex justify-end"># {props.position}</div>
            </div>
        </div>
    )
}
