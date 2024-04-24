import { BrowserView, isMobile } from "react-device-detect"
import { WorldView } from "shared/src/views/world-view"
import { LockedSvg } from "../src/common/components/inline-svg/Locked"

const todoProgressFeature = true

export function World(props: { world: WorldView; onSelected: () => void }) {
    return (
        <div className={`relative isolate flex max-w-[28rem] rounded-2xl`}>
            <div
                className="absolute inset-0 z-10 rounded-2xl opacity-30 transition hover:cursor-pointer hover:bg-white active:opacity-70"
                onClick={() => props.onSelected()}
            ></div>
            <div className="w-full p-4">
                <div className="border-base-200 relative w-full overflow-hidden rounded-2xl border-2">
                    <img
                        className={`w-full ${!todoProgressFeature && " transform-gpu blur-3xl"}`}
                        src="/static/background.png"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-black opacity-5"></div>
                </div>
            </div>
            <Overlay world={props.world} />
            {!todoProgressFeature && <LockedOverlay />}
        </div>
    )
}

function LockedOverlay() {
    return (
        <div className="group absolute inset-0 z-20 flex rounded-2xl text-zinc-300">
            <BrowserView>
                <div className="absolute inset-0 flex w-full items-center justify-center group-hover:hidden">
                    <div className="flex rounded p-4 drop-shadow">
                        <LockedSvg width="24" height="24" />
                    </div>
                </div>
            </BrowserView>
            <div
                className={`absolute inset-0 w-full select-none items-center justify-center p-6 ${
                    isMobile ? "flex" : "hidden group-hover:flex"
                }`}
            >
                <LockedSvg width="24" height="24" />
                <div className="ml-2">Beat the previous map!</div>
            </div>
        </div>
    )
}

function Overlay(props: { world: WorldView }) {
    return (
        <div className="absolute inset-0 isolate">
            <div className="absolute left-1/2 -translate-x-1/2 transform">
                <div
                    className={`w-fit  rounded-2xl  p-3 px-8 text-xl shadow ${
                        todoProgressFeature ? "bg-white text-black" : "bg-base-200 text-zinc-300"
                    }`}
                >
                    {!todoProgressFeature && "Locked"}
                    {todoProgressFeature && props.world.id.name}
                </div>
            </div>

            {/*
            <div className="bg-base-100 absolute bottom-0 right-0 rounded-2xl">
                <div className="grid">
                    <div className="steps items-center py-2">
                        {Array.from({ length: props.info.maxProgress }, (_, i) => (
                            <WorldProgressStep key={i} index={i} progress={props.info.progress} />
                        ))}
                    </div>
                </div>
            </div>
            */}
        </div>
    )
}
/*

function WorldProgressStep(props: { index: number; progress: WorldProgress | undefined }) {
    return (
        <div
            data-content=""
            className={`step ${(props.progress?.modes ?? 0) > props.index && "step-secondary"}`}
        ></div>
    )
}

*/
