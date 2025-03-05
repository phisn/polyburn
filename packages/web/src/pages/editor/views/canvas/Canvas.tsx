import { Canvas as RawCanvas } from "@react-three/fiber"
import { useContext } from "react"
import { EditorStoreContext } from "../../store/store"

export function Canvas() {
    const store = useContext(EditorStoreContext)

    if (store === undefined) {
        throw new Error("EditorStore not found")
    }

    return (
        <RawCanvas scene={store.resources.get("scene")}>
            <></>
        </RawCanvas>
    )
}
