import { ArrowClockwise } from "../../components/common/svg/ArrowClockwise"
import { ArrowCounterClockwise } from "../../components/common/svg/ArrowCounterClockwise"
import { List } from "../../components/common/svg/List"
import { Canvas } from "./views/canvas/Canvas"
import { Hierarchy } from "./views/hierarchy/Hierarchy"
import { Inspector } from "./views/inspector/Inspector"

export function Editor() {
    return (
        <div className="relative h-screen w-full grow">
            <div className="absolute inset-0">
                <Canvas />
            </div>

            <div className="pointer-events-none absolute bottom-0 left-0 right-0 top-0 z-10 flex grow space-x-4 p-4">
                <Hierarchy />

                <div className="flex-grow">
                    <Navbar />
                </div>

                <Inspector />
            </div>
        </div>
    )
}

function Navbar() {
    return (
        <div className="bg-base-300 border-base-200 pointer-events-auto flex w-min items-center rounded-2xl">
            <div className="join flex">
                <div className="join-item btn btn-square btn-ghost rounded-2xl">
                    <List width="24" height="24" />
                </div>
                <div className="join-item btn btn-square btn-ghost rounded-2xl">
                    <ArrowCounterClockwise width="20" height="20" />
                </div>
                <div className="join-item btn btn-square btn-ghost rounded-2xl">
                    <ArrowClockwise width="20" height="20" />
                </div>
            </div>
        </div>
    )
}
