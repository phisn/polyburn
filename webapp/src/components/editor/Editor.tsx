import { Stage, Graphics } from "@inlet/react-pixi"
import PIXI from "pixi.js"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useRef } from "react"
import { ActionProps } from "./ActionProps"
import SelectionPassiveAction from "./SelectionPassiveAction"
import { World, Vertex, Shape } from "./World"

enum Mode {
    Selection
}

function Editor() {
    const [previousWorlds, setPreviousWorlds] = useState<World[]>([])
    const [futureWorlds, setFutureWorlds] = useState<World[]>([])

    const [world, setWorld] = useState<World>({ shapes: [] })
    const [mode, setMode] = useState<Mode>(Mode.Selection)

    const [intermediateAction, setIntermediateAction] = useState<((props: ActionProps) => JSX.Element) | null>(null)

    // The action component depends on the mode and if an intermediate action is active.
    const Action = useMemo(() => {
        if (intermediateAction) {
            return intermediateAction
        }

        switch (mode) {
            case Mode.Selection:
                return SelectionPassiveAction
        }
    }, [ intermediateAction, mode ])

    const proposeSetWorld = useCallback((world: (p: World) => World) => {
        setWorld((w) => {
            const newWorld = world(w)
            
            setPreviousWorlds((p) => [ ...p, w ])
            setFutureWorlds([])
            
            return newWorld
        })
    }, [])

    useEffect(() => {
        if (previousWorlds.length > 0) {
            const undo = (e: KeyboardEvent) => {
                if (e.key === "z" && e.ctrlKey) {
                    setWorld((w) => {
                        setFutureWorlds((f) => [ ...f, w ])
                        return previousWorlds[previousWorlds.length - 1]
                    })
                    setPreviousWorlds((p) => p.slice(0, p.length - 1))
                }
            }

            window.addEventListener("keydown", undo)

            return () => {
                window.removeEventListener("keydown", undo)
            }
        }
    }, [ previousWorlds ])

    useEffect(() => {
        if (futureWorlds.length > 0) {
            const redo = (e: KeyboardEvent) => {
                if (e.key === "y" && e.ctrlKey) {
                    setWorld((w) => {
                        setPreviousWorlds((p) => [ ...p, w ])
                        return futureWorlds[futureWorlds.length - 1]
                    })
                    setFutureWorlds((f) => f.slice(0, f.length - 1))
                }
            }

            window.addEventListener("keydown", redo)
            
            return () => {
                window.removeEventListener("keydown", redo)
            }
        }
    }, [ futureWorlds ])

    // create a triangle, a rectangle and a circle
    useEffect(() => {
        setWorld({
            shapes: [
                {
                    vertices: [
                        { x: 100, y: 100 },
                        { x: 200, y: 100 },
                        { x: 200, y: 200 },
                        { x: 100, y: 200 }
                    ]
                },
                {
                    vertices: [
                        { x: 300, y: 300 },
                        { x: 400, y: 300 },
                        { x: 400, y: 400 },
                        { x: 300, y: 400 }
                    ]
                },
                {
                    // triangle
                    vertices: [
                        { x: 500, y: 500 },
                        { x: 600, y: 500 },
                        { x: 550, y: 600 }
                    ]
                },
            ]
        })
    }, [])

    return (
        <div className="overflow-hidden">
            <Stage width={window.innerWidth} height={window.innerHeight} options={ { resizeTo: window } }>
                <Action world={world}
                        setIntermediateAction={(action) => setIntermediateAction(() => action)}
                        setWorld={proposeSetWorld} />
            </Stage>
        </div>
    )
}

export default Editor
