import { Transition } from "@headlessui/react"
import { Fragment, useState } from "react"

export function Campaign() {
    const modes: GamemodeProps[] = [
        { name: "Normal", rank: { rank: "Diamond", time: "01:03.023", position: 41 } },
        { name: "Hard", rank: { rank: "Gold", time: "06:23.442", position: 355 } },
        { name: "Reverse" },
        { name: "Low gravity", locked: true },
        { name: "Third Gamemode", locked: true },
    ]

    const levels = [
        "level1",
        "level2",
        "level3",
    ]

    const [mapSelected, setMapSelected] = useState<string | null>(null)
    
    return (
        <div className="relative transition pt-4">
            <div className="flex justify-center text-3xl">
                Campaign
            </div>

            <div className="flex justify-center pb-12">
                <div className="w-full grid justify-center p-4 gap-8 sm:grid-cols-2">
                    {levels.map((level, i) => (<Level onClick={() => setMapSelected(level)} key={i} />))}
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
                leaveTo="opacity-0">

                <div className="absolute top-0 bottom-0 left-0 right-0 w-full py-4 backdrop-blur-md bg-opacity-10 bg-white "
                    onClick={() => setMapSelected(null)}>
                    <div className="flex justify-center">
                        <div className="w-full grid p-4 gap-6">
                            <div className="justify-self-center w-full grid grid-cols-3 btn btn-ghost max-w-[32rem]">
                                <div className="justify-self-center">
                                    <BackArrow  />
                                </div>
                                <div className="text-black text-xl">
                                    {mapSelected}
                                </div>
                            </div>
                            {modes.map((v, i) => (<Gamemode key={i} {...v} />))}
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    )
}

function Trohpy(props: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className={`bi bi-trophy-fill ${props.className}`} viewBox="0 0 16 16">
            <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33.076 33.076 0 0 1 2.5.5zm.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935zm10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935z"/>
        </svg>
    )
}

function Unlocked(props: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-unlock-fill" viewBox="0 0 16 16">
            <path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2z"/>
        </svg>
    )
}

function Locked(props: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-lock-fill" viewBox="0 0 16 16">
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
        </svg>
    )
}

function BackArrow(props: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="black" class="bi bi-arrow-left-short" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
        </svg>
    )
}

function Level(props: { onClick?: () => void }) {
    return (
        <div className="flex relative rounded-2xl aspect-[7/4] max-w-[32rem]">
            { /*
                <div className="absolute bottom-0 left-0 right-0 bg-base-100 opacity-80 self-end z-10">
                    <div className="grid grid-cols-5">
                        <div className="hidden md:block">
                        </div>
                        <div className="steps items-center col-span-4 md:col-span-3">
                            <div data-content="" className="step _step-primary">
                            </div>
                            <div data-content="" className="step _step-primary">
                            </div>
                            <div data-content="" className="step">
                            </div>
                        </div>
                        <button className="rounded-br-2xl p-4 hover:bg-base-300 active:bg-slate-600 transition ml-auto">
                            <Trohpy className="rounded-none" />
                        </button>
                    </div>
                </div>
                */
            }       
            <button className="group absolute top-0 left-0 right-0 bottom-0 rounded-2xl hover:backdrop-blur-2xl active:bg-gray-500 opacity-80"
                onClick={props.onClick}>
                <div className="select-none invisible group-hover:visible flex justify-center items-center h-full text-2xl text-base-100">
                    PLAY
                </div>
            </button>
            <img className="rounded-2xl -z-20" src="https://placehold.co/700x400"/>
        </div>
    )
}

type Rank = "Diamond" | "Platinum" | "Gold" | "Silver" | "Bronze" | "Iron"

interface GamemodeProps {
    name: string
    rank?: GamemodeRankProps
    locked?: boolean
}

interface GamemodeRankProps {
    rank: Rank
    time: string
    position: number
}

function Gamemode(props: GamemodeProps) {
    const colorMap = {
        "Diamond": { color: "bg-cyan-400", hover: "hover:bg-cyan-500", click: "active:bg-cyan-600"  },
        "Platinum": { color: "bg-gray-200", hover: "", click: ""  },
        "Gold": { color: "bg-yellow-500", hover: "hover:bg-yellow-600", click: "active:bg-yellow-700"  },
        "Silver": { color: "bg-gray-300", hover: "", click: ""  },
        "Bronze": { color: "bg-orange-500", hover: "", click: ""   },
        "Iron": { color: "bg-gray-500", hover: "", click: "" },
    }

    const color = colorMap[props.rank?.rank ?? "Iron"].color
    const colorHover = colorMap[props.rank?.rank ?? "Iron"].hover
    const colorClick = colorMap[props.rank?.rank ?? "Iron"].click

    return (
        <div className={`relative mx-auto max-w-[32rem] w-full rounded-2xl ${props.rank ? "pb-6" : ""}`}
            onClick={e => e.stopPropagation()}>
            <div className="bg-base-300 rounded-2xl flex join relative z-10">
                <button className="join-item w-full p-6 text-left hover:bg-base-100 active:bg-slate-600 transition">
                    {props.name}
                </button>
                <button className="join-item p-6 hover:bg-base-100 active:bg-slate-600 transition">
                    <Trohpy className="rounded-r-none" />
                </button>
            </div>
            {
                props.locked ? (
                    <div className="group absolute top-0 bottom-0 left-0 right-0 backdrop-blur rounded-2xl flex z-20">
                        <div className="flex justify-center items-center w-full group-hover:hidden">
                            <div className="mr-2">
                                Locked 
                            </div>
                            <Locked />
                        </div>
                        <div className="hidden select-none group-hover:flex p-6 items-center w-full">
                            <Unlocked />
                            <div className="ml-2">
                                Beat the previous gamemode!
                            </div>
                        </div>
                    </div>
                ) : <></>
            }
            {
                props.rank ? (
                    <button className={`flex items-end absolute top-0 left-0 bottom-0 right-0 rounded-2xl rounded-t-3xl ${color} ${colorHover} ${colorClick}`}>
                        <div className={"text-black w-full text-left text-sm h-6 justify-between items-center grid grid-cols-3 px-6"}>
                            <div>
                                {props.rank.rank}
                            </div>
                            <div className="flex justify-center">
                                {props.rank.time}
                            </div>
                            <div className="flex justify-end">
                            # {props.rank.position}
                            </div>
                        </div>
                    </button>
                ) : <></>
            }
        </div>
    )
}
