"use client"

import { Transition } from "@headlessui/react"
import { Fragment, useState, useTransition } from "react"
import { importWorld } from "runtime/src/model/world/WorldModel"
import Navbar from "../../common/components/Navbar"
import { BackArrowSvg } from "../../common/inline-svg/BackArrow"
import { StopSvg } from "../../common/inline-svg/Stop"
import Game from "../../game/Game"
import { Gamemode, GamemodeStats } from "./Gamemode"
import { World, WorldInfo } from "./World"

export default function Campaign() {
    const modes: GamemodeStats[] = [
        {
            name: "Normal",
            rank: { rank: "Diamond", time: "01:03.023", position: 41 },
        },
        {
            name: "Hard",
            rank: { rank: "Gold", time: "06:23.442", position: 355 },
        },
        { name: "Reverse" },
        { name: "Low gravity", locked: true },
        { name: "Third Gamemode", locked: true },
    ]
    ;("flex-col")

    const worlds: WorldInfo[] = [
        {
            raw: "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",
            name: "Map 1",
            maxProgress: 3,
            progress: { modes: 2 },
        },
        { raw: "", name: "Map 2", maxProgress: 3 },
        { raw: "", name: "Map 3", maxProgress: 3 },
        { raw: "", name: "Map 3", maxProgress: 3 },
        { raw: "", name: "Map 3", maxProgress: 3 },
    ]

    const [worldSelected, setWorldSelected] = useState<WorldInfo>()
    const [gamemodeSelected, setGamemodeSelected] = useState<string>()

    function onWorldSelected(name: WorldInfo | undefined) {
        setWorldSelected(name)
        setGamemodeSelected(undefined)

        window.scrollTo(0, 0)
    }

    function onGamemodeSelected(gamemode: GamemodeStats) {
        startTransition(() => {
            setGamemodeSelected(gamemode.name)
        })
    }

    const [isPending, startTransition] = useTransition()

    if (worldSelected && gamemodeSelected) {
        const map = importWorld(worldSelected.raw)

        return (
            <div className="absolute bottom-0 left-0 right-0 top-0 h-full">
                <Game world={map} />

                <div
                    className="absolute left-0 top-0 p-4"
                    style={{
                        touchAction: "none",
                        userSelect: "none",

                        // Prevent canvas selection on ios
                        // https://github.com/playcanvas/editor/issues/160
                        WebkitTouchCallout: "none",
                        WebkitUserSelect: "none",
                        WebkitTapHighlightColor: "rgba(255,255,255,0)",
                    }}
                >
                    <Navbar>
                        <button
                            className="btn btn-square btn-ghost"
                            onClick={() => {
                                setGamemodeSelected(undefined)
                                setWorldSelected(undefined)
                            }}
                        >
                            <StopSvg width="16" height="16" />
                        </button>
                    </Navbar>
                </div>
            </div>
        )
    }

    console.log("pending", isPending)

    return (
        <div className="flex h-full pt-4 transition">
            <div className="relative flex h-full w-full justify-center">
                <div
                    className={`grid w-full gap-8 p-4 sm:grid-cols-2 ${
                        worldSelected &&
                        "absolute bottom-0 top-0 overflow-hidden"
                    }`}
                >
                    {worlds.map((world, i) => (
                        <div
                            key={i}
                            className={`justify-self-center ${
                                i % 2 === 0
                                    ? "sm:justify-self-end"
                                    : "sm:justify-self-start"
                            }`}
                        >
                            <World
                                {...world}
                                onClick={() => onWorldSelected(world)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <Transition
                show={worldSelected !== undefined}
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div
                    className="fixed left-0 top-0 min-h-full w-full bg-white bg-opacity-10 py-4 backdrop-blur-md"
                    onClick={() => {
                        onWorldSelected(undefined)
                    }}
                >
                    <Transition
                        show={!isPending && worldSelected !== undefined}
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        appear
                    >
                        <div className="flex justify-center">
                            <div className="grid w-full gap-6 p-4">
                                <div className="btn grid w-full max-w-[28rem] grid-cols-3 justify-self-center bg-opacity-50">
                                    <div className="justify-self-center">
                                        <BackArrowSvg height="40" width="40" />
                                    </div>
                                    <div className="text-xl text-white">
                                        {worldSelected?.name}
                                    </div>
                                </div>
                                {modes.map((gamemode, i) => (
                                    <Gamemode
                                        key={i}
                                        onClick={() =>
                                            onGamemodeSelected(gamemode)
                                        }
                                        {...gamemode}
                                    />
                                ))}
                            </div>
                        </div>
                    </Transition>
                </div>
            </Transition>
        </div>
    )
}
