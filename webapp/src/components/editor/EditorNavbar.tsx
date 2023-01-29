import useEditorStore, { EditorModeType } from "./EditorStore"
import { shallow } from 'zustand/shallow'

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

function EditorNavbar() {
    const [
        undos, redos, undo, redo, mode, setMode,
    ] = useEditorStore((state) => [state.undos, state.redos, state.undo, state.redo, state.mode, state.setMode], shallow)

    return (
        <div className="flex w-min space-x-8 items-center bg-base-100 rounded-lg">
            <button className="btn btn-square btn-ghost">
                <MenuSvg />
            </button>
            
            <div className="btn-group">
                <button
                    onClick={() => undo()} 
                    className={`btn btn-square btn-ghost ${(undos.length > 0 ? "" : "btn-disabled")}`}>
                    <UndoSvg />
                </button>
                <button 
                    onClick={e => redo()}
                    className={`btn btn-square btn-ghost ${(redos.length > 0 ? "" : "btn-disabled")}`}>
                    <RedoSvg />
                </button>
            </div>

            <div className="btn-group">
                <button 
                    className={`btn ${(mode === EditorModeType.Selection ? "btn-active btn-disabled" : "")}` }
                    onClick={() => setMode(EditorModeType.Selection)}>
                    Selection
                </button>
                <button
                    className={`btn ${(mode === EditorModeType.Placement ? "btn-active btn-disabled" : "")}` }
                    onClick={() => setMode(EditorModeType.Placement)}>
                    Placement
                </button>
                <button
                    className={`btn ${(mode === EditorModeType.Movement ? "btn-active btn-disabled" : "")}` }
                    onClick={() => setMode(EditorModeType.Movement)}>
                    Movement
                </button>
            </div>
        </div>
    )
}

export default EditorNavbar
