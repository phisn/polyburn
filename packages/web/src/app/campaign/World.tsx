import { Transition } from "@headlessui/react"
import { BrowserView, isMobile } from "react-device-detect"
import { WorldView } from "shared/src/views/world-view"
import { LockedSvg } from "../../common/components/inline-svg/Locked"

const todoProgressFeature = true

export function World(props: { world?: WorldView; locked?: boolean; onSelected: () => void }) {
    //    return <div className="m-2 h-[18rem] w-[28rem] bg-white"></div>
    function ButtonOverlay() {
        return (
            <div
                className="absolute inset-0 z-30 rounded-2xl opacity-30 transition hover:cursor-pointer hover:bg-white active:opacity-70"
                onClick={() => props.onSelected()}
            ></div>
        )
    }

    // TODO: remove and do actual serverside stored background
    function bgPath() {
        switch (props.world?.id.name) {
            case "Red 1":
                return "/static/bg-1.png"
            case "Red 2":
                return "/static/bg-2.png"
            case "Red 4":
                return "/static/bg-1.png"
            default:
                return "/static/background.png"
        }
    }

    return (
        <WorldContainerOuter>
            <ButtonOverlay />
            <Overlay world={props.world} locked={props.locked} />
            <WorldContainerInner>
                {props.world === undefined && <div className="h-full w-full rounded-none" />}
                <Transition
                    show={props.world !== undefined}
                    enter="transition duration-300 ease-out"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                >
                    <img
                        className={
                            "absolute bottom-0 z-0 " +
                            (props.locked ? "transform-gpu blur-3xl" : "")
                        }
                        src={bgPath()}
                    />
                </Transition>
            </WorldContainerInner>
            {props.locked && <LockedOverlay />}
        </WorldContainerOuter>
    )
}

function WorldContainerInner(props: { children: React.ReactNode }) {
    return (
        <div className="@hxs:p-4 h-full p-0">
            <div className="border-base-100 h-full overflow-hidden rounded-2xl border-2">
                <div className="relative z-10 h-full bg-black">{props.children}</div>
            </div>
        </div>
    )
}

function WorldContainerOuter(props: { children: React.ReactNode }) {
    return (
        <div className="@container relative h-[16rem] w-full max-w-[28rem]">
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
        <div className="group absolute inset-0 z-50 flex rounded-2xl text-zinc-300">
            <BrowserView>
                <div className="absolute inset-0 flex w-full items-center justify-center group-hover:hidden">
                    <div className="flex rounded p-4 drop-shadow"></div>
                </div>
            </BrowserView>

            <div
                className={`absolute inset-0 w-full select-none items-center justify-center p-6 ${
                    isMobile ? "flex" : "hidden group-hover:flex"
                }`}
            >
                <div className="ml-2">Beat the previous map!</div>
            </div>
        </div>
    )
}

export function Overlay(props: { world?: WorldView; locked?: boolean }) {
    function Title(props: { children: React.ReactNode }) {
        return (
            <div className="@hxs:min-h-14 hxs:rounded-2xl shadow-base-200 border-base-300 @hxs:py-3 flex h-fit min-h-10 min-w-40 max-w-[16rem] items-center justify-center rounded-xl border-2 bg-white px-8 py-2 text-center text-xl text-black">
                {props.children}
            </div>
        )
    }

    function TitleInLocked() {
        return (
            <Title>
                <LockedSvg width="24" height="24" />
            </Title>
        )
    }

    function TitleInNormal() {
        return <Title>{props.world?.id.name}</Title>
    }

    function TitleInUndefined() {
        return (
            <Title>
                <div className="loading loading-sm" />
            </Title>
        )
    }

    return (
        <div className="@hxs:p-0 absolute inset-0 isolate z-20 flex justify-center p-2">
            {props.locked && <TitleInLocked />}
            {!props.locked && props.world && <TitleInNormal />}
            {!props.world && <TitleInUndefined />}
        </div>
    )
}
