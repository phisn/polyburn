
import { EntityStore } from "../../../../runtime-framework/src"
import { Camera } from "./Camera"
import EntityGraphics from "./graphics/EntityGraphics"
import { WebappComponents } from "./webapp-runtime/WebappComponents"

export function RuntimeView(props: { store: EntityStore<WebappComponents> }) {
    return (
        <>
            <EntityGraphics store={props.store} />
            <Camera store={props.store} />
        </>
    )
}