import { Stage, Graphics } from "@inlet/react-pixi"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import useEditorStore, { EditingModeType, EditorModeType, EditorStore } from "./EditorStore"
import useSelectionMode from "./editing-mode/placement-mode/PlacementMode"
import { World, Vertex, Shape } from "./World"
import WorldGraphics from "./WorldCanvas"
import PIXI from "pixi.js"
import EditorNavbar from "./EditorNavbar"
import SelectionMode from "./editing-mode/placement-mode/PlacementMode"
import EditingMode from "./editing-mode/EditingMode"
import { shallow } from 'zustand/shallow'
import Game from "../game/Game"
import Navbar from "./Navbar"

function Editor() {
    const mode = useEditorStore(state => state.mode, shallow)

    switch (mode) {
        case EditorModeType.Playing:
            return <PlayingComponent />

        case EditorModeType.Editing:
            return <EditingComponent />

        default:
            return <></>
    }
}

const StopFillSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#CD5C5C" viewBox="0 0 16 16">
        <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
    </svg>
)

function PlayingComponent() {
    const state = useEditorStore(state => ({ 
        setMode: state.setMode
    }))

    return (
        <>
            <Game />
            <div className="absolute top-0 right-0 p-4">
                {/*notification*/}
                Previewing Map
            </div>
            <div className="absolute top-0 left-0 p-4">
                <Navbar>
                    <button className="btn btn-square btn-ghost"
                            onClick={() => {
                                state.setMode(EditorModeType.Editing)
                            }}>
                        <StopFillSvg />
                    </button>
                </Navbar>
            </div>
        </>
    )
}

function EditingComponent() {
    const [app, setApp] = useState<PIXI.Application>()

    useEffect(() => {
        if (app) {
            app.stage.interactive = true
        }
    }, [ app ])

    return (
        <div className="overflow-hidden">
            {/* Prevent transition artifacts between editor and game with static black backround */}
            <div className="fixed top-0 left-0 right-0 bottom-0 bg-black -z-10" />
            
            <div className="absolute top-0 left-0 p-4">
                <EditorNavbar />
            </div>

            <div className="absolute top-0 right-0 p-4">
                <EditingMode app={app} />
            </div>

            <Stage 
                onMount={setApp}
                width={window.innerWidth}
                height={window.innerHeight} 
                options={ { resizeTo: window, antialias: true } } >

                <WorldGraphics />
            </Stage>
        </div>
    )
}

export default Editor
