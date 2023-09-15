import { Text } from "@react-three/drei"
import { EntityStore } from "runtime-framework"
import { WebappComponents } from "../../runtime-extension/WebappComponents"

export function Timer(props: { store: EntityStore<WebappComponents> }) {
    props.store
    return <Text>00:00</Text>
}
