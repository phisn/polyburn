import useEditorStore, { EditorModeType } from "../EditorStore";
import PIXI from "pixi.js"
import PlacementMode from "./PlacementMode";

function EditorMode(props: { app?: PIXI.Application }) {
    const app = props.app
    const [mode] = useEditorStore(state => [state.mode])

    if (!app) {
        return <></>
    }

    switch (mode) {
        case EditorModeType.Selection:
            return <div>Selection</div>
        case EditorModeType.Movement:
            return <div>Movement</div>
        case EditorModeType.Placement:
            return <PlacementMode app={app} />
    }
}

export default EditorMode
