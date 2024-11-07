import { useState } from "react"
import { BrowserView, isMobile } from "react-device-detect"
import { useNavigate } from "react-router-dom"
import { GamemodeDTO, WorldDTO } from "shared/src/server/world"
import { Ticks } from "../../components/common/Ticks"
import { LockedSvg } from "../../components/common/svg/Locked"
import { TrophySvg } from "../../components/common/svg/Trophy"
import { LeaderboardModal } from "./leaderboard/LeaderboardModal"

const todoLockedFeature = false

export function Gamemode(props: { world: WorldDTO; gamemode: GamemodeDTO }) {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

    function onGamemodeSelected() {
        navigate(`/play/${props.world.worldname}/${props.gamemode.name}`)
    }

    return (
        <>
            <div
                className={`relative mx-auto h-fit w-full rounded-2xl ${
                    props.gamemode.replaySummary && "pb-6"
                }`}
                onClick={e => e.stopPropagation()}
            >
                <div className="join bg-base-300 relative z-10 flex h-16 rounded-2xl border border-zinc-600">
                    <button
                        className="join-item hover:bg-base-100 w-full rounded-[0.9rem] px-6 text-left outline-none transition active:bg-slate-600"
                        onClick={() => void onGamemodeSelected()}
                    >
                        {props.gamemode.name}
                    </button>
                    <button
                        className="join-item hover:bg-base-100 rounded-[0.9rem] px-6 transition active:bg-slate-600"
                        onClick={() => void setOpen(true)}
                    >
                        <TrophySvg className="rounded-r-none" width="24" height="24" />
                    </button>
                </div>

                {todoLockedFeature && <LockedOverlay />}
                {props.gamemode.replaySummary && (
                    <ReplayStatsDisplay
                        stats={props.gamemode.replaySummary}
                        onSelected={() => {}}
                    />
                )}
            </div>
            <LeaderboardModal
                open={open}
                closeDialog={() => {
                    setOpen(false)
                }}
                world={props.world}
                gamemode={props.gamemode}
            />
        </>
    )
}

function ReplayStatsDisplay(props: {
    stats: { deaths: number; ticks: number }
    onSelected: () => void
}) {
    return (
        <div
            // margin of one pixel to prevent the border shining through
            className="absolute inset-0 m-[1px] flex items-end rounded-2xl rounded-t-3xl bg-zinc-300 transition hover:cursor-pointer hover:bg-zinc-400"
            onClick={() => props.onSelected()}
        >
            <div
                className={
                    "grid h-6 w-full grid-cols-3 items-center justify-between px-6 text-left text-sm text-black"
                }
            >
                <div>Your Record</div>
                <Ticks value={props.stats.ticks} className="flex justify-center" />
                <div className="flex justify-end">{props.stats.deaths} Deaths</div>
            </div>
        </div>
    )
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
