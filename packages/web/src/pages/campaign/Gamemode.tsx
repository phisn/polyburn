import { animated, useResize, useSpring } from "@react-spring/web"
import { useDrag } from "@use-gesture/react"
import { useMemo, useRef, useState } from "react"
import { BrowserView, isMobile } from "react-device-detect"
import { useNavigate } from "react-router-dom"
import { ReplayStats } from "runtime/src/model/replay/replay-stats"
import { GamemodeInfo } from "../../../../shared/src/worker-api/gamemode-info"
import { WorldInfo } from "../../../../shared/src/worker-api/world-info"
import { trpc } from "../../common/trpc/trpc"
import { ArrowClockwise } from "../../components/common/svg/ArrowClockwise"
import { LockedSvg } from "../../components/common/svg/Locked"
import { PlayFilled } from "../../components/common/svg/PlayFilled"
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
            className="flex h-full items-center justify-center rounded-2xl p-6"
        >
            <ModalPanel className="flex h-full w-full max-w-[48rem] flex-col items-center space-y-4">
                <div className="justify-center">Leaderboard</div>
                <Leaderboard
                    world={props.world}
                    gamemode={props.gamemode}
                    closeDialog={props.closeDialog}
                />
            </ModalPanel>
        </Modal>
    )
}

function Leaderboard(props: { world: WorldInfo; gamemode: GamemodeInfo; closeDialog: () => void }) {
    const list = [
        { username: "a", ticks: 100, leaderboardId: 1 },
        { username: "b", ticks: 200, leaderboardId: 2 },
        { username: "c", ticks: 300, leaderboardId: 3 },
        { username: "d", ticks: 400, leaderboardId: 4 },
        { username: "e", ticks: 500, leaderboardId: 5 },
        { username: "f", ticks: 600, leaderboardId: 6 },
        { username: "g", ticks: 700, leaderboardId: 7 },
        { username: "h", ticks: 800, leaderboardId: 8 },
        { username: "i", ticks: 900, leaderboardId: 9 },
        { username: "j", ticks: 1000, leaderboardId: 10 },
    ]

    return (
        <div className="font-outfit flex h-full w-full flex-col rounded-xl bg-green-300">
            <div className="w-full p-4 text-center">Some Title</div>
            <DraggableList length={10} className="overflow-hidden rounded-xl bg-blue-300">
                {index => (
                    <div className="m-2 flex w-full justify-center bg-white p-8">
                        <div className="btn">{index}</div>
                    </div>
                )}
            </DraggableList>
        </div>
    )
}

