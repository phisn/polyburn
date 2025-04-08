import { Canvas } from "./views/canvas/Canvas"
import { Hierarchy } from "./views/hierarchy/Hierarchy"

export function Editor() {
    return (
        <div className="relative h-max w-full grow">
            <div className="absolute inset-0">
                <Canvas />
            </div>

            <div className="bg-base-300 absolute bottom-0 right-0 top-0 z-10 min-w-64 grow bg-opacity-90 backdrop-blur-md">
                <Hierarchy />
            </div>
        </div>
    )
}
