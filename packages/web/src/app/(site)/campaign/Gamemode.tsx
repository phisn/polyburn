import { WorldModel, importWorld } from "runtime/src/model/world/WorldModel"
import { LockedSvg } from "../../../common/inline-svg/Locked"
import { TrophySvg } from "../../../common/inline-svg/Trophy"
import { UnlockedSvg } from "../../../common/inline-svg/Unlocked"

type Rank = "Diamond" | "Platinum" | "Gold" | "Silver" | "Bronze" | "Iron"

export interface GamemodeStats {
    name: string
    rank?: GamemodeRankProps
    locked?: boolean
}

interface GamemodeProps extends GamemodeStats {
    onClick: (world: WorldModel) => void
}

interface GamemodeRankProps {
    rank: Rank
    time: string
    position: number
}

export function Gamemode(props: GamemodeProps) {
    const runLevel = () => {
        const level1 =
            "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"

        props.onClick(importWorld(level1))
    }

    return (
        <div
            className={`relative mx-auto w-full max-w-md rounded-2xl ${
                props.rank ? "pb-6" : ""
            }`}
            onClick={e => e.stopPropagation()}
        >
            <div className="join relative z-10 flex rounded-2xl bg-zinc-900">
                <button
                    className="join-item hover:bg-base-100 hxs:p-6 w-full p-4 px-6 text-left transition active:bg-slate-600"
                    onClick={() => runLevel()}
                >
                    {props.name}
                </button>
                <button className="join-item hover:bg-base-100 hxs:p-6 p-4 px-6 transition active:bg-slate-600">
                    <TrophySvg
                        className="rounded-r-none"
                        width="24"
                        height="24"
                    />
                </button>
            </div>

            {props.locked && <LockedOverlay />}
            {props.rank && <RankInfo {...props.rank} />}
        </div>
    )
}

function LockedOverlay() {
    return (
        <div className="group absolute bottom-0 left-0 right-0 top-0 z-20 flex rounded-2xl backdrop-blur ">
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
            className={`absolute bottom-0 left-0 right-0 top-0 m-[1px] flex items-end rounded-2xl rounded-t-3xl hover:cursor-pointer ${color} ${colorHover} ${colorClick}`}
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
