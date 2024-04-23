import { Transition } from "@headlessui/react"
import { BrowserView, isMobile } from "react-device-detect"
import { WorldView } from "shared/src/views/world-view"
import { LockedSvg } from "../../common/components/inline-svg/Locked"

const todoProgressFeature = true

export function World(props: { world?: WorldView; onSelected: () => void }) {
    //    return <div className="m-2 h-[18rem] w-[28rem] bg-white"></div>
    function ButtonOverlay() {
        return (
            <div
                className="absolute inset-0 z-30 rounded-2xl opacity-30 transition hover:cursor-pointer hover:bg-white active:opacity-70"
                onClick={() => props.onSelected()}
            ></div>
        )
    }

    return (
        <WorldContainerOuter>
            <ButtonOverlay />
            <Overlay world={props.world} />
            <WorldContainerInner>
                {props.world === undefined && <div className="h-full w-full rounded-none" />}
                <Transition
                    show={props.world !== undefined}
                    enter="transition duration-300 ease-out"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                >
                    <img className="absolute bottom-0 z-0" src="/static/background.png" />
                </Transition>
            </WorldContainerInner>
        </WorldContainerOuter>
    )
}

function WorldContainerInner(props: { children: React.ReactNode }) {
    return (
        <div className="h-full p-4">
            <div className="border-base-100 h-full overflow-hidden rounded-2xl border-2">
                <div className="relative z-10 h-full bg-black">{props.children}</div>
            </div>
        </div>
    )
}

function WorldContainerOuter(props: { children: React.ReactNode }) {
    return (
        <div className="relative h-[16rem] w-full max-w-[28rem]">
            <div className="absolute inset-0">{props.children}</div>
        </div>
    )
}
/*

export function WorldSkeleton() {
    return (
        <div className={`relative isolate flex aspect-[5/3] w-full max-w-[28rem]`}>
            <div className="w-full p-4">
                <div className="border-base-100 h-full w-full overflow-hidden rounded-2xl border-2">
                    <div className="skeleton h-full w-[28rem] rounded-xl bg-black" />
                </div>
            </div>
            <Overlay world={undefined} />
        </div>
    )
}

export function World(props: { world?: WorldView; onSelected: () => void }) {
    function ButtonOverlay() {
        return (
            <div
                className="absolute inset-0 z-10 rounded-2xl opacity-30 transition hover:cursor-pointer hover:bg-white active:opacity-70"
                onClick={() => props.onSelected()}
            ></div>
        )
    }

    function BackgroundImage(props: { blur: boolean }) {
        return (
            <img
                className={`h-full w-full object-scale-down ${props.blur && " transform-gpu blur-3xl"}`}
                src="/static/background.png"
            />
        )
    }

    return (
        <>
            <Transition
                className="relative isolate flex aspect-[5/3] h-min w-full max-w-[28rem] shrink"
                show={props.world !== undefined}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
            >
                <ButtonOverlay />
                <div className="h-full w-full p-4">
                    <div className="border-base-100 h-full w-full overflow-hidden rounded-2xl border-2">
                        <BackgroundImage blur={!todoProgressFeature} />
                    </div>
                </div>
                <Overlay world={props.world} />
                {!todoProgressFeature && <LockedOverlay />}
            </Transition>
            {!props.world && <WorldSkeleton />}
        </>
    )
}
*/

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

export function Overlay(props: { world?: WorldView }) {
    function TitleInLocked() {
        return (
            <div className="bg-base-200 min-h-14 min-w-40 rounded-2xl p-3 px-8 text-xl text-zinc-300 shadow">
                Locked
            </div>
        )
    }

    function TitleInNormal() {
        return (
            <div className="min-h-14 w-fit min-w-40 rounded-2xl bg-white p-3 px-8 text-xl text-black shadow">
                {props.world?.id.name}
            </div>
        )
    }

    function TitleInUndefined() {
        return (
            <div className="flex min-h-14 w-fit min-w-40 items-center justify-center rounded-2xl bg-white p-3 px-8 text-xl text-black shadow">
                <div className="loading loading-sm" />
            </div>
        )
    }

    return (
        <div className="absolute inset-0 isolate z-20">
            <div className="absolute left-1/2 -translate-x-1/2 transform">
                {!todoProgressFeature && <TitleInLocked />}
                {!!todoProgressFeature && props.world && <TitleInNormal />}
                {!props.world && <TitleInUndefined />}
            </div>
        </div>
    )
}
