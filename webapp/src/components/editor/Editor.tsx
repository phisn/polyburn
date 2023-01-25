import { Stage, Graphics } from "@inlet/react-pixi"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import useEditorStore from "./EditorStore"
import useSelectionMode from "./modes/SelectionMode"
import { World, Vertex, Shape } from "./World"
import WorldGraphics from "./WorldGraphics"
import PIXI from "pixi.js"
import EditorNavbar from "./EditorNavbar"

function Editor() {
    const store = useEditorStore()

    useEffect(() => {
        store.setWorld({
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

    useHotkeys("ctrl+z", store.undo)
    useHotkeys("ctrl+y", store.redo)

    const Mode = useSelectionMode(store)

    return (
        <div className="overflow-hidden">
            <div className="flex flex-col space-y-4 absolute top-0 left-0 p-4">
                <EditorNavbar />
                <Mode.editorMenu />
            </div>

            <Stage onPointerDown={(e) => {
                console.log("click", e)
                Mode.onClick(e.clientX, e.clientY, e.ctrlKey, e.shiftKey) 
            }
            }
                   width={window.innerWidth} 
                   height={window.innerHeight} 
                   options={ { resizeTo: window } } >
                <WorldGraphics />
            </Stage>
        </div>
    )
}

export default Editor
