import useEditorStore from "./EditorStore"

function EditorNavbar() {
    const [undos, redos] = useEditorStore((state) => [state.undos, state.redos])

    return (
        <div className="flex space-x-8 items-center bg-base-100 rounded-lg">
            <button className="btn btn-square btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            
            <div className="btn-group">
                <button className={`btn btn-square btn-ghost ${(undos.length > 0 ? "" : "btn-disabled")}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
                        <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
                    </svg>
                </button>
                <button className={`btn btn-square btn-ghost ${(redos.length > 0 ? "" : "btn-disabled")}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                    </svg>
                </button>
            </div>

            <div className="btn-group">
                <button className="btn btn-active" onClick={e => e.preventDefault()}>Selection</button>
                <button className="btn" onClick={e => e.preventDefault()}>Placement</button>
                <button className="btn" onClick={e => e.preventDefault()}>Movement</button>
            </div>
        </div>
    )
}

export default EditorNavbar
