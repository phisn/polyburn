import { Transition } from "@headlessui/react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ReplayModel } from "runtime/proto/replay"
import { ExtendedRuntime } from "web-game/src/game/runtime-extension/new-extended-runtime"
import { bytesToBase64 } from "../../../src-campaign-old/player-handlers/GameHandler"
import { AuthButton } from "../../common/components/auth-button/AuthButton"
import { BackArrowSvg } from "../../common/components/inline-svg/BackArrow"
import { useAppStore } from "../../common/storage/app-store"
import { trpc } from "../../common/trpc/trpc"

export function FinishedPopup(props: { runtime: ExtendedRuntime }) {
    const stats = props.runtime.factoryContext.store.world.components.stats!
    const user = useAppStore(x => x.user)
    const newAlert = useAppStore(x => x.newAlert)
    const navigate = useNavigate()

    const validation = trpc.validateReplay.useMutation({
        onError: () => {
            newAlert({
                type: "error",
                message: "Error validating replay",
            })
        },
    })

    const { mutate } = validation

    useEffect(() => {
        if (!user) {
            return
        }

        setTimeout(
            () =>
                mutate({
                    world: props.runtime.factoryContext.settings.worldname,
                    gamemode: props.runtime.factoryContext.gamemode,
                    replay: bytesToBase64(
                        ReplayModel.encode(
                            props.runtime.factoryContext.replayCapture.replay,
                        ).finish(),
                    ),
                }),
            0,
        )
    }, [mutate, props, user])

    function onClickCompleted() {
        navigate("/")
    }

    return (
        <CenterOnScreen>
            <div className="flex w-full max-w-[26rem] flex-col items-center">
                <InfoContainerTitle className="p-6">Map Completed</InfoContainerTitle>

                <div className="h-56 w-full">
                    <FinishedInfoContainer
                        loading={validation.isLoading}
                        onClick={onClickCompleted}
                        ticks={stats.ticks}
                        deaths={stats.deaths}
                        rank={validation.data?.rank}
                        personalBestRank={validation.data?.personalBestRank}
                    />
                </div>

                {!user && (
                    <AuthButton className="btn btn-primary m-2 w-full">
                        Login to save your time
                    </AuthButton>
                )}
            </div>
        </CenterOnScreen>
    )
}

export function FinishedInfoContainer(props: {
    loading: boolean
    onClick: () => void
    ticks: number
    deaths: number
    rank?: number
    personalBestRank?: number
}) {
    return (
        <InfoContainer
            className="hover:bg-base-100 active:bg-base-200 relative flex items-center justify-center transition hover:cursor-pointer"
            onClick={props.onClick}
        >
            <Transition
                show={!props.loading}
                className="absolute"
                enter="ease-out duration-200 translate transform"
                enterFrom="opacity-0 translate-y-2"
                enterTo="opacity-100 translate-y-0"
            >
                <div className="flex flex-col items-center">
                    <RunStats
                        ticks={props.ticks}
                        deaths={props.deaths}
                        rank={props.rank}
                        personalBestRank={props.personalBestRank}
                    />

                    <div className="flex items-center self-center">
                        <BackArrowSvg width="40" height="40" className="rotate-180" />
                    </div>
                </div>
            </Transition>

            <Transition
                show={props.loading}
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

function RunStats(props: {
    ticks: number
    deaths: number
    rank?: number
    personalBestRank?: number
}) {
    return (
        <div className="col-span-3 flex space-x-10 p-4 text-xl">
            <div className="flex flex-col items-center space-y-3">
                <div>Time</div>
                <div>Deaths</div>
                <div>Rank</div>
            </div>
            <div className="flex flex-col items-center space-y-3">
                <div>{formatTicks(props.ticks)}</div>
                <div>{props.deaths}</div>

                {undefined !== props.rank && !props.personalBestRank && <div>{props.rank + 1}</div>}
                {undefined !== props.rank && !!props.personalBestRank && (
                    <div>
                        {props.rank + 1} (Best {props.personalBestRank + 1})
                    </div>
                )}
                {undefined === props.rank && <div>No rank</div>}
            </div>
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
