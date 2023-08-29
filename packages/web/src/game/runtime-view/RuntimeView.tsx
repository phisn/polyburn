import { useGameStore } from "../store/GameStore"
import { Camera } from "./camera/Camera"
import EntityGraphics from "./graphics/EntityGraphics"

export function RuntimeView() {
    const context = useGameStore(store => store.systemContext)

    return (
        <>
            <EntityGraphics store={context.store} />
            <Camera context={context} />
        </>
    )
}
