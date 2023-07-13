"use client"

import { Transition } from "@headlessui/react"
import { Fragment, useState } from "react"
import { WorldModel } from "runtime/src/model/world/WorldModel"
import Navbar from "../../common/components/Navbar"
import { BackArrowSvg } from "../../common/inline-svg/BackArrow"
import { StopSvg } from "../../common/inline-svg/Stop"
import Game from "../../game/Game"
import { Gamemode, GamemodeStats } from "./Gamemode"
import { Level, LevelInfo } from "./Level"

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

    const levels: LevelInfo[] = [
        { name: "Map 1", maxProgress: 3, progress: { modes: 2 } },
        { name: "Map 2", maxProgress: 3 },
        { name: "Map 3", maxProgress: 3 },
        { name: "Map 3", maxProgress: 3 },
        { name: "Map 3", maxProgress: 3 },
    ]

    const [mapSelected, setMapSelected] = useState<string>()
    const [playing, setPlaying] = useState<WorldModel>()

    function onMapSelected(name: string | undefined) {
        setMapSelected(name)
        window.scrollTo(0, 0)
    }

    if (playing) {
        return (
            <>
                <Game world={playing} />
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
                                setPlaying(undefined)
                                setMapSelected(undefined)
                            }}
                        >
                            <StopSvg width="16" height="16" />
                        </button>
                    </Navbar>
                </div>
            </>
        )
    }

    return (
        <div className="relative min-h-screen pt-4 transition">
            <div className="flex justify-center pb-12">
                <div
                    className={`grid w-full gap-8 p-4 sm:grid-cols-2 ${
                        mapSelected && "max-h-screen overflow-hidden"
                    }`}
                >
                    {levels.map((level, i) => (
                        <div
                            key={i}
                            className={`justify-self-center ${
                                i % 2 === 0
                                    ? "sm:justify-self-end"
                                    : "sm:justify-self-start"
                            }`}
                        >
                            <Level
                                {...level}
                                onClick={() => onMapSelected(level.name)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <Transition
                show={mapSelected !== undefined}
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div
                    className="absolute left-0 top-0 min-h-full w-full bg-white bg-opacity-10 py-4 backdrop-blur-md"
                    onClick={() => onMapSelected(undefined)}
                >
                    <div className="flex justify-center">
                        <div className="grid w-full gap-6 p-4">
                            <div className="btn grid w-full max-w-[28rem] grid-cols-3 justify-self-center bg-opacity-50">
                                <div className="justify-self-center">
                                    <BackArrowSvg height="40" width="40" />
                                </div>
                                <div className="text-xl text-white">
                                    {mapSelected}
                                </div>
                            </div>
                            {modes.map((v, i) => (
                                <Gamemode
                                    key={i}
                                    onClick={level => setPlaying(level)}
                                    {...v}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    )
}
