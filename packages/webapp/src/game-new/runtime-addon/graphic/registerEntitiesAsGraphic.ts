import { Components } from "runtime/src/core/Components"
import { EntityType } from "runtime/src/core/EntityType"
import { EntityStore } from "runtime-framework"

const graphicRegistry = {
    [EntityType.Flag]: null,
    [EntityType.Rocket]: null,
    [EntityType.Shape]: null,
}

export const registerEntitiesAsGraphic = (store: EntityStore) => {
    store.getState().listenToEntities(
        (entity) => {
            void 0
        },
        () => {
            void 0
        },
        Components.EntityType)
}
