import { EntityTypeComponent } from "runtime/src/core/common/components/EntityTypeComponent"
import { Components } from "runtime/src/core/Components"
import { RuntimeSystemFactory } from "runtime/src/core/RuntimeSystemFactory"

import { AddonComponents } from "../AddonComponents"
import { GraphicComponent } from "./GraphicComponent"
import { graphicRegistry } from "./GraphicRegistry"

export const newRegisterGraphicsSystem: RuntimeSystemFactory = (store) => {
    store.getState().listenToEntities(
        (entity) => {
            const component = entity.getSafe<EntityTypeComponent>(Components.EntityType)
            const graphic = graphicRegistry[component.type]

            entity.set<GraphicComponent>(
                AddonComponents.Graphic,
                { graphic }
            )
        },
        () => {
            void 0
        },
        Components.EntityType)
}
