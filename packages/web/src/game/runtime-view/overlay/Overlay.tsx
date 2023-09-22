import { EntityStore } from "runtime-framework"
import { WebappComponents } from "../../runtime-extension/webapp-components"
import { Timer } from "./Timer"

export function Overlay(props: { store: EntityStore<WebappComponents> }) {
    return <Timer store={props.store} />
}
