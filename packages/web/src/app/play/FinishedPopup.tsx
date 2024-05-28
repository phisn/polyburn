import { Transition } from "@headlessui/react"
import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useStore } from "zustand"
import { AuthButton } from "../../common/components/auth-button/AuthButton"
import { BackArrowSvg } from "../../common/components/inline-svg/BackArrow"
import { useAppStore } from "../../common/storage/app-store"
import { FinishedStatus, playStoreContext } from "./play-store"

export function FinishedPopup() {
    const playStore = useContext(playStoreContext)

    if (!playStore) {
        throw new Error("playStore is undefined")
    }

    const status = useStore(playStore, x => x.status)
    const user = useAppStore(x => x.user)

    const navigate = useNavigate()

    useEffect(() => {
        const playState = playStore.getState()

        if (
            playState.status.type === "finished" &&
            playState.status.uploadingStatus === "unauthenticated" &&
            user
        ) {
            playState.uploadReplay(
                playState.status.model,
                playState.status.ticks,
                playState.status.deaths,
            )
        }
    }, [user, playStore])

    function onClickCompleted() {
        if (window.history.length > 1) {
            window.history.back()
        } else {
            navigate("/")
        }
    }

    return (
        <Transition
            show={status.type === "finished"}
            enter="duration-200 transform ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
        >
            <CenterOnScreen>
                <div className="flex w-full max-w-[26rem] flex-col items-center">
                    <InfoContainerTitle className="p-6">Map Completed</InfoContainerTitle>

                    <div className="h-56 w-full">
                        <FinishedInfoContainer
                            status={status as FinishedStatus}
                            onClick={onClickCompleted}
                        />
                    </div>

                    {status.type === "finished" && status.uploadingStatus === "unauthenticated" && (
                        <AuthButton className="btn btn-primary m-2 w-full">
                            Login to save your time
                        </AuthButton>
                    )}
                </div>
            </CenterOnScreen>
        </Transition>
    )
}

export function FinishedInfoContainer(props: { status: FinishedStatus; onClick(): void }) {
    return (
        <InfoContainer
            className="hover:bg-base-100 active:bg-base-200 relative flex items-center justify-center transition hover:cursor-pointer"
            onClick={props.onClick}
        >
            <Transition
                show={props.status.uploadingStatus !== "uploading"}
                className="absolute"
                enter="ease-out duration-200 translate transform"
                enterFrom="opacity-0 translate-y-2"
                enterTo="opacity-100 translate-y-0"
            >
                <div className="flex flex-col items-center">
                    <ReplayStats
                        ticks={props.status.ticks}
                        deaths={props.status.deaths}
                        rank={props.status.rank}
                        personalBestRank={props.status.personalBest}
                    />

                    <div className="flex items-center self-center">
                        <BackArrowSvg width="40" height="40" className="rotate-180" />
                    </div>
                </div>
            </Transition>

            <Transition
                show={props.status.uploadingStatus === "uploading"}
                className="absolute"
                enter="ease-out duration-200 translate transform"
                enterFrom="opacity-0 translate-y-2"
                enterTo="opacity-100 translate-y-0"
            >
                <div className="relative inset-0 flex flex-col items-center justify-center space-y-8">
                    <div className="loading loading-lg" />
                    <div className="">Validating replay ...</div>
                </div>
            </Transition>
        </InfoContainer>
    )
}

function ReplayStats(props: {
    ticks: number
    deaths: number
    rank?: number
    personalBestRank?: { rank: number; ticks: number; deaths: number }
}) {
    return (
        <div className="col-span-3 flex space-x-10 p-4 text-xl">
            <div className="flex flex-col items-center space-y-3">
                <div>Time</div>
                <div>Deaths</div>
                <div>Rank</div>
            </div>
            <div className="flex flex-col items-center space-y-3">
                <ReplayStatsTime
                    ticks={props.ticks}
                    personalBestTicks={props.personalBestRank?.ticks}
                />

                <ReplayStatsDeaths
                    deaths={props.deaths}
                    personalBestDeaths={props.personalBestRank?.deaths}
                />

                {undefined !== props.rank && (
                    <ReplayStatsRank
                        rank={props.rank}
                        personalBestRank={props.personalBestRank?.rank}
                    />
                )}
                {undefined === props.rank && <div>No rank</div>}
            </div>
        </div>
    )
}

