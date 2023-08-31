import { BrowserView, isMobile } from "react-device-detect"
import { ReplayStats } from "runtime/src/model/replay/ReplayStats"
import { GamemodeView } from "shared/src/views/GamemodeView"
import { LockedSvg } from "../../common/components/inline-svg/Locked"
import { TrophySvg } from "../../common/components/inline-svg/Trophy"

const todoLockedFeature = false

export function Gamemode(props: { gamemode: GamemodeView; onSelected: () => void }) {
    return (
        <div
            className={`relative mx-auto h-fit w-full rounded-2xl ${
                props.gamemode.replayStats && "pb-6"
            }`}
            onClick={e => e.stopPropagation()}
        >
            {todoLockedFeature && (
                <div className="join bg-base-300 relative z-10 flex h-16 rounded-2xl border border-zinc-700"></div>
            )}

            {!todoLockedFeature && (
                <div className="join bg-base-300 relative z-10 flex h-16 rounded-2xl border border-zinc-600">
                    <button
                        className="join-item hover:bg-base-100 w-full rounded-[0.9rem] px-6 text-left outline-none transition active:bg-slate-600"
                        onClick={() => props.onSelected()}
                    >
                        {props.gamemode.name}
                    </button>
                    <button className="join-item hover:bg-base-100 rounded-[0.9rem] px-6 transition active:bg-slate-600">
                        <TrophySvg className="rounded-r-none" width="24" height="24" />
                    </button>
                </div>
            )}

            {todoLockedFeature && <LockedOverlay />}
            {props.gamemode.replayStats && (
                <ReplayStatsDisplay stats={props.gamemode.replayStats} />
            )}
        </div>
    )
}

function ReplayStatsDisplay(props: { stats: ReplayStats }) {
    return (
        <div
            // margin of one pixel to prevent the border shining through
            className="absolute inset-0 m-[1px] flex items-end rounded-2xl rounded-t-3xl bg-zinc-300 hover:cursor-pointer"
        >
            <div
                className={
                    "grid h-6 w-full grid-cols-3 items-center justify-between px-6 text-left text-sm text-black"
                }
            >
                <div>Global Record</div>
                <div className="flex justify-center">
                    {secondsToMMSS((props.stats.ticks * 16.66667) | 0)}
                </div>
                <div className="flex justify-end">{props.stats.deaths} Deaths</div>
            </div>
        </div>
    )
}

export const secondsToMMSS = (seconds: number) => {
    const HH = `${Math.floor(seconds / (1000 * 60))}`.padStart(2, "0")
    const MM = `${Math.floor(seconds / 1000) % 60}`.padStart(2, "0")
    const SS = `${Math.floor(seconds % 1000)}`.padStart(3, "0")
    return [HH, MM, SS].join(":")
}

function LockedOverlay() {
    return (
        <div className="group absolute inset-0 z-20 flex justify-between rounded-2xl">
            <BrowserView renderWithFragment>
                <div className="flex w-full items-center p-6 group-hover:hidden">
                    <LockedSvg width="24" height="24" />
                    <div className="ml-2">Locked</div>
                </div>
            </BrowserView>
            <div
                className={`w-full items-center p-6 ${
                    isMobile ? "flex" : "hidden group-hover:flex"
                }`}
            >
                <LockedSvg width="24" height="24" />
                <div className="ml-2">Beat the previous gamemode!</div>
            </div>

            <div className="text-base-200 my-auto px-6 transition">
                <TrophySvg className="rounded-r-none" width="24" height="24" />
            </div>
        </div>
    )
}

/*

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
*/
