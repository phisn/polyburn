import { EntityStore } from "runtime-framework"
import { WebappComponents } from "../runtime-extension/WebappComponents"
import { Camera } from "./camera/Camera"
import EntityGraphics from "./graphics/EntityGraphics"
import { Overlay } from "./overlay/Overlay"

export function RuntimeView(props: { overlay?: boolean; store: EntityStore<WebappComponents> }) {
    return (
        <>
            <EntityGraphics store={props.store} />
            <Camera store={props.store} />
            {props.overlay && <Overlay store={props.store} />}
        </>
    )
}
