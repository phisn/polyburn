export {}

import { shallow } from "zustand/shallow"

import Navbar from "../common/Navbar"
import { initialConfigureState } from "./configure/state/ConfigureModeState"
import { Mode } from "./editor-store/ModeStateBase"
import { useEditorStore } from "./editor-store/useEditorStore"
import { initialPlacementState } from "./placement/state/PlacementModeState"

const MenuSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
)

const UndoSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
        <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
    </svg>
)

const RedoSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
    </svg>
)

const PlaySvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16">
        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
    </svg>
)

function EditorNavbar() {
    const mode = useEditorStore(state => state.modeState.mode)
    const hasUndos = useEditorStore(state => state.undos.length > 0, shallow)
    const hasRedos = useEditorStore(state => state.redos.length > 0, shallow)

    const run = useEditorStore(state => state.run)
    const undo = useEditorStore(state => state.undo)
    const redo = useEditorStore(state => state.redo)
    const setModeState = useEditorStore(state => state.setModeState)

    return (
        <Navbar>
            <button className="btn btn-square btn-ghost">
                <MenuSvg />
            </button>
            
            <div className="btn-group">
                <button
                    onClick={undo} 
                    className={`btn btn-square btn-ghost ${(hasUndos ? "" : "btn-disabled")}`}>
                    <UndoSvg />
                </button>
                <button 
                    onClick={redo}
                    className={`btn btn-square btn-ghost ${(hasRedos ? "" : "btn-disabled")}`}>
                    <RedoSvg />
                </button>
            </div>

            <div className="btn-group">
                <button 
                    className={`btn ${(mode === Mode.Configure ? "btn-active btn-disabled" : "")}` }
                    onClick={() => setModeState(initialConfigureState)}>
                    Configure
                </button>
                <button
                    className={`btn ${(mode === Mode.Placement ? "btn-active btn-disabled" : "")}` }
                    onClick={() => setModeState(initialPlacementState)}>
                    Placement
                </button>
            </div>

            <button className="btn btn-square btn-ghost"
                onClick={() => {
                    run()
                }}>
                <PlaySvg />
            </button>

            <div></div>
        </Navbar>
    )
}

export default EditorNavbar
