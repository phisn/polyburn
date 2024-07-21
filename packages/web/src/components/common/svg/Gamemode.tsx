import { useState } from "react"
import { BrowserView, isMobile } from "react-device-detect"
import { useNavigate } from "react-router-dom"
import { ReplayStats } from "runtime/src/model/replay/replay-stats"
import { GamemodeInfo } from "shared/src/worker-api/gamemode-info"
import { WorldInfo } from "shared/src/worker-api/world-info"
import { WorldLeaderboardEntry } from "shared/src/worker-api/world-leaderboard"
import { trpc } from "../../common/trpc/trpc"
import { DraggableList } from "../../components/common/DraggableList"
import { Clock } from "../../components/common/svg/Clock"
import { LockedSvg } from "../../components/common/svg/Locked"
import { PlayCircle } from "../../components/common/svg/PlayCircle"
import { Skull } from "../../components/common/svg/Skull"
import { Sword } from "../../components/common/svg/Sword"
import { SwordFilled } from "../../components/common/svg/SwordFilled"
import { TrophySvg } from "../../components/common/svg/Trophy"
import { Modal, ModalPanel } from "../../components/modals/Modal"

const todoLockedFeature = false

export function Gamemode(props: { world: WorldInfo; gamemodeview: GamemodeInfo }) {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

    function onGamemodeSelected() {
        navigate(`/play/${props.world.id.name}/${props.gamemodeview.name}`)
    }

    return (
        <>
            <div
                className={`relative mx-auto h-fit w-full rounded-2xl ${
                    props.gamemodeview.replayStats && "pb-6"
                }`}
                onClick={e => e.stopPropagation()}
            >
                <div className="join bg-base-300 relative z-10 flex h-16 rounded-2xl border border-zinc-600">
                    <button
                        className="join-item hover:bg-base-100 w-full rounded-[0.9rem] px-6 text-left outline-none transition active:bg-slate-600"
                        onClick={() => void onGamemodeSelected()}
                    >
                        {props.gamemodeview.name}
                    </button>
                    <button
                        className="join-item hover:bg-base-100 rounded-[0.9rem] px-6 transition active:bg-slate-600"
                        onClick={() => void setOpen(true)}
                    >
                        <TrophySvg className="rounded-r-none" width="24" height="24" />
                    </button>
                </div>

                {todoLockedFeature && <LockedOverlay />}
                {props.gamemodeview.replayStats && (
                    <ReplayStatsDisplay
                        stats={props.gamemodeview.replayStats}
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
                gamemode={props.gamemodeview}
            />
        </>
    )
}

function LeaderboardModal(props: {
    open: boolean
    world: WorldInfo
    gamemode: GamemodeInfo
    closeDialog: () => void
}) {
    return (
        <Modal
            open={props.open}
            closeDialog={() => {
                console.log("close leaderboard")
                props.closeDialog()
            }}
            className="hmd:py-20 flex h-full items-center justify-center rounded-2xl p-6"
        >
            <ModalPanel className="flex h-full w-full max-w-[32rem] flex-col items-center space-y-4">
                <div className="justify-center text-lg">Leaderboard</div>
                <Leaderboard
                    world={props.world}
                    gamemode={props.gamemode}
                    closeDialog={props.closeDialog}
                />
            </ModalPanel>
        </Modal>
    )
}

function LeaderboardContainer(props: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={
                "font-outfit bg-base-300 border-base-100 flex h-full w-full flex-col rounded-xl border " +
                props.className
            }
        >
            {props.children}
        </div>
    )
}

function LeaderboardEntryStats(props: {
    entry?: WorldLeaderboardEntry
    iconClassName?: string
    textClassName?: string
}) {
    return (
        <div className="flex text-sm text-gray-400">
            <div className="flex w-24 items-center space-x-1">
                <Clock width="12" height="12" className={props.iconClassName} />
                <div className={props.textClassName}>{secondsToMMSS(props.entry?.ticks ?? 0)}</div>
            </div>
            {props.entry?.deaths === 0 && (
                <div className="flex items-center space-x-1">
                    <Sword width="12" height="12" className={props.iconClassName} />
                </div>
            )}

            {(props.entry?.deaths ?? 0) > 0 && (
                <div className="flex items-center space-x-1">
                    <Skull width="12" height="12" className={props.iconClassName} />
                    <div className={props.textClassName}>{props.entry?.deaths}</div>
                </div>
            )}
        </div>
    )
}

function LeaderboardEntry(props: { entry?: WorldLeaderboardEntry }) {
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

    const placeColoring = placeColorings[props.entry?.place ?? 0]

    return (
        <>
            <div className={"flex h-[4.5rem] w-full items-center " + placeColoring?.root}>
                <div className={"flex w-24 justify-center " + placeColoring?.place}>
                    <div>{props.entry?.place}</div>
                </div>
                <div>
                    <div className="text-lg">{props.entry?.username}</div>
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

function Leaderboard(props: { world: WorldInfo; gamemode: GamemodeInfo; closeDialog: () => void }) {
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

    replays.entries[0].deaths = 0

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
            <DraggableList length={replays.entries.length} className="overflow-hidden rounded-xl">
                {index => <LeaderboardEntry entry={replays.entries[index]} key={index} />}
            </DraggableList>
        </LeaderboardContainer>
    )
}

function ReplayStatsDisplay(props: { stats: ReplayStats; onSelected: () => void }) {
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
