import useEditorStore, { EditingModeType } from "../EditorStore";
import PIXI from "pixi.js"
import PlacementMode from "./placement-mode/PlacementMode";
import { shallow } from "zustand/shallow";
import MovementMode from "./movement-mode/MovementMode";

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
            return <MovementMode />
        case EditingModeType.Placement:
            return <PlacementMode app={app} />
    }
}

export default EditingMode
