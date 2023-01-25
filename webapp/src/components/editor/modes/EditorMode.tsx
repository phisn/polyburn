import useEditorStore, { EditorModeType } from "../EditorStore";
import SelectionMode from "./SelectionMode";
import PIXI from "pixi.js"

function EditorMode(props: { app?: PIXI.Application }) {
    const app = props.app
    const [mode] = useEditorStore(state => [state.mode])

    if (!app) {
        return <></>
    }

    switch (mode) {
        case EditorModeType.Selection:
            return <SelectionMode app={app} />
        case EditorModeType.Movement:
            return <div>Movement</div>
        case EditorModeType.Placement:
            return <div>Placement</div>
    }
}

export default EditorMode
