import { Stage, Graphics } from "@inlet/react-pixi"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import useEditorStore, { EditorModeType, EditorStore } from "./EditorStore"
import useSelectionMode from "./modes/PlacementMode"
import { World, Vertex, Shape } from "./World"
import WorldGraphics from "./WorldGraphics"
import PIXI from "pixi.js"
import EditorNavbar from "./EditorNavbar"
import SelectionMode from "./modes/PlacementMode"
import EditorMode from "./modes/EditorMode"

function useShortcut(key: string, callback: () => void, deps: any[] = []) {
    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === key) {
                callback()
            }

            e.preventDefault()
        }

        window.addEventListener("keydown", listener)
        return () => window.removeEventListener("keydown", listener)
    }, deps)
}

function Editor() {
    const [app, setApp] = useState<PIXI.Application | undefined>(undefined)
    const store = useEditorStore()

    const initializeApp = (app: PIXI.Application) => {
        app.stage.interactive = true
        setApp(app)
    }
    init(store)

    useShortcut("z", store.undo)
    useShortcut("y", store.redo)

    return (
        <div className="overflow-hidden">
            <div className="absolute top-0 left-0 p-4">
                <EditorNavbar />
            </div>

            <div className="absolute top-0 right-0 p-4">
                <EditorMode app={app} />
            </div>

            <Stage onMount={initializeApp}
                width={window.innerWidth}
                height={window.innerHeight} 
                options={ { resizeTo: window, antialias: true } } >

                <WorldGraphics />
            </Stage>
        </div>
    )
}

const init = (store: EditorStore) =>
    useEffect(() => {
        store.mutateWorld({
            undo: world => ({ shapes: [] }),
            redo: world => ({ shapes: [
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
            ]})
        })
    }, [])

export default Editor
