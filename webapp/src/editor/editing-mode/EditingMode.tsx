import useEditorStore, { EditingModeType } from "../EditorStore";
import PIXI from "pixi.js"
import PlacementMode from "./PlacementMode";
import { shallow } from "zustand/shallow";

function EditingMode(props: { app?: PIXI.Application }): JSX.Element {
    const app = props.app
    const [mode] = useEditorStore(state => [state.editingMode], shallow)

    if (!app) {
        return <></>
    }

    switch (mode) {
        case EditingModeType.Selection:
            return <div>Selection</div>
        case EditingModeType.Movement:
            return <div>Movement</div>
        case EditingModeType.Placement:
            return <PlacementMode app={app} />
    }
}

export default EditingMode
