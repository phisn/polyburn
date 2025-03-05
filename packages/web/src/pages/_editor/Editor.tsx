import { EntityType } from "game/proto/world"
import { useEffect, useMemo } from "react"
import { isPointInsideEntity } from "./entities/is-point-inside-entity"
import { entityGraphicRegistry } from "./graphics-assets/entity-graphic-registry"
import { EntityGraphicType } from "./graphics-assets/entity-graphic-type"
import { createEditorStore, editorStoreContext } from "./store/store"
import { Canvas } from "./views/view-canvas/Canvas"
import { Hierarchy } from "./views/view-hierarchy/Hierarchy"

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

            state.entities.set(2, {
                id: 2,
                group: undefined,
                type: EntityType.ROCKET,
                object: {
                    position: { x: 10, y: -10 },
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
            <div className="relative h-max w-full grow">
                <div className="fixed inset-0">
                    <Canvas />
                </div>

                <div className="bg-base-300 absolute bottom-0 right-0 top-0 z-10 min-w-64 grow bg-opacity-90 backdrop-blur-md">
                    <Hierarchy />
                </div>
            </div>
        </editorStoreContext.Provider>
    )
}
