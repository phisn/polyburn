import { useGameStore } from "../store/GameStore"
import { Camera } from "./Camera"
import EntityGraphics from "./graphics/EntityGraphics"

export function RuntimeView() {
    const { store } = useGameStore(store => store.systemContext)

    return (
        <>
            <EntityGraphics store={store} />
            <Camera store={store} />
        </>
    )
}
