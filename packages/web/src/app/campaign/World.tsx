import { LockedSvg } from "../../common/components/inline-svg/Locked"

export interface WorldProgress {
    modes: number
}

export interface WorldInfo {
    raw: string
    name: string
    progress?: WorldProgress
    maxProgress: number
}

export interface WorldProps extends WorldInfo {
    onClick?: () => void
}

export function World(props: WorldProps) {
    return (
        <div className={`relative isolate flex aspect-[7/4] max-w-[28rem] rounded-2xl`}>
            <div className="absolute bottom-0 left-0 right-0 top-0 isolate">
                <div className="w-fit rounded-2xl bg-zinc-800 p-3 px-8 text-xl text-zinc-200">
                    {props.name}
                </div>

                <div className="absolute bottom-0 right-0 rounded-2xl bg-zinc-800">
                    <div className="grid">
                        <div className="steps items-center py-2">
                            {Array.from({ length: props.maxProgress }, (_, i) => (
                                <WorldProgressStep key={i} index={i} progress={props.progress} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="absolute bottom-0 left-0 right-0 top-0 rounded-2xl opacity-10 transition hover:cursor-pointer hover:bg-white active:opacity-30"
                onClick={props.onClick}
            ></div>
            <div className="flex p-3">
                <img className="w-full rounded-2xl" src="/static/background.png" />
            </div>
            {!props.progress && <LockedOverlay />}
        </div>
    )
}

function LockedOverlay() {
    return (
        <div className="group absolute bottom-0 left-0 right-0 top-0 z-20 flex rounded-2xl backdrop-blur-2xl">
            <div className="absolute bottom-0 left-0 right-0 top-0 rounded-2xl bg-white opacity-5"></div>
            <div className="absolute bottom-0 left-0 right-0 top-0 flex w-full items-center justify-center text-zinc-200 group-hover:hidden">
                <div className="mr-2">Locked</div>
                <LockedSvg width="24" height="24" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 top-0 hidden w-full select-none items-center justify-center p-6 text-zinc-200 group-hover:flex">
                <LockedSvg width="24" height="24" />
                <div className="ml-2">Beat the previous map!</div>
            </div>
        </div>
    )
}

function WorldProgressStep(props: { index: number; progress: WorldProgress | undefined }) {
    return (
        <div
            data-content=""
            className={`step ${(props.progress?.modes ?? 0) > props.index && "step-secondary"}`}
        ></div>
    )
}