function ReplayStatsDeaths(props: { deaths: number; personalBestDeaths: number | undefined }) {
    let hintDiff = undefined

    if (props.personalBestDeaths !== undefined && props.deaths < props.personalBestDeaths) {
        hintDiff = (
            <div className="text-sm text-green-500">-{props.personalBestDeaths - props.deaths}</div>
        )
    } else if (props.personalBestDeaths !== undefined && props.deaths > props.personalBestDeaths) {
        hintDiff = (
            <div className="text-sm text-red-500">+{props.deaths - props.personalBestDeaths}</div>
        )
    }

    return (
        <ReplayStatsHint hint={hintDiff}>
            {props.deaths === 0 ? <div>No deaths</div> : <div>{props.deaths}</div>}
        </ReplayStatsHint>
    )
}

function ReplayStatsTime(props: { ticks: number; personalBestTicks: number | undefined }) {
    let hintDiff = undefined

    if (props.personalBestTicks !== undefined && props.ticks < props.personalBestTicks) {
        hintDiff = (
            <div className="text-sm text-green-500">
                -{formatTicksShort(props.personalBestTicks - props.ticks)}
            </div>
        )
    } else if (props.personalBestTicks !== undefined && props.ticks > props.personalBestTicks) {
        hintDiff = (
            <div className="text-sm text-red-500">
                +{formatTicksShort(props.ticks - props.personalBestTicks)}
            </div>
        )
    }

    return <ReplayStatsHint hint={hintDiff}>{formatTicks(props.ticks)}</ReplayStatsHint>
}

function ReplayStatsRank(props: { rank: number; personalBestRank: number | undefined }) {
    let hintDiff = undefined

    if (props.personalBestRank !== undefined && props.rank < props.personalBestRank) {
        hintDiff = (
            <div className="text-sm text-green-500">-{props.personalBestRank - props.rank}</div>
        )
    } else if (props.personalBestRank !== undefined && props.rank > props.personalBestRank) {
        hintDiff = (
            <div className="text-sm text-red-500">+{props.rank - props.personalBestRank}</div>
        )
    }

    return <ReplayStatsHint hint={hintDiff}>{props.rank}</ReplayStatsHint>
}

function ReplayStatsHint(props: { children: React.ReactNode; hint: React.ReactNode }) {
    return (
        <div className="relative">
            {props.children}
            <div className="absolute -right-2 top-0 translate-x-full transform">{props.hint}</div>
        </div>
    )
}

function InfoContainerTitle(props: { children: React.ReactNode; className?: string }) {
    return (
        <div className={"whitespace-nowrap text-2xl text-white " + props.className}>
            {props.children}
        </div>
    )
}

function InfoContainer(props: {
    children: React.ReactNode
    className?: string
    onClick: () => void
}) {
    return (
        <div
            className={
                "bg-base-300 border-base-100 h-full w-full rounded-2xl border p-4 " +
                props.className
            }
            onClick={props.onClick}
        >
            {props.children}
        </div>
    )
}

function CenterOnScreen(props: { children: React.ReactNode }) {
    return (
        <div className="absolute inset-0 z-10 bg-black bg-opacity-30 backdrop-blur-sm">
            <div className="flex h-full w-full items-center justify-center p-3">
                {props.children}
            </div>
        </div>
    )
}

function formatTicks(ticks: number) {
    const totalSeconds = ticks / 60
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const hundredths = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 1000)

    // Pad numbers with leading zeros if necessary
    const paddedHours = String(hours).padStart(2, "0")
    const paddedMinutes = String(minutes).padStart(2, "0")
    const paddedSeconds = String(seconds).padStart(2, "0")
    const paddedHundredths = String(hundredths).padStart(3, "0")

    let base = ""

    if (hours > 0) {
        base += `${paddedHours}:`
    }

    return `${base}${paddedMinutes}:${paddedSeconds}.${paddedHundredths}`
}

function formatTicksShort(ticks: number) {
    // first check if hours are needed
    const totalSeconds = ticks / 60
    const hours = Math.floor(totalSeconds / 3600)

    if (hours >= 1) {
        return `${hours}h`
    }

    const minutes = Math.floor(totalSeconds / 60)

    if (minutes >= 1) {
        return `${minutes}m`
    }

    if (totalSeconds >= 1) {
        return `${Math.floor(totalSeconds)}s`
    }

    return `${Math.floor(totalSeconds * 1000)}ms`
}
