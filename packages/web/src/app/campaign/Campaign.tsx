"use client"

import { Transition } from "@headlessui/react"
import { Fragment, useState } from "react"
import { WorldModel, importWorld } from "runtime/src/model/world/WorldModel"
import Navbar from "../../common/components/Navbar"
import Game from "../../game/Game"

export default function Campaign() {
    const modes: GamemodeProps[] = [
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

    const levels = ["Level 1", "Level 2", "Level 3"]

    const [mapSelected, setMapSelected] = useState<string | null>(null)
    const [playing, setPlaying] = useState<WorldModel>()

    if (playing) {
        return (
            <>
                <Game world={playing} />
                <div
                    className="absolute top-0 left-0 p-4"
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
                            onClick={() => setPlaying(undefined)}
                        >
                            <StopFillSvg />
                        </button>
                    </Navbar>
                </div>
            </>
        )
    }

    return (
        <div className="relative transition pt-4 h-screen">
            <div className="flex justify-center text-3xl">Campaign</div>

            <div className="flex justify-center pb-12">
                <div className="grid p-4 gap-8 md:grid-cols-2 w-full">
                    {levels.map((level, i) => (
                        <div
                            className={`justify-self-center ${
                                i % 2 === 0
                                    ? "md:justify-self-end"
                                    : "md:justify-self-start"
                            }`}
                        >
                            <Level
                                name={level}
                                onClick={() => setMapSelected(level)}
                                key={i}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <Transition
                show={mapSelected !== null}
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div
                    className="absolute top-0 bottom-0 left-0 right-0 w-full py-4 backdrop-blur-md bg-opacity-10 bg-white"
                    onClick={() => setMapSelected(null)}
                >
                    <div className="flex justify-center">
                        <div className="w-full grid p-4 gap-6">
                            <div className="justify-self-center w-full grid grid-cols-3 btn bg-opacity-50 max-w-[32rem]">
                                <div className="justify-self-center">
                                    <BackArrow />
                                </div>
                                <div className="text-white text-xl">
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

function StopFillSvg() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="#CD5C5C"
            viewBox="0 0 16 16"
        >
            <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z" />
        </svg>
    )
}

function Trohpy(props: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            className={`bi bi-trophy-fill ${props.className}`}
            viewBox="0 0 16 16"
        >
            <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33.076 33.076 0 0 1 2.5.5zm.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935zm10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935z" />
        </svg>
    )
}

function Unlocked(props: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            className="bi bi-unlock-fill"
            viewBox="0 0 16 16"
        >
            <path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2z" />
        </svg>
    )
}

function Locked(props: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            className="bi bi-lock-fill"
            viewBox="0 0 16 16"
        >
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
        </svg>
    )
}

function BackArrow(props: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            fill="white"
            className="bi bi-arrow-left-short"
            viewBox="0 0 16 16"
        >
            <path
                fillRule="evenodd"
                d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"
            />
        </svg>
    )
}

function Level(props: { name: string; onClick?: () => void }) {
    return (
        <div className="flex relative rounded-2xl aspect-[7/4] max-w-[28rem] isolate">
            <div className="absolute top-0 left-0 right-0 bottom-0">
                <div className="bg-zinc-800 p-3 px-8 rounded-2xl w-fit text-lg sm">
                    {props.name}
                </div>

                <div className="absolute bottom-0 right-0 bg-zinc-800 rounded-2xl">
                    <div className="grid">
                        <div className="steps items-center py-2">
                            <div
                                data-content=""
                                className="step step-secondary"
                            ></div>
                            <div
                                data-content=""
                                className="step step-secondary"
                            ></div>
                            <div data-content="" className="step"></div>
                        </div>
                        {/*
                        <button className="rounded-br-2xl p-4 hover:bg-base-300 active:bg-slate-600 transition ml-auto">
                            <Trohpy className="rounded-none" />
                        </button>
                        */}
                    </div>
                </div>
            </div>
            <button
                className="group absolute top-0 left-0 right-0 bottom-0 rounded-2xl hover:bg-black active:opacity-50 opacity-50"
                onClick={props.onClick}
            >
                <div className="select-none invisible group-hover:visible flex justify-center items-center h-full text-2xl text-base-100"></div>
            </button>
            <div className="p-3">
                <img
                    className="rounded-2xl -z-20"
                    src="https://placehold.co/700x400"
                />
            </div>
        </div>
    )
}

type Rank = "Diamond" | "Platinum" | "Gold" | "Silver" | "Bronze" | "Iron"

interface GamemodeProps {
    name: string
    rank?: GamemodeRankProps
    locked?: boolean
    onClick?: (world: WorldModel) => void
}

interface GamemodeRankProps {
    rank: Rank
    time: string
    position: number
}

function Gamemode(props: GamemodeProps) {
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

    const color = colorMap[props.rank?.rank ?? "Iron"].color
    const colorHover = colorMap[props.rank?.rank ?? "Iron"].hover
    const colorClick = colorMap[props.rank?.rank ?? "Iron"].click

    const runLevel = () => {
        const level1 =
            "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"

        props.onClick(importWorld(level1))
    }

    return (
        <div
            className={`relative mx-auto max-w-[32rem] w-full rounded-2xl ${
                props.rank ? "pb-6" : ""
            }`}
            onClick={e => e.stopPropagation()}
        >
            <div className="bg-zinc-900 rounded-2xl flex join relative z-10">
                <button
                    className="join-item w-full p-6 text-left hover:bg-base-100 active:bg-slate-600 transition"
                    onClick={() => runLevel()}
                >
                    {props.name}
                </button>
                <button className="join-item p-6 hover:bg-base-100 active:bg-slate-600 transition">
                    <Trohpy className="rounded-r-none" />
                </button>
            </div>
            {props.locked ? (
                <div className="group absolute top-0 bottom-0 left-0 right-0 backdrop-blur rounded-2xl flex z-20">
                    <div className="flex justify-center items-center w-full group-hover:hidden">
                        <div className="mr-2">Locked</div>
                        <Locked />
                    </div>
                    <div className="hidden select-none group-hover:flex p-6 items-center w-full">
                        <Unlocked />
                        <div className="ml-2">Beat the previous gamemode!</div>
                    </div>
                </div>
            ) : (
                <></>
            )}
            {props.rank ? (
                <button
                    className={`flex items-end absolute top-0 left-0 bottom-0 right-0 rounded-2xl rounded-t-3xl ${color} ${colorHover} ${colorClick}`}
                >
                    <div
                        className={
                            "text-black w-full text-left text-sm h-6 justify-between items-center grid grid-cols-3 px-6"
                        }
                    >
                        <div>{props.rank.rank}</div>
                        <div className="flex justify-center">
                            {props.rank.time}
                        </div>
                        <div className="flex justify-end">
                            # {props.rank.position}
                        </div>
                    </div>
                </button>
            ) : (
                <></>
            )}
        </div>
    )
}
