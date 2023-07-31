import { WebappSystemFactory } from "../WebappSystemFactory"
import { graphicRegistry } from "./GraphicRegistry"

export const newRegisterGraphicsSystem: WebappSystemFactory = ({ store }) => {
    store.listenTo(
        entity => {
            if (entity.components.entityType in graphicRegistry) {
                entity.components.graphic = graphicRegistry[entity.components.entityType]
            }
        },
        undefined,
        "entityType",
    )
}