function DraggableList(props: {
    length: number
    className?: string
    children: (index: number) => React.ReactNode
}) {
    const firstChildRef = useRef<HTMLDivElement>(null)
    const relativeContainerRef = useRef<HTMLDivElement>(null)
    const absoluteContainerRef = useRef<HTMLDivElement>(null)

    const oldElementIndex = useRef(0)
    const newElementIndex = useRef(0)

    const elements = useMemo(() => Array.from({ length: props.length }), [props.length])

    function clampElementIndex(index: number) {
        return Math.max(0, Math.min(props.length - 1, index))
    }

    const { height: elementHeight } = useResize({
        container: firstChildRef,
    })

    const { height: relativeContainerHeight } = useResize({
        container: relativeContainerRef,
    })

    const { height: absoluteContainerHeight } = useResize({
        container: absoluteContainerRef,
    })

    const [springs, api] = useSpring(() => ({
        y: 0,
        config: {
            tension: 210,
            friction: 20,
        },
    }))

    function applyScrollCap(moveDownBy: number, smoothed?: number) {
        const remainingHeight = absoluteContainerHeight.get() + moveDownBy

        let overscroll = 0

        const overscrollDown = relativeContainerHeight.get() - remainingHeight
        if (overscrollDown > 0) {
            overscroll = -overscrollDown
        }

        if (moveDownBy > 0) {
            overscroll = moveDownBy
        }

        moveDownBy -= overscroll

        if (smoothed) {
            moveDownBy += Math.sign(overscroll) * Math.pow(Math.abs(overscroll), smoothed)
        }

        if (overscrollDown > 0) {
            moveDownBy = Math.min(moveDownBy, 0)
        }

        return moveDownBy
    }

    const binds = useDrag(
        ({ event, active, movement: [, my], swipe: [, swipeY], velocity: [, vy] }) => {
            event.preventDefault()

            if (active === false) {
                oldElementIndex.current = newElementIndex.current
            }

            // allow swiping
            if (swipeY && oldElementIndex.current === newElementIndex.current) {
                const t = newElementIndex.current + (swipeY < 0 ? 1 : -1)
                newElementIndex.current = clampElementIndex(t)
            }

            // calculate movement
            let moveDownBy = -oldElementIndex.current * elementHeight.get()

            moveDownBy = applyScrollCap(moveDownBy)

            // apply change of gesture
            if (active) {
                moveDownBy += my
                moveDownBy = applyScrollCap(moveDownBy, 0.7)
            }

            // stop at element
            if (active) {
                newElementIndex.current = clampElementIndex(
                    Math.round((-moveDownBy + elementHeight.get() / 2) / elementHeight.get()),
                )

                console.log("n", newElementIndex.current)
            }

            api.start({
                y: moveDownBy,
                config: {
                    velocity: active ? vy : undefined,
                },
            })
        },
        {
            filterTaps: true,
        },
    )

    return (
        <div ref={relativeContainerRef} className={"relative h-full " + props.className}>
            <animated.div
                ref={absoluteContainerRef}
                className="absolute inset-0 flex h-max touch-none select-none flex-col items-center bg-red-300"
                {...binds()}
                style={springs}
            >
                {elements.map((_, index) => (
                    <div
                        ref={index === 0 ? firstChildRef : undefined}
                        key={index}
                        className="w-full"
                    >
                        {props.children(index)}
                    </div>
                ))}
            </animated.div>
        </div>
    )
}

function LeaderboardList(props: { world: WorldInfo; gamemode: GamemodeInfo }) {
    const [replays] = trpc.replay.list.useSuspenseQuery({
        world: props.world.id.name,
        gamemode: props.gamemode.name,
    })

    while (replays.length < 10) {
        replays.push(replays[0])
    }

    function onCompeteReplay(leaderboardId: number) {
        console.log("compete", leaderboardId)
    }

    function onReplayReplay(leaderboardId: number) {
        console.log("replay", leaderboardId)
    }

    return (
        <>
            {replays.map((row, i) => (
                <LeaderboardRow
                    key={i}
                    rank={i + 1}
                    time={secondsToMMSS(row.ticks * 16.66667)}
                    name={row.username}
                    onCompete={() => onCompeteReplay(row.leaderboardId)}
                    onReplay={() => onReplayReplay(row.leaderboardId)}
                />
            ))}
            {replays.length === 0 && (
                <div className="space-y-8 p-12">
                    <div className="text-center text-xl">
                        Be the first to complete this gamemode and get your name on the leaderboard!
                    </div>
                </div>
            )}
        </>
    )
}

function LeaderboardRow(props: {
    rank: number
    time: string
    name: string
    onReplay: () => void
    onCompete: () => void
}) {
    return (
        <div>
            {props.rank > 1 && <div className="mx-8 mr-12 h-[1px] bg-zinc-800"></div>}
            <div className="group my-2 grid w-full grid-cols-3 items-center rounded-2xl px-4 py-2 transition ">
                <div className="flex items-center space-x-4">
                    <div className="w-12">{props.rank}.</div>
                    <div className="justify-self-center">{props.time}</div>
                </div>

                <div className="space-x-1 justify-self-center opacity-0 transition group-hover:opacity-100">
                    <button
                        className="btn-square btn-ghost btn m-0"
                        onClick={() => props.onReplay()}
                    >
                        <ArrowClockwise width="16" height="16" />
                    </button>
                    <button
                        className="btn-square btn-ghost btn m-0"
                        onClick={() => props.onCompete()}
                    >
                        <PlayFilled width="16" height="16" />
                    </button>
                </div>

                <div className="justify-self-end">{props.name}</div>
            </div>
        </div>
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
