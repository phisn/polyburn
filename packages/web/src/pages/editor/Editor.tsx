import { createWorld } from "koota"
import { WorldProvider } from "koota/react"
import { useEffect, useRef } from "react"
import { editorActions } from "./store/world"
import { Canvas } from "./views/canvas/Canvas"
import { Hierarchy } from "./views/hierarchy/Hierarchy"

export function Editor() {
    const worldRef = useRef(createWorld())

    useEffect(() => {
        const rocket = editorActions(worldRef.current).spawnRocket({ x: 0, y: 0 })

        return () => {
            rocket.destroy()
        }
    }, [])

    return (
        <WorldProvider world={worldRef.current}>
            <div className="relative h-max w-full grow">
                <Canvas />
                <Hierarchy />
            </div>
        </WorldProvider>
    )
}
