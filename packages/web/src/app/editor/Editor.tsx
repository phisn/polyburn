import { useEffect, useMemo } from "react"
import { EntityType } from "runtime/proto/world"
import { entityGraphicRegistry } from "./entities/graphics-assets/entity-graphic-registry"
import { EntityGraphicType } from "./entities/graphics-assets/entity-graphic-type"
import { isPointInsideEntity } from "./entities/is-point-inside-entity"
import { createEditorStore, editorStoreContext } from "./store/store"
import { Canvas } from "./views/view-canvas/Canvas"

export function Editor() {
    const store = useMemo(() => createEditorStore(), [])

    useEffect(() => {
        store.getState().mutate(state => {
            state.entities.set(1, {
                id: 1,
                group: undefined,
                type: EntityType.ROCKET,
                object: {
                    position: { x: 0, y: 0 },
                    rotation: 0,
                    isInside: function (point) {
                        return isPointInsideEntity(
                            point,
                            this.position,
                            this.rotation,
                            EntityGraphicType.Rocket,
                        )
                    },
                    size: () => entityGraphicRegistry[EntityGraphicType.Rocket].size,
                },
            })
        })
    }, [store])

    return (
        <editorStoreContext.Provider value={store}>
            <div className="h-max w-full grow">
                <div className="absolute inset-0">
                    <Canvas />
                </div>
            </div>
        </editorStoreContext.Provider>
    )
}
