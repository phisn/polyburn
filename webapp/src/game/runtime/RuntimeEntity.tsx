import { Entity } from "../../model/world/Entity"
import { UpdateContext } from "./UpdateContext"

export interface RuntimeEntity {
    entity: Entity

    update: (context: UpdateContext) => void
    updateGraphics: () => void
}
