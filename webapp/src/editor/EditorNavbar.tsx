import useEditorStore, { EditingModeType, EditorModeType } from "./EditorStore"
import { shallow } from 'zustand/shallow'
import Navbar from "./Navbar"
import useGameStore from "../game/GameStore"

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
    const state = useEditorStore((state) => ({
        world: state.world,
        undos: state.undos,
        redos: state.redos, 
        undo: state.undo, 
        redo: state.redo, 
        mode: state.editingMode, 
        setMode: state.setMode,
        setEditingMode: state.setEditingMode
    }), shallow)

    return (
        <Navbar>
            <button className="btn btn-square btn-ghost">
                <MenuSvg />
            </button>
            
            <div className="btn-group">
                <button
                    onClick={() => state.undo()} 
                    className={`btn btn-square btn-ghost ${(state.undos.length > 0 ? "" : "btn-disabled")}`}>
                    <UndoSvg />
                </button>
                <button 
                    onClick={e => state.redo()}
                    className={`btn btn-square btn-ghost ${(state.redos.length > 0 ? "" : "btn-disabled")}`}>
                    <RedoSvg />
                </button>
            </div>

            <div className="btn-group">
                <button 
                    className={`btn ${(state.mode === EditingModeType.Selection ? "btn-active btn-disabled" : "")}` }
                    onClick={() => state.setEditingMode(EditingModeType.Selection)}>
                    Selection
                </button>
                <button
                    className={`btn ${(state.mode === EditingModeType.Placement ? "btn-active btn-disabled" : "")}` }
                    onClick={() => state.setEditingMode(EditingModeType.Placement)}>
                    Placement
                </button>
                <button
                    className={`btn ${(state.mode === EditingModeType.Movement ? "btn-active btn-disabled" : "")}` }
                    onClick={() => state.setEditingMode(EditingModeType.Movement)}>
                    Movement
                </button>
            </div>

            <button className="btn btn-square btn-ghost"
                    onClick={() => {
                        useGameStore.getState().prepare(state.world)
                        state.setMode(EditorModeType.Playing)
                    }}>
                <PlaySvg />
            </button>

            <div></div>
        </Navbar>
    )
}

export default EditorNavbar
